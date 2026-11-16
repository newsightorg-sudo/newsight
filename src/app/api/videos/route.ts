import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, isEditorOrAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { getAllVideosAdmin, invalidateDataCache } from '@/lib/data';
import {
  verifyCsrfOrigin,
  getClientIp,
  sanitizeString,
  logSecurityAudit,
  safeErrorResponse,
} from '@/lib/security';

export async function GET() {
  try {
    const videos = await getAllVideosAdmin();
    return NextResponse.json({ videos });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error fetching videos.');
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  try {
    const user = await getCurrentUser();
    // RBAC: Only Editor or Super Admin can create video broadcasts
    if (!user || !isEditorOrAdmin(user.role)) {
      logSecurityAudit('PERMISSION_DENIED', {
        userId: user?.id,
        role: user?.role,
        ip,
        status: 'BLOCKED',
        notes: 'Unauthorized video creation attempt',
      });
      return NextResponse.json({ error: 'Permission denied. Editor role required.' }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    const title = sanitizeString(body.title, 200);
    const summary = sanitizeString(body.summary, 1000);
    const video_url = sanitizeString(body.video_url, 1000);
    const thumbnail_url = sanitizeString(body.thumbnail_url, 1000);
    const duration = sanitizeString(body.duration, 20, '08:00');
    const category = sanitizeString(body.category, 60, 'Ground Report');
    const reporter_id = sanitizeString(body.reporter_id, 100);
    const show_id = sanitizeString(body.show_id, 100);
    const video_type = sanitizeString(body.video_type, 40, 'REPORT');
    const is_featured = body.is_featured ? 1 : 0;

    if (!title || !video_url) {
      return NextResponse.json({ error: 'Title and video URL are required.' }, { status: 400 });
    }

    const db = getDb();
    const id = `vid-${Date.now()}`;
    const slug = slugify(title) + '-' + Math.floor(Math.random() * 1000);
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO videos (
        id, title, slug, summary, video_url, thumbnail_url, duration, 
        category, reporter_id, show_id, video_type, is_featured, 
        published_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title,
      slug,
      summary,
      video_url,
      thumbnail_url || '',
      duration,
      category,
      reporter_id || null,
      show_id || null,
      video_type,
      is_featured,
      now,
      now
    );

    invalidateDataCache('video');

    logSecurityAudit('SETTINGS_UPDATED', {
      userId: user.id,
      role: user.role,
      resourceId: id,
      ip,
      status: 'SUCCESS',
      notes: `Published video "${title}"`,
    });

    return NextResponse.json({ success: true, video: { id, title, slug } });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error publishing video.');
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
      return NextResponse.json({ error: 'Video ID is required.' }, { status: 400 });
    }

    const db = getDb();
    await db.prepare('DELETE FROM videos WHERE id = ?').run(id);

    invalidateDataCache('video');

    logSecurityAudit('SETTINGS_UPDATED', {
      userId: user.id,
      role: user.role,
      resourceId: id,
      ip,
      status: 'SUCCESS',
      notes: `Deleted video ${id}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error deleting video.');
  }
}
