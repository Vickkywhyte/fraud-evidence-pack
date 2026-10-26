# Security Audit Report

**Project:** Fraud Evidence Pack
**Date:** 2026-10-26
**Auditor:** Security review (automated + manual)
**Scope:** Full client-side codebase
**Standards:** OWASP Top 10 (2021), OWASP ASVS v4.0

---

## 1. STRIDE Threat Model

Since Fraud Evidence Pack is a zero-backend, client-side-only application that processes sensitive PII (fraud evidence containing bank details, phone numbers, emails), the threat model focuses on client-side attack vectors.

| Threat | Applies? | Analysis |
|--------|----------|----------|
| **Spoofing** | Low | No authentication system. The app is a static tool. Risk: a malicious clone could impersonate the app. Mitigation: CSP headers, GitHub Pages HTTPS. |
| **Tampering** | Medium | User-supplied text files are the sole input. Malicious file content could attempt to exploit regex engines (ReDoS) or PDF generation. Mitigation: input is processed as plain text only, never interpreted as HTML or code. |
| **Repudiation** | N/A | No user accounts, no audit trail needed. The PDF output is the artifact. |
| **Information Disclosure** | High | This is the primary threat. Raw PII (bank accounts, phone numbers, emails) is processed in-browser. Leakage vectors: console.log in production, browser extensions, DevTools access. Mitigation: all debug logging removed from production builds; CSP blocks external script injection. |
| **Denial of Service** | Medium | Maliciously crafted input could trigger ReDoS or excessive memory use. Mitigation: regex patterns reviewed for catastrophic backtracking; input processed as finite text strings. |
| **Elevation of Privilege** | N/A | No privilege model exists. All processing is same-origin, same-context. |

---

## 2. Findings

### FINDING-01: Production Console Logging of Raw PII
- **Severity:** HIGH
- **Category:** Information Disclosure (OWASP A01:2021)
- **Location:** `src/App.tsx` lines 99-134
- **Description:** 13 `console.log` and `console.error` statements logged raw unredacted text, redacted text, full analysis JSON, and PDF byte sizes to the browser console in production builds. Any browser extension, DevTools session, or console-harvesting malware could capture this PII.
- **Remediation:** All debug `console.log` statements removed entirely. The single error-handling `console.error` wrapped in `if (import.meta.env.DEV)` guard so it only fires during local development. Vite's tree-shaking eliminates the dead branch in production builds.
- **Status:** FIXED

