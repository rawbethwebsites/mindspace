import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import { Home, MessageCircle, BookOpen, Heart, Phone, AlertTriangle, LayoutGrid } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Disclaimer from './components/Disclaimer'
import CrisisAlert from './components/CrisisAlert'
import LookPicker from './components/LookPicker'
import { globalHelpers } from './features'
import { AI_ENABLED } from './lib/ai'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  // On phones the chat lives on the floating button instead of the tab bar.
  { to: '/chat', label: 'Chat', icon: MessageCircle, mobileHidden: true },
  { to: '/journal', label: 'Journal', icon: BookOpen },
  { to: '/mood', label: 'Mood', icon: Heart },
  // Exercises live at the top of Tools; the tab bar keeps five slots.
  { to: '/tools', label: 'Tools', icon: LayoutGrid },
  { to: '/resources', label: 'Resources', icon: Phone },
].filter((item) => AI_ENABLED || item.to !== '/chat')

// The very first launch plays the logo intro; later launches get a short dissolve from the splash.
function LaunchVeil() {
  const [mode, setMode] = useState<'intro' | 'veil' | null>(() => {
    try {
      if (sessionStorage.getItem('mindspace-launched')) return null
      return localStorage.getItem('mindspace-intro-seen') ? 'veil' : 'intro'
    } catch { return 'veil' }
  })
  useEffect(() => {
    if (!mode) return
    try {
      sessionStorage.setItem('mindspace-launched', '1')
      localStorage.setItem('mindspace-intro-seen', '1')
    } catch { /* private mode */ }
    const t = setTimeout(() => setMode(null), mode === 'intro' ? 2600 : 1200)
    return () => clearTimeout(t)
  }, [mode])
  if (mode === 'veil') return <div className="launch-veil" aria-hidden="true"><img src="/mindspace-icon.png" alt="" /></div>
  if (mode !== 'intro') return null
  return (
    <div className="intro" aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <defs>
          <linearGradient id="introSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bd4123" /><stop offset="0.56" stopColor="#ef7851" /><stop offset="1" stopColor="#f2bd5b" />
          </linearGradient>
          <clipPath id="introHorizon"><rect x="0" y="0" width="100" height="54.7" /></clipPath>
        </defs>
        <g className="tile">
          <rect width="100" height="100" rx="22.5" fill="url(#introSky)" />
          <g clipPath="url(#introHorizon)"><circle className="sun" cx="50" cy="54.7" r="24.4" fill="#fffaf0" /></g>
          <rect className="ln ln1" x="14.6" y="56.9" width="70.8" height="3.4" rx="1.7" fill="#fffaf0" />
          <rect className="ln ln2" x="26.4" y="63.3" width="47.2" height="3.4" rx="1.7" fill="#fffaf0" opacity="0.75" />
          <rect className="ln ln3" x="37.3" y="69.7" width="25.4" height="3.4" rx="1.7" fill="#fffaf0" opacity="0.5" />
        </g>
      </svg>
      <div className="name">Mindspace</div>
      <div className="tag">A quiet place for you</div>
    </div>
  )
}

// Liquid tab indicator (after "Shape morphing through UI states", motionvideo.xyz): one pill
// whose two edges ride different springs, so the leading edge stretches ahead of the trailing one.
const mobileItems = navItems.filter((i) => !('mobileHidden' in i))

function TabLiquid({ pathname }: { pathname: string }) {
  const n = mobileItems.length
  const idx = mobileItems.findIndex((i) => (i.to === '/' ? pathname === '/' : pathname.startsWith(i.to)))
  const prev = useRef(idx)
  const movingRight = idx >= prev.current
  useEffect(() => { if (idx >= 0) prev.current = idx }, [idx])
  const at = idx >= 0 ? idx : prev.current
  return (
    <span
      aria-hidden="true"
      className="tab-liquid md:hidden"
      style={{
        left: `calc(${(at / n) * 100}% + 3px)`,
        right: `calc(${((n - at - 1) / n) * 100}% + 3px)`,
        opacity: idx >= 0 ? 1 : 0,
        transitionDuration: movingRight ? '560ms, 320ms, 200ms' : '320ms, 560ms, 200ms',
      }}
    />
  )
}

