import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse('Asset ID required', { status: 400 });
    }

    const db = getDb();
    const asset = await db.prepare('SELECT * FROM media_assets WHERE id = ?').get(id);

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
        },
      });
    }

    // If it's an external URL (http/https), redirect
    if (asset.url.startsWith('http://') || asset.url.startsWith('https://')) {
      return NextResponse.redirect(asset.url, { status: 302 });
    }

    return new NextResponse('Unsupported media format', { status: 400 });
  } catch (error: any) {
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    await db.prepare('DELETE FROM media_assets WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete asset.' }, { status: 500 });
  }
}
