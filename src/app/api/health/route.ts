import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const envFound = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    POSTGRES_URL: Boolean(process.env.POSTGRES_URL),
    POSTGRES_PRISMA_URL: Boolean(process.env.POSTGRES_PRISMA_URL),
    DATABASE_URL_UNPOOLED: Boolean(process.env.DATABASE_URL_UNPOOLED),
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: Boolean(process.env.VERCEL),
    VERCEL_ENV: process.env.VERCEL_ENV || 'local'
  };

  try {
    const db = getDb();
    const [categories, articles, videos] = await Promise.all([
      db.query('SELECT count(*) as count FROM categories').catch(() => [{ count: 0 }]),
      db.query('SELECT count(*) as count FROM articles').catch(() => [{ count: 0 }]),
      db.query('SELECT count(*) as count FROM videos').catch(() => [{ count: 0 }])
    ]);

    const categoriesCount = Number(categories[0]?.count || 0);
    const articlesCount = Number(articles[0]?.count || 0);
    const videosCount = Number(videos[0]?.count || 0);

    const isConnected = categoriesCount > 0 || articlesCount > 0;

    return NextResponse.json({
      status: isConnected ? 'healthy' : 'warning',
      database_connected: isConnected,
      counts: {
        categories: categoriesCount,
        articles: articlesCount,
        videos: videosCount
      },
      environment: envFound,
      message: isConnected 
        ? 'Neon database connected successfully and data is loaded.' 
        : 'DATABASE_URL is missing or returning 0 records. Add DATABASE_URL in Vercel Project Settings > Environment Variables, then Redeploy.'
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      database_connected: false,
      environment: envFound,
      error: error?.message || 'Database connection error',
      hint: 'Add DATABASE_URL to your Vercel Project Settings > Environment Variables, then Redeploy.'
    }, { status: 500 });
  }
}
