import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Sparkles } from 'lucide-react'
import { getWins, addWin, deleteWin, getMoods, type StoredWin } from '../lib/db'

// Wins jar: one-tap capture of small wins, and a gentle "pour" view when today
// is Low or Struggling — offered via a link on the Mood page.
export default function WinsJar() {
  const [wins, setWins] = useState<StoredWin[]>([])
  const [text, setText] = useState('')
  const [pouring, setPouring] = useState(false)
  const [offerPour, setOfferPour] = useState(false)

  const load = async () => {
    const [all, moods] = await Promise.all([getWins(), getMoods()])
    setWins(all)
    const last = moods[moods.length - 1]
    setOfferPour(!!last && last.mood <= 1 && all.length > 0)
  }
  useEffect(() => {
    load()
  }, [])

  const handleAdd = async () => {
    const t = text.trim()
    if (!t) return
    await addWin(t)
    setText('')
    load()
  }

  // How full the jar looks. Soft cap so the jar never looks literally stuffed.
  const fillPct = useMemo(() => Math.min(wins.length * 9, 92), [wins.length])

  return (
    <div className="app-page">
      <div className="max-w-2xl mx-auto">
        <p className="page-kicker mb-2">Wins jar</p>
        <h1 className="page-title mb-2">Small wins, kept safe</h1>
        <p className="page-subtitle mb-6">
          Drop one small thing in when it happens. On a hard day, pour a few out and remember who you are.
        </p>

        {offerPour && !pouring && (
          <button
            onClick={() => setPouring(true)}
            className="btn-sunset w-full py-3 mb-6 flex items-center justify-center gap-2 min-h-[48px] rise-in"
          >
            <Sparkles size={16} aria-hidden="true" /> Open your jar — pour a few out
          </button>
        )}

        {pouring ? (
          <PourView wins={wins} onDone={() => setPouring(false)} />
        ) : (
          <>
            <div className="card p-5 mb-6">
              <label htmlFor="win-input" className="block text-sm font-medium text-[var(--color-on-surface-muted)] mb-2">
                Drop a small win in the jar
              </label>
              <div className="flex gap-2">
                <input
                  id="win-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
                  placeholder='e.g. "Sent that email I was avoiding"'
                  className="flex-1 px-4 py-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-subtle)] focus:outline-none focus:border-[var(--color-primary)] transition-colors min-h-[48px]"
                />
                <button
                  onClick={handleAdd}
                  disabled={!text.trim()}
                  aria-label="Add to wins jar"
                  className="btn-sunset px-4 disabled:opacity-40 min-w-[48px] min-h-[48px] flex items-center justify-center"
                >
                  <Plus size={18} aria-hidden="true" />
                </button>
              </div>
            </div>

            <JarVisual fillPct={fillPct} count={wins.length} />

            {wins.length > 0 && (
              <section aria-label="Your wins" className="mt-6">
                <h2 className="panel-label mb-3">In the jar ({wins.length})</h2>
                <ul className="space-y-2">
                  {wins.map((w) => (
                    <li key={w.id} className="card p-4 flex items-start gap-3">
                      <span className="icon-tile w-9 h-9 shrink-0"><Sparkles size={15} aria-hidden="true" /></span>
                      <span className="flex-1 text-sm text-[var(--color-on-surface)] leading-snug pt-1.5">{w.text}</span>
                      <button
                        onClick={() => deleteWin(w.id).then(load)}
                        aria-label="Delete this win"
                        className="press min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center text-[var(--color-on-surface-muted)] hover:text-[var(--color-error)]"
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function JarVisual({ fillPct, count }: { fillPct: number; count: number }) {
  return (
    <div aria-hidden="true" className="flex flex-col items-center my-6">
      <div
        className="relative"
        style={{ width: 150, height: 200 }}
      >
        <div
          className="absolute inset-0 rounded-[28px] border-2 border-[var(--border)] overflow-hidden"
          style={{ background: 'var(--color-surface)' }}
        >
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: `${fillPct}%`,
              background: 'linear-gradient(to top, var(--color-primary), var(--color-accent))',
              opacity: 0.85,
              transition: 'height 700ms var(--ease-calm)',
            }}
          />
        </div>
      </div>
      <p className="text-xs text-[var(--color-on-surface-muted)] mt-3">
        {count === 0 ? 'Empty — every jar starts somewhere' : count === 1 ? 'One small win, kept safe' : `${count} small wins, kept safe`}
      </p>
    </div>
  )
}

function PourView({ wins, onDone }: { wins: StoredWin[]; onDone: () => void }) {
  const [index, setIndex] = useState(0)
  // Random-ish few (up to 3), from most recent wins.
  const sample = useMemo(() => wins.slice(0, 3), [wins])
  const current = sample[index]

  if (!current) {
    onDone()
    return null
  }

  return (
    <div className="card p-8 text-center rise-in">
      <p className="page-kicker mb-3">From your jar</p>
      <p key={current.id} className="text-xl font-semibold text-[var(--color-on-surface)] mb-2 leading-snug msg-in">
        {current.text}
      </p>
      <p className="text-xs text-[var(--color-on-surface-muted)] mb-6">
        You did this on {new Date(current.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}.
      </p>
      <div className="flex gap-3">
        {index < sample.length - 1 ? (
          <button onClick={() => setIndex(index + 1)} className="btn-sunset flex-1 py-3 min-h-[48px]">
            One more
          </button>
        ) : (
          <button onClick={onDone} className="btn-sunset flex-1 py-3 min-h-[48px]">
            Back to the jar
          </button>
        )}
        <button onClick={onDone} className="btn-ghost px-4 min-h-[48px]">
          Close
        </button>
      </div>
    </div>
  )
}
