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

  // 1. CSRF Origin check
  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  // 2. Rate limiting (max 6 comments per 2 minutes per IP)
  const rateLimit = checkRateLimit(`comments_${ip}`, RateLimits.PUBLIC_COMMENTS.limit, RateLimits.PUBLIC_COMMENTS.windowMs);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'You are submitting contributions too quickly. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.resetSeconds) } }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    const article_id = sanitizeString(body.article_id, 100);
    const author_name = sanitizeString(body.author_name, 80);
    const rawEmail = sanitizeString(body.author_email, 254);
    const content = sanitizeString(body.content, 1500);

    if (!article_id || !author_name || !content) {
      return NextResponse.json(
        { error: 'Article ID, your name, and comment content are required.' },
        { status: 400 }
      );
    }

    if (author_name.length < 2) {
      return NextResponse.json({ error: 'Display name must be at least 2 characters.' }, { status: 400 });
    }

    if (content.length < 2) {
      return NextResponse.json({ error: 'Comment must be at least 2 characters long.' }, { status: 400 });
    }

    let author_email = '';
    if (rawEmail) {
      if (!isValidEmail(rawEmail)) {
        return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
      }
      author_email = rawEmail;
    }

    const db = getDb();
    // Verify that the target article exists and is published
    const article = await db.prepare('SELECT id, status FROM articles WHERE id = ?').get<any>(article_id);
    if (!article || article.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Target article not found.' }, { status: 404 });
    }

    const id = `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO comments (id, article_id, author_name, author_email, content, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'APPROVED', ?)
    `).run(id, article_id, author_name, author_email, content, now);

    return NextResponse.json({
      success: true,
      comment: {
        id,
        article_id,
        author_name,
        author_email: author_email ? `${author_email[0]}***@***` : '', // minimize email disclosure
        content,
        status: 'APPROVED',
        created_at: now,
      },
    });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error posting contribution.');
  }
}
