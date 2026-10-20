import { useEffect, useState } from 'react'
import { Plus, Trash2, Eye, EyeOff, Pencil, AlertTriangle } from 'lucide-react'
import { getMemories, saveMemory, updateMemory, deleteMemory, clearMemories, type StoredMemory } from '../lib/db'

// Settings section: the list of facts the companion will remember, plus
// add/edit/toggle/delete and a "forget everything" escape hatch.
export default function MemorySettings() {
  const [memories, setMemories] = useState<StoredMemory[]>([])
  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [confirmWipe, setConfirmWipe] = useState(false)

  const load = async () => setMemories(await getMemories())
  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    const t = draft.trim()
    if (!t) return
    await saveMemory(t)
    setDraft('')
    load()
  }

  const handleEdit = async (id: string) => {
    const t = editText.trim()
    if (!t) return
    const current = memories.find((m) => m.id === id)
    if (!current) return
    await updateMemory(id, t, current.enabled)
    setEditing(null)
    setEditText('')
    load()
  }

  return (
    <div>
      <p className="text-sm text-[var(--color-on-surface-muted)] mb-4 leading-relaxed">
        Short facts your companion keeps in mind when talking with you. You add them, you change them, you delete them. This list lives on this device.
      </p>

      {memories.length > 0 && (
        <ul className="space-y-2 mb-4">
          {memories.map((m) => (
            <li key={m.id} className="flex items-start gap-2 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
              {editing === m.id ? (
                <>
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(m.id); if (e.key === 'Escape') setEditing(null) }}
                    aria-label="Edit this fact"
                    className="flex-1 px-2 py-1.5 rounded bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                  <button onClick={() => handleEdit(m.id)} className="press text-xs btn-sunset px-3 py-1.5 min-h-[32px]" aria-label="Save edit">Save</button>
                  <button onClick={() => setEditing(null)} className="press text-xs btn-ghost px-3 py-1.5 min-h-[32px]" aria-label="Cancel edit">Cancel</button>
                </>
              ) : (
                <>
                  <span className={`flex-1 text-sm leading-snug pt-1 ${m.enabled ? 'text-[var(--color-on-surface)]' : 'text-[var(--color-on-surface-muted)] line-through'}`}>
                    {m.fact}
                  </span>
                  <button
                    onClick={() => updateMemory(m.id, m.fact, !m.enabled).then(load)}
                    aria-label={m.enabled ? 'Pause this memory' : 'Resume this memory'}
                    className="press min-w-[44px] min-h-[44px] rounded-md flex items-center justify-center text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)]"
                  >
                    {m.enabled ? <Eye size={15} aria-hidden="true" /> : <EyeOff size={15} aria-hidden="true" />}
                  </button>
                  <button
                    onClick={() => { setEditing(m.id); setEditText(m.fact) }}
                    aria-label="Edit this memory"
                    className="press min-w-[44px] min-h-[44px] rounded-md flex items-center justify-center text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)]"
                  >
                    <Pencil size={15} aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => deleteMemory(m.id).then(load)}
                    aria-label="Delete this memory"
                    className="press min-w-[44px] min-h-[44px] rounded-md flex items-center justify-center text-[var(--color-on-surface-muted)] hover:text-[var(--color-error)]"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2 mb-4">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
          placeholder='e.g. "My sister is Tolu" or "Exams in November"'
          aria-label="Add a fact for your companion to remember"
          className="flex-1 px-4 py-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-subtle)] focus:outline-none focus:border-[var(--color-primary)] transition-colors min-h-[44px]"
        />
        <button
          onClick={handleAdd}
          disabled={!draft.trim()}
          aria-label="Add fact"
          className="btn-sunset px-4 disabled:opacity-40 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <Plus size={18} aria-hidden="true" />
        </button>
      </div>

      {memories.length > 0 && !confirmWipe && (
        <button
          onClick={() => setConfirmWipe(true)}
          className="press text-xs text-[var(--color-error)] hover:underline"
        >
          Forget everything
        </button>
      )}
      {confirmWipe && (
        <div className="rounded-lg border border-[rgba(200,63,77,.3)] bg-[var(--color-error-light)] p-3 flex items-start gap-2">
          <AlertTriangle size={16} className="text-[var(--color-error)] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm text-[var(--color-on-surface)] font-medium mb-2">Forget everything?</p>
            <p className="text-xs text-[var(--color-on-surface-muted)] mb-3">Every fact on this list will be removed. This can't be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => clearMemories().then(() => { setConfirmWipe(false); load() })}
                className="press text-xs font-semibold px-3 py-1.5 rounded-md bg-[var(--color-error)] text-white min-h-[36px]"
              >
                Yes, forget everything
              </button>
              <button
                onClick={() => setConfirmWipe(false)}
                className="press text-xs px-3 py-1.5 rounded-md btn-ghost min-h-[36px]"
              >
                Keep them
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
