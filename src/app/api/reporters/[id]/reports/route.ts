import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, isEditorOrAdmin, canPublish } from '@/lib/auth';
import { slugify, estimateReadingTime } from '@/lib/utils';
import {
  verifyCsrfOrigin,
  getClientIp,
  sanitizeString,
  sanitizeHtml,
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
    const reporterId = sanitizeString(rawId, 100);
    const user = await getCurrentUser();
    const db = getDb();

    // Check if the caller is authorized to view unpublished drafts
    let allowDrafts = false;
    if (user) {
      if (isEditorOrAdmin(user.role)) {
        allowDrafts = true;
      } else if (user.role === 'REPORTER') {
        const rep = await db.prepare('SELECT id FROM reporters WHERE user_id = ?').get<any>(user.id);
        if (rep?.id === reporterId) {
          allowDrafts = true;
        }
      }
    }

    // Broken Access Control Defense: Non-authenticated / unauthorized callers only see PUBLISHED articles
    const statusClause = allowDrafts ? '' : "AND a.status = 'PUBLISHED'";

    const reports = await db.prepare(`
      SELECT 
        a.*,
        c.name as category_name,
        c.slug as category_slug,
        c.color as category_color,
        r.name as reporter_name,
        r.title as reporter_title
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN reporters r ON a.reporter_id = r.id
      WHERE a.reporter_id = ? ${statusClause}
      ORDER BY a.created_at DESC
    `).all<any>(reporterId);

    return NextResponse.json({ reports });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error fetching reporter reports.');
  }
}

export async function POST(req: Request, context: RouteContext) {
  const ip = getClientIp(req);

  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { id: rawId } = await context.params;
    const reporterId = sanitizeString(rawId, 100);
    const db = getDb();

    // BOLA/IDOR Defense: If user is a reporter, ensure they can only submit reports for their own reporter profile
    if (!isEditorOrAdmin(user.role)) {
      const rep = await db.prepare('SELECT id FROM reporters WHERE user_id = ?').get<any>(user.id);
      if (rep?.id !== reporterId) {
        logSecurityAudit('PERMISSION_DENIED', {
          userId: user.id,
          role: user.role,
          resourceId: reporterId,
          ip,
          status: 'BLOCKED',
          notes: 'Reporter attempted to create article under another byline',
        });
        return NextResponse.json(
          { error: 'Permission denied. You can only create reports under your own assigned reporter byline.' },
          { status: 403 }
        );
      }
    }

    // Verify reporter exists
    const reporter = await db.prepare('SELECT id, name FROM reporters WHERE id = ?').get<any>(reporterId);
    if (!reporter) {
      return NextResponse.json({ error: 'Reporter not found.' }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    const title = sanitizeString(body.title, 300);
    const deck = sanitizeString(body.deck, 600);
    const rawContent = typeof body.content === 'string' ? body.content : '';
    const cleanContent = sanitizeHtml(rawContent);
    const category_id = sanitizeString(body.category_id, 100);
    const article_type = sanitizeString(body.article_type, 50, 'NEWS');
    const featured_image = sanitizeString(body.featured_image, 1000);
    const image_caption = sanitizeString(body.image_caption, 500);
    const image_credit = sanitizeString(body.image_credit, 300);
    const district = sanitizeString(body.district, 100);
    const source_attribution = sanitizeString(body.source_attribution, 300);
    const correction_notice = sanitizeString(body.correction_notice, 1000);

    const is_breaking = body.is_breaking ? 1 : 0;
    const is_lead = body.is_lead ? 1 : 0;
    const is_featured = body.is_featured ? 1 : 0;
    const is_opinion = body.is_opinion ? 1 : 0;

    let targetStatus = body.status || 'DRAFT';
    if ((targetStatus === 'PUBLISHED' || targetStatus === 'APPROVED') && !canPublish(user.role)) {
      targetStatus = 'IN_REVIEW';
    }

    if (!title || !cleanContent || !category_id) {
      return NextResponse.json(
        { error: 'Title, content, and category desk are required.' },
        { status: 400 }
      );
    }

    const articleId = `art-${Date.now()}`;
    const slug = `${slugify(title)}-${Math.floor(Math.random() * 10000)}`;
    const now = new Date().toISOString();
    const readingTime = estimateReadingTime(cleanContent);
    const publishedAt = targetStatus === 'PUBLISHED' ? now : null;

    await db.prepare(`
      INSERT INTO articles (
        id, title, slug, deck, body, featured_image, image_caption, image_credit,
        category_id, reporter_id, status, article_type, is_breaking, is_lead, is_featured,
        is_opinion, is_sponsored, reading_time_minutes, district, source_attribution,
        correction_notice, published_at, updated_at, created_at, views_count
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, 0, ?, ?, ?,
        ?, ?, ?, ?, 0
      )
    `).run(
      articleId,
      title,
      slug,
      deck,
      cleanContent,
      featured_image || '',
      image_caption || '',
      image_credit || '',
      category_id,
      reporterId,
      targetStatus,
      article_type,
      is_breaking,
      is_lead,
      is_featured,
      is_opinion,
      readingTime,
      district || null,
      source_attribution || null,
      correction_notice || null,
      publishedAt,
      now,
      now
    );

    logSecurityAudit('ARTICLE_CREATED', {
      userId: user.id,
      role: user.role,
      resourceId: articleId,
      ip,
      status: 'SUCCESS',
      notes: `Report created for reporter ${reporterId}`,
    });

    return NextResponse.json({
      success: true,
      article: { id: articleId, slug, status: targetStatus },
    });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error creating report.');
  }
}
