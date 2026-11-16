import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { safeErrorResponse } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();

    const sql = `
      SELECT 
        a.id, a.title, a.slug, a.deck, a.body, a.featured_image, a.image_caption, a.image_credit,
        a.category_id, a.reporter_id, a.status, a.article_type, a.is_breaking, a.is_lead, a.is_featured,
        a.is_opinion, a.is_sponsored, a.reading_time_minutes, a.district, a.source_attribution,
        a.correction_notice, a.published_at, a.updated_at, a.created_at, a.views_count,
        c.name as category_name, c.slug as category_slug, c.color as category_color,
        r.name as reporter_name, r.slug as reporter_slug, r.avatar_url as reporter_avatar, r.role as reporter_title
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id OR a.category_id = c.slug
      LEFT JOIN reporters r ON a.reporter_id = r.id
      WHERE a.status = 'PUBLISHED'
      ORDER BY COALESCE(a.published_at, a.created_at) DESC, a.created_at DESC, a.id DESC
      LIMIT 24
    `;

    const rows = await db.prepare(sql).all<any>();
    const articles = rows || [];

    const featuredArticle = articles[0] || null;
    const sideRailArticles = articles.slice(1, 5);

    const version = featuredArticle 
      ? `${featuredArticle.id}_${featuredArticle.updated_at || featuredArticle.published_at || featuredArticle.created_at}_${articles.length}`
      : 'empty';

    return NextResponse.json(
      {
        total: articles.length,
        version,
        featuredArticle,
        sideRailArticles,
        latestArticles: articles,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error: any) {
    return safeErrorResponse(error, 'Error fetching live articles.');
  }
}
