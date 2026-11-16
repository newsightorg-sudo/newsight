import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { getReporters, invalidateDataCache } from '@/lib/data';
import { 
  verifyCsrfOrigin, 
  enforceRateLimit, 
  RateLimits, 
  sanitizeString, 
  isValidEmail, 
  safeErrorResponse, 
  logSecurityAudit 
} from '@/lib/security';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    const isUserAdmin = isAdmin(user?.role);
    const reporters = await getReporters(isUserAdmin);

    // If caller is not admin, scrub internal user data to prevent information disclosure
    const sanitizedReporters = isUserAdmin 
      ? reporters 
      : reporters.map(r => {
          const { user_id, user_email, user_role, has_credentials, ...safeReporter } = r as any;
          return safeReporter;
        });

    return NextResponse.json({ reporters: sanitizedReporters });
  } catch (error: any) {
    return safeErrorResponse(error, 'Failed to fetch reporters.');
  }
}

export async function POST(req: Request) {
  // CSRF Origin verification
  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  // Rate limit
  const rateLimitResponse = enforceRateLimit(req, RateLimits.MUTATIONS, 'reporter_mutations');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await getCurrentUser();
    // Only Admin (SUPER_ADMIN) can create reporters and credentials
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json(
        { error: 'Permission denied. Only administrators can create reporters and credentials.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const name = sanitizeString(body.name || '');
    const title = sanitizeString(body.title || '');
    const beat = sanitizeString(body.beat || '');
    const bio = sanitizeString(body.bio || '');
    const avatar_url = body.avatar_url ? String(body.avatar_url).trim().slice(0, 1000) : null;
    const email = body.email ? String(body.email).trim().toLowerCase() : '';
    const twitter = body.twitter ? sanitizeString(String(body.twitter)).slice(0, 100) : null;
    const linkedin = body.linkedin ? sanitizeString(String(body.linkedin)).slice(0, 100) : null;
    const password = body.password ? String(body.password).trim() : '';
    const create_credentials = Boolean(body.create_credentials);
    const user_role = body.user_role === 'EDITOR' || body.user_role === 'SUPER_ADMIN' ? body.user_role : 'REPORTER';

    if (!name || !title || !beat) {
      return NextResponse.json(
        { error: 'Byline name, editorial title, and beat are required.' },
        { status: 400 }
      );
    }

    const db = getDb();
    const reporterSlug = slugify(name);
    const now = new Date().toISOString();
    const reporterEmail = email || `${reporterSlug}@newsight.media`;

    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address provided.' },
        { status: 400 }
      );
    }

    let userId: string | null = null;

    // Admin creates login credentials for this reporter
    const shouldCreateCredentials = Boolean(create_credentials || password.length > 0);

    if (shouldCreateCredentials) {
      if (!password || password.length < 8) {
        return NextResponse.json(
          { error: 'A password with at least 8 characters is required for staff credentials.' },
          { status: 400 }
        );
      }

      // Check for duplicate user email
      const existingUser = await db.prepare('SELECT id FROM users WHERE email = ?').get(reporterEmail);
      if (existingUser) {
        return NextResponse.json(
          { error: `A user account with email "${reporterEmail}" already exists. Please use a unique email for credentials.` },
          { status: 400 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 12);
      userId = `usr-${Date.now()}`;

      await db.prepare(`
        INSERT INTO users (id, name, email, password_hash, role, avatar_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        name,
        reporterEmail,
        passwordHash,
        user_role,
        avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        now
      );
    }

    const reporterId = `rep-${Date.now()}`;

    await db.prepare(`
      INSERT INTO reporters (
        id, user_id, name, slug, title, beat, bio, avatar_url, 
        email, twitter, linkedin, is_active, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      reporterId,
      userId,
      name,
      reporterSlug,
      title,
      beat,
      bio,
      avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      reporterEmail,
      twitter,
      linkedin,
      now
    );

    invalidateDataCache('reporter');

    logSecurityAudit('REPORTER_CREATED', {
      adminId: user.id,
      reporterId,
      reporterSlug,
      hasCredentials: Boolean(userId),
      userRole: shouldCreateCredentials ? user_role : undefined
    });

    return NextResponse.json({
      success: true,
      message: shouldCreateCredentials 
        ? `Reporter "${name}" registered with newsroom login credentials.`
        : `Reporter "${name}" registered to newsroom roster.`,
      reporter: {
        id: reporterId,
        user_id: userId,
        name,
        slug: reporterSlug,
        email: reporterEmail,
        has_credentials: Boolean(userId),
        user_role: shouldCreateCredentials ? user_role : undefined
      }
    });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error creating reporter.');
  }
}
