const crisisKeywords = [
  'kill myself',
  'killing myself',
  'end my life',
  'end it all',
  'suicide',
  'suicidal',
  'self-harm',
  'self harm',
  'cut myself',
  'hurt myself',
  "don't want to live",
  'dont want to live',
  'no reason to live',
  'better off dead',
  'better off without me',
  'want to die',
  'wanna die',
  'take my own life',
  'not worth living',
  'everyone would be better off',
  'goodbye forever',
  'last time',
  'final goodbye',
]

export function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase()
  return crisisKeywords.some((kw) => lower.includes(kw))
}

export const crisisResources = [
  {
    name: '988 Suicide & Crisis Lifeline',
    phone: '988',
    text: 'Text 988',
    url: 'https://988lifeline.org',
    regions: ['US'],
    description: '24/7 free and confidential support for people in distress.',
  },
  {
    name: 'Crisis Text Line',
    phone: '',
    text: 'Text HOME to 741741',
    url: 'https://www.crisistextline.org',
    regions: ['US', 'UK', 'Ireland', 'Canada'],
    description: 'Free 24/7 crisis support via text message.',
  },
  {
    name: 'International Association for Suicide Prevention',
    phone: '',
    text: '',
    url: 'https://www.iasp.info/resources/Crisis_Centres/',
    regions: ['Global'],
    description: 'Find crisis centers and hotlines worldwide.',
  },
  {
    name: 'SAMHSA National Helpline',
    phone: '1-800-662-4357',
    text: '',
    url: 'https://www.samhsa.gov/find-help/national-helpline',
    regions: ['US'],
    description: 'Free, confidential, 24/7 treatment referral and information.',
  },
  {
    name: 'The Trevor Project',
    phone: '1-866-488-7386',
    text: 'Text START to 678-678',
    url: 'https://www.thetrevorproject.org',
    regions: ['US'],
    description: 'Crisis intervention for LGBTQ+ youth (24/7).',
  },
]