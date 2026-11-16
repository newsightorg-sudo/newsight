import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { invalidateDataCache } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const category = await db.prepare(`
      SELECT 
        c.id, c.name, c.slug, c.description, c.color, c.order_index, c.show_in_nav, c.created_at,
        CAST((
          SELECT COUNT(*) 
          FROM articles a 
          WHERE a.category_id = c.id OR a.category_id = c.slug
        ) AS INTEGER) as article_count
      FROM categories c
      WHERE c.id = ? OR c.slug = ?
    `).get(id, id) as any;

    if (!category) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    return NextResponse.json({
      category: {
        ...category,
        article_count: Number(category.article_count || 0)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching category.' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, slug: customSlug, description, color, order_index, show_in_nav } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category / Desk name is required.' }, { status: 400 });
    }

    const db = getDb();
    const existing = await db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    let slug = existing.slug;
    if (customSlug && customSlug.trim()) {
      const newSlug = slugify(customSlug);
      if (newSlug !== existing.slug) {
        const collision = await db.prepare('SELECT id FROM categories WHERE slug = ? AND id != ?').get(newSlug, id);
        if (collision) {
          return NextResponse.json({ error: `Slug "${newSlug}" is already in use by another desk.` }, { status: 400 });
        }
        slug = newSlug;
      }
    }

    const updatedColor = color || existing.color || '#079FE3';
    const updatedOrder = order_index !== undefined ? Number(order_index) : existing.order_index;
    const updatedShowNav = show_in_nav !== undefined ? (show_in_nav ? 1 : 0) : existing.show_in_nav;
    const updatedDesc = description !== undefined ? description.trim() : (existing.description || '');

    await db.prepare(`
      UPDATE categories
      SET name = ?, slug = ?, description = ?, color = ?, order_index = ?, show_in_nav = ?
      WHERE id = ?
    `).run(name.trim(), slug, updatedDesc, updatedColor, updatedOrder, updatedShowNav, id);

    invalidateDataCache('categor');
    invalidateDataCache('article');

    return NextResponse.json({
      success: true,
      category: {
        id,
        name: name.trim(),
        slug,
        description: updatedDesc,
        color: updatedColor,
        order_index: updatedOrder,
        show_in_nav: updatedShowNav
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating category.' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);

    const db = getDb();
    const existing = await db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    const articleCountRow = await db.prepare(`
      SELECT COUNT(*) as count FROM articles WHERE category_id = ? OR category_id = ?
    `).get(id, existing.slug) as any;
    const articleCount = Number(articleCountRow?.count || 0);

    const force = searchParams.get('force') === 'true';
    if (articleCount > 0 && !force) {
      return NextResponse.json({
        error: `Cannot delete "${existing.name}" because it contains ${articleCount} article(s). Pass force=true to confirm reassigning articles to an active desk.`,
        articleCount
      }, { status: 409 });
    }

    if (articleCount > 0 && force) {
      const fallbackCat = await db.prepare("SELECT id FROM categories WHERE id != ? ORDER BY order_index ASC LIMIT 1").get(id) as any;
      if (fallbackCat?.id) {
        await db.prepare("UPDATE articles SET category_id = ? WHERE category_id = ? OR category_id = ?").run(fallbackCat.id, id, existing.slug);
      }
    }

    await db.prepare('DELETE FROM categories WHERE id = ?').run(id);

    invalidateDataCache('categor');
    invalidateDataCache('article');

    return NextResponse.json({
      success: true,
      message: `Category "${existing.name}" deleted successfully.`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting category.' }, { status: 500 });
  }
}
