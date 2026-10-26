# Architecture — Fraud Evidence Pack

## Design Principle: Local-First, Zero-Trust

The entire application runs as a static single-page app. There is no server, no API, no database, and no network communication after the initial page load. The browser is the only runtime environment.

This is not merely a preference — it is a hard architectural constraint driven by the sensitivity of fraud evidence (bank details, personal communications, financial records).

## Technology Stack

| Layer | Technology | Role |
|---|---|---|
| Build | Vite 8 | Dev server, bundling, HMR |
| UI | React 19 + TypeScript | Component rendering, state management |
| Styling | TailwindCSS 4 | Utility-first CSS via Vite plugin |
| PDF | pdf-lib 1.17 | Client-side PDF creation (no canvas, no server) |
| Test | Vitest 5 | Unit tests for utilities |

## Data Pipeline

```
┌─────────────┐
│  User drops  │
│  .txt files  │
└──────┬───────┘
       │  file.text() — browser File API
       ▼
┌─────────────┐
│  Raw text    │
│  (in memory) │
└──────┬───────┘
       │  redactPII()
       ▼
┌─────────────┐
│  Redacted    │   IBANs, cards, emails, phones → [REDACTED]
│  text        │
└──────┬───────┘
       │  analyzeTier1()
       ▼
┌─────────────┐
│  Tier1Result │   { matchedTypologies, extractedFlags, timeline }
│  (JSON)      │
└──────┬───────┘
       │  generatePDF()  ← pdf-lib (planned)
       ▼
┌─────────────┐
│  PDF blob    │   Downloaded via <a download> or URL.createObjectURL
│  (in memory) │
└─────────────┘
```

Every stage operates on in-memory data. No intermediate results are written to disk, localStorage, or IndexedDB. When the user closes the tab, everything is gone.

## Module Map

```
src/
├── main.tsx                 Entry point — mounts <App /> into #root
├── index.css                TailwindCSS v4 import
├── App.tsx                  UI shell: drop zone, file list, process button, results display
└── utils/
    ├── redact.ts            redactPII(text) — regex-based PII removal
    ├── redact.test.ts       12 unit tests covering all PII formats
    ├── analyzeTier1.ts      analyzeTier1(text) — rule-based fraud classification
    └── analyzeTier1.test.ts 12 unit tests covering typologies, flags, dates
```

## Key Design Decisions

### File reading: File API, not FileReader
We use `file.text()` (the modern Promise-based File API) rather than the callback-based FileReader. This simplifies the async pipeline and is supported in all target browsers.

### PII redaction runs first
The redaction step is intentionally placed before analysis. This means the typology matcher and any future AI tier never see raw PII. Even if a bug leaked internal state, the sensitive data would already be masked.

### No state persistence
There is no localStorage, sessionStorage, or IndexedDB usage. This is deliberate: if a user's device is seized or inspected, the tool leaves no forensic trace beyond the downloaded PDF (which the user controls).

### pdf-lib over jsPDF/html2canvas
`pdf-lib` creates real PDF documents with searchable text, proper fonts, and metadata — not rasterized screenshots. This matters for evidence packs that may be OCR-scanned or text-searched by investigators.

## Future Extensions

- **Image/PDF input:** Use browser-native APIs or lightweight WASM (e.g., Tesseract.js) for OCR.
- **Tier 2 AI:** WebGPU-based local LLM for narrative analysis (see ADR-001).
- **Export formats:** JSON export for interoperability with case management systems.
