import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    // Lightweight connectivity probe without leaking system metadata or counts
    await db.query('SELECT 1');

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}


