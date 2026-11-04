import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, canPublish } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { getReporters } from '@/lib/data';

export async function GET() {
  const reporters = getReporters();
  return NextResponse.json({ reporters });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canPublish(user.role)) {
      return NextResponse.json({ error: 'Permission denied.' }, { status: 403 });
    }

    const { name, title, beat, bio, avatar_url, email, twitter, linkedin } = await req.json();

    if (!name || !title || !beat) {
      return NextResponse.json({ error: 'Name, title, and beat are required.' }, { status: 400 });
    }

    const db = getDb();
    const id = `rep-${Date.now()}`;
    const slug = slugify(name);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO reporters (id, name, slug, title, beat, bio, avatar_url, email, twitter, linkedin, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      id,
      name,
      slug,
      title,
      beat,
      bio || '',
      avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      email || `${slug}@dailysignal.com`,
      twitter || null,
      linkedin || null,
      now
    );

    return NextResponse.json({ success: true, reporter: { id, name, slug } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating reporter.' }, { status: 500 });
  }
}
