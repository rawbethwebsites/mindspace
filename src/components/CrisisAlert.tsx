import { AlertTriangle, X, Phone, MessageSquare, Globe } from 'lucide-react'
import { crisisResources } from '../lib/crisis'

export default function CrisisAlert({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-on-surface)]">You matter. Help is here.</h2>
              <p className="text-sm text-[var(--color-on-surface-muted)]">If you're in crisis, please reach out now.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] p-1">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {crisisResources.map((r) => (
            <div key={r.name} className="border border-gray-100 rounded-xl p-4 hover:border-[var(--color-primary)]/30 transition-colors">
              <h3 className="font-semibold text-[var(--color-on-surface)] mb-1">{r.name}</h3>
              <p className="text-sm text-[var(--color-on-surface-muted)] mb-2">{r.description}</p>
              <div className="flex flex-wrap gap-3 text-sm">
                {r.phone && (
                  <a href={`tel:${r.phone}`} className="flex items-center gap-1.5 text-[var(--color-primary-dark)] font-medium hover:underline">
                    <Phone size={14} /> {r.phone}
                  </a>
                )}
                {r.text && (
                  <span className="flex items-center gap-1.5 text-[var(--color-primary-dark)] font-medium">
                    <MessageSquare size={14} /> {r.text}
                  </span>
                )}
                {r.url && (
                  <a href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[var(--color-secondary)] font-medium hover:underline">
                    <Globe size={14} /> Website
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-[var(--color-primary)]/8 rounded-xl">
          <p className="text-sm text-[var(--color-primary-dark)]">
            If you're in immediate danger, call your local emergency number (911 in the US, 999 in the UK, 112 in Europe).
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          I understand
        </button>
      </div>
    </div>
  )
}