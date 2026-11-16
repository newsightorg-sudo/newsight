import { NextRequest, NextResponse } from 'next/server';
import { searchArticles, searchVideos } from '@/lib/data';
import { enforceRateLimit, RateLimits, sanitizeString, safeErrorResponse } from '@/lib/security';

export async function GET(request: NextRequest) {
  // Rate limit search requests to prevent DoS
  const rateLimitResponse = enforceRateLimit(request, RateLimits.SEARCH, 'search');
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const rawQ = searchParams.get('q') || '';
  const q = sanitizeString(rawQ).slice(0, 100).trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ videos: [], articles: [] });
  }

  try {
    const videos = await searchVideos(q, 4);
    const articles = (await searchArticles(q)).slice(0, 4);

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
    return safeErrorResponse(error, 'Search failed.');
  }
}
