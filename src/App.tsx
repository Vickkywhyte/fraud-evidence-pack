import { useCallback, useState } from 'react'
import { analyzeTier1, type Tier1Result } from './utils/analyzeTier1'
import { redactPII } from './utils/redact'

const loadGeneratePDF = () =>
  import('./utils/generatePDF').then((m) => m.generatePDF)

interface UploadedFile {
  name: string
  size: number
  type: string
  file: File
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

const STEPS = [
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13" />
      </svg>
    ),
    title: 'Upload',
    description: 'Drop your text evidence files — chat logs, emails, letters.',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.3 24.3 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5m-4.75-11.396c.251.023.501.05.75.082M5 14.5l-1.456 1.456a1.5 1.5 0 0 0 0 2.122l.879.879a1.5 1.5 0 0 0 2.122 0L8 17.5m11 -3 1.456 1.456a1.5 1.5 0 0 1 0 2.122l-.879.879a1.5 1.5 0 0 1-2.122 0L16 17.5" />
      </svg>
    ),
    title: 'Analyse',
    description: 'Local engine redacts PII and identifies fraud patterns.',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    title: 'Download',
    description: 'Get a professional PDF evidence brief, ready to submit.',
  },
]

function App() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<Tier1Result | null>(null)

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const newFiles: UploadedFile[] = Array.from(incoming).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }))
    setFiles((prev) => [...prev, ...newFiles])
    setResult(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
    },
    [addFiles],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) addFiles(e.target.files)
      e.target.value = ''
    },
    [addFiles],
  )

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return
    setProcessing(true)
    setResult(null)

    const rawTexts = await Promise.all(files.map((f) => f.file.text()))
    const combined = rawTexts.join('\n\n--- Next File ---\n\n')
    const redacted = redactPII(combined)
    const analysisResult = analyzeTier1(redacted)

    console.log('=== Fraud Evidence Pack Analysis ===')
    console.log('Redacted text:', redacted)
    console.log('Analysis:', JSON.stringify(analysisResult, null, 2))

    const generatePDF = await loadGeneratePDF()
    const pdfBytes = await generatePDF(analysisResult, redacted)
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fraud-evidence-brief-${Date.now()}.pdf`
    a.click()
    URL.revokeObjectURL(url)

    setAnalysis(analysisResult)
    setResult(
      `Processed ${files.length} file(s) — ${analysisResult.matchedTypologies.length} typolog${analysisResult.matchedTypologies.length === 1 ? 'y' : 'ies'} matched, ${analysisResult.extractedFlags.length} warning flag(s), ${analysisResult.timeline.length} date(s) found. PDF downloaded.`,
    )
    setProcessing(false)
  }, [files])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      {/* ── Header ── */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-5 sm:px-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
              Fraud Evidence Pack
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm">
              Build a structured evidence brief — 100% in your browser
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {/* ── How it works ── */}
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
            How it works
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-col sm:items-center sm:text-center"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 sm:h-12 sm:w-12">
                  {step.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    <span className="mr-1.5 text-blue-600">{i + 1}.</span>
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Privacy guarantee ── */}
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5">
          <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          <p className="text-xs font-medium text-emerald-800 sm:text-sm">
            Privacy guarantee — your files never leave your device. Zero network requests. Fully offline after page load.
          </p>
        </div>

        {/* ── Drop zone ── */}
        <label
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition sm:py-14 ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
        >
          <svg
            className="mb-3 h-9 w-9 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13"
            />
          </svg>
          <span className="text-sm font-medium text-slate-600">
            Drag &amp; drop files here, or click to browse
          </span>
          <span className="mt-1 text-xs text-slate-400">
            .txt files — chat logs, emails, letters, statements
          </span>
          <input
            type="file"
            multiple
            accept=".txt,text/plain"
            className="hidden"
            onChange={handleFileInput}
          />
        </label>

        {/* ── File list ── */}
        {files.length > 0 && (
          <div className="mt-5 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Uploaded files ({files.length})
            </h2>
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-700">
                      {f.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatBytes(f.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="ml-4 rounded px-2 py-1 text-xs text-red-500 transition hover:bg-red-50 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Process button ── */}
        <button
          type="button"
          disabled={files.length === 0 || processing}
          onClick={handleProcess}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {processing ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" />
              </svg>
              Processing...
            </>
          ) : (
            'Process Evidence Pack'
          )}
        </button>

        {/* ── Results ── */}
        {result && (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {result}
            </div>

            {analysis && (
              <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 text-sm sm:p-5">
                {analysis.matchedTypologies.length > 0 && (
                  <div>
                    <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Matched Typologies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.matchedTypologies.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-red-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.extractedFlags.length > 0 && (
                  <div>
                    <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Warning Flags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.extractedFlags.map((flag) => (
                        <span
                          key={flag}
                          className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.timeline.length > 0 && (
                  <div>
                    <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Timeline
                    </h3>
                    <ul className="space-y-1.5">
                      {analysis.timeline.map((entry, i) => (
                        <li
                          key={i}
                          className="flex flex-col gap-0.5 rounded-md bg-slate-50 px-3 py-2 text-xs sm:flex-row sm:items-baseline sm:gap-2"
                        >
                          <span className="shrink-0 font-semibold text-slate-700">
                            {entry.date}
                          </span>
                          <span className="text-slate-500 italic">
                            ...{entry.context}...
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <p>
          All processing happens locally in your browser. Zero data is sent anywhere.
        </p>
        <p className="mt-1">
          This tool does not provide legal advice. Consult a professional for legal matters.
        </p>
      </footer>
    </div>
  )
}

export default App
