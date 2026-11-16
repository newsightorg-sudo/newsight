import { NextResponse } from 'next/server';
import { getEditorialSettings, updateEditorialSettings } from '@/lib/data';
import { getCurrentUser, canManageSettings } from '@/lib/auth';
import {
  verifyCsrfOrigin,
  getClientIp,
  sanitizeString,
  logSecurityAudit,
  safeErrorResponse,
} from '@/lib/security';

const ALLOWED_SETTING_KEYS = new Set([
  'site_name',
  'site_tagline',
  'contact_email',
  'breaking_banner_enabled',
  'breaking_banner_text',
  'breaking_banner_url',
  'newsletter_enabled',
  'comments_enabled',
  'comments_require_approval',
  'maintenance_mode',
  'default_reading_speed',
  'lead_story_id',
  'show_bureau_tags',
  'masthead_announcement',
]);

export async function GET() {
  try {
    const settings = await getEditorialSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error fetching settings.');
  }
}

export async function PUT(req: Request) {
  const ip = getClientIp(req);

  // 1. CSRF Origin validation
  if (!verifyCsrfOrigin(req)) {
    logSecurityAudit('CSRF_BLOCKED', { ip, status: 'BLOCKED', notes: 'Cross-origin settings update attempt' });
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  try {
    const user = await getCurrentUser();
    // RBAC: Strict Super Admin role enforcement
    if (!user || !canManageSettings(user.role)) {
      logSecurityAudit('PERMISSION_DENIED', {
        userId: user?.id,
        role: user?.role,
        ip,
        status: 'BLOCKED',
        notes: 'Unauthorized settings mutation attempt',
      });
      return NextResponse.json({ error: 'Permission denied. Super Admin role required.' }, { status: 403 });
    }

    const updates = await req.json().catch(() => null);
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    // Mass Assignment Defense: Only whitelist permitted configuration keys
    const filteredUpdates: Record<string, string> = {};
    for (const [key, val] of Object.entries(updates)) {
      if (ALLOWED_SETTING_KEYS.has(key)) {
        filteredUpdates[key] = sanitizeString(val, 1000);
      }
    }

    await updateEditorialSettings(filteredUpdates);

    logSecurityAudit('SETTINGS_UPDATED', {
      userId: user.id,
      role: user.role,
      ip,
      status: 'SUCCESS',
      notes: `Updated ${Object.keys(filteredUpdates).length} settings keys`,
    });

    return NextResponse.json({ success: true, message: 'Settings updated successfully.' });
  } catch (error: any) {
    return safeErrorResponse(error, 'Error updating settings.');
  }
}
