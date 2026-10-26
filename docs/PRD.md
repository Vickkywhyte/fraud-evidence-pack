# Product Requirements Document — Fraud Evidence Pack

## Problem Statement

Victims of Authorised Push Payment (APP) fraud and other financial scams face a critical disadvantage when reporting to banks, law enforcement, or ombudsmen: their evidence is scattered across screenshots, emails, chat logs, and documents with no structure. Banks routinely reject reimbursement claims citing "insufficient evidence."

Meanwhile, victims are justifiably reluctant to upload sensitive financial communications to cloud services, and cannot afford professional forensic tools.

There is no free, private, structured tool that turns raw scam evidence into a professional evidence pack ready for submission.

## Target Audience

- **Primary:** Individual fraud victims preparing evidence for bank disputes, Action Fraud reports, or Financial Ombudsman Service complaints (UK focus, applicable globally).
- **Secondary:** Citizen advocates, community fraud volunteers, and consumer rights advisors helping victims compile cases.
- **Tertiary:** Researchers studying fraud typologies who need redacted, structured datasets.

## Core Features

### 1. Local-First File Processing
- Drag-and-drop upload of evidence files (.txt initially; images, PDFs, and emails planned).
- All file reading happens via the browser's File API. Files never leave the device.

### 2. Automatic PII Redaction
- Regex-based detection and replacement of IBANs, credit card numbers, email addresses, and phone numbers with `[REDACTED]`.
- Runs before any analysis, ensuring the processing pipeline never operates on raw PII.

### 3. Fraud Typology Matching (Tier 1 — Rule-Based)
- Keyword/phrase matching against five known fraud typologies: Impersonation, Advance Fee, Romance Scam, Investment Scam, Account Takeover.
- Extraction of 38 warning phrases (urgency language, payment methods, social engineering cues).
- Timeline extraction: dates found in the text with surrounding context for chronological reconstruction.

### 4. Structured PDF Evidence Pack
- Client-side PDF generation via `pdf-lib`.
- Sections: cover page, redacted transcript, matched typologies, warning flags, timeline of events.
- Downloadable directly from the browser — no server round-trip.

### 5. Future: Tier 2 Local AI Analysis
- Optional WebGPU-accelerated local LLM for deeper narrative analysis, entity extraction, and confidence scoring.
- Strictly opt-in. Falls back gracefully to Tier 1 if hardware doesn't support it.

## Explicit Non-Goals

| Non-Goal | Rationale |
|---|---|
| **Cloud storage or sync** | Violates the core privacy guarantee. Evidence stays on-device only. |
| **Legal advice** | The tool structures evidence; it does not interpret law or recommend legal action. A disclaimer is shown. |
| **User accounts or authentication** | No server means no accounts. No tracking of who uses the tool. |
| **Telemetry, analytics, or error reporting** | Zero network requests. No beacons, no pixels, no crash reporters. |
| **Backend API of any kind** | The entire application is a static site. It can be served from a file:// URL. |
| **Real-time collaboration** | Single-user, single-session tool by design. |

## Success Metrics

Since there is no telemetry, success is measured externally:
- The generated PDF is accepted as structured evidence by UK bank fraud teams.
- The tool runs fully offline after initial page load.
- PII redaction has zero false negatives on the supported formats (validated by unit tests).

## Technical Constraints

- **Runtime:** Modern browser with File API support (Chrome, Firefox, Safari, Edge).
- **Bundle:** Must remain under 1 MB gzipped for fast loading on mobile connections.
- **Accessibility:** WCAG 2.1 AA compliance for the UI.
