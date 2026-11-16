import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, isEditorOrAdmin } from '@/lib/auth';
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

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id: rawId } = await params;
    const id = sanitizeString(rawId, 100);
    if (!id) {
      return new NextResponse('Asset ID required', { status: 400 });
    }

    const db = getDb();
    const asset = await db.prepare('SELECT * FROM media_assets WHERE id = ?').get<any>(id);

    if (!asset || !asset.url) {
      return new NextResponse('Media asset not found', { status: 404 });
    }

    // If url is stored as a Data URL (base64)
    if (asset.url.startsWith('data:')) {
      const commaIdx = asset.url.indexOf(',');
      if (commaIdx === -1) {
        return new NextResponse('Corrupted media data', { status: 500 });
      }
      const header = asset.url.slice(0, commaIdx);
      const mime = header.split(':')[1]?.split(';')[0] || asset.file_type || 'image/jpeg';
      const base64Str = asset.url.slice(commaIdx + 1);
      const buffer = Buffer.from(base64Str, 'base64');

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': mime,
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    // If it's an external URL (http/https), safely redirect
    if (asset.url.startsWith('http://') || asset.url.startsWith('https://')) {
      try {
        const parsed = new URL(asset.url);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          return NextResponse.redirect(asset.url, { status: 302 });
        }
      } catch (_) {}
    }

    return new NextResponse('Unsupported media format', { status: 400 });
  } catch (error: any) {
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const ip = getClientIp(req);

  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  try {
    const user = await getCurrentUser();
    // RBAC: Only Editor or Super Admin can delete assets
    if (!user || !isEditorOrAdmin(user.role)) {
      logSecurityAudit('PERMISSION_DENIED', {
        userId: user?.id,
        role: user?.role,
        ip,
        status: 'BLOCKED',
        notes: 'Unauthorized media asset deletion attempt',
      });
      return NextResponse.json({ error: 'Permission denied. Editor role required.' }, { status: 403 });
    }

    const { id: rawId } = await params;
    const id = sanitizeString(rawId, 100);
    const db = getDb();
    await db.prepare('DELETE FROM media_assets WHERE id = ?').run(id);

    logSecurityAudit('MEDIA_DELETED', {
      userId: user.id,
      role: user.role,
      resourceId: id,
      ip,
      status: 'SUCCESS',
      notes: `Deleted media asset ${id}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return safeErrorResponse(error, 'Failed to delete asset.');
  }
}
