import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { World as WorldApi } from './scene'
import './world.css'

// One chapter per camera station in scene.ts (same order).
const CHAPTERS = [
  { kicker: 'Mindspace', title: 'A quiet place for you.', body: 'Scroll slowly. This is what lives inside.' },
  { kicker: 'Check in', title: 'One tap. No judgment.', body: 'Five feelings. Over the weeks, your patterns show up: sleep, exams, salary days, even power cuts.' },
  { kicker: 'Write it out', title: 'A journal that keeps your secrets.', body: 'And a letter to future you, written on a good day, that finds you on a hard one.' },
  { kicker: 'Breathe', title: 'Four in. Four hold. Four out.', body: 'Box breathing, grounding and a body scan. Check your heart rate before and after and see the change.' },
  { kicker: 'Companions', title: 'Five voices. Pick yours.', body: 'Sola listens. Kemi plans. Tobi cheers. Amara calms. Dayo keeps it real. In English, Pidgin and more. Good company, not therapy.' },
  { kicker: 'Tools', title: 'Things no other app does.', body: 'Burn a worry and watch it go. Fill a jar with small wins. Rehearse a hard conversation before you have it.' },
  { kicker: 'Private', title: 'Yours alone.', body: 'No account. Everything you write stays on your phone. Safe-at-home mode can hide the app behind a calculator.' },
  { kicker: 'Help', title: 'Always lit.', body: 'If you are ever in danger, call 112. Crisis help is one tap away, any time, on every screen.' },
  { kicker: 'Your sunrise', title: 'Start here.', body: '' },
]

function webglOk() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

export default function World() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const worldRef = useRef<WorldApi | null>(null)
  const [active, setActive] = useState(0)
  const [ready, setReady] = useState(false)
  const [fallback] = useState(() => !webglOk() || new URLSearchParams(location.search).has('fallback'))

  // Scene (loaded on demand so the app itself stays light)
  useEffect(() => {
    if (fallback || !canvasRef.current) return
    let disposed = false
    import('./scene').then(({ createWorld }) => {
      if (disposed || !canvasRef.current) return
      worldRef.current = createWorld(canvasRef.current)
      setReady(true)
      onScroll()
    })
    const onResize = () => worldRef.current?.resize()
    window.addEventListener('resize', onResize)
    return () => { disposed = true; window.removeEventListener('resize', onResize); worldRef.current?.dispose(); worldRef.current = null }
  }, [fallback])

  // Scroll → progress → camera and active chapter
  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const p = max > 0 ? window.scrollY / max : 0
    worldRef.current?.setProgress(p)
    setActive(Math.round(p * (CHAPTERS.length - 1)))
  }
  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Auto tour: after 4 s of no input, glide to the next chapter and rest there; any input hands control back.
  useEffect(() => {
    if (fallback || new URLSearchParams(location.search).has('notour')) return
    let idleTimer = 0, tourTimer = 0, touring = false
    const stop = () => {
      touring = false
      clearTimeout(tourTimer)
      clearTimeout(idleTimer)
      idleTimer = window.setTimeout(start, 4000)
    }
    const step = () => {
      if (!touring) return
      const max = document.documentElement.scrollHeight - window.innerHeight
      const per = max / (CHAPTERS.length - 1)
      const next = Math.min(CHAPTERS.length - 1, Math.round(window.scrollY / per) + 1)
      if (Math.round(window.scrollY / per) >= CHAPTERS.length - 1) { touring = false; return }
      window.scrollTo({ top: next * per, behavior: 'smooth' })
      tourTimer = window.setTimeout(step, 4200)
    }
    function start() { touring = true; step() }
    const evs = ['wheel', 'touchstart', 'keydown', 'pointerdown']
    evs.forEach((e) => window.addEventListener(e, stop, { passive: true }))
    idleTimer = window.setTimeout(start, 4000)
    return () => { clearTimeout(idleTimer); clearTimeout(tourTimer); evs.forEach((e) => window.removeEventListener(e, stop)) }
  }, [fallback])

  const enter = () => {
    try { localStorage.setItem('mindspace-entered', '1') } catch { /* private mode */ }
    window.scrollTo(0, 0)
    navigate('/')
  }

  return (
    <div className={`world ${fallback ? 'world-fallback' : ''}`}>
      {!fallback && <canvas ref={canvasRef} className={`world-canvas ${ready ? 'on' : ''}`} aria-hidden="true" />}
      <header className="world-top">
        <span className="world-brand"><img src="/mindspace-icon.png" alt="" />Mindspace</span>
        <button className="world-skip press" onClick={enter}>Open the app</button>
      </header>
      <div className="world-dots" aria-hidden="true">
        {CHAPTERS.map((_, i) => <i key={i} className={i === active ? 'on' : ''} />)}
      </div>
      <main>
        {CHAPTERS.map((c, i) => (
          <section key={i} className={`world-ch ${i === active ? 'on' : ''} ${i === 0 ? 'first' : ''}`}>
            <div className="world-card">
              <p className="world-kicker">{c.kicker}</p>
              <h2 className="world-title">{c.title}</h2>
              {c.body && <p className="world-body">{c.body}</p>}
              {i === 0 && <p className="world-hint">Scroll ↓</p>}
              {i === CHAPTERS.length - 1 && (
                <div className="world-cta">
                  <button className="press world-enter" onClick={enter}>Enter Mindspace</button>
                  <p>Free. Private. Coming to the App Store and Google Play.</p>
                  <p className="world-made">Made by <a href="https://theboostnation.space">The Boost Nation</a></p>
                </div>
              )}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
