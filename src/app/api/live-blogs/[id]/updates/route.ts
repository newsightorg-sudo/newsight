import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ updates: [] });
}

export async function POST() {
  return NextResponse.json({ error: 'Live blogs feature is disabled.' }, { status: 404 });
}
