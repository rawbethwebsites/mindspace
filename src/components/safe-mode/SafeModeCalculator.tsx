import { useEffect, useRef, useState } from 'react'
import { Calculator, Lock, Vibrate } from 'lucide-react'
import { initSafeMode, isSafeModeEnabled, stopShakeWipe } from '../../lib/safe-mode'

/**
 * Safe-at-home Mode:
 * - Shows a completely normal-looking calculator
 * - Secret: tap the "MC" key 5 times fast → unlocks to Mindspace
 * - When enabled in Settings, shake-to-wipe is armed (requires user permission)
 * - All local data stays on device; wipe clears everything except Quiet Signal dismiss streak
 */

const CALC_KEYS = [
  ['MC', 'M+', 'M-', 'MR'],
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
]

export default function SafeModeCalculator({ onUnlock }: { onUnlock: () => void }) {
  const [display, setDisplay] = useState('0')
  const [unlocked, setUnlocked] = useState(false)
  const tapCount = useRef(0)
  const lastTap = useRef(0)
  const [shakeArmed, setShakeArmed] = useState(false)

  // Calculator logic (simplified but functional)
  const [pending, setPending] = useState<{ op: string; val: number } | null>(null)
  const waitingForOperand = useRef(false)

  useEffect(() => {
    initSafeMode()
    setShakeArmed(isSafeModeEnabled())
  }, [])

  function inputDigit(d: string) {
    if (unlocked) return
    setDisplay((cur) => {
      if (waitingForOperand.current) { waitingForOperand.current = false; return d === '.' ? '0.' : d }
      if (cur === '0' && d !== '.') return d
      if (d === '.' && cur.includes('.')) return cur
      return cur + d
    })
    checkUnlockTap()
  }

  function inputOp(op: string) {
    if (unlocked) return
    const val = Number(display)
    if (pending) {
      const res = compute(pending.val, val, pending.op)
      setDisplay(String(res))
      setPending({ op, val: res })
    } else {
      setPending({ op, val })
    }
    waitingForOperand.current = true
    checkUnlockTap()
  }

  function compute(a: number, b: number, op: string): number {
    switch (op) {
      case '+': return a + b
      case '−': return a - b
      case '×': return a * b
      case '÷': return b !== 0 ? a / b : 0
      default: return b
    }
  }

  function clearAll() {
    if (unlocked) return
    setDisplay('0')
    setPending(null)
    waitingForOperand.current = false
    checkUnlockTap()
  }

  function checkUnlockTap() {
    const now = Date.now()
    if (now - lastTap.current < 600) {
      tapCount.current += 1
      if (tapCount.current >= 5) {
        setUnlocked(true)
        stopShakeWipe()
        onUnlock()
      }
    } else {
      tapCount.current = 1
    }
    lastTap.current = now
  }

  // Keyboard support
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (unlocked) return
      if (e.key >= '0' && e.key <= '9') inputDigit(e.key)
      else if (e.key === '.') inputDigit('.')
      else if (e.key === '+') inputOp('+')
      else if (e.key === '-') inputOp('−')
      else if (e.key === '*') inputOp('×')
      else if (e.key === '/') inputOp('÷')
      else if (e.key === '=' || e.key === 'Enter') inputOp('=')
      else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') clearAll()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [unlocked])

  if (unlocked) return null // parent swaps to the real app

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]" role="application" aria-label="Calculator">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Calculator size={20} className="text-[var(--color-primary)]" aria-hidden="true" />
          <span className="font-medium text-[var(--color-on-surface)]">Calculator</span>
        </div>
        <span className="text-xs text-[var(--color-on-surface-muted)]" aria-live="polite">
          {shakeArmed ? (
            <> <Vibrate size={12} className="inline" aria-hidden="true" /> Shake-to-wipe armed </>
          ) : (
            <> <Lock size={12} className="inline" aria-hidden="true" /> Safe mode off </>
          )}
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <div className="w-full max-w-sm">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 mb-4 text-right font-mono text-2xl text-[var(--color-on-surface)] min-h-[48px] overflow-hidden">
            {display}
          </div>

          <div className="grid grid-cols-4 gap-2" role="grid" aria-label="Calculator keypad">
            {CALC_KEYS.map((row, ri) =>
              <div key={ri} className="contents">
                {row.map((key, ci) => {
                  const wide = key === '0'
                  return (
                    <button
                      key={ci}
                      onClick={() => key === 'C' ? clearAll() : key === '=' || key === '+' || key === '−' || key === '×' || key === '÷' ? inputOp(key) : inputDigit(key)}
                      className={`press min-h-[44px] rounded-xl text-lg font-medium transition-colors ${wide ? 'col-span-2' : ''} ${
                        ['C', '±', '%', '÷'].includes(key)
                          ? 'bg-[var(--color-surface)] text-[var(--color-on-surface)] border border-[var(--color-border)]'
                          : ['MC', 'M+', 'M-', 'MR'].includes(key)
                            ? 'bg-[var(--color-surface)] text-[var(--color-on-surface-muted)] border border-[var(--color-border)]'
                            : key === '='
                              ? 'bg-[var(--color-primary)] text-white'
                              : 'bg-[var(--color-surface)] text-[var(--color-on-surface)] border border-[var(--color-border)]'
                      }`}
                      style={wide ? { gridColumn: 'span 2' } : undefined}
                      aria-label={key === 'C' ? 'Clear' : key === '=' ? 'Equals' : key === '÷' ? 'Divide' : key === '×' ? 'Multiply' : key === '−' ? 'Subtract' : key === '+' ? 'Add' : key === '±' ? 'Plus minus' : key === '%' ? 'Percent' : key}
                    >
                      {key}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <p className="text-center text-xs text-[var(--color-on-surface-muted)] mt-4 max-w-sm">
            Tap <kbd className="px-1.5 py-0.5 bg-[var(--color-background)] border border-[var(--color-border)] rounded">MC</kbd> five times quickly to unlock Mindspace.
          </p>
        </div>
      </main>
    </div>
  )
}