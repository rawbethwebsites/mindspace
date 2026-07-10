import { useEffect, useState } from 'react'
import { TrendingUp, Frown, Meh, Smile, Laugh, Heart } from 'lucide-react'
import { getMoods, saveMood, getTodayMood } from '../lib/db'

const moodIcons = [Frown, Frown, Meh, Smile, Laugh]
const moodLabels = ['Struggling', 'Low', 'Okay', 'Good', 'Great']
const moodColors = ['#c44', '#e88', '#aa9', '#7a9', '#5a7']

export default function Mood() {
  const [selected, setSelected] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [moods, setMoods] = useState<{ date: string; mood: number; note?: string }[]>([])
  const [todaySet, setTodaySet] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const today = await getTodayMood()
    if (today) {
      setSelected(today.mood)
      setNote(today.note || '')
      setTodaySet(true)
    }
    const all = await getMoods()
    setMoods(all)
  }

  const handleSave = async () => {
    if (selected === null) return
    await saveMood(selected, note.trim() || undefined)
    setSaved(true)
    setTodaySet(true)
    setTimeout(() => setSaved(false), 2000)
    loadData()
  }

  const streak = (() => {
    let s = 0
    const today = new Date().toISOString().split('T')[0]
    const dates = new Set(moods.map(m => m.date))
    let d = new Date(today)
    while (dates.has(d.toISOString().split('T')[0])) {
      s++
      d.setDate(d.getDate() - 1)
    }
    return s
  })()

  return (
    <div className="min-h-screen pb-12 px-6 md:px-12 pt-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-on-surface)] mb-2">How are you feeling?</h1>
          <p className="text-sm text-[var(--color-on-surface-muted)]">Take a moment to check in with yourself. No judgment, just honesty.</p>
        </div>

        {/* Mood picker — SVG icons, not emojis */}
        <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] mb-6">
          <div className="flex justify-between gap-2 mb-6">
            {moodIcons.map((Icon, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                aria-label={`Mood: ${moodLabels[i]}`}
                aria-pressed={selected === i}
                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl transition-all min-h-[44px] ${
                  selected === i
                    ? 'bg-[var(--color-primary)]/15 scale-105'
                    : 'hover:bg-[var(--color-primary)]/8'
                }`}
              >
                <Icon
                  size={32}
                  className="transition-colors"
                  style={{ color: selected === i ? moodColors[i] : 'var(--color-on-surface-subtle)' }}
                  aria-hidden="true"
                />
                <span className={`text-xs font-medium ${selected === i ? 'text-[var(--color-on-surface)]' : 'text-[var(--color-on-surface-muted)]'}`}>{moodLabels[i]}</span>
              </button>
            ))}
          </div>

          <label htmlFor="mood-note" className="text-sm font-medium text-[var(--color-on-surface-muted)] mb-2 block">What&apos;s behind this feeling? (optional)</label>
          <textarea
            id="mood-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write a note about how you're feeling..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-subtle)] focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none mb-4"
          />

          <button
            onClick={handleSave}
            disabled={selected === null}
            aria-label={todaySet ? 'Update mood check-in' : 'Save mood check-in'}
            className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
          >
            {saved ? '✓ Saved' : todaySet ? 'Update check-in' : 'Save check-in'}
          </button>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 rounded-xl">
          <TrendingUp size={20} className="text-[var(--color-primary-dark)]" aria-hidden="true" />
          <span className="text-sm font-medium text-[var(--color-on-surface)]">
            {streak > 0 ? `${streak}-day streak — keep it up` : 'Check in daily to build your streak'}
          </span>
        </div>

        {/* History */}
        {moods.length > 0 && (
          <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
            <h2 className="text-sm font-semibold text-[var(--color-on-surface-muted)] uppercase tracking-wide mb-4">Mood History</h2>

            {/* Chart — accessible with aria-label */}
            <div
              className="flex items-end justify-between gap-1 h-32 mb-6"
              role="img"
              aria-label={`Mood chart for last ${Math.min(moods.length, 14)} days: ${moods.slice(-14).map(m => `${moodLabels[m.mood]} on ${m.date}`).join(', ')}`}
            >
              {moods.slice(-14).map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full rounded-t-lg transition-all hover:opacity-80"
                    style={{
                      height: `${(m.mood / 4) * 100}%`,
                      backgroundColor: moodColors[m.mood],
                    }}
                  />
                  <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 whitespace-nowrap bg-[var(--color-on-surface)] text-white text-[10px] px-2 py-1 rounded">
                    {moodLabels[m.mood]} · {m.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>

            {/* List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...moods].reverse().map((m, i) => {
                const MoodIcon = moodIcons[m.mood]
                return (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-[var(--color-border)]/50 last:border-0">
                    <MoodIcon size={24} style={{ color: moodColors[m.mood] }} aria-hidden="true" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-[var(--color-on-surface)]">{moodLabels[m.mood]}</span>
                      {m.note && <p className="text-xs text-[var(--color-on-surface-muted)] mt-0.5">{m.note}</p>}
                    </div>
                    <span className="text-xs text-[var(--color-on-surface-muted)]">{m.date}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}