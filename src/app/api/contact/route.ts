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

  // 2. Rate limiting (max 4 per 5 minutes per IP)
  const rateLimit = checkRateLimit(`contact_${ip}`, RateLimits.PUBLIC_CONTACT.limit, RateLimits.PUBLIC_CONTACT.windowMs);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many messages sent. Please wait a few minutes before submitting again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.resetSeconds) } }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    const name = sanitizeString(body.name, 100);
    const email = sanitizeString(body.email, 254).toLowerCase();
    const department = sanitizeString(body.department, 60, 'General Desk');
    const subject = sanitizeString(body.subject, 150, 'No Subject');
    const message = sanitizeString(body.message, 3000);

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }

    if (name.length < 2) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    if (message.length < 5) {
      return NextResponse.json({ error: 'Message must be at least 5 characters long.' }, { status: 400 });
    }

    const db = getDb();
    const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO contact_messages (id, name, email, department, subject, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'NEW', ?)
    `).run(id, name, email, department, subject, message, now);

    return NextResponse.json({ success: true, message: 'Message received by the newsroom.' });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error submitting contact form.');
  }
}
