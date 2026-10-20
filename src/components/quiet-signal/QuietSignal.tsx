import { useEffect, useState } from 'react'
import { Users, UserPlus, Trash2, Sun, CloudSun, CloudRain, Check, AlertTriangle } from 'lucide-react'
import {
  getTrustedPeople,
  saveTrustedPerson,
  deleteTrustedPerson,
  type TrustedPerson,
} from '../../lib/db'
import { weatherOptions, shareWeather, type Weather } from './helpers'

const weatherIcons = { sunny: Sun, cloudy: CloudSun, stormy: CloudRain }

export default function QuietSignal() {
  const [people, setPeople] = useState<TrustedPerson[]>([])
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [pickFor, setPickFor] = useState<TrustedPerson | null>(null)
  const [sentNote, setSentNote] = useState('')

  const load = () => getTrustedPeople().then(setPeople)
  useEffect(() => { load() }, [])

  const addPerson = async () => {
    if (!name.trim() || !phone.trim()) return
    await saveTrustedPerson(`person-${Date.now()}`, name.trim(), phone.trim())
    setName('')
    setPhone('')
    setAdding(false)
    load()
  }

  const remove = async (id: string) => {
    await deleteTrustedPerson(id)
    load()
  }

  const send = async (w: Weather, person: TrustedPerson) => {
    const how = await shareWeather(w, person)
    setSentNote(
      how === 'share' || how === 'sms'
        ? `Ready for ${person.name} — press send in the message app.`
        : 'Message copied — paste it wherever you like.',
    )
    setPickFor(null)
  }

  return (
    <div className="app-page">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6">
          <p className="page-kicker mb-1.5">Quiet signal</p>
          <h1 className="page-title">Your people</h1>
          <p className="page-subtitle mt-2">
            Add up to three people you trust. When words are hard, send them your weather instead —
            a short, ready-written message. They only hear from you when you choose to send it.
          </p>
        </header>

        <div className="card p-4 mb-4 flex items-start gap-3" role="note">
          <LockIcon />
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Names and numbers stay on this phone only. Sharing uses your own messaging app — you always
            press send yourself, and nothing is ever sent automatically.
          </p>
        </div>

        {/* People list */}
        <div className="space-y-3 mb-4">
          {people.map((p) => (
            <div key={p.id} className="card p-4 flex items-center gap-3">
              <span className="icon-tile w-11 h-11 shrink-0"><Users size={20} aria-hidden="true" /></span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--text)] truncate">{p.name}</p>
                <p className="text-sm text-[var(--text-muted)]">{p.phone}</p>
              </div>
              <button
                onClick={() => { setPickFor(p); setSentNote('') }}
                className="btn-sunset press px-4 py-2 text-sm min-h-[44px]"
              >
                Send my weather
              </button>
              <button
                onClick={() => remove(p.id)}
                aria-label={`Remove ${p.name}`}
                className="press p-2 min-h-[44px] min-w-[44px] rounded-lg text-[var(--text-muted)] hover:text-[var(--color-error)]"
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
          ))}

          {people.length === 0 && !adding && (
            <div className="card p-6 text-center">
              <p className="text-[var(--text-muted)] text-sm">
                No one added yet. Think of one person who would want to hear from you.
              </p>
            </div>
          )}
        </div>

        {/* Add form */}
        {adding ? (
          <div className="card p-5">
            <h2 className="panel-label mb-4">Add a trusted person</h2>
            <label htmlFor="person-name" className="block text-sm font-medium text-[var(--text)] mb-1.5">Name</label>
            <input
              id="person-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Their name"
              className="w-full px-3 py-2.5 mb-3 rounded-lg bg-[var(--color-background)] border border-[var(--border)] text-sm text-[var(--text)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--color-primary)]"
            />
            <label htmlFor="person-phone" className="block text-sm font-medium text-[var(--text)] mb-1.5">Phone number</label>
            <input
              id="person-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234..."
              className="w-full px-3 py-2.5 mb-4 rounded-lg bg-[var(--color-background)] border border-[var(--border)] text-sm text-[var(--text)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--color-primary)]"
            />
            <div className="flex gap-3">
              <button onClick={() => { setAdding(false); setName(''); setPhone('') }} className="btn-ghost press px-4 py-2.5 text-sm min-h-[44px]">Cancel</button>
              <button
                onClick={addPerson}
                disabled={!name.trim() || !phone.trim()}
                className="btn-sunset press flex-1 py-2.5 text-sm min-h-[44px] disabled:opacity-40"
              >
                Save person
              </button>
            </div>
          </div>
        ) : (
          people.length < 3 && (
            <button onClick={() => setAdding(true)} className="card card-hover press w-full p-4 flex items-center gap-3 text-left">
              <span className="icon-tile w-11 h-11 shrink-0"><UserPlus size={20} aria-hidden="true" /></span>
              <span>
                <span className="block font-semibold text-[var(--text)]">Add someone</span>
                <span className="block text-sm text-[var(--text-muted)]">Up to three people, private to this phone.</span>
              </span>
            </button>
          )
        )}

        {/* Weather picker sheet */}
        {pickFor && (
          <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label="Pick your weather">
            <button aria-label="Close" onClick={() => setPickFor(null)} className="absolute inset-0 bg-black/40 fade-in" />
            <div
              className="sheet-in relative w-full md:max-w-md bg-[var(--color-surface-elevated)] text-[var(--color-on-surface)] rounded-t-[28px] md:rounded-[28px] p-5"
              style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
            >
              <div className="w-10 h-1 rounded-full bg-[var(--color-border)] mx-auto mb-4 md:hidden" aria-hidden="true" />
              <h3 className="text-lg font-bold mb-1">Your weather right now?</h3>
              <p className="text-sm text-[var(--color-on-surface-muted)] mb-5">We'll write a short message for {pickFor.name}. You press send.</p>
              <div className="space-y-2">
                {weatherOptions.map((w) => {
                  const Icon = weatherIcons[w.id]
                  return (
                    <button
                      key={w.id}
                      onClick={() => send(w.id, pickFor)}
                      className="press w-full flex items-center gap-3 p-3 rounded-2xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors text-left min-h-[56px]"
                    >
                      <Icon size={22} style={{ color: w.color }} aria-hidden="true" />
                      <span className="flex-1">
                        <span className="block font-semibold">{w.label}</span>
                        <span className="block text-xs text-[var(--color-on-surface-muted)]">
                          {w.id === 'sunny' ? 'Doing okay' : w.id === 'cloudy' ? 'A bit low, but okay' : 'Having a hard day'}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Sent confirmation */}
        {sentNote && (
          <div className="card p-4 mt-4 flex items-center gap-2 swap-in" role="status">
            <Check size={18} className="text-[var(--color-success)] shrink-0" aria-hidden="true" />
            <p className="text-sm text-[var(--text)]">{sentNote}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function LockIcon() {
  return (
    <span className="icon-tile w-10 h-10 shrink-0" aria-hidden="true">
      <AlertTriangle size={18} />
    </span>
  )
}