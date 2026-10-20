import { settingsSections } from '../features'

export default function Settings() {
  return (
    <div className="app-page">
      <div className="max-w-2xl mx-auto">
        <p className="page-kicker mb-1.5">Make it yours</p>
        <h1 className="page-title mb-6">Settings</h1>
        {settingsSections.length === 0 && <p className="text-[var(--text-muted)]">Nothing to set yet.</p>}
        <div className="space-y-4">
          {settingsSections.map((s) => (
            <section key={s.id} className="card p-5">
              <h2 className="panel-label mb-3">{s.title}</h2>
              {s.element}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
