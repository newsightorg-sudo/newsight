import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { invalidateDataCache } from '@/lib/data';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
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

    return NextResponse.json({
      reporter: {
        ...reporter,
        has_credentials: Boolean(reporter.has_credentials || reporter.user_id),
        reports_count: Number(reporter.reports_count || 0)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching reporter.' }, { status: 500 });
  }
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    // Only Admin can update reporters and credentials
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json(
        { error: 'Permission denied. Only administrators can update reporters and credentials.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const db = getDb();

    const existing = await db.prepare('SELECT * FROM reporters WHERE id = ?').get<any>(id);
    if (!existing) {
      return NextResponse.json({ error: 'Reporter not found.' }, { status: 404 });
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
      user_role
    } = await req.json();

    const updatedName = name !== undefined ? name.trim() : existing.name;
    const updatedTitle = title !== undefined ? title.trim() : existing.title;
    const updatedBeat = beat !== undefined ? beat.trim() : existing.beat;
    const updatedBio = bio !== undefined ? bio.trim() : existing.bio;
    const updatedAvatar = avatar_url !== undefined ? avatar_url.trim() : existing.avatar_url;
    const updatedEmail = email !== undefined ? email.trim() : existing.email;
    const updatedTwitter = twitter !== undefined ? (twitter.trim() || null) : existing.twitter;
    const updatedLinkedin = linkedin !== undefined ? (linkedin.trim() || null) : existing.linkedin;
    const updatedIsActive = is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active;

    let linkedUserId = existing.user_id;

    // Password reset / credential update or provisioning
    if (password && password.trim().length > 0) {
      const plainPassword = password.trim();
      if (plainPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters long.' },
          { status: 400 }
        );
      }

      const passwordHash = await bcrypt.hash(plainPassword, 10);
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
        const existingEmailUser = await db.prepare('SELECT id FROM users WHERE email = ?').get(updatedEmail);
        if (existingEmailUser) {
          return NextResponse.json(
            { error: `User with email "${updatedEmail}" already exists. Please use a distinct email for login credentials.` },
            { status: 400 }
          );
        }

        await db.prepare(`
          INSERT INTO users (id, name, email, password_hash, role, avatar_url, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          newUserId,
          updatedName,
          updatedEmail,
          passwordHash,
          user_role || 'REPORTER',
          updatedAvatar,
          now
        );
        linkedUserId = newUserId;
      }
    } else if (linkedUserId && (email !== undefined || name !== undefined || user_role !== undefined)) {
      // Sync email/name/role to users table if reporter already has user credentials
      await db.prepare(`
        UPDATE users 
        SET email = COALESCE(?, email), 
            name = COALESCE(?, name),
            role = COALESCE(?, role)
        WHERE id = ?
      `).run(updatedEmail, updatedName, user_role || null, linkedUserId);
    }

    // Update reporters table
    await db.prepare(`
      UPDATE reporters 
      SET name = ?,
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

    return NextResponse.json({
      success: true,
      message: `Reporter "${updatedName}" updated successfully.`,
      reporter: {
        id,
        user_id: linkedUserId,
        name: updatedName,
        title: updatedTitle,
        beat: updatedBeat,
        email: updatedEmail,
        is_active: updatedIsActive,
        has_credentials: Boolean(linkedUserId)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating reporter.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    // Only Admin can delete reporters
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json(
        { error: 'Permission denied. Only administrators can delete reporters.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const reassignTo = searchParams.get('reassign_to');

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
        // Reassign reports to another reporter
        await db.prepare('UPDATE articles SET reporter_id = ? WHERE reporter_id = ?').run(reassignTo, id);
      } else {
        // In our schema articles cascade delete, or we can reassign to default admin reporter
        // If reassign_to was not specified, delete the articles
        await db.prepare('DELETE FROM articles WHERE reporter_id = ?').run(id);
      }
    }

    // Delete reporter from reporters table
    await db.prepare('DELETE FROM reporters WHERE id = ?').run(id);

    // If reporter had linked login credentials, delete user credentials
    if (existing.user_id) {
      await db.prepare('DELETE FROM users WHERE id = ?').run(existing.user_id);
    }

    invalidateDataCache('reporter');
    invalidateDataCache('article');

    return NextResponse.json({
      success: true,
      message: `Reporter "${existing.name}" and associated credentials deleted successfully.`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting reporter.' }, { status: 500 });
  }
}

