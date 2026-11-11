import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, isAdmin, canPublish } from '@/lib/auth';
import { slugify, estimateReadingTime } from '@/lib/utils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const db = getDb();

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
      WHERE a.reporter_id = ?
      ORDER BY a.created_at DESC
    `).all<any>(id);

    return NextResponse.json({ reports });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching reporter reports.' }, { status: 500 });
  }
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user || (!isAdmin(user.role) && !canPublish(user.role))) {
      return NextResponse.json({ error: 'Permission denied.' }, { status: 403 });
    }

    const { id: reporterId } = await context.params;
    const db = getDb();

    // Verify reporter exists
    const reporter = await db.prepare('SELECT id, name FROM reporters WHERE id = ?').get<any>(reporterId);
    if (!reporter) {
      return NextResponse.json({ error: 'Reporter not found.' }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      deck = '',
      content = '',
      category_id,
      article_type = 'NEWS',
      status = 'DRAFT',
      featured_image,
      image_caption,
      image_credit,
      district,
      source_attribution,
      is_breaking = 0,
      is_lead = 0,
      is_featured = 0,
      is_opinion = 0,
      is_sponsored = 0
    } = body;

    if (!title || !category_id) {
      return NextResponse.json({ error: 'Headline and Category are required.' }, { status: 400 });
    }

    const articleId = `art-${Date.now()}`;
    const slug = slugify(title);
    const now = new Date().toISOString();
    const readingTime = estimateReadingTime(content);

    await db.prepare(`
      INSERT INTO articles (
        id, title, slug, deck, body, featured_image, image_caption, image_credit,
        category_id, reporter_id, status, article_type, is_breaking, is_lead, is_featured,
        is_opinion, is_sponsored, reading_time_minutes, district, source_attribution,
        published_at, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      articleId,
      title.trim(),
      slug,
      deck.trim(),
      content,
      featured_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
      image_caption || null,
      image_credit || null,
      category_id,
      reporterId,
      status,
      article_type,
      is_breaking ? 1 : 0,
      is_lead ? 1 : 0,
      is_featured ? 1 : 0,
      is_opinion ? 1 : 0,
      is_sponsored ? 1 : 0,
      readingTime,
      district || null,
      source_attribution || null,
      status === 'PUBLISHED' ? now : null,
      now,
      now
    );

    return NextResponse.json({
      success: true,
      message: `Report created for ${reporter.name}.`,
      report: { id: articleId, title, slug, status }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating report.' }, { status: 500 });
  }
}

