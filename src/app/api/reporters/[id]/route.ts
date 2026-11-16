import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { invalidateDataCache } from '@/lib/data';
import {
  verifyCsrfOrigin,
  getClientIp,
  sanitizeString,
  isValidEmail,
  logSecurityAudit,
  safeErrorResponse,
} from '@/lib/security';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function GET(req: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = sanitizeString(rawId, 100);
    const user = await getCurrentUser();
    const userIsAdmin = isAdmin(user?.role);

    const db = getDb();
    const reporter = await db.prepare(`
      SELECT 
        r.*,
        u.email as user_email,
        u.role as user_role,
        (u.id IS NOT NULL) as has_credentials,
        (SELECT COUNT(*) FROM articles a WHERE a.reporter_id = r.id) as reports_count
      FROM reporters r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `).get<any>(id);

    if (!reporter) {
      return NextResponse.json({ error: 'Reporter not found.' }, { status: 404 });
    }

    // Response Minimization Defense:
    // Only administrators can see user_email, internal role, or credential provisioning status
    if (!userIsAdmin) {
      return NextResponse.json({
        reporter: {
          id: reporter.id,
          name: reporter.name,
          slug: reporter.slug,
          title: reporter.title,
          beat: reporter.beat,
          bio: reporter.bio,
          avatar_url: reporter.avatar_url,
          twitter: reporter.twitter,
          linkedin: reporter.linkedin,
          is_active: reporter.is_active,
          created_at: reporter.created_at,
          reports_count: Number(reporter.reports_count || 0),
        },
      });
    }

    return NextResponse.json({
      reporter: {
        ...reporter,
        has_credentials: Boolean(reporter.has_credentials || reporter.user_id),
        reports_count: Number(reporter.reports_count || 0),
      },
    });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error fetching reporter.');
  }
}

