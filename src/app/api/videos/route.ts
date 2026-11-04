import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { getVideos, getAllVideosAdmin } from '@/lib/data';

export async function GET() {
  const videos = getAllVideosAdmin();
  return NextResponse.json({ videos });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const {
      title,
      summary,
      video_url,
      thumbnail_url,
      duration = '08:00',
      category = 'Ground Report',
      reporter_id,
      show_id,
      video_type = 'REPORT',
      is_featured = 0,
    } = await req.json();

    if (!title || !video_url) {
      return NextResponse.json({ error: 'Title and video URL are required.' }, { status: 400 });
    }

    const db = getDb();
    const id = `vid-${Date.now()}`;
    const slug = slugify(title) + '-' + Math.floor(Math.random() * 1000);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO videos (
        id, title, slug, summary, video_url, thumbnail_url, duration, 
        category, reporter_id, show_id, video_type, is_featured, 
        published_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title,
      slug,
      summary || '',
      video_url,
      thumbnail_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
      duration,
      category,
      reporter_id || null,
      show_id || null,
      video_type,
      is_featured ? 1 : 0,
      now,
      now
    );

    return NextResponse.json({ success: true, video: { id, title, slug } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error publishing video.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required.' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('DELETE FROM videos WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting video.' }, { status: 500 });
  }
}
