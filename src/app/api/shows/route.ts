import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { getShows } from '@/lib/data';

export async function GET() {
  const shows = getShows();
  return NextResponse.json({ shows });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const {
      title,
      description,
      cover_image,
      banner_image,
      host_name,
      schedule_info,
      order_index = 0
    } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 });
    }

    const db = getDb();
    const id = `show-${Date.now()}`;
    const slug = slugify(title);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO shows (id, title, slug, description, cover_image, banner_image, host_name, schedule_info, order_index, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title,
      slug,
      description,
      cover_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
      banner_image || null,
      host_name || null,
      schedule_info || null,
      Number(order_index || 0),
      now
    );

    return NextResponse.json({ success: true, show: { id, title, slug } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating show.' }, { status: 500 });
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
      return NextResponse.json({ error: 'Show ID is required.' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('DELETE FROM shows WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting show.' }, { status: 500 });
  }
}
