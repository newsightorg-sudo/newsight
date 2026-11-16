import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const altText = (formData.get('alt_text') as string) || '';
    const caption = (formData.get('caption') as string) || '';
    const credit = (formData.get('credit') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Allowed image formats
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
    const mimeType = file.type || 'image/jpeg';
    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Invalid file format. Only JPEG, PNG, WebP, AVIF and GIF are permitted.' },
        { status: 400 }
      );
    }

    // Max 15MB
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 15MB limit.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    const assetId = `med-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    // Optionally cache to disk if filesystem is writable (e.g. local development)
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const ext = path.extname(file.name) || (mimeType === 'image/png' ? '.png' : '.jpg');
      const cleanName = `${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;
      const filePath = path.join(uploadsDir, cleanName);
      fs.writeFileSync(filePath, buffer);
    } catch (_fsError) {
      // Safe to ignore on serverless platforms (Vercel) with read-only file systems
    }

    // Always persist to database in media_assets table
    const db = getDb();
    await db.prepare(`
      INSERT INTO media_assets (id, filename, url, alt_text, caption, credit, file_type, file_size, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(assetId, file.name || 'image.jpg', dataUrl, altText, caption, credit, mimeType, file.size, now);

    const publicUrl = `/api/media/${assetId}`;

    return NextResponse.json({
      success: true,
      asset: {
        id: assetId,
        url: publicUrl,
        filename: file.name || 'image.jpg',
        alt_text: altText,
        caption,
        credit,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Media upload error.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getDb();
    const assets = await db.prepare('SELECT id, filename, url, alt_text, caption, credit, file_type, file_size, created_at FROM media_assets ORDER BY created_at DESC LIMIT 60').all();

    // Transform assets so that for catalog display, the URL is `/api/media/[id]` if it was stored as dataUrl
    const formatted = (assets || []).map((a: any) => ({
      ...a,
      url: a.url && a.url.startsWith('data:') ? `/api/media/${a.id}` : (a.url || `/api/media/${a.id}`),
    }));

    return NextResponse.json({ assets: formatted });
  } catch (error: any) {
    return NextResponse.json({ assets: [] });
  }
}
