const patterns: RegExp[] = [
  // IBAN: 2-letter country code + 2 check digits + up to 30 alphanumeric (with optional spaces/dashes)
  /\b[A-Z]{2}\d{2}[\s-]?[\dA-Z]{4}(?:[\s-]?[\dA-Z]{4}){1,7}(?:[\s-]?[\dA-Z]{1,4})?\b/g,

  // Credit card: 16 digits, optionally grouped by 4 with spaces or dashes
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,

  // Email
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,

  // Phone: optional +, country code, then 7–14 digits with optional spaces/dashes/dots/parens
  /\+?\(?\d{1,4}\)?[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}\b/g,
]

export function redactPII(text: string): string {
  let result = text
  for (const pattern of patterns) {
    result = result.replace(pattern, '[REDACTED]')
  }
  return result
}
