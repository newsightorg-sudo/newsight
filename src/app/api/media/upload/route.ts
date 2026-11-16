import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { 
  verifyCsrfOrigin, 
  enforceRateLimit, 
  RateLimits, 
  sanitizeString, 
  safeErrorResponse, 
  logSecurityAudit 
} from '@/lib/security';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';
export const maxDuration = 30;

function isValidImageSignature(buffer: Buffer, mime: string): boolean {
  if (buffer.length < 12) return false;
  // JPEG: FF D8 FF
  if (mime === 'image/jpeg' && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return true;
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (mime === 'image/png' && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return true;
  }
  // GIF: GIF87a or GIF89a
  if (mime === 'image/gif' && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return true;
  }
  // WebP: RIFF....WEBP
  if (mime === 'image/webp') {
    const isRiff = buffer.toString('ascii', 0, 4) === 'RIFF';
    const isWebp = buffer.toString('ascii', 8, 12) === 'WEBP';
    if (isRiff && isWebp) return true;
  }
  // AVIF: ....ftyp
  if (mime === 'image/avif') {
    const ftyp = buffer.toString('ascii', 4, 8);
    if (ftyp === 'ftyp') return true;
  }
  return false;
}

export async function POST(req: Request) {
  // CSRF Origin verification
  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  // Rate limiting
  const rateLimitResponse = enforceRateLimit(req, RateLimits.MEDIA_UPLOAD, 'media_upload');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const altText = sanitizeString((formData.get('alt_text') as string) || '').slice(0, 500);
    const caption = sanitizeString((formData.get('caption') as string) || '').slice(0, 1000);
    const credit = sanitizeString((formData.get('credit') as string) || '').slice(0, 200);

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Allowed image formats
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
    const mimeType = file.type?.toLowerCase() || 'image/jpeg';
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

    // Verify magic bytes signature to prevent malicious disguised files
    if (!isValidImageSignature(buffer, mimeType)) {
      return NextResponse.json(
        { error: 'File signature does not match claimed image MIME type.' },
        { status: 400 }
      );
    }

    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    const assetId = `med-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    // Sanitize filename against directory traversal
    const safeBaseName = path.basename(file.name || 'image.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');

    // Optionally cache to disk if filesystem is writable (e.g. local development)
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const ext = path.extname(safeBaseName) || (mimeType === 'image/png' ? '.png' : '.jpg');
      const cleanName = `${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;
      const filePath = path.join(uploadsDir, cleanName);
      fs.writeFileSync(filePath, buffer);
    } catch (_fsError) {
      // Safe to ignore on serverless platforms (Vercel) with read-only file systems
    }

    // Persist to database in media_assets table
    const db = getDb();
    await db.prepare(`
      INSERT INTO media_assets (id, filename, url, alt_text, caption, credit, file_type, file_size, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(assetId, safeBaseName, dataUrl, altText, caption, credit, mimeType, file.size, now);

    logSecurityAudit('MEDIA_UPLOADED', {
      userId: user.id,
      assetId,
      mimeType,
      fileSize: file.size,
      filename: safeBaseName
    });

    const publicUrl = `/api/media/${assetId}`;

    return NextResponse.json({
      success: true,
      asset: {
        id: assetId,
        url: publicUrl,
        filename: safeBaseName,
        alt_text: altText,
        caption,
        credit,
      },
    });
  } catch (error: any) {
    return safeErrorResponse(error, 'Media upload error.');
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const db = getDb();
    const assets = await db.prepare('SELECT id, filename, url, alt_text, caption, credit, file_type, file_size, created_at FROM media_assets ORDER BY created_at DESC LIMIT 60').all();

    // Transform assets so that for catalog display, the URL is `/api/media/[id]` if it was stored as dataUrl
    const formatted = (assets || []).map((a: any) => ({
      ...a,
      url: a.url && a.url.startsWith('data:') ? `/api/media/${a.id}` : (a.url || `/api/media/${a.id}`),
    }));

    return NextResponse.json({ assets: formatted });
  } catch (error: any) {
    return safeErrorResponse(error, 'Failed to fetch media assets.');
  }
}
