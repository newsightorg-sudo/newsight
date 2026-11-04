import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { getLiveBlogs } from '@/lib/data';

export async function GET() {
  const blogs = getLiveBlogs();
  return NextResponse.json({ liveBlogs: blogs });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { title, summary, reporter_id, category_id, status = 'ACTIVE' } = await req.json();

    if (!title || !summary) {
      return NextResponse.json({ error: 'Title and summary are required.' }, { status: 400 });
    }

    const db = getDb();
    const id = `lb-${Date.now()}`;
    const slug = slugify(title);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO live_blogs (id, title, slug, summary, status, reporter_id, category_id, started_at, updated_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, slug, summary, status, reporter_id || null, category_id || null, now, now, now);

    return NextResponse.json({ success: true, liveBlog: { id, title, slug } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating live blog.' }, { status: 500 });
  }
}
