import { useEffect, useState } from 'react'
import { HeartHandshake, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getMoods } from '../../lib/db'
import { isWeatherBannerDue } from './helpers'

// Quiet Signal banner: when the last 3 check-ins were Low/Struggling, Home gently
// asks "Want to let your people know?". Dismissable; never shows again until the
// pattern changes (the dismissal is remembered per streak of low days).
export default function QuietSignalBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const moods = await getMoods()
        if (!alive || !isWeatherBannerDue(moods.map((m) => m.mood))) return
        // Remember which low-day the banner was dismissed on; show once per pattern change.
        const lastLowDay = moods[moods.length - 1].date
        if (localStorage.getItem('mindspace-quiet-dismissed') === lastLowDay) return
        setShow(true)
      } catch { /* never nag about a broken read */ }
    })()
    return () => { alive = false }
  }, [])

  if (!show) return null

  const dismiss = () => {
    try { localStorage.setItem('mindspace-quiet-dismissed', new Date().toISOString().slice(0, 10)) } catch { /* private mode */ }
    setShow(false)
  }

  return (
    <div className="fixed left-3 right-3 bottom-[calc(4.9rem+env(safe-area-inset-bottom))] md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-40 sheet-in" role="note">
      <div className="card p-4 flex items-start gap-3">
        <span className="icon-tile w-10 h-10 shrink-0"><HeartHandshake size={18} aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--text)]">Want to let your people know?</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">The last few days have been heavy. Send a quiet signal — one tap, you press send.</p>
          <Link to="/your-people" className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-[var(--color-primary)] min-h-[44px]">
            Open your people
          </Link>
        </div>
        <button onClick={dismiss} aria-label="Dismiss" className="press p-1.5 min-h-[44px] min-w-[44px] -m-1 rounded-lg text-[var(--text-muted)]">
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}