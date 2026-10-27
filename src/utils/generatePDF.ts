import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib'
import type { Tier1Result } from './analyzeTier1'

function sanitizeForPDF(text: string): string {
  return text.replace(/[^\x20-\x7E\n\r\t]/g, '?')
}

const SOURCE_SEPARATOR = /^--- Source: (.+) ---$/

const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN = 50
const CONTENT_W = PAGE_W - MARGIN * 2
const FOOTER_Y = 30

const COLORS = {
  black: rgb(0, 0, 0),
  darkGray: rgb(0.2, 0.2, 0.2),
  gray: rgb(0.45, 0.45, 0.45),
  lightGray: rgb(0.85, 0.85, 0.85),
  accent: rgb(0.15, 0.25, 0.5),
  red: rgb(0.7, 0.15, 0.15),
  bgLight: rgb(0.95, 0.95, 0.97),
}

interface Fonts {
  regular: PDFFont
  bold: PDFFont
  italic: PDFFont
}

interface Cursor {
  page: PDFPage
  y: number
}

function addPage(doc: PDFDocument, fonts: Fonts, pageNum: { n: number }): Cursor {
  pageNum.n++
  const page = doc.addPage([PAGE_W, PAGE_H])
  page.drawText(`Page ${pageNum.n}`, {
    x: PAGE_W - MARGIN - 40,
    y: FOOTER_Y,
    size: 8,
    font: fonts.regular,
    color: COLORS.gray,
  })
  return { page, y: PAGE_H - MARGIN }
}

