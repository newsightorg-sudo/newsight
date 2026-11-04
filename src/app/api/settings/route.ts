import { NextResponse } from 'next/server';
import { getEditorialSettings, updateEditorialSettings } from '@/lib/data';
import { getCurrentUser, canManageSettings } from '@/lib/auth';

export async function GET() {
  const settings = getEditorialSettings();
  return NextResponse.json({ settings });
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageSettings(user.role)) {
      return NextResponse.json({ error: 'Permission denied. Super Admin role required.' }, { status: 403 });
    }

    const updates = await req.json();
    updateEditorialSettings(updates);

    return NextResponse.json({ success: true, message: 'Settings updated successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating settings.' }, { status: 500 });
  }
}
