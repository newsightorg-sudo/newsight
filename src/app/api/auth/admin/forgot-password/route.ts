import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getDb, NeonDbClient } from '@/lib/db';
import { sendAdminOtpViaMsg91 } from '@/lib/msg91';
import {
  verifyCsrfOrigin,
  enforceRateLimit,
  getClientIp,
  RateLimits,
  isValidEmail,
  sanitizeString,
  logSecurityAudit,
  safeErrorResponse,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

let isTableInitialized = false;

// Fallback in-memory cache for stateless resilience
interface MemoryResetRecord {
  id: string;
  email: string;
  otpHash: string;
  resetToken?: string;
  expiresAt: number;
  attempts: number;
  used: boolean;
}
const memoryResets = new Map<string, MemoryResetRecord>();

async function ensureAdminPasswordResetsTable(db: NeonDbClient) {
  if (isTableInitialized) return;
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS admin_password_resets (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp_hash VARCHAR(128) NOT NULL,
        reset_token VARCHAR(128),
        expires_at TIMESTAMPTZ NOT NULL,
        attempts INT DEFAULT 0,
        used INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    try {
      await db.exec(`CREATE INDEX IF NOT EXISTS idx_admin_resets_email ON admin_password_resets(email);`);
    } catch (_) {}
    isTableInitialized = true;
  } catch (err) {
    console.warn('[DB] Could not ensure admin_password_resets table:', err);
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  // 1. CSRF Protection
  if (!verifyCsrfOrigin(req)) {
    logSecurityAudit('CSRF_BLOCKED', {
      ip,
      status: 'BLOCKED',
      notes: 'Cross-origin admin password reset attempt',
    });
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  // 2. Strict Rate Limiting (5 requests per 15 min per IP)
  const rateLimitResponse = enforceRateLimit(
    req,
    RateLimits.ADMIN_FORGOT_PASSWORD,
    'admin_forgot_password'
  );
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
    }

    const action = body.action || 'request_otp';
    const email = sanitizeString(body.email, 254).toLowerCase().trim();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'A valid administrator email address is required.' },
        { status: 400 }
      );
    }

    const db = getDb();
    await ensureAdminPasswordResetsTable(db);

    // ========================================================================
    // ACTION 1: REQUEST OTP (Send verification code via MSG91)
    // ========================================================================
    if (action === 'request_otp') {
      // Query user and enforce ADMIN ONLY restriction
      const user = await db
        .prepare('SELECT id, name, email, role FROM users WHERE LOWER(email) = ?')
        .get<any>(email);

      if (!user) {
        return NextResponse.json(
          { error: 'No administrator account found with this email address.' },
          { status: 404 }
        );
      }

      // Explicitly enforce ADMIN ONLY (SUPER_ADMIN)
      if (user.role !== 'SUPER_ADMIN') {
        logSecurityAudit('PERMISSION_DENIED', {
          email,
          role: user.role,
          ip,
          status: 'BLOCKED',
          notes: 'Non-admin attempted to use admin email OTP recovery',
        });
        return NextResponse.json(
          {
            error:
              'Password recovery via email verification is restricted to administrator accounts only. Staff reporters, correspondents, and contributors should contact the senior editorial desk.',
          },
          { status: 403 }
        );
      }

      // Generate 6-digit cryptographic OTP (100000 - 999999)
      const otp = crypto.randomInt(100000, 1000000).toString();
      const otpHash = crypto.createHash('sha256').update(otp + email).digest('hex');
      const resetId = `rst-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const expiresAtMs = Date.now() + 10 * 60 * 1000; // 10 minutes
      const expiresAtIso = new Date(expiresAtMs).toISOString();

      // Persist in memory store for fallback
      memoryResets.set(email, {
        id: resetId,
        email,
        otpHash,
        expiresAt: expiresAtMs,
        attempts: 0,
        used: false,
      });

      // Invalidate existing active reset codes for this email in Postgres
      try {
        await db
          .prepare('UPDATE admin_password_resets SET used = 1 WHERE LOWER(email) = ? AND used = 0')
          .run(email);

        await db
          .prepare(`
            INSERT INTO admin_password_resets (id, email, otp_hash, expires_at, created_at, used, attempts)
            VALUES (?, ?, ?, ?, ?, 0, 0)
          `)
          .run(resetId, email, otpHash, expiresAtIso, new Date().toISOString());
      } catch (dbErr) {
        console.warn('[DB] Failed to persist reset record, using memory cache:', dbErr);
      }

      // Dispatch OTP email via MSG91 with template "global_otp"
      const sendResult = await sendAdminOtpViaMsg91({
        toEmail: email,
        toName: user.name || 'Administrator',
        otp,
        companyName: 'NEWSIGHT',
      });

      if (!sendResult.success) {
        logSecurityAudit('ADMIN_PASSWORD_RESET_FAILED', {
          email,
          ip,
          status: 'FAILED',
          notes: `MSG91 send failure: ${sendResult.error}`,
        });
        return NextResponse.json(
          {
            error:
              sendResult.error ||
              'Unable to send verification code via MSG91. Please verify MSG91 configuration.',
          },
          { status: 502 }
        );
      }

      logSecurityAudit('ADMIN_PASSWORD_RESET_OTP_SENT', {
        email,
        userId: user.id,
        role: user.role,
        ip,
        status: 'SUCCESS',
        notes: sendResult.devMode ? 'Dev Mode (logged to console)' : 'Dispatched via MSG91 global_otp',
      });

      return NextResponse.json({
        success: true,
        message: 'A 6-digit verification code has been sent to your administrator email address.',
        devMode: sendResult.devMode || false,
      });
    }

    // ========================================================================
    // ACTION 2: VERIFY OTP (Validates code & generates single-use reset token)
    // ========================================================================
    if (action === 'verify_otp') {
      const otp = String(body.otp || '').trim();
      if (!/^\d{6}$/.test(otp)) {
        return NextResponse.json(
          { error: 'Please enter a valid 6-digit verification code.' },
          { status: 400 }
        );
      }

      const inputHash = crypto.createHash('sha256').update(otp + email).digest('hex');
      let matchedRecord: { id: string; otp_hash: string; attempts: number } | null = null;
      let isMemoryMatch = false;

      // Try database lookup first
      try {
        const row = await db
          .prepare(`
            SELECT id, otp_hash, attempts
            FROM admin_password_resets
            WHERE LOWER(email) = ? AND used = 0 AND expires_at > ?
            ORDER BY created_at DESC
            LIMIT 1
          `)
          .get<any>(email, new Date().toISOString());

        if (row) {
          matchedRecord = row;
        }
      } catch (err) {
        console.warn('[DB] Reset lookup query failed, falling back to memory store:', err);
      }

      // Memory fallback if DB query returned nothing
      if (!matchedRecord) {
        const mem = memoryResets.get(email);
        if (mem && !mem.used && mem.expiresAt > Date.now()) {
          matchedRecord = {
            id: mem.id,
            otp_hash: mem.otpHash,
            attempts: mem.attempts,
          };
          isMemoryMatch = true;
        }
      }

      if (!matchedRecord) {
        return NextResponse.json(
          { error: 'Verification code has expired or is invalid. Please request a new code.' },
          { status: 400 }
        );
      }

      // Brute-force throttling: lock code after 5 invalid attempts
      if (matchedRecord.attempts >= 5) {
        if (!isMemoryMatch) {
          await db
            .prepare('UPDATE admin_password_resets SET used = 1 WHERE id = ?')
            .run(matchedRecord.id);
        } else {
          const mem = memoryResets.get(email);
          if (mem) mem.used = true;
        }
        return NextResponse.json(
          { error: 'Too many incorrect attempts. This code has expired. Please request a new code.' },
          { status: 429 }
        );
      }

      // Timing-safe comparison to prevent timing attacks
      const expectedBuffer = Buffer.from(matchedRecord.otp_hash, 'hex');
      const inputBuffer = Buffer.from(inputHash, 'hex');
      const isOtpValid =
        expectedBuffer.length === inputBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, inputBuffer);

      if (!isOtpValid) {
        // Increment attempts
        if (!isMemoryMatch) {
          await db
            .prepare('UPDATE admin_password_resets SET attempts = attempts + 1 WHERE id = ?')
            .run(matchedRecord.id);
        } else {
          const mem = memoryResets.get(email);
          if (mem) mem.attempts += 1;
        }
        return NextResponse.json(
          { error: 'Incorrect verification code. Please check your email and try again.' },
          { status: 400 }
        );
      }

      // OTP Verified successfully -> Generate single-use reset token (32 bytes hex)
      const resetToken = crypto.randomBytes(32).toString('hex');

      if (!isMemoryMatch) {
        await db
          .prepare('UPDATE admin_password_resets SET reset_token = ? WHERE id = ?')
          .run(resetToken, matchedRecord.id);
      }
      const mem = memoryResets.get(email);
      if (mem) {
        mem.resetToken = resetToken;
      }

      return NextResponse.json({
        success: true,
        message: 'Code verified successfully. You may now set a new administrator password.',
        reset_token: resetToken,
      });
    }

    // ========================================================================
    // ACTION 3: RESET PASSWORD (Updates password in users table)
    // ========================================================================
    if (action === 'reset_password') {
      const resetToken = String(body.reset_token || '').trim();
      const newPassword = typeof body.new_password === 'string' ? body.new_password : '';

      if (!resetToken || resetToken.length < 32) {
        return NextResponse.json(
          { error: 'Invalid or missing password reset token. Please restart the recovery flow.' },
          { status: 400 }
        );
      }

      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters long.' },
          { status: 400 }
        );
      }

      let validReset = false;
      let matchedId = '';

      // Check in DB
      try {
        const row = await db
          .prepare(`
            SELECT id FROM admin_password_resets
            WHERE LOWER(email) = ? AND reset_token = ? AND used = 0 AND expires_at > ?
            ORDER BY created_at DESC
            LIMIT 1
          `)
          .get<any>(email, resetToken, new Date().toISOString());

        if (row) {
          validReset = true;
          matchedId = row.id;
        }
      } catch (err) {
        console.warn('[DB] Reset token lookup query failed, checking memory:', err);
      }

      // Check memory fallback
      if (!validReset) {
        const mem = memoryResets.get(email);
        if (mem && mem.resetToken === resetToken && !mem.used && mem.expiresAt > Date.now()) {
          validReset = true;
          matchedId = mem.id;
        }
      }

      if (!validReset) {
        return NextResponse.json(
          { error: 'Your password reset session has expired or is invalid. Please request a new verification code.' },
          { status: 400 }
        );
      }

      // Re-verify that user exists and is SUPER_ADMIN
      const user = await db
        .prepare('SELECT id, role FROM users WHERE LOWER(email) = ?')
        .get<any>(email);

      if (!user || user.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Unauthorized. Password reset is restricted to administrator accounts.' },
          { status: 403 }
        );
      }

      // Hash new password using bcrypt (cost 12)
      const passwordHash = await bcrypt.hash(newPassword, 12);

      // Update password in users table
      await db
        .prepare('UPDATE users SET password_hash = ? WHERE LOWER(email) = ? AND role = ?')
        .run(passwordHash, email, 'SUPER_ADMIN');

      // Invalidate the reset token so it cannot be reused
      try {
        if (matchedId) {
          await db
            .prepare('UPDATE admin_password_resets SET used = 1, reset_token = NULL WHERE id = ?')
            .run(matchedId);
        }
      } catch (_) {}

      memoryResets.delete(email);

      logSecurityAudit('ADMIN_PASSWORD_RESET_SUCCESS', {
        userId: user.id,
        email,
        role: user.role,
        ip,
        status: 'SUCCESS',
        notes: 'Admin password reset completed successfully via MSG91 email verification',
      });

      return NextResponse.json({
        success: true,
        message: 'Administrator password reset successfully. You can now sign in with your new password.',
      });
    }

    return NextResponse.json({ error: 'Unknown action specified.' }, { status: 400 });
  } catch (error: any) {
    return safeErrorResponse(error, 'An error occurred during password recovery.');
  }
}
