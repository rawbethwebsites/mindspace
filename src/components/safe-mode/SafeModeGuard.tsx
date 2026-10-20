import { useEffect, useRef, useState } from 'react'
import { isSafeModeEnabled, initSafeMode, fullWipe } from '../../lib/safe-mode'
import SafeModeCalculator from './SafeModeCalculator'

/**
 * Safe-at-home: when on, the app opens to a working calculator. Typing the person's 4-digit
 * code then "=" opens Mindspace. It locks again whenever the app goes to the background.
 * A shake starts a neutral 5-second "Resetting" countdown with Cancel before anything is wiped.
 */
export default function SafeModeGuard() {
  const [locked, setLocked] = useState(() => isSafeModeEnabled())
  const [countdown, setCountdown] = useState<number | null>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    initSafeMode()
    const onHide = () => { if (document.visibilityState === 'hidden' && isSafeModeEnabled()) setLocked(true) }
    const onWipe = () => { if (isSafeModeEnabled()) setCountdown((c) => (c === null ? 5 : c)) }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('safe-wipe-request', onWipe)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('safe-wipe-request', onWipe)
    }
  }, [])

  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) { fullWipe(); return }
    timer.current = window.setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [countdown])

  return (
    <>
      {locked && isSafeModeEnabled() && <SafeModeCalculator onUnlock={() => setLocked(false)} />}
      {countdown !== null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80" role="alertdialog" aria-label="Resetting">
          <div className="text-center text-white">
            <p className="text-5xl font-light tabular-nums mb-2">{countdown}</p>
            <p className="text-sm opacity-80 mb-6">Resetting</p>
            <button onClick={() => setCountdown(null)} className="press min-h-[48px] px-8 rounded-full bg-white text-black font-semibold">Cancel</button>
          </div>
        </div>
      )}
    </>
  )
}
