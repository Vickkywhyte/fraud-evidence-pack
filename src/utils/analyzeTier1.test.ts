import { describe, expect, it } from 'vitest'
import { analyzeTier1 } from './analyzeTier1'

describe('analyzeTier1', () => {
  it('matches Impersonation typology', () => {
    const result = analyzeTier1('The caller was pretending to be a bank manager.')
    expect(result.matchedTypologies).toContain('Impersonation')
  })

  it('matches Advance Fee typology', () => {
    const result = analyzeTier1('They asked for an upfront payment to release the funds.')
    expect(result.matchedTypologies).toContain('Advance Fee')
  })

  it('matches Romance Scam typology', () => {
    const result = analyzeTier1('We started an online relationship and she asked me to send money.')
    expect(result.matchedTypologies).toContain('Romance Scam')
  })

  it('matches Investment Scam typology', () => {
    const result = analyzeTier1('He promised guaranteed returns on a crypto investment platform.')
    expect(result.matchedTypologies).toContain('Investment Scam')
  })

  it('matches Account Takeover typology', () => {
    const result = analyzeTier1('Please verify your account immediately or it will be locked.')
    expect(result.matchedTypologies).toContain('Account Takeover')
  })

  it('matches multiple typologies in one text', () => {
    const result = analyzeTier1(
      'Someone posing as my bank asked me to verify your account and pay a processing fee.',
    )
    expect(result.matchedTypologies).toContain('Impersonation')
    expect(result.matchedTypologies).toContain('Account Takeover')
    expect(result.matchedTypologies).toContain('Advance Fee')
  })

  it('extracts warning phrases case-insensitively', () => {
    const result = analyzeTier1('This is URGENT. Send money via WIRE TRANSFER now!')
    expect(result.extractedFlags).toContain('urgent')
    expect(result.extractedFlags).toContain('send money')
    expect(result.extractedFlags).toContain('wire transfer')
  })

  it('extracts dates in DD/MM/YYYY format with context', () => {
    const result = analyzeTier1('The payment was made on 15/03/2024 to the account.')
    expect(result.timeline).toHaveLength(1)
    expect(result.timeline[0].date).toBe('15/03/2024')
    expect(result.timeline[0].context).toContain('payment')
  })

  it('extracts dates in Month DD, YYYY format', () => {
    const result = analyzeTier1('On January 5, 2024 I received a suspicious email.')
    expect(result.timeline).toHaveLength(1)
    expect(result.timeline[0].date).toBe('January 5, 2024')
  })

  it('extracts dates in DD Month YYYY format', () => {
    const result = analyzeTier1('Transfer happened 3 March 2024 without authorization.')
    expect(result.timeline).toHaveLength(1)
    expect(result.timeline[0].date).toBe('3 March 2024')
  })

  it('extracts multiple dates as a timeline', () => {
    const text =
      'First contact on 01/01/2024. Second payment on 15/02/2024. Reported on 01/03/2024.'
    const result = analyzeTier1(text)
    expect(result.timeline).toHaveLength(3)
    expect(result.timeline.map((t) => t.date)).toEqual([
      '01/01/2024',
      '15/02/2024',
      '01/03/2024',
    ])
  })

  it('returns empty results for clean text', () => {
    const result = analyzeTier1('The weather today is sunny and warm.')
    expect(result.matchedTypologies).toEqual([])
    expect(result.extractedFlags).toEqual([])
    expect(result.timeline).toEqual([])
  })
})
