import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { article_id, author_name, author_email, content } = await req.json();

    if (!article_id || !author_name || !content) {
      return NextResponse.json({ error: 'Article ID, name, and comment content are required.' }, { status: 400 });
    }

    const db = getDb();
    const id = `comm-${Date.now()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO comments (id, article_id, author_name, author_email, content, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'APPROVED', ?)
    `).run(id, article_id, author_name, author_email || '', content, now);

    return NextResponse.json({
      success: true,
      comment: {
        id,
        article_id,
        author_name,
        author_email,
        content,
        status: 'APPROVED',
        created_at: now,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Comment error.' }, { status: 500 });
  }
}
