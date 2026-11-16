import { cache } from 'react';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getDb } from './db';
import { UserRole } from './types';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[CRITICAL_SECURITY_ALERT] JWT_SECRET is not set in production environment variables.');
    }
    // Fallback key with 32+ bytes for local development
    return new TextEncoder().encode('newsight-editorial-secure-key-2026-min-32-bytes-token!');
  }
  return new TextEncoder().encode(secret);
}

export const COOKIE_NAME = 'ds_auth_session';

export interface AuthSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
}

export async function createSessionToken(user: AuthSession): Promise<string> {
  const secret = getJwtSecret();
  return await new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar_url: user.avatar_url,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<AuthSession | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      avatar_url: payload.avatar_url as string | undefined,
    };
  } catch (error) {
    return null;
  }
}

export const getCurrentUser = cache(async (): Promise<AuthSession | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await verifySessionToken(token);
    if (!session || !session.id) return null;

    // Database verification: ensure user account still exists and role is current
    try {
      const db = getDb();
      const dbUser = await db.prepare('SELECT id, name, email, role, avatar_url FROM users WHERE id = ?').get<any>(session.id);
      if (!dbUser) return null;

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role as UserRole,
        avatar_url: dbUser.avatar_url || session.avatar_url,
      };
    } catch (_) {
      // In offline or fallback mode, honor cryptographically verified JWT payload
      return session;
    }
  } catch (e) {
    return null;
  }
});

export async function verifyUserCredentials(email: string, password: string): Promise<AuthSession | null> {
  if (!email || !password) return null;

  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const user = await db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get<any>(normalizedEmail);
  if (!user || !user.password_hash) {
    // Progressive constant-time dummy comparison to mitigate timing attacks / account enumeration
    await bcrypt.compare(password, '$2a$10$wT0X7V3Y0O2pQ5d8u3h7kO.1H9wN6jM4g9b5z6x7c8v9a0b1c2d3e');
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    avatar_url: user.avatar_url,
  };
}

// ============================================================================
// CENTRALIZED AUTHORIZATION & RBAC ROLES
// ============================================================================

export function isAdmin(role?: UserRole): boolean {
  return role === 'SUPER_ADMIN';
}

export function isEditorOrAdmin(role?: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'EDITOR';
}

export function canPublish(role?: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'EDITOR' || role === 'REPORTER';
}

export function canEditAnyArticle(role?: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'EDITOR';
}

export function canManageSettings(role?: UserRole): boolean {
  return role === 'SUPER_ADMIN';
}

/**
 * BOLA/IDOR Defense: Determines if a user can edit/update a specific article.
 * - SUPER_ADMIN & EDITOR: can edit any article
 * - REPORTER: can only edit articles they authored, and only while still in DRAFT or IN_REVIEW
 */
export async function canUserMutateArticle(user: AuthSession, article: any): Promise<boolean> {
  if (!user || !article) return false;
  if (isEditorOrAdmin(user.role)) return true;

  if (user.role === 'REPORTER') {
    // Check if the article belongs to this reporter
    let userReporterId: string | undefined;
    try {
      const db = getDb();
      const reporter = await db.prepare('SELECT id FROM reporters WHERE user_id = ?').get<any>(user.id);
      userReporterId = reporter?.id;
    } catch {
      // Safe fallback if database is temporarily offline or in sandboxed unit testing
    }

    const isAuthor =
      (userReporterId && article.reporter_id === userReporterId) ||
      article.reporter_id === user.id;

    // Reporters can only mutate drafts or stories in review; published articles require editor privileges
    if (isAuthor && article.status !== 'PUBLISHED') {
      return true;
    }
  }

  return false;
}

/**
 * BOLA/IDOR Defense: Determines if a user can delete a specific article.
 * - SUPER_ADMIN & EDITOR: can delete any article
 * - REPORTER: can only delete their own unpublished drafts
 */
export async function canUserDeleteArticle(user: AuthSession, article: any): Promise<boolean> {
  if (!user || !article) return false;
  if (isEditorOrAdmin(user.role)) return true;

  if (user.role === 'REPORTER') {
    let userReporterId: string | undefined;
    try {
      const db = getDb();
      const reporter = await db.prepare('SELECT id FROM reporters WHERE user_id = ?').get<any>(user.id);
      userReporterId = reporter?.id;
    } catch {
      // Safe fallback if database is temporarily offline or in sandboxed unit testing
    }

    const isAuthor =
      (userReporterId && article.reporter_id === userReporterId) ||
      article.reporter_id === user.id;

    if (isAuthor && article.status === 'DRAFT') {
      return true;
    }
  }

  return false;
}
