// "Faith-aware" (Batch B): optional, off by default. None / Christian / Muslim.
// A systemAddons entry (registered in src/features/b.tsx) lets companions offer
// faith-based comfort gently when it fits — never preachy, never replacing
// practical help or crisis lines, respectful of every belief.

export type FaithPref = 'none' | 'christian' | 'muslim'

export const FAITH_OPTIONS: { id: FaithPref; label: string; note: string }[] = [
  { id: 'none', label: 'Off', note: 'Companions keep faith out of the conversation.' },
  { id: 'christian', label: 'Christian', note: 'A short verse or a prayer idea may be offered when it fits.' },
  { id: 'muslim', label: 'Muslim', note: 'A short Qur\u2019an reflection or prayer idea may be offered when it fits.' },
]

export function loadFaith(): FaithPref {
  try {
    const v = localStorage.getItem('mindspace-faith') as FaithPref | null
    return FAITH_OPTIONS.some((f) => f.id === v) ? (v as FaithPref) : 'none'
  } catch {
    return 'none'
  }
}

export function saveFaith(id: FaithPref) {
  try {
    localStorage.setItem('mindspace-faith', id)
  } catch {
    /* private mode */
  }
}

// systemAddons entry. '' when Off.
export function faithAddon(): string {
  const faith = loadFaith()
  if (faith === 'none') return ''
  const faithName = faith === 'christian' ? 'Christian' : 'Muslim'
  const source = faith === 'christian'
    ? 'the Bible'
    : 'the Qur\u2019an'
  return `Faith: the person finds comfort in their ${faithName} faith. Once in a while, when it genuinely fits what they shared, you may offer a brief word of comfort from ${source} or a short prayer idea — at most a sentence or two, and only when it fits naturally. Never preach, never lecture, never push faith. If they ask you to stop, stop immediately and permanently. Always offer the same practical care and self-care steps you would anyway; faith never replaces practical help, professional help or crisis resources. Be equally respectful of every belief, including if they mention a different one.`
}