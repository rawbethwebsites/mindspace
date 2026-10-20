import { useState } from 'react'
import { loadNightMode, saveNightMode } from '../../features/b-night'

// Settings block: "Late nights" — the 3 a.m. mode toggle, on by default.
export default function NightSettings() {
  const [on, setOn] = useState(loadNightMode())

  const toggle = () => {
    saveNightMode(!on)
    setOn(!on)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed flex-1">
          Between midnight and 5 a.m., Mindspace dims, slows down and speaks softly. It&rsquo;s easier on tired eyes,
          and it nudges you toward rest.
        </p>
        <button
          role="switch"
          aria-checked={on}
          aria-label="Late-night mode"
          onClick={toggle}
          className={`night-switch press ${on ? 'on' : ''}`}
        >
          <span className="night-knob" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}