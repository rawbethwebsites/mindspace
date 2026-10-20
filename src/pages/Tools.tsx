import { Link } from 'react-router-dom'
import { Settings as SettingsIcon, ArrowRight, Wind } from 'lucide-react'
import { features } from '../features'

export default function Tools() {
  return (
    <div className="app-page">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <p className="page-kicker mb-1.5">Your toolkit</p>
            <h1 className="page-title">Tools</h1>
            <p className="page-subtitle mt-2">Small things that help, in your own way.</p>
          </div>
          <Link to="/settings" aria-label="Settings" className="press min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center border border-[var(--border)] text-[var(--text)]">
            <SettingsIcon size={18} aria-hidden="true" />
          </Link>
        </div>
        {features.length === 0 && <p className="text-[var(--text-muted)]">New tools are on the way.</p>}
        <div className="grid sm:grid-cols-2 gap-3">
          <Link to="/exercises" className="card card-hover press p-5 flex items-start gap-4">
            <span className="icon-tile w-11 h-11 shrink-0"><Wind size={20} aria-hidden="true" /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-[var(--text)]">Breathe and ground</span>
              <span className="block text-sm text-[var(--text-muted)] mt-0.5">Box breathing, 5-4-3-2-1, thought record, body scan.</span>
            </span>
            <ArrowRight size={18} className="text-[var(--text-muted)] mt-1 shrink-0" aria-hidden="true" />
          </Link>
          {features.map((f) => (
            <Link key={f.id} to={f.route} className="card card-hover press p-5 flex items-start gap-4">
              <span className="icon-tile w-11 h-11 shrink-0"><f.icon size={20} aria-hidden="true" /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-[var(--text)]">{f.title}</span>
                <span className="block text-sm text-[var(--text-muted)] mt-0.5">{f.blurb}</span>
              </span>
              <ArrowRight size={18} className="text-[var(--text-muted)] mt-1 shrink-0" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
