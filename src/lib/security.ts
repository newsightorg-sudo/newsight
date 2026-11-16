/**
 * NEWSIGHT Central Application Security Module
 * 
 * Provides production-grade security utilities:
 * 1. Distributed/In-memory sliding-window rate limiting
 * 2. CSRF & Origin verification for mutating HTTP methods
 * 3. Server-side HTML sanitization (XSS mitigation)
 * 4. Input validation & normalization primitives
 * 5. Safe production error masking
 * 6. Security audit logging
 */

import { NextResponse } from 'next/server';

// ============================================================================
// 1. RATE LIMITING ENGINE (Sliding-Window Token Bucket)
// ============================================================================

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 3600000); // 1 hour window
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 300000);
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Filter timestamps within the current window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0];
    const resetSeconds = Math.ceil((oldestTimestamp + windowMs - now) / 1000);
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetSeconds: Math.max(1, resetSeconds),
    };
  }

  // Record this hit
  record.timestamps.push(now);
  return {
    allowed: true,
    limit,
    remaining: limit - record.timestamps.length,
    resetSeconds: Math.ceil(windowMs / 1000),
  };
}

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

// Pre-configured rate limits
export const RateLimits = {
  // Login: 5 attempts per 15 minutes per IP/email
  AUTH_LOGIN: { limit: 5, windowMs: 15 * 60 * 1000 },
  // Password change / credential updates: 5 per 15 minutes
  AUTH_CREDENTIALS: { limit: 5, windowMs: 15 * 60 * 1000 },
  // Comments: 6 per 2 minutes per IP
  PUBLIC_COMMENTS: { limit: 6, windowMs: 2 * 60 * 1000 },
  // Contact messages: 4 per 5 minutes per IP
  PUBLIC_CONTACT: { limit: 4, windowMs: 5 * 60 * 1000 },
  // Newsletter signup: 6 per 5 minutes per IP
  NEWSLETTER: { limit: 6, windowMs: 5 * 60 * 1000 },
  // Search queries: 60 per minute per IP
  SEARCH: { limit: 60, windowMs: 60 * 1000 },
  // File uploads: 20 per 5 minutes per authenticated user
  MEDIA_UPLOAD: { limit: 20, windowMs: 5 * 60 * 1000 },
  // General mutating API: 120 per minute
  MUTATIONS: { limit: 120, windowMs: 60 * 1000 },
};

export function enforceRateLimit(
  req: Request,
  config: { limit: number; windowMs: number },
  keyPrefix = 'rl'
): NextResponse | null {
  const ip = getClientIp(req);
  const result = checkRateLimit(`${keyPrefix}_${ip}`, config.limit, config.windowMs);
  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.resetSeconds),
        },
      }
    );
  }
  return null;
}

// ============================================================================
// 2. CSRF & ORIGIN VERIFICATION
// ============================================================================

