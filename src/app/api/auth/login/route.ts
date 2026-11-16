import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyUserCredentials, createSessionToken, COOKIE_NAME } from '@/lib/auth';
import {
  checkRateLimit,
  getClientIp,
  RateLimits,
  verifyCsrfOrigin,
  isValidEmail,
  sanitizeString,
  logSecurityAudit,
  safeErrorResponse,
} from '@/lib/security';

export async function POST(req: Request) {
  const ip = getClientIp(req);

  // 1. CSRF Origin validation
  if (!verifyCsrfOrigin(req)) {
    logSecurityAudit('CSRF_BLOCKED', { ip, status: 'BLOCKED', notes: 'Cross-origin login attempt rejected' });
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  // 2. Distributed sliding-window Rate Limiting
  const rateLimit = checkRateLimit(`login_${ip}`, RateLimits.AUTH_LOGIN.limit, RateLimits.AUTH_LOGIN.windowMs);
  if (!rateLimit.allowed) {
    logSecurityAudit('AUTH_RATE_LIMITED', { ip, status: 'BLOCKED', notes: 'Exceeded 5 login attempts per 15 minutes' });
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait 15 minutes before trying again.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.resetSeconds),
        },
      }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const email = sanitizeString(body.email, 254).toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid newsroom email or credentials.' }, { status: 401 });
    }

    const user = await verifyUserCredentials(email, password);
    if (!user) {
      logSecurityAudit('AUTH_LOGIN_FAILED', { email, ip, status: 'FAILED' });
      return NextResponse.json({ error: 'Invalid newsroom email or credentials.' }, { status: 401 });
    }

    // Generate authenticated session token
    const token = await createSessionToken(user);
    const cookieStore = await cookies();

    // Enforce Secure, HttpOnly, SameSite=Lax cookie with 7 days expiration
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    logSecurityAudit('AUTH_LOGIN_SUCCESS', {
      userId: user.id,
      email: user.email,
      role: user.role,
      ip,
      status: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return safeErrorResponse(error, 'Authentication error.');
  }
}
