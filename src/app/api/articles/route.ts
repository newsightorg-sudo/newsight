import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getCurrentUser, canPublish, isEditorOrAdmin } from '@/lib/auth';
import { slugify, estimateReadingTime } from '@/lib/utils';
import { getAllArticlesAdmin, invalidateDataCache } from '@/lib/data';
import {
  verifyCsrfOrigin,
  checkRateLimit,
  getClientIp,
  RateLimits,
  sanitizeString,
  sanitizeHtml,
  logSecurityAudit,
  safeErrorResponse,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedStatus = searchParams.get('status') || undefined;
    const user = await getCurrentUser();

    // Broken Access Control Defense:
    // Only authenticated staff can view non-published articles or query by administrative statuses
    if (!user || (!isEditorOrAdmin(user.role) && user.role !== 'REPORTER')) {
      // Unauthenticated / public callers only receive published articles
      const articles = await getAllArticlesAdmin('PUBLISHED');
      return NextResponse.json({ articles });
    }

    // Authenticated staff
    const articles = await getAllArticlesAdmin(requestedStatus);
    return NextResponse.json({ articles });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error fetching articles.');
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  // 1. CSRF Origin validation
  if (!verifyCsrfOrigin(req)) {
    logSecurityAudit('CSRF_BLOCKED', { ip, status: 'BLOCKED', notes: 'Cross-origin article creation attempt' });
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    // Rate limiting for article creation
    const rateLimit = checkRateLimit(`article_create_${user.id}`, RateLimits.MUTATIONS.limit, RateLimits.MUTATIONS.windowMs);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    const rawTitle = sanitizeString(body.title, 300);
    const rawDeck = sanitizeString(body.deck, 600);
    const rawContent = typeof body.content === 'string' ? body.content : '';
    const category_id = sanitizeString(body.category_id, 100);
    const reporter_id = sanitizeString(body.reporter_id, 100);
    const featured_image = sanitizeString(body.featured_image, 1000);
    const image_caption = sanitizeString(body.image_caption, 500);
    const image_credit = sanitizeString(body.image_credit, 300);
    const article_type = sanitizeString(body.article_type || 'NEWS', 50);
    const status = sanitizeString(body.status || 'DRAFT', 50);
    const district = sanitizeString(body.district, 100);
    const source_attribution = sanitizeString(body.source_attribution, 300);
    const correction_notice = sanitizeString(body.correction_notice, 1000);

    const is_breaking = body.is_breaking ? 1 : 0;
    const is_lead = body.is_lead ? 1 : 0;
    const is_featured = body.is_featured ? 1 : 0;
    const is_opinion = body.is_opinion ? 1 : 0;

    if (!rawTitle || !rawDeck || !rawContent || !category_id || !reporter_id) {
      return NextResponse.json(
        { error: 'Title, summary, content, category desk, and reporter attribution are required.' },
        { status: 400 }
      );
    }

    // XSS Defense: Sanitize article HTML body content before storing in database
    const cleanContent = sanitizeHtml(rawContent);

    // Role-based publish permission check
    let targetStatus = status;
    if ((status === 'PUBLISHED' || status === 'APPROVED') && !canPublish(user.role)) {
      targetStatus = 'IN_REVIEW'; // Force review if unauthorized role
    }

    const db = getDb();
    const id = `art-${Date.now()}`;
    const baseSlug = slugify(rawTitle);
    let finalSlug = baseSlug;

    // Ensure unique slug
    const existing = await db.prepare('SELECT id FROM articles WHERE slug = ?').get(finalSlug);
    if (existing) {
      finalSlug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;
    }

    const readingTime = estimateReadingTime(cleanContent);
    const now = new Date().toISOString();
    const publishedAt = targetStatus === 'PUBLISHED' ? now : null;

    let targetCategoryId = category_id;
    try {
      if (category_id === 'cat-field-reports' || category_id === 'field-reports') {
        const cat = await db.prepare('SELECT id FROM categories WHERE id = ? OR slug = ?').get('cat-field-reports', 'field-reports');
        if (!cat) {
          await db.prepare(`
            INSERT INTO categories (id, name, slug, description, color, order_index, show_in_nav, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run('cat-field-reports', 'Latest Field Reports & Stories', 'field-reports', 'On-the-ground visual dispatches and field reporting.', '#E50914', 2, 1, now);
        } else {
          targetCategoryId = (cat as any).id;
        }
      } else if (category_id === 'cat-recent-dispatches' || category_id === 'recent-dispatches') {
        const cat = await db.prepare('SELECT id FROM categories WHERE id = ? OR slug = ?').get('cat-recent-dispatches', 'recent-dispatches');
        if (!cat) {
          await db.prepare(`
            INSERT INTO categories (id, name, slug, description, color, order_index, show_in_nav, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run('cat-recent-dispatches', 'Recent Dispatches & Articles', 'recent-dispatches', 'Latest dispatches, ground updates, and breaking articles.', '#079FE3', 3, 1, now);
        } else {
          targetCategoryId = (cat as any).id;
        }
      } else if (category_id === 'cat-investigations' || category_id === 'investigations') {
        const cat = await db.prepare('SELECT id FROM categories WHERE id = ? OR slug = ?').get('cat-investigations', 'investigations');
        if (!cat) {
          await db.prepare(`
            INSERT INTO categories (id, name, slug, description, color, order_index, show_in_nav, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run('cat-investigations', 'Special Investigations & Ground Desks', 'investigations', 'In-depth investigative reports and public interest investigations.', '#075DEB', 4, 1, now);
        } else {
          targetCategoryId = (cat as any).id;
        }
      }
    } catch (_) {}

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
      id,
      rawTitle,
      finalSlug,
      rawDeck,
      cleanContent,
      featured_image || '',
      image_caption || '',
      image_credit || '',
      targetCategoryId,
      reporter_id,
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

    invalidateDataCache('article');
    invalidateDataCache('categories');
    revalidatePath('/', 'layout');

    logSecurityAudit('ARTICLE_CREATED', {
      userId: user.id,
      role: user.role,
      resourceId: id,
      ip,
      status: 'SUCCESS',
      notes: `Article "${rawTitle.slice(0, 40)}" created with status ${targetStatus}`,
    });

    return NextResponse.json({
      success: true,
      article: { id, slug: finalSlug, status: targetStatus },
    });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error saving article.');
  }
}
