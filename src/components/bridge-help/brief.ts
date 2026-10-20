import { getMoods } from '../../lib/db'
import { getJournalEntries } from '../../lib/db'
import { getTrustedPeople } from '../../lib/db'
import { getActivities } from '../../lib/db'

/** Mood tag clusters for the brief */
const POSITIVE = new Set(['good', 'great', 'calm', 'hopeful', 'grateful', 'proud', 'peaceful', 'motivated'])
const STRUGGLING = new Set(['struggling', 'low', 'anxious', 'overwhelmed', 'numb', 'irritable', 'hopeless', 'exhausted', 'lonely'])

export interface FourteenDayBrief {
  days: number
  moodCount: number
  journalCount: number
  positiveDays: number
  strugglingDays: number
  mostCommonTag: string | null
  trustedPeople: number
  breathingSessions: number
  heartChecks: number
  avgBpm: number | null
  generatedAt: string
}

export async function buildFourteenDayBrief(): Promise<FourteenDayBrief> {
  const now = Date.now()
  const cutoff = now - 14 * 24 * 60 * 60 * 1000

  const [moods, journals, people, activities] = await Promise.all([
    getMoods(),
    getJournalEntries(),
    getTrustedPeople(),
    getActivities(cutoff),
  ])

  const moodCount = moods.filter((m) => m.createdAt >= cutoff).length
  const journalCount = journals.filter((j) => j.createdAt >= cutoff).length

  let positiveDays = 0
  let strugglingDays = 0
  const tagCounts = new Map<string, number>()
  const daysWithMood = new Set<string>()

  for (const m of moods) {
    if (m.createdAt < cutoff) continue
    const day = new Date(m.createdAt).toDateString()
    daysWithMood.add(day)
    const tags = (m as any).tags ? (m as any).tags.filter((t: string) => t) : []
    for (const t of tags) tagCounts.set(t, (tagCounts.get(t) || 0) + 1)
    if (tags.some((t: string) => POSITIVE.has(t))) positiveDays++
    if (tags.some((t: string) => STRUGGLING.has(t))) strugglingDays++
  }

  let mostCommonTag: string | null = null
  let maxCount = 0
  for (const [tag, count] of tagCounts) if (count > maxCount) { maxCount = count; mostCommonTag = tag }

  const breathing = activities.filter((a) => a.kind === 'breathing-complete')
  const heartChecks = activities.filter((a) => a.kind === 'heart-check')
  const bpms = heartChecks.map((h) => (h.meta?.bpm as number | undefined)).filter((b): b is number => typeof b === 'number')
  const avgBpm = bpms.length ? Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length) : null

  return {
    days: 14,
    moodCount,
    journalCount,
    positiveDays,
    strugglingDays,
    mostCommonTag,
    trustedPeople: people.length,
    breathingSessions: breathing.length,
    heartChecks: heartChecks.length,
    avgBpm,
    generatedAt: new Date().toISOString(),
  }
}

export function formatBriefForClinician(b: FourteenDayBrief): string {
  const lines = [
    'MINDSpace — 14-Day Summary for Clinician',
    `Generated: ${new Date(b.generatedAt).toLocaleString()}`,
    '',
    `Period: ${b.days} days`,
    `Mood check-ins: ${b.moodCount}`,
    `Journal entries: ${b.journalCount}`,
    `Positive days: ${b.positiveDays}`,
    `Struggling days: ${b.strugglingDays}`,
    `Most common tag: ${b.mostCommonTag || '—'}`,
    `Trusted contacts: ${b.trustedPeople}`,
    `Breathing sessions: ${b.breathingSessions}`,
    `Heart-rate checks: ${b.heartChecks}`,
    b.avgBpm !== null ? `Average heart-rate estimate: ${b.avgBpm} bpm` : 'Average heart-rate estimate: not available',
    '',
    'Notes:',
    '- Heart-rate estimates are from a phone-camera PPG sensor; they are estimates only, not medical readings.',
    '- All data stored locally on the user\'s device. Nothing is transmitted.',
    '- This summary is intended to support, not replace, clinical assessment.',
  ]
  return lines.join('\n')
}

export function formatBriefForShare(b: FourteenDayBrief): string {
  return `My MINDSpace 14-day summary:\nMood check-ins: ${b.moodCount}\nJournal entries: ${b.journalCount}\nPositive days: ${b.positiveDays} / Struggling: ${b.strugglingDays}\nBreathing sessions: ${b.breathingSessions}\nHeart checks: ${b.heartChecks}${b.avgBpm !== null ? ` (avg ${b.avgBpm} bpm)` : ''}\nGenerated ${new Date(b.generatedAt).toLocaleDateString()}`
}