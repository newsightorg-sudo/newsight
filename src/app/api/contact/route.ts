import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { name, email, department, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }

    const db = getDb();
    const id = `msg-${Date.now()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO contact_messages (id, name, email, department, subject, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'NEW', ?)
    `).run(id, name, email, department || 'General', subject || 'No Subject', message, now);

    return NextResponse.json({ success: true, message: 'Message recorded.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Contact error.' }, { status: 500 });
  }
}
