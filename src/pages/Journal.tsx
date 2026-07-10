import { useState } from 'react'
import { BookOpen, Sparkles, Trash2, Loader2, Plus } from 'lucide-react'
import { getJournalEntries, saveJournalEntry, deleteJournalEntry } from '../lib/db'
import { getJournalReflection } from '../lib/ai'
import { useEffect } from 'react'

type Entry = { id: string; title: string; body: string; reflection?: string; createdAt: number; updatedAt: number }

export default function Journal() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [reflection, setReflection] = useState<string | undefined>(undefined)
  const [gettingReflection, setGettingReflection] = useState(false)

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    const all = await getJournalEntries()
    setEntries(all as Entry[])
  }

  const newEntry = () => {
    setEditing(true)
    setEditId(null)
    setTitle('')
    setBody('')
    setReflection(undefined)
  }

  const editEntry = (entry: Entry) => {
    setEditing(true)
    setEditId(entry.id)
    setTitle(entry.title)
    setBody(entry.body)
    setReflection(entry.reflection)
  }

  const handleSave = async () => {
    if (!title.trim() && !body.trim()) return
    const id = editId || `journal-${Date.now()}`
    await saveJournalEntry(id, title.trim() || 'Untitled', body.trim(), reflection)
    setEditing(false)
    loadEntries()
  }

  const handleDelete = async (id: string) => {
    await deleteJournalEntry(id)
    loadEntries()
  }

  const handleReflection = async () => {
    if (!body.trim()) return
    setGettingReflection(true)
    try {
      const r = await getJournalReflection(body)
      setReflection(r)
      if (editId) {
        await saveJournalEntry(editId, title || 'Untitled', body, r)
      }
    } catch {
      setReflection('Unable to get reflection right now. Please try again later.')
    } finally {
      setGettingReflection(false)
    }
  }

  if (editing) {
    return (
      <div className="min-h-screen pb-12 px-6 md:px-12 pt-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[var(--color-on-surface)]">{editId ? 'Edit Entry' : 'New Entry'}</h1>
            <button onClick={() => setEditing(false)} className="text-sm text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)]">Cancel</button>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title..."
            className="w-full px-4 py-3 rounded-xl bg-white border border-[var(--color-border)] text-lg font-semibold text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-muted)]/50 focus:outline-none focus:border-[var(--color-primary)] transition-colors mb-4"
          />

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write freely... this is your space."
            rows={12}
            className="w-full px-4 py-3 rounded-xl bg-white border border-[var(--color-border)] text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-muted)]/50 focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none mb-4 leading-relaxed"
          />

          {reflection && (
            <div className="bg-gradient-to-br from-[var(--color-primary)]/10 to-[#A8C5D6]/10 rounded-xl p-4 border border-[var(--color-primary)]/20 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-[var(--color-primary-dark)]" />
                <span className="text-xs font-semibold text-[var(--color-primary-dark)] uppercase tracking-wide">AI Reflection</span>
              </div>
              <p className="text-sm text-[var(--color-on-surface)] italic leading-relaxed">{reflection}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              Save Entry
            </button>
            <button
              onClick={handleReflection}
              disabled={!body.trim() || gettingReflection}
              className="px-4 py-3 rounded-xl bg-white border border-[var(--color-primary)]/30 text-[var(--color-primary-dark)] font-medium hover:bg-[var(--color-primary)]/8 transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              {gettingReflection ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {reflection ? 'New Reflection' : 'Get Reflection'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-12 px-6 md:px-12 pt-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-on-surface)] mb-1">Journal</h1>
            <p className="text-sm text-[var(--color-on-surface-muted)]">Write freely. Get a gentle AI reflection.</p>
          </div>
          <button
            onClick={newEntry}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            <Plus size={16} /> New Entry
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} className="text-[var(--color-primary)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-on-surface)] mb-2">Your journal is empty</h3>
            <p className="text-sm text-[var(--color-on-surface-muted)] mb-6">Writing can help you process and reflect. Start your first entry.</p>
            <button
              onClick={newEntry}
              className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              Write first entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <div
                key={entry.id}
                onClick={() => editEntry(entry)}
                className="bg-white rounded-2xl p-5 border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-primary)]/30 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-[var(--color-on-surface)]">{entry.title}</h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(entry.id) }}
                    className="opacity-0 group-hover:opacity-100 text-[var(--color-on-surface-muted)] hover:text-red-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-sm text-[var(--color-on-surface-muted)] line-clamp-2 mb-3">{entry.body}</p>
                {entry.reflection && (
                  <div className="flex items-start gap-2 text-xs text-[var(--color-primary-dark)] italic">
                    <Sparkles size={12} className="mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{entry.reflection}</span>
                  </div>
                )}
                <p className="text-xs text-[var(--color-on-surface-muted)]/60 mt-2">
                  {new Date(entry.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}