import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getCurrentUser, isEditorOrAdmin, canPublish } from '@/lib/auth';
import { invalidateDataCache } from '@/lib/data';
import {
  verifyCsrfOrigin,
  getClientIp,
  sanitizeString,
  logSecurityAudit,
  safeErrorResponse,
} from '@/lib/security';

interface Params {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: Params) {
  const ip = getClientIp(req);

  // 1. CSRF Origin validation
  if (!verifyCsrfOrigin(req)) {
    logSecurityAudit('CSRF_BLOCKED', { ip, status: 'BLOCKED', notes: 'Cross-origin status change attempt' });
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    const status = sanitizeString(body.status, 30);
    const validStatuses = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid article status.' }, { status: 400 });
    }

    // Role-based status transition checks
    if ((status === 'APPROVED' || status === 'PUBLISHED' || status === 'ARCHIVED') && !canPublish(user.role)) {
      logSecurityAudit('PERMISSION_DENIED', {
        userId: user.id,
        role: user.role,
        resourceId: id,
        ip,
        status: 'BLOCKED',
        notes: `Attempted unauthorized transition to ${status}`,
      });
      return NextResponse.json(
        { error: 'Only Editors and Administrators have permission to approve or publish content.' },
        { status: 403 }
      );
    }

    const db = getDb();
    const existing = await db.prepare('SELECT id, status FROM articles WHERE id = ?').get<any>(id);
    if (!existing) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    const now = new Date().toISOString();
    let updateQuery = 'UPDATE articles SET status = ?, updated_at = ?';
    const queryParams: any[] = [status, now];

    if (status === 'PUBLISHED') {
      updateQuery += ', published_at = COALESCE(published_at, ?)';
      queryParams.push(now);
    }

    updateQuery += ' WHERE id = ?';
    queryParams.push(id);

    await db.prepare(updateQuery).run(...queryParams);
    invalidateDataCache('article');
    invalidateDataCache('categories');
    revalidatePath('/', 'layout');

    logSecurityAudit('ARTICLE_STATUS_CHANGED', {
      userId: user.id,
      role: user.role,
      resourceId: id,
      ip,
      status: 'SUCCESS',
      notes: `Status changed from ${existing.status} to ${status}`,
    });

    return NextResponse.json({
      success: true,
      message: `Article status updated to ${status}.`,
    });
  } catch (error: any) {
    return safeErrorResponse(error, 'Status transition error.');
  }
}
