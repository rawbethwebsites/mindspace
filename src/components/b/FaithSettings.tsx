import { useState } from 'react'
import { Check } from 'lucide-react'
import { FAITH_OPTIONS, loadFaith, saveFaith, type FaithPref } from '../../features/b-faith'

// Settings block: "Faith" — optional, off by default.
export default function FaithSettings() {
  const [faith, setFaith] = useState<FaithPref>(loadFaith())

  const choose = (id: FaithPref) => {
    saveFaith(id)
    setFaith(id)
  }

  return (
    <div>
      <div role="radiogroup" aria-label="Faith">
        <div className="space-y-1.5">
          {FAITH_OPTIONS.map((f) => (
            <button
              key={f.id}
              role="radio"
              aria-checked={faith === f.id}
              onClick={() => choose(f.id)}
              className={`press w-full flex items-center gap-3 p-3 rounded-2xl text-left ${faith === f.id ? 'bg-[var(--color-primary)]/10' : ''}`}
            >
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-[var(--color-on-surface)]">{f.label}</span>
                <span className="block text-[13px] text-[var(--color-on-surface-muted)] leading-snug">{f.note}</span>
              </span>
              {faith === f.id && <Check size={18} className="text-[var(--color-primary)] shrink-0" aria-label="Current" />}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-[var(--color-on-surface-muted)] mt-3 leading-relaxed">
        Off by default. When on, companions may gently offer a short verse or prayer idea when it fits — never pushy,
        and always alongside the same practical care. Crisis help always comes first.
      </p>
    </div>
  )
}