export async function PUT(req: Request, context: RouteContext) {
  const ip = getClientIp(req);

  // 1. CSRF Origin validation
  if (!verifyCsrfOrigin(req)) {
    logSecurityAudit('CSRF_BLOCKED', { ip, status: 'BLOCKED', notes: 'Cross-origin reporter update attempt' });
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  try {
    const user = await getCurrentUser();
    // Only Admin can update reporters and credentials
    if (!user || !isAdmin(user.role)) {
      logSecurityAudit('PERMISSION_DENIED', {
        userId: user?.id,
        role: user?.role,
        ip,
        status: 'BLOCKED',
        notes: 'Unauthorized reporter update attempt',
      });
      return NextResponse.json(
        { error: 'Permission denied. Only administrators can update reporters and credentials.' },
        { status: 403 }
      );
    }

    const { id: rawId } = await context.params;
    const id = sanitizeString(rawId, 100);
    const db = getDb();

    const existing = await db.prepare('SELECT * FROM reporters WHERE id = ?').get<any>(id);
    if (!existing) {
      return NextResponse.json({ error: 'Reporter not found.' }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    const {
      name,
      title,
      beat,
      bio,
      avatar_url,
      email,
      twitter,
      linkedin,
      is_active,
      password,
      user_role,
    } = body;

    const updatedName = name !== undefined ? sanitizeString(name, 100) : existing.name;
    const updatedTitle = title !== undefined ? sanitizeString(title, 150) : existing.title;
    const updatedBeat = beat !== undefined ? sanitizeString(beat, 150) : existing.beat;
    const updatedBio = bio !== undefined ? sanitizeString(bio, 1000) : existing.bio;
    const updatedAvatar = avatar_url !== undefined ? sanitizeString(avatar_url, 1000) : existing.avatar_url;
    const updatedEmail = email !== undefined ? sanitizeString(email, 254).toLowerCase() : existing.email;
    const updatedTwitter = twitter !== undefined ? (sanitizeString(twitter, 100) || null) : existing.twitter;
    const updatedLinkedin = linkedin !== undefined ? (sanitizeString(linkedin, 100) || null) : existing.linkedin;
    const updatedIsActive = is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active;

    if (updatedEmail && !isValidEmail(updatedEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    let linkedUserId = existing.user_id;

    // Password reset / credential update or provisioning
    if (password && typeof password === 'string' && password.trim().length > 0) {
      const plainPassword = password.trim();
      if (plainPassword.length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters long for newsroom security.' },
          { status: 400 }
        );
      }

      const passwordHash = await bcrypt.hash(plainPassword, 12);
      const now = new Date().toISOString();

      if (linkedUserId) {
        // Update existing user credentials
        await db.prepare(`
          UPDATE users 
          SET password_hash = ?, 
              email = COALESCE(?, email), 
              name = COALESCE(?, name),
              role = COALESCE(?, role)
          WHERE id = ?
        `).run(passwordHash, updatedEmail, updatedName, user_role || null, linkedUserId);
      } else {
        // Create new user credentials and link to reporter
        const newUserId = `usr-${Date.now()}`;
        const existingEmailUser = await db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(updatedEmail);
        if (existingEmailUser) {
          return NextResponse.json(
            { error: `User with email "${updatedEmail}" already exists. Please use a distinct email for login credentials.` },
            { status: 400 }
          );
        }

        await db.prepare(`
          INSERT INTO users (id, name, email, password_hash, role, avatar_url, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(newUserId, updatedName, updatedEmail, passwordHash, user_role || 'REPORTER', updatedAvatar, now);

        linkedUserId = newUserId;
      }

      logSecurityAudit('REPORTER_CREDENTIALS_MUTATED', {
        userId: user.id,
        role: user.role,
        resourceId: id,
        ip,
        status: 'SUCCESS',
        notes: `Credentials updated for reporter "${updatedName}"`,
      });
    } else if (user_role && linkedUserId) {
      // Role changed without changing password
      await db.prepare('UPDATE users SET role = ? WHERE id = ?').run(user_role, linkedUserId);
    }

    // Slug regeneration if name changed
    let updatedSlug = existing.slug;
    if (updatedName !== existing.name) {
      const baseSlug = slugify(updatedName);
      const slugCollision = await db.prepare('SELECT id FROM reporters WHERE slug = ? AND id != ?').get(baseSlug, id);
      updatedSlug = slugCollision ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
    }

    await db.prepare(`
      UPDATE reporters
      SET name = ?,
          slug = ?,
          title = ?,
          beat = ?,
          bio = ?,
          avatar_url = ?,
          email = ?,
          twitter = ?,
          linkedin = ?,
          is_active = ?,
          user_id = ?
      WHERE id = ?
    `).run(
      updatedName,
      updatedSlug,
      updatedTitle,
      updatedBeat,
      updatedBio,
      updatedAvatar,
      updatedEmail,
      updatedTwitter,
      updatedLinkedin,
      updatedIsActive,
      linkedUserId,
      id
    );

    invalidateDataCache('reporter');
    invalidateDataCache('article');

    return NextResponse.json({
      success: true,
      reporter: {
        id,
        name: updatedName,
        slug: updatedSlug,
        title: updatedTitle,
        beat: updatedBeat,
        email: updatedEmail,
        is_active: updatedIsActive,
        user_id: linkedUserId,
        has_credentials: Boolean(linkedUserId),
      },
    });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error updating reporter.');
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  const ip = getClientIp(req);

  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  try {
    const user = await getCurrentUser();
    // Only Admin can delete reporters
    if (!user || !isAdmin(user.role)) {
      logSecurityAudit('PERMISSION_DENIED', {
        userId: user?.id,
        role: user?.role,
        ip,
        status: 'BLOCKED',
        notes: 'Unauthorized reporter deletion attempt',
      });
      return NextResponse.json(
        { error: 'Permission denied. Only administrators can delete reporters.' },
        { status: 403 }
      );
    }

    const { id: rawId } = await context.params;
    const id = sanitizeString(rawId, 100);
    const { searchParams } = new URL(req.url);
    const reassignTo = sanitizeString(searchParams.get('reassign_to'), 100);

    const db = getDb();
    const existing = await db.prepare('SELECT * FROM reporters WHERE id = ?').get<any>(id);
    if (!existing) {
      return NextResponse.json({ error: 'Reporter not found.' }, { status: 404 });
    }

    // Handle reports/articles written by this reporter
    const reportCountRow = await db.prepare('SELECT COUNT(*) as count FROM articles WHERE reporter_id = ?').get<{ count: string | number }>(id);
    const reportsCount = Number(reportCountRow?.count || 0);

    if (reportsCount > 0) {
      if (reassignTo) {
        await db.prepare('UPDATE articles SET reporter_id = ? WHERE reporter_id = ?').run(reassignTo, id);
      } else {
        await db.prepare('DELETE FROM articles WHERE reporter_id = ?').run(id);
      }
    }

    await db.prepare('DELETE FROM reporters WHERE id = ?').run(id);

    // If reporter had linked login credentials, delete user credentials
    if (existing.user_id) {
      await db.prepare('DELETE FROM users WHERE id = ?').run(existing.user_id);
    }

    invalidateDataCache('reporter');
    invalidateDataCache('article');

    logSecurityAudit('REPORTER_CREDENTIALS_MUTATED', {
      userId: user.id,
      role: user.role,
      resourceId: id,
      ip,
      status: 'SUCCESS',
      notes: `Deleted reporter "${existing.name}" and credentials`,
    });

    return NextResponse.json({
      success: true,
      message: `Reporter "${existing.name}" and associated credentials deleted successfully.`,
    });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error deleting reporter.');
  }
}
