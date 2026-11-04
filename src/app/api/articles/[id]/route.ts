import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, canPublish, canEditAnyArticle } from '@/lib/auth';
import { estimateReadingTime } from '@/lib/utils';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  const db = getDb();
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(id);

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
    const existing = db.prepare('SELECT * FROM articles WHERE id = ?').get(id) as any;

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

    db.prepare(`
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
      category_id || existing.category_id,
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
    db.prepare('DELETE FROM articles WHERE id = ?').run(id);

    return NextResponse.json({ success: true, message: 'Article deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error deleting article.' },
      { status: 500 }
    );
  }
}
