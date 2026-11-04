import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getDb } from './db';
import { User, UserRole } from './types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'daily-signal-editorial-secure-key-2026-production-token'
);

export const COOKIE_NAME = 'ds_auth_session';

export interface AuthSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
}

export async function createSessionToken(user: AuthSession): Promise<string> {
  return await new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar_url: user.avatar_url
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      avatar_url: payload.avatar_url as string | undefined
    };
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch (e) {
    return null;
  }
}

export async function verifyUserCredentials(email: string, password: string): Promise<AuthSession | null> {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !user.password_hash) {
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
    avatar_url: user.avatar_url
  };
}

export function canPublish(role?: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'EDITOR';
}

export function canEditAnyArticle(role?: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'EDITOR';
}

export function canManageSettings(role?: UserRole): boolean {
  return role === 'SUPER_ADMIN';
}
