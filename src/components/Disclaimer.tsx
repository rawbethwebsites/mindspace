import { Shield } from 'lucide-react'
import { AI_ENABLED } from '../lib/ai'

export default function Disclaimer({ onAck }: { onAck: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <img src="/mindspace-icon.png" alt="" aria-hidden="true" className="w-16 h-16 rounded-2xl mb-4 glow-sunset" />
          <h1 className="text-2xl font-bold text-[var(--color-on-surface)]">Mindspace</h1>
          <p className="text-sm text-[var(--color-on-surface-muted)] mt-1">Your private space for reflection and support</p>
        </div>

        <div className="card p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--color-warning)]/15 flex items-center justify-center shrink-0">
              <Shield size={18} className="text-[var(--color-warning)]" />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--color-on-surface)] mb-2">Please read before continuing</h2>
              <ul className="text-sm text-[var(--color-on-surface-muted)] space-y-2">
                <li>• Mindspace is <strong>not a replacement</strong> for professional therapy or medical care.</li>
                <li>• This is a supportive companion, not a licensed therapist.</li>
                <li>• If you're in crisis or having thoughts of self-harm, please contact a crisis hotline or emergency services.</li>
                <li>• All your data stays on your device{AI_ENABLED ? ' — nothing is sent to a server (except your AI messages).' : '. Nothing is sent to a server.'}</li>
                <li>• You can delete all your data at any time.</li>
              </ul>
            </div>
          </div>

          <button
            onClick={onAck}
            className="btn-sunset w-full py-3"
          >
            I understand — let's begin
          </button>
        </div>

        <p className="text-center text-xs text-[var(--color-on-surface-muted)] mt-4">
          If you need immediate help, call your local emergency number (112 in Nigeria, 999 in the UK, 988 in the US).
        </p>
      </div>
    </div>
  )
}
