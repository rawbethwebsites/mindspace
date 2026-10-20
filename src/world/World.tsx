import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BrainWorld } from './brain'
import { REGIONS } from './regions'
import './world.css'

function webglOk() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

export default function World() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const worldRef = useRef<BrainWorld | null>(null)
  const [active, setActive] = useState(0)
  const [ready, setReady] = useState(false)
  const [fallback] = useState(() => !webglOk() || new URLSearchParams(location.search).has('fallback'))

  const goTo = (i: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: (max * i) / (REGIONS.length - 1), behavior: 'smooth' })
  }

  // Brain (loaded on demand so the app itself stays light)
  useEffect(() => {
    if (fallback || !canvasRef.current) return
    let disposed = false
    import('./brain').then(({ createBrain }) => {
      if (disposed || !canvasRef.current) return
      worldRef.current = createBrain(canvasRef.current, { onPick: goTo })
      setReady(true)
      onScroll()
    })
    const onResize = () => worldRef.current?.resize()
    window.addEventListener('resize', onResize)
    return () => { disposed = true; window.removeEventListener('resize', onResize); worldRef.current?.dispose(); worldRef.current = null }
  }, [fallback])

  // Scroll → progress → camera and active region
  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const p = max > 0 ? window.scrollY / max : 0
    worldRef.current?.setProgress(p)
    setActive(Math.round(p * (REGIONS.length - 1)))
  }
  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Auto tour: after 5 s of no input, glide to the next region and rest there; any input hands control back.
  useEffect(() => {
    if (fallback || new URLSearchParams(location.search).has('notour')) return
    let idleTimer = 0, tourTimer = 0, touring = false
    const stop = () => {
      touring = false
      clearTimeout(tourTimer)
      clearTimeout(idleTimer)
      idleTimer = window.setTimeout(start, 5000)
    }
    const step = () => {
      if (!touring) return
      const max = document.documentElement.scrollHeight - window.innerHeight
      const per = max / (REGIONS.length - 1)
      const cur = Math.round(window.scrollY / per)
      if (cur >= REGIONS.length - 1) { touring = false; return }
      window.scrollTo({ top: (cur + 1) * per, behavior: 'smooth' })
      tourTimer = window.setTimeout(step, 5200)
    }
    function start() { touring = true; step() }
    const evs = ['wheel', 'touchstart', 'keydown', 'pointerdown']
    evs.forEach((e) => window.addEventListener(e, stop, { passive: true }))
    idleTimer = window.setTimeout(start, 5000)
    return () => { clearTimeout(idleTimer); clearTimeout(tourTimer); evs.forEach((e) => window.removeEventListener(e, stop)) }
  }, [fallback])

  const enter = (route = '/') => {
    try { localStorage.setItem('mindspace-entered', '1') } catch { /* private mode */ }
    window.scrollTo(0, 0)
    navigate(route)
  }

  const last = REGIONS.length - 1
  return (
    <div className={`world ${fallback ? 'world-fallback' : ''}`} style={{ ['--region' as string]: REGIONS[active]?.color }}>
      {!fallback && <canvas ref={canvasRef} className={`world-canvas ${ready ? 'on' : ''}`} aria-hidden="true" />}
      <header className="world-top">
        <span className="world-brand"><img src="/mindspace-icon.png" alt="" />Mindspace</span>
        <button className="world-skip press" onClick={() => enter()}>Open the app</button>
      </header>
      <nav className="world-dots" aria-label="Parts of your mind">
        {REGIONS.map((r, i) => (
          <button key={r.id} className={i === active ? 'on' : ''} onClick={() => goTo(i)} aria-label={r.name} title={r.name}
            style={{ ['--c' as string]: r.color }}>
            <span>{i === 0 || i === last ? '' : r.name}</span>
          </button>
        ))}
      </nav>
      <main>
        {REGIONS.map((r, i) => (
          <section key={r.id} className={`world-ch ${i === active ? 'on' : ''} ${i === 0 ? 'first' : ''}`}>
            <div className="world-card">
              <p className="world-kicker">{r.kicker}</p>
              <h2 className="world-title">{r.title}</h2>
              {r.body && <p className="world-body">{r.body}</p>}
              {r.houses.length > 0 && (
                <ul className="world-houses">{r.houses.map((h) => <li key={h}>{h}</li>)}</ul>
              )}
              {r.fact && <p className="world-fact"><span>Did you know</span>{r.fact}</p>}
              {r.route && <button className="press world-open" onClick={() => enter(r.route)}>{r.cta ?? 'Open'} →</button>}
              {i === 0 && <p className="world-hint">Scroll ↓ · drag to turn · tap a light</p>}
              {i === last && (
                <div className="world-cta">
                  <button className="press world-enter" onClick={() => enter()}>Enter Mindspace</button>
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
