import { AlertTriangle, X, Phone, MessageSquare, Globe } from 'lucide-react'
import { crisisResources } from '../lib/crisis'

export default function CrisisAlert({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card max-w-lg w-full p-6 slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-error)]/15 flex items-center justify-center">
              <AlertTriangle size={20} className="text-[var(--color-error)]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-on-surface)]">You matter. Help is here.</h2>
              <p className="text-sm text-[var(--color-on-surface-muted)]">If you're in crisis, please reach out now.</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X size={20} />
          </button>
        </div>

        <div className="rounded-xl bg-[var(--color-error)]/10 border border-[rgba(200,63,77,.2)] p-4 mb-4">
          <p className="text-sm font-semibold text-[var(--color-on-surface)] mb-3">In immediate danger? Call emergency services now.</p>
          <div className="flex flex-wrap gap-2">
            {[['Nigeria', '112'], ['UK', '999'], ['US', '911']].map(([region, num]) => (
              <a key={num} href={`tel:${num}`} className="press flex items-center gap-1.5 rounded-lg bg-[var(--color-error)] text-white font-semibold text-sm px-3.5 min-h-[44px]">
                <Phone size={15} aria-hidden="true" /> {num} <span className="font-normal opacity-85">{region}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {crisisResources.map((r) => (
            <div key={r.name} className="border border-[var(--color-border)] rounded-lg p-4 hover:border-[var(--color-primary)]/30 transition-colors">
              <h3 className="font-semibold text-[var(--color-on-surface)] mb-1">{r.name}</h3>
              <p className="text-sm text-[var(--color-on-surface-muted)] mb-2">{r.description}</p>
              <div className="flex flex-wrap gap-3 text-sm">
                {r.phone && (
                  <a href={`tel:${r.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-1.5 text-[var(--color-error)] font-medium hover:underline">
                    <Phone size={14} /> {r.phone}
                  </a>
                )}
                {r.text && (
                  <span className="flex items-center gap-1.5 text-[var(--color-error)] font-medium">
                    <MessageSquare size={14} /> {r.text}
                  </span>
                )}
                {r.url && (
                  <a href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[var(--color-primary)] font-medium hover:underline">
                    <Globe size={14} /> Website
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-[var(--color-error)]/10 rounded-lg">
          <p className="text-sm text-[var(--color-error)]">
            If you're in immediate danger, call your local emergency number (911 in the US, 999 in the UK, 112 in Europe).
          </p>
        </div>

        <button
          onClick={onClose}
          className="btn-sunset mt-4 w-full py-3"
        >
          I understand
        </button>
      </div>
    </div>
  )
}