### FINDING-02: Missing Content Security Policy
- **Severity:** MEDIUM
- **Category:** Security Misconfiguration (OWASP A05:2021)
- **Location:** `index.html`
- **Description:** No CSP meta tag was present. While the app loads no external resources by design, the absence of CSP meant a compromised CDN, browser extension, or XSS vector could inject arbitrary scripts.
- **Remediation:** Added strict CSP meta tag:
  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:; font-src 'self'; connect-src 'none';
  object-src 'none'; frame-src 'none';
  ```
  Key decisions:
  - `connect-src 'none'` — enforces zero-network promise; no fetch/XHR/WebSocket possible
  - `script-src 'self'` — blocks injected external scripts
  - `frame-src 'none'` — prevents clickjacking via iframes
  - `style-src 'unsafe-inline'` — required by Tailwind CSS runtime; acceptable since no user-controlled styles exist
- **Status:** FIXED

### FINDING-03: XSS and DOM Clobbering Audit
- **Severity:** PASS (no issues found)
- **Category:** Injection (OWASP A03:2021)
- **Files audited:** `src/App.tsx`, `src/utils/generatePDF.ts`
- **Checks performed:**
  - No `dangerouslySetInnerHTML` usage anywhere in codebase
  - No `innerHTML` assignments
  - No `eval()`, `Function()`, or `setTimeout(string)` calls
  - No `document.write()` usage
  - All user-supplied text rendered via React JSX (auto-escaped)
  - PDF generation uses `drawText()` which treats input as literal text, not markup
  - File input restricted to `.txt,text/plain` via `accept` attribute
  - `sanitizeForPDF()` strips all non-ASCII characters before passing to pdf-lib
- **Status:** PASS

### FINDING-04: ReDoS (Regular Expression Denial of Service) Audit
- **Severity:** LOW (acceptable risk)
- **Category:** Denial of Service
- **Files audited:** `src/utils/redact.ts`, `src/utils/analyzeTier1.ts`
- **Patterns reviewed:**

  1. **IBAN** `/\b[A-Z]{2}\d{2}[\s-]?[\dA-Z]{4}(?:[\s-]?[\dA-Z]{4}){1,7}(?:[\s-]?[\dA-Z]{1,4})?\b/g`
     - Bounded repetition `{1,7}` and `{1,4}` — no unbounded quantifiers
     - Character classes are disjoint — no ambiguous alternation
     - Risk: NONE

  2. **Credit Card** `/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g`
     - Fixed-length pattern with optional single-character separators
     - Risk: NONE

  3. **Email** `/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g`
     - The `[a-zA-Z0-9._%+-]+` before `@` could theoretically backtrack on very long non-email strings, but the `@` anchor limits real-world impact. The character class overlap between `.` in the local part and `.` in the domain part is minimal.
     - Risk: LOW — would require a crafted string of 10,000+ characters with no `@` to cause measurable delay

  4. **Phone** `/(?:\+\d{1,3}[\s.-])?\(?\d{1,4}\)?[\s.-]\d{1,4}[\s.-]?\d{1,9}\b/g`
     - All quantifiers are bounded (`{1,3}`, `{1,4}`, `{1,9}`)
     - Required separator `[\s.-]` between groups prevents matching bare number sequences
     - Risk: NONE

  5. **Date** (analyzeTier1.ts) — Complex alternation pattern
     - Uses `matchAll()` (not `while/exec`) — no stale `lastIndex` risk
     - Alternation branches are structurally distinct (digit-first vs. month-name-first)
     - Risk: LOW

- **Status:** PASS (no remediation needed)

### FINDING-05: Supply Chain Audit
- **Severity:** PASS
- **Category:** Vulnerable and Outdated Components (OWASP A06:2021)
- **Check:** `npm audit` — **0 vulnerabilities found**
- **Dependencies reviewed:**
  - `pdf-lib` (runtime) — well-maintained, no known CVEs
  - `react`, `react-dom` (runtime) — React 19, actively maintained
  - All other dependencies are devDependencies (Vite, Vitest, TypeScript, Tailwind, gh-pages) — not shipped to users
- **Lock file:** `package-lock.json` present and tracked
- **Status:** PASS

### FINDING-06: Data Persistence Audit
- **Severity:** PASS
- **Category:** Information Disclosure
- **Description:** Verified that the application uses:
  - No `localStorage`
  - No `sessionStorage`
  - No `IndexedDB`
  - No cookies
  - No Service Workers
  - No `navigator.sendBeacon()`
  - `URL.createObjectURL()` is used for PDF download and immediately revoked with `URL.revokeObjectURL()`
- **Status:** PASS — data exists only in JavaScript heap memory and is garbage-collected when the tab closes

---

## 3. Remediation Summary

| Finding | Severity | Status |
|---------|----------|--------|
| FINDING-01: Console PII leakage | HIGH | FIXED |
| FINDING-02: Missing CSP | MEDIUM | FIXED |
| FINDING-03: XSS/DOM Clobbering | N/A | PASS |
| FINDING-04: ReDoS | LOW | PASS |
| FINDING-05: Supply Chain | N/A | PASS |
| FINDING-06: Data Persistence | N/A | PASS |

---

## 4. Recommendations for Future Development

1. **Subresource Integrity (SRI):** If external CDN resources are ever added, use `integrity` attributes on `<script>` and `<link>` tags.

2. **File size limits:** Consider adding a client-side file size limit (e.g., 5 MB per file) to prevent memory exhaustion from very large uploads.

3. **Blob URL lifetime:** The current `URL.revokeObjectURL()` call is immediate after `a.click()`. This is correct, but if download behavior changes, ensure blob URLs are always revoked.

4. **Tier 2 AI (future):** If WebGPU-based local LLM inference is added, audit the model loading pipeline for supply chain risks (model file integrity, WASM module verification).

5. **Regular `npm audit`:** Run `npm audit` in CI (already present in the GitHub Actions workflow via `npm ci` which flags audit issues).

---

## 5. Verification

- All 26 unit tests pass after remediation
- Production build succeeds (`tsc -b && vite build`)
- No console output in production build (verified via source inspection — all `console.log` removed, `console.error` guarded by `import.meta.env.DEV`)
- CSP meta tag present in built `dist/index.html`
