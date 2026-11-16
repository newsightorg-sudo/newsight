import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, isEditorOrAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { getShows, invalidateDataCache } from '@/lib/data';
import {
  verifyCsrfOrigin,
  getClientIp,
  sanitizeString,
  sanitizeInteger,
  logSecurityAudit,
  safeErrorResponse,
} from '@/lib/security';

export async function GET() {
  try {
    const shows = await getShows();
    return NextResponse.json({ shows });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error fetching shows.');
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  try {
    const user = await getCurrentUser();
    // RBAC: Only Editor or Super Admin can create shows
    if (!user || !isEditorOrAdmin(user.role)) {
      logSecurityAudit('PERMISSION_DENIED', {
        userId: user?.id,
        role: user?.role,
        ip,
        status: 'BLOCKED',
        notes: 'Unauthorized show creation attempt',
      });
      return NextResponse.json({ error: 'Permission denied. Editor role required.' }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    const title = sanitizeString(body.title, 200);
    const description = sanitizeString(body.description, 1000);
    const cover_image = sanitizeString(body.cover_image, 1000);
    const banner_image = sanitizeString(body.banner_image, 1000);
    const host_name = sanitizeString(body.host_name, 100);
    const schedule_info = sanitizeString(body.schedule_info, 150);
    const order_index = sanitizeInteger(body.order_index, 0, 1000, 0);

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 });
    }

    const db = getDb();
    const id = `show-${Date.now()}`;
    const slug = slugify(title);
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO shows (id, title, slug, description, cover_image, banner_image, host_name, schedule_info, order_index, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title,
      slug,
      description,
      cover_image || '',
      banner_image || null,
      host_name || null,
      schedule_info || null,
      order_index,
      now
    );

    invalidateDataCache('show');

    logSecurityAudit('SETTINGS_UPDATED', {
      userId: user.id,
      role: user.role,
      resourceId: id,
      ip,
      status: 'SUCCESS',
      notes: `Created show "${title}"`,
    });

    return NextResponse.json({ success: true, show: { id, title, slug } });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error creating show.');
  }
}

export async function DELETE(req: Request) {
  const ip = getClientIp(req);

  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  try {
    const user = await getCurrentUser();
    if (!user || !isEditorOrAdmin(user.role)) {
      return NextResponse.json({ error: 'Permission denied. Editor role required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = sanitizeString(searchParams.get('id'), 100);

    if (!id) {
      return NextResponse.json({ error: 'Show ID is required.' }, { status: 400 });
    }

    const db = getDb();
    await db.prepare('DELETE FROM shows WHERE id = ?').run(id);

    invalidateDataCache('show');

    logSecurityAudit('SETTINGS_UPDATED', {
      userId: user.id,
      role: user.role,
      resourceId: id,
      ip,
      status: 'SUCCESS',
      notes: `Deleted show ${id}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error deleting show.');
  }
}
