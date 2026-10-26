export interface Tier1Result {
  matchedTypologies: string[]
  extractedFlags: string[]
  timeline: { date: string; context: string }[]
}

interface Typology {
  name: string
  keywords: string[]
}

const typologies: Typology[] = [
  {
    name: 'Impersonation',
    keywords: [
      'impersonat',
      'pretending to be',
      'posing as',
      'fake identity',
      'claimed to be',
      'acting as',
      'spoofed',
    ],
  },
  {
    name: 'Advance Fee',
    keywords: [
      'advance fee',
      'upfront payment',
      'processing fee',
      'pay first',
      'release the funds',
      'transfer fee',
      'clearance fee',
      'pay before',
    ],
  },
  {
    name: 'Romance Scam',
    keywords: [
      'fell in love',
      'dating',
      'romantic',
      'meet in person',
      'send money',
      'stranded abroad',
      'military deployment',
      'never met',
      'online relationship',
    ],
  },
  {
    name: 'Investment Scam',
    keywords: [
      'guaranteed returns',
      'guaranteed profit',
      'high yield',
      'investment opportunity',
      'trading platform',
      'forex',
      'crypto investment',
      'double your money',
      'no risk',
      'passive income',
      'ponzi',
      'pyramid',
    ],
  },
  {
    name: 'Account Takeover',
    keywords: [
      'verify your account',
      'confirm your identity',
      'unusual activity',
      'suspicious login',
      'reset your password',
      'account compromised',
      'unauthorized access',
      'security alert',
      'locked out',
      'credentials',
    ],
  },
]

const warningPhrases: string[] = [
  'urgent',
  'act now',
  'act immediately',
  'limited time',
  'guaranteed returns',
  'guaranteed profit',
  'crypto wallet',
  'bitcoin',
  'wire transfer',
  'western union',
  'moneygram',
  'gift card',
  'verify your account',
  "don't tell anyone",
  'do not tell anyone',
  'keep this confidential',
  'keep this secret',
  'send money',
  'send funds',
  'processing fee',
  'advance fee',
  'tax payment',
  'claim your prize',
  'you have won',
  "you've won",
  'congratulations',
  'click this link',
  'click here',
  'log in immediately',
  'account suspended',
  'account locked',
  'too good to be true',
  'risk-free',
  'no risk',
  'once in a lifetime',
  'official government',
  'irs',
  'hmrc',
  'customs',
]

const datePattern =
  /\b(\d{1,2}[\/.\\-]\d{1,2}[\/.\\-]\d{2,4}|\d{4}[\/.\\-]\d{1,2}[\/.\\-]\d{1,2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2}(?:,?\s+\d{2,4})?|\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?(?:,?\s+\d{2,4})?)\b/gi

export function analyzeTier1(text: string): Tier1Result {
  const lower = text.toLowerCase()

  const matchedTypologies = typologies
    .filter((t) => t.keywords.some((kw) => lower.includes(kw)))
    .map((t) => t.name)

  const extractedFlags = warningPhrases.filter((phrase) =>
    lower.includes(phrase),
  )

  const timeline: { date: string; context: string }[] = []
  let match: RegExpExecArray | null
  while ((match = datePattern.exec(text)) !== null) {
    const start = Math.max(0, match.index - 40)
    const end = Math.min(text.length, match.index + match[0].length + 40)
    const context = text.slice(start, end).replace(/\n/g, ' ').trim()
    timeline.push({ date: match[0], context })
  }

  return { matchedTypologies, extractedFlags, timeline }
}
