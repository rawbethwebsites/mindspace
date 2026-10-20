import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { looks, loadLook, applyLook, type LookId } from '../lib/theme'

// Opens on the 'open-looks' event (home header button). Switching is instant.
export default function LookPicker() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<LookId>(loadLook())
  useEffect(() => {
    const show = () => { setCurrent(loadLook()); setOpen(true) }
    window.addEventListener('open-looks', show)
    return () => window.removeEventListener('open-looks', show)
  }, [])
  if (!open) return null
  const pick = (id: LookId) => { applyLook(id); setCurrent(id) }
  return (
    <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label="Choose a look">
      <button aria-label="Close" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/40 fade-in" />
      <div className="sheet-in relative w-full md:max-w-md bg-[var(--color-surface-elevated)] text-[var(--color-on-surface)] rounded-t-[28px] md:rounded-[28px] p-5 backdrop-blur-2xl" style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
        <div className="w-10 h-1 rounded-full bg-[var(--color-border)] mx-auto mb-4 md:hidden" aria-hidden="true" />
        <h3 className="text-lg font-bold mb-3">Look</h3>
        <div className="space-y-1.5" role="radiogroup">
          {looks.map((l) => (
            <button key={l.id} role="radio" aria-checked={l.id === current} onClick={() => pick(l.id)}
              className={`press w-full flex items-center gap-3 p-2.5 rounded-2xl text-left ${l.id === current ? 'bg-[var(--color-primary)]/12' : ''}`}>
              <span className="look-swatch" style={{ background: l.swatch }} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{l.name}</span>
                <span className="block text-[13px] text-[var(--color-on-surface-muted)]">{l.tagline}</span>
              </span>
              {l.id === current && <Check size={18} className="text-[var(--color-primary)] shrink-0" aria-label="Current" />}
            </button>
          ))}
        </div>
        <button onClick={() => setOpen(false)} className="btn-sunset w-full mt-4 min-h-[48px]">Done</button>
      </div>
    </div>
  )
}
