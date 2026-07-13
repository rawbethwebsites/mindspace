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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-64 md:min-h-screen md:fixed md:left-0 md:top-0 bg-[var(--color-background-dark)] border-r border-[var(--color-border)] flex md:flex-col items-center md:items-start px-4 md:px-5 py-4 md:py-8 gap-2 md:gap-1 overflow-x-auto md:overflow-x-visible z-40">
        <div className="hidden md:flex items-center gap-2.5 mb-8 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary-light)] glow-sunset flex items-center justify-center" aria-hidden="true">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-[var(--color-on-surface)]">Mindspace</span>
        </div>
        <div className="flex md:hidden items-center gap-2 mr-auto">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary-light)]" aria-hidden="true" />
          <span className="font-bold text-[var(--color-on-surface)]">Mindspace</span>
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            aria-label={item.label}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap min-h-[44px] ${
                isActive
                  ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                  : 'text-[var(--color-on-surface-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-on-surface)]'
              }`
            }
          >
            <item.icon size={18} aria-hidden="true" />
            <span className="hidden md:inline">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => setShowCrisis(true)}
          aria-label="Get crisis help"
          className="mt-auto hidden md:flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error-light)] transition-all min-h-[44px]"
        >
          <AlertTriangle size={18} aria-hidden="true" />
          <span>Crisis Help</span>
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 min-h-screen">
        {/* Mobile crisis button */}
        <button
          onClick={() => setShowCrisis(true)}
          aria-label="Get crisis help"
          className="md:hidden fixed bottom-16 right-4 z-40 w-12 h-12 rounded-full bg-[var(--color-error)] text-white shadow-lg flex items-center justify-center"
        >
          <AlertTriangle size={20} aria-hidden="true" />
        </button>
        <Outlet />
      </main>

      {/* Persistent disclaimer bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-[var(--color-surface)] border-t border-[var(--color-border)] px-4 py-1.5 text-center text-[10px] text-[var(--color-on-surface-muted)] z-30" role="alert">
        Mindspace is not a replacement for professional therapy. If you're in crisis, call 988 (US) or your local emergency number.
      </div>

      {showCrisis && <CrisisAlert onClose={() => setShowCrisis(false)} />}
    </div>
  )
}