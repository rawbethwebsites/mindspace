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

  // Allow crisis button from any page
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
      <aside className="md:w-64 md:min-h-screen md:fixed md:left-0 md:top-0 bg-[#F5F1EA] border-r border-[#E8E0D0] flex md:flex-col items-center md:items-start px-4 md:px-6 py-4 md:py-8 gap-2 md:gap-1 overflow-x-auto md:overflow-x-visible">
        <div className="hidden md:flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8BA889] to-[#6B9BB5]" />
          <span className="text-lg font-bold tracking-tight text-[#2C2C2C]">Mindspace</span>
        </div>
        <div className="flex md:hidden items-center gap-2 mr-auto">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#8BA889] to-[#6B9BB5]" />
          <span className="font-bold text-[#2C2C2C]">Mindspace</span>
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#8BA889]/15 text-[#5F7A5E]'
                  : 'text-[#6B6B6B] hover:bg-[#8BA889]/8 hover:text-[#2C2C2C]'
              }`
            }
          >
            <item.icon size={18} />
            <span className="hidden md:inline">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => setShowCrisis(true)}
          className="mt-auto hidden md:flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#c44] hover:bg-red-50 transition-all"
        >
          <AlertTriangle size={18} />
          <span>Crisis Help</span>
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 min-h-screen">
        {/* Mobile crisis button */}
        <button
          onClick={() => setShowCrisis(true)}
          className="md:hidden fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full bg-red-500 text-white shadow-lg flex items-center justify-center"
          aria-label="Crisis help"
        >
          <AlertTriangle size={20} />
        </button>
        <Outlet />
      </main>

      {/* Persistent disclaimer bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-[#8BA889]/10 border-t border-[#8BA889]/20 px-4 py-1.5 text-center text-[10px] text-[#5F7A5E] z-30">
        Mindspace is not a replacement for professional therapy. If you're in crisis, call 988 (US) or your local emergency number.
      </div>

      {showCrisis && <CrisisAlert onClose={() => setShowCrisis(false)} />}
    </div>
  )
}