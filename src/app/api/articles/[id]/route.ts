import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import {
  getCurrentUser,
  canPublish,
  isEditorOrAdmin,
  canUserMutateArticle,
  canUserDeleteArticle,
} from '@/lib/auth';
import { estimateReadingTime } from '@/lib/utils';
import { invalidateDataCache } from '@/lib/data';
import {
  verifyCsrfOrigin,
  getClientIp,
  sanitizeString,
  sanitizeHtml,
  logSecurityAudit,
  safeErrorResponse,
} from '@/lib/security';

interface Params {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const db = getDb();
    const article = await db.prepare('SELECT * FROM articles WHERE id = ?').get<any>(id);

    if (!article) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    // Broken Access Control Defense:
    // If article is not PUBLISHED, only authenticated staff (Editor/Admin or author) may view it
    if (article.status !== 'PUBLISHED') {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
      }

      if (!isEditorOrAdmin(user.role)) {
        const reporter = await db.prepare('SELECT id FROM reporters WHERE user_id = ?').get<any>(user.id);
        const isAuthor = reporter?.id && article.reporter_id === reporter.id;
        if (!isAuthor) {
          return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
        }
      }
    }

    return NextResponse.json({ article });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error fetching article.');
  }
}

export async function PUT(req: Request, { params }: Params) {
  const ip = getClientIp(req);

  // 1. CSRF Origin validation
  if (!verifyCsrfOrigin(req)) {
    logSecurityAudit('CSRF_BLOCKED', { ip, status: 'BLOCKED', notes: 'Cross-origin article update attempt' });
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const existing = await db.prepare('SELECT * FROM articles WHERE id = ?').get<any>(id);

    if (!existing) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    // BOLA/IDOR Defense: Verify user has permission to edit this specific article
    const canMutate = await canUserMutateArticle(user, existing);
    if (!canMutate) {
      logSecurityAudit('PERMISSION_DENIED', {
        userId: user.id,
        role: user.role,
        resourceId: id,
        ip,
        status: 'BLOCKED',
        notes: 'Attempted to edit unauthorized article',
      });
      return NextResponse.json(
        { error: 'Permission denied. You are not authorized to edit this article.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    const title = body.title !== undefined ? sanitizeString(body.title, 300) : existing.title;
    const deck = body.deck !== undefined ? sanitizeString(body.deck, 600) : existing.deck;
    const content = body.content !== undefined ? sanitizeHtml(body.content) : existing.body;
    const category_id = body.category_id !== undefined ? sanitizeString(body.category_id, 100) : existing.category_id;
    const reporter_id = body.reporter_id !== undefined ? sanitizeString(body.reporter_id, 100) : existing.reporter_id;
    const featured_image = body.featured_image !== undefined ? sanitizeString(body.featured_image, 1000) : existing.featured_image;
    const image_caption = body.image_caption !== undefined ? sanitizeString(body.image_caption, 500) : existing.image_caption;
    const image_credit = body.image_credit !== undefined ? sanitizeString(body.image_credit, 300) : existing.image_credit;
    const article_type = body.article_type !== undefined ? sanitizeString(body.article_type, 50) : existing.article_type;
    const district = body.district !== undefined ? sanitizeString(body.district, 100) : existing.district;
    const source_attribution = body.source_attribution !== undefined ? sanitizeString(body.source_attribution, 300) : existing.source_attribution;
    const correction_notice = body.correction_notice !== undefined ? sanitizeString(body.correction_notice, 1000) : existing.correction_notice;

    const is_breaking = body.is_breaking !== undefined ? (body.is_breaking ? 1 : 0) : existing.is_breaking;
    const is_lead = body.is_lead !== undefined ? (body.is_lead ? 1 : 0) : existing.is_lead;
    const is_featured = body.is_featured !== undefined ? (body.is_featured ? 1 : 0) : existing.is_featured;
    const is_opinion = body.is_opinion !== undefined ? (body.is_opinion ? 1 : 0) : existing.is_opinion;

    let targetStatus = body.status || existing.status;
    if ((targetStatus === 'PUBLISHED' || targetStatus === 'APPROVED') && !canPublish(user.role)) {
      targetStatus = 'IN_REVIEW';
    }

    const now = new Date().toISOString();
    let publishedAt = existing.published_at;
    if (targetStatus === 'PUBLISHED' && !publishedAt) {
      publishedAt = now;
    }

    const readingTime = content ? estimateReadingTime(content) : existing.reading_time_minutes;

    let targetCategoryId = category_id || existing.category_id;
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
      UPDATE articles SET
        title = ?,
        deck = ?,
        body = ?,
        category_id = ?,
        reporter_id = ?,
        featured_image = ?,
        image_caption = ?,
        image_credit = ?,
        article_type = ?,
        status = ?,
        is_breaking = ?,
        is_lead = ?,
        is_featured = ?,
        is_opinion = ?,
        reading_time_minutes = ?,
        district = ?,
        source_attribution = ?,
        correction_notice = ?,
        published_at = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      title,
      deck,
      content,
      targetCategoryId,
      reporter_id,
      featured_image || '',
      image_caption || '',
      image_credit || '',
      article_type,
      targetStatus,
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
      id
    );

    invalidateDataCache('article');
    invalidateDataCache('categories');
    revalidatePath('/', 'layout');

    logSecurityAudit('ARTICLE_UPDATED', {
      userId: user.id,
      role: user.role,
      resourceId: id,
      ip,
      status: 'SUCCESS',
      notes: `Article updated with status ${targetStatus}`,
    });

    return NextResponse.json({ success: true, message: 'Article updated successfully.' });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error updating article.');
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const ip = getClientIp(req);

  // 1. CSRF Origin validation
  if (!verifyCsrfOrigin(req)) {
    logSecurityAudit('CSRF_BLOCKED', { ip, status: 'BLOCKED', notes: 'Cross-origin article delete attempt' });
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const existing = await db.prepare('SELECT * FROM articles WHERE id = ?').get<any>(id);

    if (!existing) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    // BOLA/IDOR Defense: Verify user is authorized to delete this specific article
    const canDelete = await canUserDeleteArticle(user, existing);
    if (!canDelete) {
      logSecurityAudit('PERMISSION_DENIED', {
        userId: user.id,
        role: user.role,
        resourceId: id,
        ip,
        status: 'BLOCKED',
        notes: 'Attempted to delete unauthorized article',
      });
      return NextResponse.json(
        { error: 'Permission denied. Only authorized editors or the author of draft stories can delete this article.' },
        { status: 403 }
      );
    }

    await db.prepare('DELETE FROM articles WHERE id = ?').run(id);

    invalidateDataCache('article');
    invalidateDataCache('categories');
    revalidatePath('/', 'layout');

    logSecurityAudit('ARTICLE_DELETED', {
      userId: user.id,
      role: user.role,
      resourceId: id,
      ip,
      status: 'SUCCESS',
      notes: `Article "${existing.title?.slice(0, 40)}" deleted`,
    });

    return NextResponse.json({ success: true, message: 'Article deleted successfully.' });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error deleting article.');
  }
}