export default function App() {
  const location = useLocation()
  const [showCrisis, setShowCrisis] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    const ack = localStorage.getItem('mindspace-ack')
    if (ack === 'true') setAcknowledged(true)
  }, [])

  const handleAck = () => {
    localStorage.setItem('mindspace-ack', 'true')
    setAcknowledged(true)
  }

  useEffect(() => {
    const handler = () => setShowCrisis(true)
    window.addEventListener('show-crisis', handler)
    return () => window.removeEventListener('show-crisis', handler)
  }, [])

  if (!acknowledged) {
    return <><LaunchVeil /><div className="page-enter"><Disclaimer onAck={handleAck} /></div></>
  }

  return (
    <div className="app-root min-h-screen flex flex-col md:flex-row bg-[var(--bg)] text-[var(--text)]">
      <LaunchVeil />
      <LookPicker />
      {globalHelpers.map((G, i) => <G key={i} />)}
      <div className="status-shield" aria-hidden="true" />
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <aside className="tabbar nav-safe fixed bottom-0 left-0 right-0 md:bottom-auto md:right-auto md:w-64 md:min-h-screen md:top-0 backdrop-blur-xl border-t md:border-t-0 md:border-r border-white/10 flex md:flex-col items-center md:items-stretch px-2 md:px-4 py-2 md:py-5 gap-1 md:gap-2 z-50">
        <div className="hidden md:flex items-center gap-3 mb-7 px-2 py-1">
          <img src="/mindspace-icon.png" alt="" aria-hidden="true" className="w-10 h-10 rounded-lg glow-sunset" />
          <div>
            <span className="block text-lg font-bold tracking-tight text-white">Mindspace</span>
            <span className="block text-xs text-white/50">Private mental wellness</span>
          </div>
        </div>
        <nav aria-label="Primary" className="relative flex w-full items-center justify-around md:flex-col md:items-stretch md:justify-start">
          <TabLiquid pathname={location.pathname} />
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              aria-label={item.label}
              className={({ isActive }) =>
                `${'mobileHidden' in item ? 'hidden md:flex' : 'flex'} relative z-10 min-w-0 flex-1 flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-1 md:px-3 py-1.5 md:py-2.5 rounded-xl text-[10px] md:text-sm transition-all min-h-[50px] md:min-h-[44px] md:w-full ${
                  isActive
                    ? 'tab-active md:bg-white/10 font-semibold md:shadow-[inset_3px_0_0_0_#f5c56a]'
                    : 'font-medium hover:bg-white/8'
                }`
              }
            >
              <item.icon size={18} aria-hidden="true" className="tab-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => setShowCrisis(true)}
          aria-label="Get crisis help"
          className="mt-auto hidden md:flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-[var(--color-error)] border border-[rgba(240,80,92,0.22)] bg-[rgba(240,80,92,0.055)] hover:bg-[var(--color-error-light)] transition-all min-h-[44px]"
        >
          <AlertTriangle size={18} aria-hidden="true" />
          <span>Crisis Help</span>
        </button>
      </aside>

      <main id="main-content" className="flex-1 md:ml-64 min-h-screen">
        {AI_ENABLED ? (
          location.pathname !== '/chat' && (
            <Link to="/chat" aria-label="Talk it through (chat)" className="chat-fab press md:hidden">
              <MessageCircle size={24} aria-hidden="true" />
            </Link>
          )
        ) : (
          <button
            onClick={() => setShowCrisis(true)}
            aria-label="Get crisis help"
            className="md:hidden fixed bottom-[9rem] right-4 z-40 w-11 h-11 rounded-full bg-[var(--color-error)] text-white shadow-lg flex items-center justify-center"
          >
            <AlertTriangle size={20} aria-hidden="true" />
          </button>
        )}
        <div key={location.pathname} className="page-enter"><Outlet /></div>
      </main>

      <footer className="hidden md:block fixed bottom-0 left-64 right-0 bg-[rgba(244,241,235,0.9)] backdrop-blur-xl border-t border-[var(--color-border)] px-4 py-2 text-center text-[10px] text-[var(--color-on-surface-muted)] z-30">
        Mindspace is not a replacement for professional therapy. If you're in crisis, call your local emergency number (112 in Nigeria, 999 in the UK, 988 in the US).
      </footer>

      {showCrisis && <CrisisAlert onClose={() => setShowCrisis(false)} />}
    </div>
  )
}
