import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getCurrentUser, canPublish } from '@/lib/auth';
import { slugify, estimateReadingTime } from '@/lib/utils';
import { getAllArticlesAdmin, invalidateDataCache } from '@/lib/data';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;

  const articles = await getAllArticlesAdmin(status);
  return NextResponse.json({ articles });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
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
      article_type = 'NEWS',
      status = 'DRAFT',
      is_breaking = 0,
      is_lead = 0,
      is_featured = 0,
      is_opinion = 0,
      district,
      source_attribution,
      correction_notice,
    } = body;

    if (!title || !deck || !content || !category_id || !reporter_id) {
      return NextResponse.json(
        { error: 'Title, summary, content, category, and reporter attribution are required.' },
        { status: 400 }
      );
    }

    // Role-based publish permission check
    let targetStatus = status;
    if ((status === 'PUBLISHED' || status === 'APPROVED') && !canPublish(user.role)) {
      targetStatus = 'IN_REVIEW'; // Force review if reporter
    }

    const db = getDb();
    const id = `art-${Date.now()}`;
    const baseSlug = slugify(title);
    let finalSlug = baseSlug;

    // Ensure unique slug
    const existing = await db.prepare('SELECT id FROM articles WHERE slug = ?').get(finalSlug);
    if (existing) {
      finalSlug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;
    }

    const readingTime = estimateReadingTime(content);
    const now = new Date().toISOString();
    const publishedAt = targetStatus === 'PUBLISHED' ? now : null;

    // Ensure special categories exist if selected
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
      title,
      finalSlug,
      deck,
      content,
      featured_image?.trim() || '',
      image_caption || '',
      image_credit || '',
      targetCategoryId,
      reporter_id,
      targetStatus,
      article_type,
      is_breaking ? 1 : 0,
      is_lead ? 1 : 0,
      is_featured ? 1 : 0,
      is_opinion ? 1 : 0,
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
    return NextResponse.json({
      success: true,
      article: { id, slug: finalSlug, status: targetStatus },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error saving article.' },
      { status: 500 }
    );
  }
}
