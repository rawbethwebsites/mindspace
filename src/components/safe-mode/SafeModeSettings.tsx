import { useState, useEffect } from 'react'
import { Shield, Vibrate, AlertTriangle } from 'lucide-react'
import { isSafeModeEnabled, setSafeMode, fullWipe, getSafeCode, setSafeCode } from '../../lib/safe-mode'

/**
 * Safe-at-home Mode Settings section.
 * - Toggle to enable/disable the calculator disguise + shake-to-wipe.
 * - When enabling, request DeviceMotion permission.
 * - Red button to trigger full wipe immediately.
 */

export default function SafeModeSettings() {
  const [enabled, setEnabled] = useState(isSafeModeEnabled())
  const [perm, setPerm] = useState<'prompt' | 'granted' | 'denied'>('prompt')
  const [wiping, setWiping] = useState(false)
  const [warned, setWarned] = useState(false)
  const [code, setCode] = useState(getSafeCode() ?? '')
  const codeOk = /^\d{4}$/.test(code)

  useEffect(() => {
    if (!('DeviceMotionEvent' in window)) return
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      ;(DeviceMotionEvent as any).requestPermission().then((p: string) => {
        if (p === 'granted' || p === 'denied') setPerm(p)
      })
    } else {
      setPerm('granted')
    }
  }, [])

  const handleToggle = async (on: boolean) => {
    if (on && !codeOk) return
    if (on) setSafeCode(code)
    setEnabled(on)
    setSafeMode(on)
    setWarned(false)
  }

  const handleWipe = async () => {
    if (!warned) { setWarned(true); return }
    setWiping(true)
    try { await fullWipe() } finally { setWiping(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="icon-tile w-10 h-10 shrink-0"><Shield size={20} className="text-[var(--color-primary)]" aria-hidden="true" /></div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--color-on-surface)]">Safe-at-home Mode</h3>
          <p className="text-sm text-[var(--color-on-surface-muted)] mt-1">
            When on, Mindspace opens as a normal calculator. To get in, type your 4-digit code and press =.
            A firm shake starts a 5-second reset you can cancel; then everything in the app is deleted.
          </p>
        </div>
      </div>

      <label className="block p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <span className="font-medium text-[var(--color-on-surface)]">Your 4-digit code</span>
        <span className="block text-xs text-[var(--color-on-surface-muted)] mb-2">Pick something only you would know. It is never shown on the calculator.</span>
        <input
          inputMode="numeric" maxLength={4} value={code}
          onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 4); setCode(v); if (enabled && /^\d{4}$/.test(v)) setSafeCode(v) }}
          className="w-32 px-3 py-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-lg tracking-[0.4em] tabular-nums"
          aria-label="Your 4-digit code"
        />
      </label>

      <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div>
          <p className="font-medium text-[var(--color-on-surface)]">Calculator disguise</p>
          <p className="text-xs text-[var(--color-on-surface-muted)]">
            {enabled ? 'On: the app opens as a calculator' : codeOk ? 'Off: the app opens normally' : 'Set your code first'}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            disabled={!enabled && !codeOk}
            className="sr-only peer"
            aria-label="Enable Safe-at-home Mode"
          />
          <div className="w-11 h-6 rounded-full bg-[var(--color-border)] peer-checked:bg-[var(--color-primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-primary)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--bg)] transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-full" aria-hidden="true" />
        </label>
      </div>

      {perm !== 'granted' && (
        <div className="p-3 rounded-lg bg-[var(--color-warning-light)] border border-[var(--color-warning)]/30 flex items-start gap-2">
          <AlertTriangle size={16} className="text-[var(--color-warning)] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm text-[var(--color-on-surface)]">
            <strong>Shake-to-wipe needs motion permission.</strong> Enable it in your browser/site settings, then toggle the switch again.
          </div>
        </div>
      )}

      {warned && (
        <div className="p-3 rounded-lg bg-[var(--color-error-light)] border border-[var(--color-error)]/30 flex items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-[var(--color-error)] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm text-[var(--color-on-surface)]">
              <strong>This deletes everything:</strong> chats, moods, journal, trusted people, breathing history. The calculator and your code stay, so the app still looks like a calculator.
            </div>
          </div>
          <button
            onClick={handleWipe}
            disabled={wiping}
            className="btn-error press px-4 py-2 text-sm min-h-[44px] shrink-0 flex items-center gap-2"
            aria-label="Wipe all local data now"
          >
            <Vibrate size={16} aria-hidden="true" />
            {wiping ? 'Wiping…' : 'Wipe now'}
          </button>
        </div>
      )}

      <details className="text-sm text-[var(--color-on-surface-muted)]">
        <summary className="flex items-center gap-1.5 cursor-pointer">How the wipe works</summary>
        <div className="mt-2 space-y-1 pl-6">
          <p>• Clears all IndexedDB stores (chats, moods, journal, trusted people, activity log)</p>
          <p>• Clears saved settings, except the calculator disguise, your code and your look</p>
          <p>• Clears sessionStorage</p>
          <p>• Reloads the page so the calculator reappears</p>
        </div>
      </details>
    </div>
  )
}