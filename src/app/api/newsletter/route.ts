import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import {
  checkRateLimit,
  getClientIp,
  RateLimits,
  verifyCsrfOrigin,
  sanitizeString,
  isValidEmail,
  safeErrorResponse,
} from '@/lib/security';

export async function POST(req: Request) {
  const ip = getClientIp(req);

  // 1. CSRF Origin validation
  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  // 2. Rate limiting (max 6 per 5 minutes per IP)
  const rateLimit = checkRateLimit(`newsletter_${ip}`, RateLimits.NEWSLETTER.limit, RateLimits.NEWSLETTER.windowMs);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many subscription attempts. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.resetSeconds) } }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    const email = sanitizeString(body.email, 254).toLowerCase();
    const edition_preference = sanitizeString(body.edition_preference, 50, 'India');

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
    }

    const db = getDb();
    const existing = await db.prepare('SELECT id, is_active FROM newsletter_subscribers WHERE LOWER(email) = ?').get<any>(email);

    const now = new Date().toISOString();

    if (existing) {
      if (!existing.is_active) {
        await db.prepare('UPDATE newsletter_subscribers SET is_active = 1, edition_preference = ?, subscribed_at = ? WHERE LOWER(email) = ?')
          .run(edition_preference, now, email);
      }
      // Return generic message to prevent account enumeration
      return NextResponse.json({ success: true, message: 'You are subscribed to NEWSIGHT morning dispatches.' });
    }

    const id = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await db.prepare(`
      INSERT INTO newsletter_subscribers (id, email, edition_preference, is_active, subscribed_at)
      VALUES (?, ?, ?, 1, ?)
    `).run(id, email, edition_preference, now);

    return NextResponse.json({ success: true, message: 'Welcome to NEWSIGHT morning dispatches.' });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error processing subscription.');
  }
}
