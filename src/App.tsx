import { Outlet, NavLink } from 'react-router-dom'
import { Home, MessageCircle, BookOpen, Heart, Wind, Phone, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import Disclaimer from './components/Disclaimer'
import CrisisAlert from './components/CrisisAlert'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/journal', label: 'Journal', icon: BookOpen },
  { to: '/mood', label: 'Mood', icon: Heart },
  { to: '/exercises', label: 'Exercises', icon: Wind },
  { to: '/resources', label: 'Resources', icon: Phone },
]

export default function App() {
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
    return <Disclaimer onAck={handleAck} />
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg)] text-[var(--text)]">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <aside className="fixed bottom-0 left-0 right-0 md:bottom-auto md:right-auto md:w-64 md:min-h-screen md:top-0 bg-[rgba(17,25,35,0.96)] backdrop-blur-xl border-t md:border-t-0 md:border-r border-white/10 flex md:flex-col items-center md:items-stretch px-2 md:px-4 py-2 md:py-5 gap-1 md:gap-2 z-50">
        <div className="hidden md:flex items-center gap-3 mb-7 px-2 py-1">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary-light)] glow-sunset flex items-center justify-center p-1.5" aria-hidden="true">
            <img src="/tbn-mark-white.png" alt="" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="block text-lg font-bold tracking-tight text-white">Mindspace</span>
            <span className="block text-xs text-white/50">Private mental wellness</span>
          </div>
        </div>
        <nav aria-label="Primary" className="flex w-full items-center justify-around md:flex-col md:items-stretch md:justify-start">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              aria-label={item.label}
              className={({ isActive }) =>
                `flex min-w-0 flex-1 flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-1 md:px-3 py-1.5 md:py-2.5 rounded-xl text-[10px] md:text-sm transition-all min-h-[50px] md:min-h-[44px] md:w-full ${
                  isActive
                    ? 'bg-white/10 text-[#f5c56a] font-semibold md:shadow-[inset_3px_0_0_0_#f5c56a]'
                    : 'font-medium text-white/55 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              <item.icon size={18} aria-hidden="true" />
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
        <button
          onClick={() => setShowCrisis(true)}
          aria-label="Get crisis help"
          className="md:hidden fixed bottom-[9rem] right-4 z-40 w-11 h-11 rounded-full bg-[var(--color-error)] text-white shadow-lg flex items-center justify-center"
        >
          <AlertTriangle size={20} aria-hidden="true" />
        </button>
        <Outlet />
      </main>

      <footer className="hidden md:block fixed bottom-0 left-64 right-0 bg-[rgba(244,241,235,0.9)] backdrop-blur-xl border-t border-[var(--color-border)] px-4 py-2 text-center text-[10px] text-[var(--color-on-surface-muted)] z-30">
        Mindspace is not a replacement for professional therapy. If you're in crisis, call 988 (US) or your local emergency number.
      </footer>

      {showCrisis && <CrisisAlert onClose={() => setShowCrisis(false)} />}
    </div>
  )
}
