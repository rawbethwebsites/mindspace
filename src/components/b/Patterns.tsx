import { useEffect, useState } from 'react'
import { Activity, Tag } from 'lucide-react'
import { getMoods } from '../../lib/db'
import { MOOD_TAGS, computeFindings, tagLabel } from '../../features/b-tags'

const MOOD_LABELS = ['Struggling', 'Low', 'Okay', 'Good', 'Great']
const avgLabel = (avg: number) => MOOD_LABELS[Math.max(0, Math.min(4, Math.round(avg)))]
const MIN_CHECKINS = 7

// Tools screen: "Your patterns" — plain-language findings from tagged
// check-ins (power cuts, fuel queues, family days...). Descriptive only.
export default function Patterns() {
  const [moods, setMoods] = useState<{ date: string; mood: number; tags?: string[] }[]>([])

  useEffect(() => {
    getMoods().then(setMoods)
  }, [])

  const findings = computeFindings(moods)
  const taggedCount = moods.filter((m) => (m.tags ?? []).length > 0).length
  const tagCounts = MOOD_TAGS.map((t) => ({ ...t, n: moods.filter((m) => m.tags?.includes(t.id)).length })).filter((t) => t.n > 0)

  return (
    <div className="app-page">
      <div className="max-w-3xl mx-auto">
        <header className="mb-7">
          <p className="page-kicker mb-2">Your patterns</p>
          <h1 className="page-title mb-2">What your days have in common</h1>
          <p className="page-subtitle">
            Findings from your own check-ins and day tags. Honest counts, gentle hints — not rules.
          </p>
        </header>

        {moods.length < MIN_CHECKINS ? (
          <div className="card p-6">
            <div className="icon-tile w-10 h-10 mb-4"><Activity size={20} aria-hidden="true" /></div>
            <h2 className="font-semibold text-lg text-[var(--text)] mb-1.5">Not enough check-ins yet</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              You have {moods.length} of {MIN_CHECKINS} check-ins. Once you have a week of them, this page starts
              noticing what your hard and good days have in common. Keep tagging your days on the Mood check-in —
              power cuts, fuel queues, family, rain and the rest.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {findings.length > 0 ? (
              <>
                {findings.map((f) => (
                  <div key={f.tag} className="card p-5">
                    <p className="mono mb-1.5" style={{ textTransform: 'uppercase' }}>{tagLabel(f.tag)}</p>
                    <h2 className="font-semibold text-lg text-[var(--text)] leading-snug mb-2">
                      On {tagLabel(f.tag).toLowerCase()} days your mood is usually {f.direction}.
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                      {f.nWith} check-ins on those days averaged {avgLabel(f.avgWith).toLowerCase()}, against{' '}
                      {avgLabel(f.avgWithout).toLowerCase()} across your other {f.nWithout} check-ins. Small numbers
                      so far — read it as a gentle hint, not a rule.
                    </p>
                  </div>
                ))}
                <p className="text-xs text-[var(--text-muted)] px-1">
                  These are observations from your own check-ins, not medical advice. Days change; so do patterns.
                </p>
              </>
            ) : (
              <div className="card p-6">
                <div className="icon-tile w-10 h-10 mb-4"><Activity size={20} aria-hidden="true" /></div>
                <h2 className="font-semibold text-lg text-[var(--text)] mb-1.5">
                  {taggedCount === 0 ? 'No tagged days yet' : 'No clear patterns yet'}
                </h2>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {taggedCount === 0
                    ? 'Add a few day tags on your Mood check-in — power cut, family, exams and so on. Once a tag shows up on three or more days, findings start appearing here.'
                    : `You have ${taggedCount} tagged check-ins, but nothing stands out clearly yet. Keep going — once a tag shows up on three or more days with a real difference, it will appear here.`}
                </p>
              </div>
            )}

            {tagCounts.length > 0 && (
              <div className="card p-5">
                <p className="panel-label mb-3 flex items-center gap-1.5"><Tag size={13} aria-hidden="true" /> Your day tags</p>
                <div className="flex flex-wrap gap-2">
                  {tagCounts.map((t) => (
                    <span key={t.id} className="pill pill-cream" style={{ textTransform: 'none' }}>
                      {t.label} · {t.n}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}