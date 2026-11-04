import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import path from 'path';
import fs from 'fs';

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
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file format. Only JPEG, PNG, WebP, and AVIF are permitted.' }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit.' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || '.jpg';
    const cleanName = `${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;
    const filePath = path.join(uploadsDir, cleanName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${cleanName}`;
    const db = getDb();
    const assetId = `med-${Date.now()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO media_assets (id, filename, url, alt_text, caption, credit, file_type, file_size, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(assetId, file.name, publicUrl, altText, caption, credit, file.type, file.size, now);

    return NextResponse.json({
      success: true,
      asset: {
        id: assetId,
        url: publicUrl,
        filename: file.name,
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
  const db = getDb();
  const assets = db.prepare('SELECT * FROM media_assets ORDER BY created_at DESC LIMIT 50').all();
  return NextResponse.json({ assets });
}
