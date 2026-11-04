import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, edition_preference = 'India' } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id, is_active FROM newsletter_subscribers WHERE email = ?').get(email) as any;

    const now = new Date().toISOString();

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json({ message: 'You are already subscribed to NEWSIGHT briefings.' });
      }
      db.prepare('UPDATE newsletter_subscribers SET is_active = 1, edition_preference = ?, subscribed_at = ? WHERE email = ?')
        .run(edition_preference, now, email);
      return NextResponse.json({ success: true, message: 'Your subscription has been reactivated.' });
    }

    const id = `sub-${Date.now()}`;
    db.prepare(`
      INSERT INTO newsletter_subscribers (id, email, edition_preference, is_active, subscribed_at)
      VALUES (?, ?, ?, 1, ?)
    `).run(id, email, edition_preference, now);

    return NextResponse.json({ success: true, message: 'Welcome to NEWSIGHT morning dispatches.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Subscription error.' }, { status: 500 });
  }
}
