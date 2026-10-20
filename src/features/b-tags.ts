// Day tags for "Your patterns" (Batch B). Shared by the Mood check-in row
// (src/pages/Mood.tsx) and the Patterns screen (src/components/b/Patterns.tsx).
export const MOOD_TAGS: { id: string; label: string }[] = [
  { id: 'slept-badly', label: 'Slept badly' },
  { id: 'power-cut', label: 'Power cut' },
  { id: 'fuel-queue', label: 'Fuel queue' },
  { id: 'salary-day', label: 'Salary day' },
  { id: 'exams', label: 'Exams' },
  { id: 'traffic', label: 'Traffic' },
  { id: 'family', label: 'Family' },
  { id: 'exercise', label: 'Exercise' },
  { id: 'worship', label: 'Church/Mosque' },
  { id: 'rain', label: 'Rain' },
]

export const tagLabel = (id: string) => MOOD_TAGS.find((t) => t.id === id)?.label ?? id

export interface PatternFinding {
  tag: string
  direction: 'lower' | 'higher'
  nWith: number
  nWithout: number
  avgWith: number
  avgWithout: number
}

// Plain-language findings from tagged check-ins. Descriptive only — honest
// counts, no causes claimed, no medical claims. Needs 7+ check-ins to say
// anything, and 3+ days with a tag before comparing.
export function computeFindings(moods: { date: string; mood: number; tags?: string[] }[]): PatternFinding[] {
  const findings: PatternFinding[] = []
  for (const tag of MOOD_TAGS) {
    const withTag = moods.filter((m) => m.tags?.includes(tag.id))
    const without = moods.filter((m) => !m.tags?.includes(tag.id))
    if (withTag.length < 3 || without.length === 0) continue
    const avgWith = withTag.reduce((s, m) => s + m.mood, 0) / withTag.length
    const avgWithout = without.reduce((s, m) => s + m.mood, 0) / without.length
    const diff = avgWith - avgWithout
    if (diff <= -0.4) findings.push({ tag: tag.id, direction: 'lower', nWith: withTag.length, nWithout: without.length, avgWith, avgWithout })
    else if (diff >= 0.4) findings.push({ tag: tag.id, direction: 'higher', nWith: withTag.length, nWithout: without.length, avgWith, avgWithout })
  }
  return findings
}