export function verifyCsrfOrigin(req: Request): boolean {
  // Only state-changing methods require CSRF validation
  const method = req.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true;
  }

  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host = req.headers.get('host');

  if (!host) {
    return true; // No host header provided (e.g., standard internal call)
  }

  // Check Origin header first if present
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host.toLowerCase() === host.toLowerCase()) {
        return true;
      }
      // Allow localhost variants in development
      if (
        process.env.NODE_ENV !== 'production' &&
        (originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1')
      ) {
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  // Fallback to Referer header if Origin not set (standard in some browsers)
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host.toLowerCase() === host.toLowerCase()) {
        return true;
      }
      if (
        process.env.NODE_ENV !== 'production' &&
        (refererUrl.hostname === 'localhost' || refererUrl.hostname === '127.0.0.1')
      ) {
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  // If both origin and referer are missing on a state-changing POST/PUT from a browser, reject in production
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  return true;
}

// ============================================================================
// 3. SERVER-SIDE HTML SANITIZER (Stored XSS Protection)
// ============================================================================

/**
 * Sanitizes HTML content for articles and rich text.
 * Strips script tags, iframes, object/embed, dangerous event handlers,
 * and malicious javascript: or data: URIs, preserving safe editorial typography.
 */
export function sanitizeHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  let html = rawHtml;

  // 1. Remove dangerous executable tag blocks entirely (including contents)
  const dangerousTags = [
    'script',
    'style',
    'iframe',
    'embed',
    'object',
    'applet',
    'base',
    'form',
    'input',
    'button',
    'textarea',
    'select',
    'option',
    'meta',
    'link',
    'frame',
    'frameset',
  ];

  for (const tag of dangerousTags) {
    const tagRegex = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    html = html.replace(tagRegex, '');
    const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
    html = html.replace(selfClosingRegex, '');
  }

  // 2. Strip all inline JavaScript event handlers (e.g. onload, onerror, onclick, onmouseover)
  html = html.replace(/\s+on[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // 3. Strip dangerous URI protocols in href and src attributes (javascript:, vbscript:, data:text/html)
  html = html.replace(
    /(href|src)\s*=\s*["']?\s*(javascript|vbscript|data\s*:\s*text\/html)[^"'>\s]*["']?/gi,
    '$1="#"'
  );

  // 4. Ensure external links have safe rel attributes
  html = html.replace(/<a\b([^>]*)>/gi, (match, attrs) => {
    let cleanAttrs = attrs;
    if (!/rel\s*=/i.test(cleanAttrs)) {
      cleanAttrs += ' rel="noopener noreferrer"';
    } else {
      cleanAttrs = cleanAttrs.replace(
        /rel\s*=\s*["'][^"']*["']/gi,
        'rel="noopener noreferrer"'
      );
    }
    return `<a ${cleanAttrs}>`;
  });

  return html;
}

// ============================================================================
// 4. INPUT VALIDATION & NORMALIZATION
// ============================================================================

export function sanitizeString(
  val: any,
  maxLength = 500,
  defaultValue = ''
): string {
  if (val === undefined || val === null) return defaultValue;
  const s = String(val).trim();
  // Strip control characters except newline and tab
  const cleaned = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return cleaned.slice(0, maxLength);
}

export function isValidEmail(email: any): boolean {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 254) return false;
  // RFC 5322 standard compliant basic regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

export function sanitizeInteger(val: any, min = 0, max = 1000000, defaultValue = 0): number {
  const n = parseInt(val, 10);
  if (isNaN(n)) return defaultValue;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

// ============================================================================
// 5. SAFE PRODUCTION ERROR HANDLING
// ============================================================================

export function safeErrorResponse(
  error: any,
  publicMessage = 'An unexpected error occurred. Please try again later.',
  statusCode = 500
): NextResponse {
  // Always log full error server-side for diagnostics
  console.error('[SECURITY_ERROR_HANDLER]', {
    timestamp: new Date().toISOString(),
    status: statusCode,
    message: error?.message || 'Unknown error',
    stack: process.env.NODE_ENV !== 'production' ? error?.stack : undefined,
  });

  // In production, never leak internal database details or stack traces
  const safeMessage =
    process.env.NODE_ENV === 'production'
      ? publicMessage
      : error?.message || publicMessage;

  return NextResponse.json(
    {
      error: safeMessage,
      code: statusCode === 400 ? 'INVALID_INPUT' : statusCode === 403 ? 'PERMISSION_DENIED' : 'SERVER_ERROR',
    },
    { status: statusCode }
  );
}

// ============================================================================
// 6. SECURITY AUDIT LOGGING
// ============================================================================

export type SecurityAuditAction =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_LOGOUT'
  | 'AUTH_RATE_LIMITED'
  | 'PERMISSION_DENIED'
  | 'ARTICLE_CREATED'
  | 'ARTICLE_UPDATED'
  | 'ARTICLE_DELETED'
  | 'ARTICLE_STATUS_CHANGED'
  | 'CATEGORY_MUTATED'
  | 'REPORTER_CREATED'
  | 'REPORTER_CREDENTIALS_MUTATED'
  | 'SETTINGS_UPDATED'
  | 'CSRF_BLOCKED'
  | 'MEDIA_UPLOADED'
  | 'MEDIA_DELETED';

export function logSecurityAudit(
  action: SecurityAuditAction,
  details: {
    userId?: string;
    adminId?: string;
    email?: string;
    role?: string;
    resourceId?: string;
    ip?: string;
    status?: 'SUCCESS' | 'BLOCKED' | 'FAILED';
    notes?: string;
    [key: string]: any;
  }
) {
  const record = {
    event: 'SECURITY_AUDIT',
    action,
    timestamp: new Date().toISOString(),
    status: 'SUCCESS',
    ...details,
  };

  // Mask sensitive parts
  if (record.email) {
    const parts = record.email.split('@');
    if (parts.length === 2) {
      const name = parts[0];
      const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : '***';
      record.email = `${maskedName}@${parts[1]}`;
    }
  }

  console.info(JSON.stringify(record));
}
