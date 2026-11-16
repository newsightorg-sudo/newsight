import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getCurrentUser, canPublish, canEditAnyArticle } from '@/lib/auth';
import { estimateReadingTime } from '@/lib/utils';
import { invalidateDataCache } from '@/lib/data';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  const db = getDb();
  const article = await db.prepare('SELECT * FROM articles WHERE id = ?').get(id);

  if (!article) {
    return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
  }

  return NextResponse.json({ article });
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const existing = await db.prepare('SELECT * FROM articles WHERE id = ?').get(id) as any;

    if (!existing) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      deck,
      content,
      category_id,
      reporter_id,
      featured_image,
      image_caption,
      image_credit,
      article_type,
      status,
      is_breaking,
      is_lead,
      is_featured,
      is_opinion,
      district,
      source_attribution,
      correction_notice,
    } = body;

    let targetStatus = status || existing.status;
    if ((targetStatus === 'PUBLISHED' || targetStatus === 'APPROVED') && !canPublish(user.role)) {
      targetStatus = 'IN_REVIEW';
    }

    const now = new Date().toISOString();
    let publishedAt = existing.published_at;
    if (targetStatus === 'PUBLISHED' && !publishedAt) {
      publishedAt = now;
    }

    const readingTime = content ? estimateReadingTime(content) : existing.reading_time_minutes;

    // Ensure special categories exist if selected
    let targetCategoryId = category_id || existing.category_id;
    try {
      if (category_id === 'cat-field-reports' || category_id === 'field-reports') {
        const cat = await db.prepare('SELECT id FROM categories WHERE id = ? OR slug = ?').get('cat-field-reports', 'field-reports');
        if (!cat) {
          await db.prepare(`
            INSERT INTO categories (id, name, slug, description, color, order_index, show_in_nav, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run('cat-field-reports', 'Latest Field Reports & Stories', 'field-reports', 'On-the-ground visual dispatches and field reporting.', '#E50914', 2, 1, new Date().toISOString());
        } else {
          targetCategoryId = (cat as any).id;
        }
      } else if (category_id === 'cat-recent-dispatches' || category_id === 'recent-dispatches') {
        const cat = await db.prepare('SELECT id FROM categories WHERE id = ? OR slug = ?').get('cat-recent-dispatches', 'recent-dispatches');
        if (!cat) {
          await db.prepare(`
            INSERT INTO categories (id, name, slug, description, color, order_index, show_in_nav, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run('cat-recent-dispatches', 'Recent Dispatches & Articles', 'recent-dispatches', 'Latest dispatches, ground updates, and breaking articles.', '#079FE3', 3, 1, new Date().toISOString());
        } else {
          targetCategoryId = (cat as any).id;
        }
      } else if (category_id === 'cat-investigations' || category_id === 'investigations') {
        const cat = await db.prepare('SELECT id FROM categories WHERE id = ? OR slug = ?').get('cat-investigations', 'investigations');
        if (!cat) {
          await db.prepare(`
            INSERT INTO categories (id, name, slug, description, color, order_index, show_in_nav, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run('cat-investigations', 'Special Investigations & Ground Desks', 'investigations', 'In-depth investigative reports and public interest investigations.', '#075DEB', 4, 1, new Date().toISOString());
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
      title || existing.title,
      deck || existing.deck,
      content || existing.body,
      targetCategoryId,
      reporter_id || existing.reporter_id,
      featured_image || existing.featured_image,
      image_caption !== undefined ? image_caption : existing.image_caption,
      image_credit !== undefined ? image_credit : existing.image_credit,
      article_type || existing.article_type,
      targetStatus,
      is_breaking !== undefined ? (is_breaking ? 1 : 0) : existing.is_breaking,
      is_lead !== undefined ? (is_lead ? 1 : 0) : existing.is_lead,
      is_featured !== undefined ? (is_featured ? 1 : 0) : existing.is_featured,
      is_opinion !== undefined ? (is_opinion ? 1 : 0) : existing.is_opinion,
      readingTime,
      district !== undefined ? district : existing.district,
      source_attribution !== undefined ? source_attribution : existing.source_attribution,
      correction_notice !== undefined ? correction_notice : existing.correction_notice,
      publishedAt,
      now,
      id
    );

    invalidateDataCache('article');
    invalidateDataCache('categories');
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, message: 'Article updated successfully.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error updating article.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user || !canPublish(user.role)) {
      return NextResponse.json({ error: 'Permission denied. Only editors and admins can delete articles.' }, { status: 403 });
    }

    const { id } = await params;
    const db = getDb();
    await db.prepare('DELETE FROM articles WHERE id = ?').run(id);

    invalidateDataCache('article');
    invalidateDataCache('categories');
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, message: 'Article deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error deleting article.' },
      { status: 500 }
    );
  }
}
