import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { MoonStar } from 'lucide-react'
import { loadNightMode, isNightHour, nightTestOn } from '../../features/b-night'
import './b-night.css'

// Global helper (always mounted): between 00:00 and 05:00 the whole app dims,
// motion slows down, and Home and Chat show a soft good-night note.
export default function NightMode() {
  const [active, setActive] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const check = () => setActive(loadNightMode() && (isNightHour() || nightTestOn()))
    check()
    const timer = setInterval(check, 60_000)
    const onVisible = () => {
      if (!document.hidden) check()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('b-night-3am', active)
    return () => document.documentElement.classList.remove('b-night-3am')
  }, [active])

  const showNote = active && (location.pathname === '/' || location.pathname === '/chat')

  return (
    <>
      <div className={`night-dim ${active ? 'on' : ''}`} aria-hidden="true" />
      {showNote && (
        <div className="night-note" role="status">
          <MoonStar size={15} aria-hidden="true" />
          It&rsquo;s late. Go easy on yourself.
        </div>
      )}
    </>
  )
}