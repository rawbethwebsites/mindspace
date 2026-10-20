import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { getLetters, getMoods, getLetterSeenAt, markLetterSeen, type StoredLetter } from '../lib/db'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

// Always-mounted helper. Watches for a moment when the last three check-ins are
// all Low (1) or Struggling (0), then surfaces the oldest unseen letter as a
// gentle full-screen page. At most once per 7 days per letter.
export default function LetterMoment() {
  const location = useLocation()
  const [letter, setLetter] = useState<StoredLetter | null>(null)

  useEffect(() => {
    let cancelled = false
    async function check() {
      const [letters, moods] = await Promise.all([getLetters(), getMoods()])
      if (cancelled || letters.length === 0 || moods.length < 3) return
      const last3 = moods.slice(-3).map((m) => m.mood)
      if (!last3.every((m) => m <= 1)) return

      for (const l of letters) {
        const seen = await getLetterSeenAt(l.id)
        if (cancelled) return
        if (seen === null || Date.now() - seen >= SEVEN_DAYS_MS) {
          setLetter(l)
          return
        }
      }
    }
    check()
    return () => {
      cancelled = true
    }
  }, [location.pathname])

  if (!letter) return null

  const close = async () => {
    await markLetterSeen(letter.id)
    setLetter(null)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="A letter from you"
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
    >
      <div className="card max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 slide-up">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="page-kicker mb-1">A letter from you</p>
            <h2 className="text-lg font-semibold text-[var(--color-on-surface)]">
              Written on {new Date(letter.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
            </h2>
          </div>
          <button
            onClick={close}
            aria-label="Close letter"
            className="press min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)]"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <p className="text-[15px] leading-relaxed text-[var(--color-on-surface)] whitespace-pre-wrap mb-6">
          {letter.body}
        </p>
        <p className="text-sm text-[var(--color-on-surface-muted)] mb-5 italic">
          Past-you wrote this on a good day, for this exact moment.
        </p>
        <button onClick={close} className="btn-sunset w-full py-3 min-h-[48px]">
          Thank you, me
        </button>
      </div>
    </div>
  )
}
