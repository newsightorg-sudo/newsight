import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getLiveUpdates } from '@/lib/data';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  const updates = getLiveUpdates(id);
  return NextResponse.json({ updates });
}

export async function POST(req: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { id: liveBlogId } = await params;
    const { title, content, image_url, author_name, is_key_event } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required.' }, { status: 400 });
    }

    const db = getDb();
    const updateId = `lu-${Date.now()}`;
    const now = new Date();
    const timestampStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST';
    const isoNow = now.toISOString();

    db.prepare(`
      INSERT INTO live_updates (id, live_blog_id, title, content, image_url, author_name, is_key_event, timestamp, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      updateId,
      liveBlogId,
      title,
      content,
      image_url || null,
      author_name || user.name,
      is_key_event ? 1 : 0,
      timestampStr,
      isoNow
    );

    // Update parent live blog's updated_at
    db.prepare('UPDATE live_blogs SET updated_at = ? WHERE id = ?').run(isoNow, liveBlogId);

    return NextResponse.json({
      success: true,
      update: {
        id: updateId,
        live_blog_id: liveBlogId,
        title,
        content,
        image_url,
        author_name: author_name || user.name,
        is_key_event: is_key_event ? 1 : 0,
        timestamp: timestampStr,
        created_at: isoNow,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error posting update.' }, { status: 500 });
  }
}
