import { useEffect, useRef, useState } from 'react'
import { Flame } from 'lucide-react'
import { detectCrisis } from '../lib/crisis'

type Stage = 'write' | 'burning' | 'gone'

// Gentle burning: the text dissolves into rising warm particles on a canvas.
// Nothing is stored, nothing is sent to the AI.
export default function BurnIt() {
  const [text, setText] = useState('')
  const [stage, setStage] = useState<Stage>('write')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useRef(false)

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const startBurn = () => {
    if (!text.trim() || stage !== 'write') return
    if (detectCrisis(text)) {
      window.dispatchEvent(new CustomEvent('show-crisis'))
      return
    }
    setStage('burning')
  }

  useEffect(() => {
    if (stage !== 'burning') return
    const canvas = canvasRef.current
    const host = textRef.current
    if (!canvas || !host) return

    const duration = reducedMotion.current ? 200 : 2600
    const rect = host.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    interface P { x: number; y: number; vx: number; vy: number; size: number; life: number; maxLife: number; hue: number }
    const particles: P[] = []
    const cell = 4
    const chars = text.trim()

    // Spread particles roughly across the text area so the dissolve covers
    // what was written without needing to rasterise glyphs.
    const cols = Math.floor(rect.width / cell)
    const rows = Math.min(Math.ceil((chars.length * 7) / rect.width), Math.floor(rect.height / cell))
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() > 0.45) continue
        particles.push({
          x: c * cell + Math.random() * cell,
          y: 8 + r * cell,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -0.4 - Math.random() * 1.4,
          size: 1 + Math.random() * 2.2,
          life: 0,
          maxLife: 60 + Math.random() * 120,
          hue: 20 + Math.random() * 30,
        })
      }
    }

    const start = performance.now()
    let raf = 0
    const fadeText = () => { host.style.opacity = '0' }

    const tick = (now: number) => {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (t > 0.08) fadeText()
      for (const p of particles) {
        p.life += 1.6
        p.x += p.vx
        p.y += p.vy
        p.vy -= 0.015
        const progress = p.life / p.maxLife
        if (progress < 1) {
          const alpha = (1 - progress) * 0.9
          ctx.fillStyle = `hsla(${p.hue}, 90%, ${55 + progress * 25}%, ${alpha})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setStage('gone')
        setText('')
        host.style.opacity = ''
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [stage, text])

  return (
    <div className="app-page">
      <div className="max-w-2xl mx-auto">
        <p className="page-kicker mb-2">Burn it</p>
        <h1 className="page-title mb-2">Say it, then let it go</h1>
        <p className="page-subtitle mb-6">
          Nothing here is saved. Nothing here goes anywhere. Type it out, then watch it burn.
        </p>

        {stage === 'gone' ? (
          <div className="card p-10 text-center rise-in">
            <p className="text-xl font-semibold text-[var(--color-on-surface)] mb-3">It's gone.</p>
            <p className="text-sm text-[var(--color-on-surface-muted)] mb-6">Breathe. You let it out and you let it go.</p>
            <button onClick={() => setStage('write')} className="btn-ghost px-5 py-3 min-h-[48px]">
              Write again
            </button>
          </div>
        ) : (
          <>
            <div className="relative mb-4">
              <div
                ref={textRef}
                className="card p-5 min-h-[240px] transition-opacity duration-500 ease-out"
                style={{ opacity: stage === 'burning' ? 0.95 : 1 }}
              >
                {stage === 'write' ? (
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={10}
                    placeholder="Whatever needs to come out. Nobody is reading this."
                    aria-label="Write what you want to burn"
                    className="w-full h-full px-1 py-1 bg-transparent text-[15px] text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-subtle)] focus:outline-none resize-none leading-relaxed"
                  />
                ) : (
                  <p className="text-[15px] leading-relaxed text-[var(--color-on-surface)] whitespace-pre-wrap">{text}</p>
                )}
              </div>
              <canvas
                ref={canvasRef}
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{ display: stage === 'burning' ? 'block' : 'none' }}
              />
            </div>
            <button
              onClick={startBurn}
              disabled={!text.trim() || stage === 'burning'}
              className="btn-sunset w-full py-3 disabled:opacity-40 flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Flame size={16} aria-hidden="true" /> Burn it
            </button>
            <p className="text-xs text-[var(--color-on-surface-muted)] text-center mt-3">
              If this is about hurting yourself, we'll pause and show you support instead.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
