import { describe, expect, it } from 'vitest'
import { redactPII } from './redact'

describe('redactPII', () => {
  it('redacts a standard IBAN', () => {
    const input = 'Send to GB29 NWBK 6016 1331 9268 19 please'
    expect(redactPII(input)).toBe('Send to [REDACTED] please')
  })

  it('redacts an IBAN without spaces', () => {
    const input = 'Account: DE89370400440532013000'
    expect(redactPII(input)).toBe('Account: [REDACTED]')
  })

  it('redacts a 16-digit credit card number', () => {
    const input = 'Card: 4111 1111 1111 1111 was charged'
    expect(redactPII(input)).toBe('Card: [REDACTED] was charged')
  })

  it('redacts a credit card with dashes', () => {
    const input = 'Paid with 5500-0000-0000-0004'
    expect(redactPII(input)).toBe('Paid with [REDACTED]')
  })

  it('redacts a credit card with no separators', () => {
    const input = 'CC 4111111111111111 on file'
    expect(redactPII(input)).toBe('CC [REDACTED] on file')
  })

  it('redacts email addresses', () => {
    const input = 'Contact jane.doe@example.com for details'
    expect(redactPII(input)).toBe('Contact [REDACTED] for details')
  })

  it('redacts emails with plus addressing', () => {
    const input = 'user+tag@mail.co.uk sent the report'
    expect(redactPII(input)).toBe('[REDACTED] sent the report')
  })

  it('redacts international phone numbers', () => {
    const input = 'Call +44 20 7946 0958 for info'
    expect(redactPII(input)).toBe('Call [REDACTED] for info')
  })

  it('redacts US phone numbers', () => {
    const input = 'Phone: (555) 123-4567 is on record'
    expect(redactPII(input)).toBe('Phone: [REDACTED] is on record')
  })

  it('redacts phone numbers with dots', () => {
    const input = 'Reach me at 555.123.4567 today'
    expect(redactPII(input)).toBe('Reach me at [REDACTED] today')
  })

  it('redacts multiple PII types in one string', () => {
    const result = redactPII(
      'Email: bob@test.com, Card: 4111111111111111, IBAN: GB29NWBK60161331926819',
    )
    expect(result).toBe(
      'Email: [REDACTED], Card: [REDACTED], IBAN: [REDACTED]',
    )
  })

  it('does not redact years or short digit sequences as phone numbers', () => {
    const input = 'The year 2026 was significant. Order #4821 confirmed.'
    expect(redactPII(input)).toBe(input)
  })

  it('handles WhatsApp-style timestamp lines without hanging', () => {
    const input =
      '[12/10/2026, 09:14:02] +44 7700 900077: URGENT: Send it to IBAN GB29NWBK60161331926819.'
    const result = redactPII(input)
    expect(result).toContain('[REDACTED]')
    expect(result).not.toContain('GB29')
    expect(result).not.toContain('900077')
    expect(result).toContain('12/10/2026')
  })

  it('leaves clean text untouched', () => {
    const input = 'This is a normal sentence with no PII.'
    expect(redactPII(input)).toBe(input)
  })
})
