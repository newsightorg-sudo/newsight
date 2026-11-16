import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { invalidateDataCache } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.prepare(`
      SELECT 
        c.id, c.name, c.slug, c.description, c.color, c.order_index, c.show_in_nav, c.created_at,
        CAST((
          SELECT COUNT(*) 
          FROM articles a 
          WHERE a.category_id = c.id 
             OR a.category_id = c.slug
             OR (c.slug = 'top-stories' AND (a.is_lead = 1 OR a.is_featured = 1 OR a.category_id = c.id OR a.category_id = 'cat-1'))
             OR (c.slug = 'field-reports' AND (a.article_type IN ('GROUND_REPORT', 'FIELD_REPORT') OR a.category_id IN ('cat-field-reports', 'field-reports')))
             OR (c.slug = 'recent-dispatches' AND (a.article_type IN ('RECENT_DISPATCH', 'DISPATCH') OR a.category_id IN ('cat-recent-dispatches', 'recent-dispatches')))
             OR (c.slug = 'investigations' AND (a.article_type IN ('INVESTIGATION', 'SPECIAL_INVESTIGATION') OR a.category_id IN ('cat-investigations', 'investigations', 'cat-11', 'cat-special-reports')))
             OR (c.slug = 'opinion' AND (a.is_opinion = 1 OR a.article_type = 'OPINION' OR a.category_id = 'cat-opinion'))
        ) AS INTEGER) as article_count
      FROM categories c
      ORDER BY c.order_index ASC, c.name ASC
    `).all<any>();

    const categories = (rows || []).map((c: any) => ({
      ...c,
      article_count: Number(c.article_count || 0)
    }));

    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching categories.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug: customSlug, description, color, order_index = 0, show_in_nav = 1 } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category / Desk name is required.' }, { status: 400 });
    }

    const db = getDb();
    let baseSlug = customSlug && customSlug.trim() ? slugify(customSlug) : slugify(name);
    if (!baseSlug) baseSlug = `desk-${Date.now()}`;

    // Ensure slug is unique
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
      if (!existing) break;
      slug = `${baseSlug}-${counter++}`;
    }

    const id = `cat-${Date.now()}`;
    const now = new Date().toISOString();
    const cleanColor = color || '#079FE3';
    const cleanOrder = Number(order_index) || 0;
    const cleanNav = show_in_nav ? 1 : 0;
    const cleanDesc = description?.trim() || '';

    await db.prepare(`
      INSERT INTO categories (id, name, slug, description, color, order_index, show_in_nav, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name.trim(), slug, cleanDesc, cleanColor, cleanOrder, cleanNav, now);

    invalidateDataCache('categor');
    invalidateDataCache('article');

    return NextResponse.json({
      success: true,
      category: {
        id,
        name: name.trim(),
        slug,
        description: cleanDesc,
        color: cleanColor,
        order_index: cleanOrder,
        show_in_nav: cleanNav,
        created_at: now,
        article_count: 0
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating category.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, slug: customSlug, description, color, order_index, show_in_nav } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required for update.' }, { status: 400 });
    }

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
        // Check uniqueness excluding this id
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

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch (_) {}
    }

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
    }

    const db = getDb();
    const existing = await db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    // Check if any articles are linked to this category
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

    // If force is requested and articles exist, safely reassign articles to another category so data is never orphaned
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
