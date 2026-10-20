import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Frown, Meh, Smile, Laugh, Loader2, Check, Sparkles } from 'lucide-react'
import { getMoods, saveMood, getTodayMood, localDay, getWins } from '../lib/db'

const moodIcons = [Frown, Frown, Meh, Smile, Laugh]
const moodLabels = ['Struggling', 'Low', 'Okay', 'Good', 'Great']
// Stored dates are YYYY-MM-DD; read them as local calendar days.
const asDay = (d: string) => new Date(`${d}T12:00:00`)
const prettyDate = (d: string) => asDay(d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
const dayInitial = (d: string) => asDay(d).toLocaleDateString(undefined, { weekday: 'narrow' })
const moodColors = ['#e8444c', '#e8844c', '#f8b830', '#f88820', '#6ab070']

export default function Mood() {
  const [selected, setSelected] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'done'>('idle')
  const [moods, setMoods] = useState<{ date: string; mood: number; note?: string }[]>([])
  const [todaySet, setTodaySet] = useState(false)
  const [hasWins, setHasWins] = useState(false)

  useEffect(() => {
    loadData()
    getWins().then((w) => setHasWins(w.length > 0))
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
    // One shape, three states (after "Shape morphing through UI states"): button -> loader -> check -> button
    setSaveState('saving')
    await Promise.all([saveMood(selected, note.trim() || undefined), new Promise((r) => setTimeout(r, 420))])
    setSaveState('done')
    setTodaySet(true)
    setTimeout(() => setSaveState('idle'), 1300)
    loadData()
  }

  const streak = (() => {
    let s = 0
    const dates = new Set(moods.map(m => m.date))
    const d = new Date()
    while (dates.has(localDay(d))) {
      s++
      d.setDate(d.getDate() - 1)
    }
    return s
  })()

  return (
    <div className="app-page glow-bg">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <p className="page-kicker mb-2">Daily check-in</p>
          <h1 className="page-title mb-2">How are you feeling?</h1>
          <p className="page-subtitle">Take a moment to name what is here. No judgment, just honesty.</p>
        </header>

        {/* Mood picker */}
        <div className="card p-6 mb-6">
          <div className="flex justify-between gap-2 mb-6">
            {moodIcons.map((Icon, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                aria-label={`Mood: ${moodLabels[i]}`}
                aria-pressed={selected === i}
                  className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-lg transition-all min-h-[44px] ${
                  selected === i
                    ? 'bg-[var(--color-primary)]/15 scale-105'
                    : 'hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                <Icon
                  key={selected === i ? 'on' : 'off'}
                  size={32}
                  className={`transition-colors ${selected === i ? 'mood-pop' : ''}`}
                  style={{ color: moodColors[i], opacity: selected === null || selected === i ? 1 : 0.45 }}
                  aria-hidden="true"
                />
                <span className={`text-xs font-medium ${selected === i ? 'text-[var(--color-on-surface)]' : 'text-[var(--color-on-surface-muted)]'}`}>{moodLabels[i]}</span>
              </button>
            ))}
          </div>

          <label htmlFor="mood-note" className="text-sm font-medium text-[var(--color-on-surface-muted)] mb-2 block">What's behind this feeling? (optional)</label>
          <textarea
            id="mood-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write a note about how you're feeling..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-subtle)] focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none mb-4"
          />

          <button
            onClick={handleSave}
            disabled={selected === null}
            aria-label={todaySet ? 'Update mood check-in' : 'Save mood check-in'}
            className={`btn-sunset morph-btn py-3 disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px] ${saveState !== 'idle' ? 'is-compact' : ''} ${saveState === 'done' ? 'is-done' : ''}`}
          >
            <span key={saveState} className="swap-in flex items-center justify-center" aria-live="polite">
              {saveState === 'saving' ? <Loader2 size={20} className="animate-spin" aria-label="Saving" />
                : saveState === 'done' ? <Check size={22} strokeWidth={2.6} aria-label="Saved" />
                : todaySet ? 'Update check-in' : 'Save check-in'}
            </span>
          </button>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-3 mb-6 p-4 card">
          <div className="icon-tile w-10 h-10">
            <TrendingUp size={20} className="text-[var(--color-primary)]" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-[var(--color-on-surface)]">
            {streak > 0 ? `${streak}-day streak — keep it up` : 'Check in daily to build your streak'}
          </span>
        </div>

        {todaySet && selected !== null && selected <= 1 && hasWins && (
          <Link
            to="/wins-jar"
            className="press flex items-center gap-3 mb-6 p-4 card text-left"
          >
            <div className="icon-tile w-10 h-10">
              <Sparkles size={18} className="text-[var(--color-primary)]" aria-hidden="true" />
            </div>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-[var(--color-on-surface)]">Open your wins jar</span>
              <span className="block text-xs text-[var(--color-on-surface-muted)] mt-0.5">A few small things you've already done, poured out for you.</span>
            </span>
          </Link>
        )}

        {/* History */}
        {moods.length > 0 && (
          <div className="card p-6">
            <h2 className="panel-label mb-4">Mood History</h2>

            {/* Chart */}
            <div
              className="flex items-end justify-between gap-1.5 h-36 mb-6"
              role="img"
              aria-label={`Mood chart for last ${Math.min(moods.length, 14)} days: ${moods.slice(-14).map(m => `${moodLabels[m.mood]} on ${m.date}`).join(', ')}`}
            >
              {moods.slice(-14).map((m, i) => (
                <div key={i} className="flex-1 h-full flex flex-col items-center justify-end gap-1.5 group relative">
                  <div
                    className="bar-grow w-full rounded-t-lg rounded-b-sm hover:opacity-80"
                    style={{
                      height: `${14 + (m.mood / 4) * 86}%`,
                      animationDelay: `${i * 30}ms`,
                      background: `linear-gradient(to top, ${moodColors[m.mood]}40, ${moodColors[m.mood]})`,
                    }}
                  />
                  <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 whitespace-nowrap bg-[var(--color-surface-elevated)] text-[var(--color-on-surface)] text-[10px] px-2 py-1 rounded border border-[var(--color-border)]">
                    {moodLabels[m.mood]} · {m.date.slice(5)}
                  </span>
                  <span className="text-[10px] font-medium text-[var(--color-on-surface-subtle)]" aria-hidden="true">{dayInitial(m.date)}</span>
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
                    <span className="text-xs text-[var(--color-on-surface-muted)]">{prettyDate(m.date)}</span>
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
