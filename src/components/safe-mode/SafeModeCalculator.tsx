import { useEffect, useRef, useState } from 'react'
import { Calculator } from 'lucide-react'
import { initSafeMode, getSafeCode } from '../../lib/safe-mode'

/**
 * Safe-at-home Mode:
 * - Shows a completely normal-looking calculator
 * - Unlock: type the person's 4-digit code, then "=" (no hint is ever shown on screen)
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
  const entry = useRef('') // digits typed since the last operator or clear

  // Calculator logic (simplified but functional)
  const [pending, setPending] = useState<{ op: string; val: number } | null>(null)
  const waitingForOperand = useRef(false)

  useEffect(() => {
    initSafeMode()
  }, [])

  function inputDigit(d: string) {
    if (unlocked) return
    setDisplay((cur) => {
      if (waitingForOperand.current) { waitingForOperand.current = false; return d === '.' ? '0.' : d }
      if (cur === '0' && d !== '.') return d
      if (d === '.' && cur.includes('.')) return cur
      return cur + d
    })
    entry.current = (entry.current + d).slice(-8)
  }

  function inputOp(op: string) {
    if (unlocked) return
    if (op === '=' && entry.current === getSafeCode()) {
      entry.current = ''
      setDisplay('0')
      setPending(null)
      setUnlocked(true)
      onUnlock()
      return
    }
    entry.current = ''
    const val = Number(display)
    if (pending) {
      const res = compute(pending.val, val, pending.op)
      setDisplay(String(res))
      setPending({ op, val: res })
    } else {
      setPending({ op, val })
    }
    waitingForOperand.current = true
  }

  // ± and % act on the display; memory keys keep one stored value, like a real calculator.
  const memory = useRef(0)
  function special(key: string) {
    if (unlocked) return
    entry.current = ''
    const v = Number(display)
    if (key === '±') setDisplay(String(-v))
    else if (key === '%') setDisplay(String(v / 100))
    else if (key === 'MC') memory.current = 0
    else if (key === 'M+') memory.current += v
    else if (key === 'M-') memory.current -= v
    else if (key === 'MR') { setDisplay(String(memory.current)); waitingForOperand.current = true }
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
    entry.current = ''
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
    <div className="fixed inset-0 z-[150] overflow-auto flex flex-col bg-[var(--color-background)]" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }} role="application" aria-label="Calculator">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Calculator size={20} className="text-[var(--color-primary)]" aria-hidden="true" />
          <span className="font-medium text-[var(--color-on-surface)]">Calculator</span>
        </div>
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
                      onClick={() => key === 'C' ? clearAll() : key === '=' || key === '+' || key === '−' || key === '×' || key === '÷' ? inputOp(key) : /^[0-9.]$/.test(key) ? inputDigit(key) : special(key)}
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


        </div>
      </main>
    </div>
  )
}