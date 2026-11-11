import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { getReporters, invalidateDataCache } from '@/lib/data';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  const includeInactive = isAdmin(user?.role);
  const reporters = await getReporters(includeInactive);
  return NextResponse.json({ reporters });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    // Only Admin (SUPER_ADMIN) can create reporters and credentials
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json(
        { error: 'Permission denied. Only administrators can create reporters and credentials.' },
        { status: 403 }
      );
    }

    const {
      name,
      title,
      beat,
      bio = '',
      avatar_url,
      email,
      twitter,
      linkedin,
      password,
      create_credentials = false,
      user_role = 'REPORTER'
    } = await req.json();

    if (!name || !title || !beat) {
      return NextResponse.json(
        { error: 'Byline name, editorial title, and beat are required.' },
        { status: 400 }
      );
    }

    const db = getDb();
    const reporterSlug = slugify(name);
    const now = new Date().toISOString();
    const reporterEmail = email?.trim() || `${reporterSlug}@newsight.media`;

    let userId: string | null = null;

    // Admin creates login credentials for this reporter
    const shouldCreateCredentials = Boolean(create_credentials || (password && password.trim().length > 0));

    if (shouldCreateCredentials) {
      const plainPassword = password?.trim();
      if (!plainPassword || plainPassword.length < 6) {
        return NextResponse.json(
          { error: 'A password with at least 6 characters is required to create credentials.' },
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

      const passwordHash = await bcrypt.hash(plainPassword, 10);
      userId = `usr-${Date.now()}`;

      await db.prepare(`
        INSERT INTO users (id, name, email, password_hash, role, avatar_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        name.trim(),
        reporterEmail,
        passwordHash,
        user_role || 'REPORTER',
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
      name.trim(),
      reporterSlug,
      title.trim(),
      beat.trim(),
      bio?.trim() || '',
      avatar_url?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      reporterEmail,
      twitter?.trim() || null,
      linkedin?.trim() || null,
      now
    );

    invalidateDataCache('reporter');

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
        user_role: shouldCreateCredentials ? (user_role || 'REPORTER') : undefined
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating reporter.' }, { status: 500 });
  }
}
