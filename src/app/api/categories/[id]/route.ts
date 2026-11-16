import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, isEditorOrAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { invalidateDataCache } from '@/lib/data';
import {
  verifyCsrfOrigin,
  getClientIp,
  sanitizeString,
  sanitizeInteger,
  logSecurityAudit,
  safeErrorResponse,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = sanitizeString(rawId, 100);
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
        article_count: Number(category.article_count || 0),
      },
    });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error fetching category.');
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(req);

  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  try {
    const user = await getCurrentUser();
    if (!user || !isEditorOrAdmin(user.role)) {
      return NextResponse.json({ error: 'Permission denied. Editor role required.' }, { status: 403 });
    }

    const { id: rawId } = await params;
    const id = sanitizeString(rawId, 100);
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    const name = sanitizeString(body.name, 100);
    const customSlug = sanitizeString(body.slug, 100);
    const description = body.description !== undefined ? sanitizeString(body.description, 500) : undefined;
    const color = body.color !== undefined ? sanitizeString(body.color, 30) : undefined;
    const order_index = body.order_index !== undefined ? sanitizeInteger(body.order_index, 0, 1000) : undefined;
    const show_in_nav = body.show_in_nav !== undefined ? (body.show_in_nav ? 1 : 0) : undefined;

    if (!name) {
      return NextResponse.json({ error: 'Category / Desk name is required.' }, { status: 400 });
    }

    const db = getDb();
    const existing = await db.prepare('SELECT * FROM categories WHERE id = ?').get<any>(id);
    if (!existing) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    let slug = existing.slug;
    if (customSlug) {
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
    const updatedOrder = order_index !== undefined ? order_index : existing.order_index;
    const updatedShowNav = show_in_nav !== undefined ? show_in_nav : existing.show_in_nav;
    const updatedDesc = description !== undefined ? description : (existing.description || '');

    await db.prepare(`
      UPDATE categories
      SET name = ?, slug = ?, description = ?, color = ?, order_index = ?, show_in_nav = ?
      WHERE id = ?
    `).run(name, slug, updatedDesc, updatedColor, updatedOrder, updatedShowNav, id);

    invalidateDataCache('categor');
    invalidateDataCache('article');

    logSecurityAudit('CATEGORY_MUTATED', {
      userId: user.id,
      role: user.role,
      resourceId: id,
      ip,
      status: 'SUCCESS',
      notes: `Updated category "${name}"`,
    });

    return NextResponse.json({
      success: true,
      category: {
        id,
        name,
        slug,
        description: updatedDesc,
        color: updatedColor,
        order_index: updatedOrder,
        show_in_nav: updatedShowNav,
      },
    });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error updating category.');
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(req);

  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  try {
    const user = await getCurrentUser();
    if (!user || !isEditorOrAdmin(user.role)) {
      return NextResponse.json({ error: 'Permission denied. Editor role required.' }, { status: 403 });
    }

    const { id: rawId } = await params;
    const id = sanitizeString(rawId, 100);
    const { searchParams } = new URL(req.url);

    const db = getDb();
    const existing = await db.prepare('SELECT * FROM categories WHERE id = ?').get<any>(id);
    if (!existing) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    const articleCountRow = await db.prepare(`
      SELECT COUNT(*) as count FROM articles WHERE category_id = ? OR category_id = ?
    `).get<any>(id, existing.slug);
    const articleCount = Number(articleCountRow?.count || 0);

    const force = searchParams.get('force') === 'true';
    if (articleCount > 0 && !force) {
      return NextResponse.json({
        error: `Cannot delete "${existing.name}" because it contains ${articleCount} article(s). Pass force=true to confirm reassigning articles to an active desk.`,
        articleCount,
      }, { status: 409 });
    }

    if (articleCount > 0 && force) {
      const fallbackCat = await db.prepare('SELECT id FROM categories WHERE id != ? ORDER BY order_index ASC LIMIT 1').get<any>(id);
      if (fallbackCat?.id) {
        await db.prepare('UPDATE articles SET category_id = ? WHERE category_id = ? OR category_id = ?').run(fallbackCat.id, id, existing.slug);
      }
    }

    await db.prepare('DELETE FROM categories WHERE id = ?').run(id);

    invalidateDataCache('categor');
    invalidateDataCache('article');

    logSecurityAudit('CATEGORY_MUTATED', {
      userId: user.id,
      role: user.role,
      resourceId: id,
      ip,
      status: 'SUCCESS',
      notes: `Deleted category "${existing.name}"`,
    });

    return NextResponse.json({
      success: true,
      message: `Category "${existing.name}" deleted successfully.`,
    });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error deleting category.');
  }
}
