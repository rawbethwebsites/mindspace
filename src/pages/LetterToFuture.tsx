import { useEffect, useState } from 'react'
import { PenLine, Trash2, Mail } from 'lucide-react'
import { saveLetter, getLetters, deleteLetter, type StoredLetter } from '../lib/db'

export default function LetterToFuture() {
  const [letters, setLetters] = useState<StoredLetter[]>([])
  const [body, setBody] = useState('')
  const [compose, setCompose] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = async () => setLetters(await getLetters())
  useEffect(() => { load() }, [])

  const handleSave = async () => {
    const text = body.trim()
    if (!text) return
    await saveLetter(text)
    setBody('')
    setCompose(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
    load()
  }

  return (
    <div className="app-page">
      <div className="max-w-2xl mx-auto">
        <p className="page-kicker mb-2">Letter to future you</p>
        <h1 className="page-title mb-2">Write while the light is here</h1>
        <p className="page-subtitle mb-8">
          On a good day, write a letter to yourself. When you have three heavy days in a row, this letter finds you again — once, gently.
        </p>

        {!compose && (
          <button onClick={() => setCompose(true)} className="btn-sunset w-full py-3 mb-8 flex items-center justify-center gap-2 min-h-[48px]">
            <PenLine size={16} aria-hidden="true" /> Write a letter
          </button>
        )}

        {compose && (
          <div className="card p-5 mb-8">
            <label htmlFor="letter-body" className="block text-sm font-medium text-[var(--color-on-surface-muted)] mb-2">
              Dear me on a hard day —
            </label>
            <textarea
              id="letter-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              placeholder="Remind yourself what today feels like. What you did. Who you saw. Why it mattered. Speak kindly to the person reading this."
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-subtle)] focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none leading-relaxed mb-4"
            />
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={!body.trim()} className="btn-sunset flex-1 py-3 disabled:opacity-40 min-h-[48px]">
                Save letter
              </button>
              <button onClick={() => { setCompose(false); setBody('') }} className="btn-ghost px-4 min-h-[48px]">
                Cancel
              </button>
            </div>
          </div>
        )}

        {saved && (
          <div role="status" className="card p-4 mb-6 text-sm text-[var(--color-on-surface)] rise-in">
            Saved. It will find you exactly when you need it.
          </div>
        )}

        {letters.length > 0 && (
          <section aria-label="Your letters">
            <h2 className="panel-label mb-3">Your letters ({letters.length})</h2>
            <div className="space-y-3">
              {letters.map((l) => (
                <article key={l.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 text-xs text-[var(--color-on-surface-muted)]">
                      <Mail size={14} aria-hidden="true" />
                      Written on {new Date(l.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <button
                      onClick={() => { deleteLetter(l.id).then(load) }}
                      aria-label="Delete this letter"
                      className="press min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center text-[var(--color-on-surface-muted)] hover:text-[var(--color-error)]"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--color-on-surface)] whitespace-pre-wrap">{l.body}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
