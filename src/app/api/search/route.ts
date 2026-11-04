import { NextRequest, NextResponse } from 'next/server';
import { searchArticles, searchVideos } from '@/lib/data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (!q.trim() || q.trim().length < 2) {
    return NextResponse.json({ videos: [], articles: [] });
  }

  try {
    const videos = searchVideos(q, 4);
    const articles = searchArticles(q).slice(0, 4);

    return NextResponse.json({
      videos: videos.map(v => ({
        id: v.id,
        title: v.title,
        slug: v.slug,
        thumbnail: v.thumbnail_url,
        duration: v.duration,
        category: v.category
      })),
      articles: articles.map(a => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        image: a.featured_image,
        category: a.category_name,
        reporter: a.reporter_name
      }))
    });
  } catch (error) {
    console.error('API search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
