import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, canPublish } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { getCategories } from '@/lib/data';

export async function GET() {
  const categories = getCategories(false);
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canPublish(user.role)) {
      return NextResponse.json({ error: 'Permission denied.' }, { status: 403 });
    }

    const { name, description, color, order_index = 0, show_in_nav = 1 } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    const db = getDb();
    const id = `cat-${Date.now()}`;
    const slug = slugify(name);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO categories (id, name, slug, description, color, order_index, show_in_nav, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, slug, description || '', color || '#0f172a', order_index, show_in_nav ? 1 : 0, now);

    return NextResponse.json({ success: true, category: { id, name, slug } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating category.' }, { status: 500 });
  }
}