function ensureSpace(
  doc: PDFDocument,
  fonts: Fonts,
  cursor: Cursor,
  needed: number,
  pageNum: { n: number },
): Cursor {
  if (cursor.y - needed < MARGIN + 20) {
    return addPage(doc, fonts, pageNum)
  }
  return cursor
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

function drawWrapped(
  doc: PDFDocument,
  fonts: Fonts,
  cursor: Cursor,
  text: string,
  font: PDFFont,
  size: number,
  color: typeof COLORS.black,
  lineHeight: number,
  pageNum: { n: number },
): Cursor {
  const lines = wrapText(text, font, size, CONTENT_W)
  for (const line of lines) {
    cursor = ensureSpace(doc, fonts, cursor, lineHeight, pageNum)
    cursor.page.drawText(line, { x: MARGIN, y: cursor.y, size, font, color })
    cursor.y -= lineHeight
  }
  return cursor
}

function drawSectionTitle(
  doc: PDFDocument,
  fonts: Fonts,
  cursor: Cursor,
  title: string,
  pageNum: { n: number },
): Cursor {
  cursor = ensureSpace(doc, fonts, cursor, 40, pageNum)
  cursor.y -= 10
  cursor.page.drawLine({
    start: { x: MARGIN, y: cursor.y + 16 },
    end: { x: PAGE_W - MARGIN, y: cursor.y + 16 },
    thickness: 0.5,
    color: COLORS.lightGray,
  })
  cursor.page.drawText(title.toUpperCase(), {
    x: MARGIN,
    y: cursor.y,
    size: 12,
    font: fonts.bold,
    color: COLORS.accent,
  })
  cursor.y -= 20
  return cursor
}

function buildExecutiveSummary(analysis: Tier1Result, redactedText: string): string {
  const typCount = analysis.matchedTypologies.length
  const flagCount = analysis.extractedFlags.length
  const dateCount = analysis.timeline.length
  const wordCount = redactedText.split(/\s+/).length

  let summary = `This evidence brief analyses approximately ${wordCount} words of redacted source material. `
  if (typCount > 0) {
    summary += `The rule-based engine identified ${typCount} fraud typolog${typCount === 1 ? 'y' : 'ies'}: ${analysis.matchedTypologies.join(', ')}. `
  } else {
    summary += 'No known fraud typologies were matched by the rule-based engine. '
  }
  if (flagCount > 0) {
    summary += `${flagCount} warning phrase${flagCount === 1 ? ' was' : 's were'} detected, including language associated with urgency, social engineering, or fraudulent payment methods. `
  }
  if (dateCount > 0) {
    summary += `${dateCount} date reference${dateCount === 1 ? ' was' : 's were'} extracted to reconstruct a timeline of events.`
  }
  return summary
}

export async function generatePDF(
  analysis: Tier1Result,
  redactedText: string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle('Fraud Evidence Brief')
  doc.setSubject('AI-assisted fraud evidence analysis')
  doc.setProducer('Fraud Evidence Pack (local, browser-only)')
  doc.setCreationDate(new Date())

  const fonts: Fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    italic: await doc.embedFont(StandardFonts.HelveticaOblique),
  }

  const pageNum = { n: 0 }
  let cursor = addPage(doc, fonts, pageNum)

  // --- Cover / Header ---
  cursor.y -= 30
  cursor.page.drawText('FRAUD EVIDENCE BRIEF', {
    x: MARGIN,
    y: cursor.y,
    size: 24,
    font: fonts.bold,
    color: COLORS.accent,
  })
  cursor.y -= 22

  const timestamp = new Date().toLocaleString('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
  })
  cursor.page.drawText(`Generated: ${timestamp}`, {
    x: MARGIN,
    y: cursor.y,
    size: 10,
    font: fonts.regular,
    color: COLORS.gray,
  })
  cursor.y -= 14
  cursor.page.drawText('Analysis method: Tier 1 -- Rule-based keyword and pattern matching', {
    x: MARGIN,
    y: cursor.y,
    size: 10,
    font: fonts.regular,
    color: COLORS.gray,
  })
  cursor.y -= 20

  // Disclaimer box
  const disclaimerH = 36
  cursor.page.drawRectangle({
    x: MARGIN,
    y: cursor.y - disclaimerH + 14,
    width: CONTENT_W,
    height: disclaimerH,
    color: COLORS.bgLight,
  })
  cursor.page.drawText(
    'DISCLAIMER: Generated locally in the browser. This is an AI-assisted analytical report, not legal advice.',
    {
      x: MARGIN + 8,
      y: cursor.y - 4,
      size: 8.5,
      font: fonts.italic,
      color: COLORS.red,
    },
  )
  cursor.page.drawText(
    'All personal data has been redacted. Verify all findings against original evidence before submission.',
    {
      x: MARGIN + 8,
      y: cursor.y - 16,
      size: 8.5,
      font: fonts.italic,
      color: COLORS.red,
    },
  )
  cursor.y -= disclaimerH + 10

  // --- Executive Summary ---
  cursor = drawSectionTitle(doc, fonts, cursor, 'Executive Summary', pageNum)
  const summary = buildExecutiveSummary(analysis, redactedText)
  cursor = drawWrapped(doc, fonts, cursor, summary, fonts.regular, 10, COLORS.darkGray, 14, pageNum)
  cursor.y -= 6

  // --- Typology Match ---
  cursor = drawSectionTitle(doc, fonts, cursor, 'Typology Match', pageNum)
  if (analysis.matchedTypologies.length === 0) {
    cursor = drawWrapped(
      doc, fonts, cursor,
      'No known fraud typologies were matched.',
      fonts.italic, 10, COLORS.gray, 14, pageNum,
    )
  } else {
    for (const typ of analysis.matchedTypologies) {
      cursor = ensureSpace(doc, fonts, cursor, 16, pageNum)
      cursor.page.drawCircle({
        x: MARGIN + 5,
        y: cursor.y + 3,
        size: 3,
        color: COLORS.red,
      })
      cursor.page.drawText(typ, {
        x: MARGIN + 14,
        y: cursor.y,
        size: 10,
        font: fonts.bold,
        color: COLORS.darkGray,
      })
      cursor.y -= 16
    }
  }
  cursor.y -= 6

  // --- Red Flag Analysis ---
  cursor = drawSectionTitle(doc, fonts, cursor, 'Red Flag Analysis', pageNum)
  if (analysis.extractedFlags.length === 0) {
    cursor = drawWrapped(
      doc, fonts, cursor,
      'No warning phrases were detected.',
      fonts.italic, 10, COLORS.gray, 14, pageNum,
    )
  } else {
    for (const flag of analysis.extractedFlags) {
      cursor = ensureSpace(doc, fonts, cursor, 14, pageNum)
      cursor.page.drawText(`- ${flag}`, {
        x: MARGIN + 6,
        y: cursor.y,
        size: 9.5,
        font: fonts.regular,
        color: COLORS.darkGray,
      })
      cursor.y -= 14
    }
  }
  cursor.y -= 6

  // --- Timeline ---
  cursor = drawSectionTitle(doc, fonts, cursor, 'Event Timeline', pageNum)
  if (analysis.timeline.length === 0) {
    cursor = drawWrapped(
      doc, fonts, cursor,
      'No dates were found in the source text.',
      fonts.italic, 10, COLORS.gray, 14, pageNum,
    )
  } else {
    // Table header
    cursor = ensureSpace(doc, fonts, cursor, 20, pageNum)
    cursor.page.drawRectangle({
      x: MARGIN,
      y: cursor.y - 4,
      width: CONTENT_W,
      height: 16,
      color: COLORS.accent,
    })
    cursor.page.drawText('Date', {
      x: MARGIN + 6,
      y: cursor.y,
      size: 9,
      font: fonts.bold,
      color: rgb(1, 1, 1),
    })
    cursor.page.drawText('Context', {
      x: MARGIN + 120,
      y: cursor.y,
      size: 9,
      font: fonts.bold,
      color: rgb(1, 1, 1),
    })
    cursor.y -= 18

    for (let i = 0; i < analysis.timeline.length; i++) {
      const entry = analysis.timeline[i]
      const contextLines = wrapText(sanitizeForPDF(entry.context), fonts.regular, 8.5, CONTENT_W - 126)
      const rowHeight = Math.max(14, contextLines.length * 12 + 4)

      cursor = ensureSpace(doc, fonts, cursor, rowHeight, pageNum)

      if (i % 2 === 0) {
        cursor.page.drawRectangle({
          x: MARGIN,
          y: cursor.y - rowHeight + 12,
          width: CONTENT_W,
          height: rowHeight,
          color: COLORS.bgLight,
        })
      }

      cursor.page.drawText(sanitizeForPDF(entry.date), {
        x: MARGIN + 6,
        y: cursor.y,
        size: 9,
        font: fonts.bold,
        color: COLORS.darkGray,
      })

      let contextY = cursor.y
      for (const line of contextLines) {
        cursor.page.drawText(line, {
          x: MARGIN + 120,
          y: contextY,
          size: 8.5,
          font: fonts.regular,
          color: COLORS.gray,
        })
        contextY -= 12
      }

      cursor.y -= rowHeight
    }
  }
  cursor.y -= 6

  // --- Appendix: Full Redacted Text ---
  cursor = drawSectionTitle(doc, fonts, cursor, 'Appendix -- Full Redacted Text', pageNum)
  cursor = drawWrapped(
    doc, fonts, cursor,
    'The complete redacted source text is reproduced below for verification against the original evidence.',
    fonts.italic, 9, COLORS.gray, 13, pageNum,
  )
  cursor.y -= 8

  const textLines = redactedText.split('\n')
  for (const line of textLines) {
    if (line.trim() === '') {
      cursor.y -= 8
      continue
    }
    const sourceMatch = line.match(SOURCE_SEPARATOR)
    if (sourceMatch) {
      cursor = ensureSpace(doc, fonts, cursor, 30, pageNum)
      cursor.y -= 6
      cursor.page.drawRectangle({
        x: MARGIN,
        y: cursor.y - 2,
        width: CONTENT_W,
        height: 16,
        color: COLORS.bgLight,
      })
      cursor.page.drawText(sanitizeForPDF(sourceMatch[1]), {
        x: MARGIN + 6,
        y: cursor.y + 2,
        size: 9,
        font: fonts.bold,
        color: COLORS.accent,
      })
      cursor.y -= 18
      continue
    }
    cursor = drawWrapped(doc, fonts, cursor, sanitizeForPDF(line), fonts.regular, 9, COLORS.darkGray, 12, pageNum)
  }

  return doc.save()
}
