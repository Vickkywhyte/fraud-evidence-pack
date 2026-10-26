# Fraud Evidence Pack

[![CI](https://github.com/Vickkywhyte/fraud-evidence-pack/actions/workflows/deploy.yml/badge.svg)](https://github.com/Vickkywhyte/fraud-evidence-pack/actions/workflows/deploy.yml)

**A zero-trust, local-first tool for APP fraud victims.**

Turn messy chat logs and scam evidence into a structured, professional PDF brief — entirely in your browser. No uploads. No servers. No cloud AI.

[**Live Demo**](https://vickkywhyte.github.io/fraud-evidence-pack/)

---

## The Problem

Every year, thousands of fraud victims lose their claims because their evidence is rejected as "unstructured" or "insufficient." Banks want timelines. Police want redacted transcripts. Ombudsmen want typology analysis.

Victims are left with a folder of screenshots and no idea how to organise them — and a justified fear of uploading sensitive financial communications to yet another website.

## The Solution

Fraud Evidence Pack is a web application that runs **100% in your browser**. Drop in your text evidence, and it:

1. **Redacts PII** — bank accounts, card numbers, emails, and phone numbers are masked automatically
2. **Extracts a timeline** — dates are found and paired with surrounding context
3. **Matches fraud typologies** — patterns are matched against known scam types (Impersonation, Advance Fee, Romance, Investment, Account Takeover)
4. **Flags warning phrases** — urgency language, payment methods, and social engineering cues are highlighted
5. **Generates a PDF brief** — a professional, multi-page evidence document ready to submit to your bank, Action Fraud, or the Financial Ombudsman

---

## Architecture

```
  Upload .txt files
        |
        v
  +------------------+
  |  Read file text   |  Browser File API — files never leave your device
  +------------------+
        |
        +---> Extract Timeline (dates + context from raw text)
        |
        v
  +------------------+
  |   Redact PII      |  IBANs, credit cards, emails, phone numbers -> [REDACTED]
  +------------------+
        |
        v
  +------------------+
  | Match Typologies  |  5 fraud types, 38 warning phrases (rule-based)
  +------------------+
        |
        v
  +------------------+
  |   Generate PDF    |  pdf-lib — real searchable-text PDF, not a screenshot
  +------------------+
        |
        v
   Download PDF
```

Every stage operates on in-memory data. Nothing is written to disk, localStorage, or any server. When you close the tab, the data is gone.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build | [Vite 8](https://vite.dev/) |
| Styling | [TailwindCSS 4](https://tailwindcss.com/) |
| PDF | [pdf-lib](https://pdf-lib.js.org/) (client-side, no canvas) |
| Tests | [Vitest](https://vitest.dev/) |

---

## Privacy Guarantee

This is not a marketing claim. It is an architectural constraint.

- **Zero backend.** The app is a static site. It can run from a `file://` URL.
- **Zero network requests.** After the page loads, the browser makes no HTTP calls. Open DevTools > Network and verify.
- **Zero telemetry.** No analytics, no error reporting, no tracking pixels, no beacons.
- **Zero cloud AI.** All analysis is rule-based regex and keyword matching. No data is sent to any LLM API.
- **Zero persistence.** No localStorage, no cookies, no IndexedDB. Close the tab and everything is gone.

---

## Run Locally

```bash
git clone https://github.com/Vickkywhyte/fraud-evidence-pack.git
cd fraud-evidence-pack
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Other commands

```bash
npm run build      # Production build to dist/
npm run preview    # Preview the production build
npx vitest run     # Run unit tests (26 tests)
npm run deploy     # Deploy to GitHub Pages
```

---

## Project Structure

```
src/
├── App.tsx                  UI: upload zone, results display, processing pipeline
├── main.tsx                 Entry point
├── index.css                TailwindCSS import
└── utils/
    ├── redact.ts            PII redaction (IBAN, credit card, email, phone)
    ├── redact.test.ts       14 unit tests
    ├── analyzeTier1.ts      Fraud typology matching, flag extraction, timeline
    ├── analyzeTier1.test.ts 12 unit tests
    └── generatePDF.ts       PDF evidence brief generator (pdf-lib)

docs/
├── PRD.md                   Product requirements
├── ARCHITECTURE.md          System architecture
└── ADR-001.md               Decision record: tiered intelligence approach
```

---

## Roadmap

- [ ] **Image/PDF input** — OCR via Tesseract.js for screenshot evidence
- [ ] **Tier 2 AI** — optional local LLM via WebGPU for narrative summarisation
- [ ] **Multi-language** — fraud typology keywords in additional languages
- [ ] **Export formats** — JSON export for case management interoperability

---

## Disclaimer

This tool structures evidence for submission. It does **not** provide legal advice. Consult a solicitor or your bank's fraud team for guidance on your specific case.

---

## License

MIT
