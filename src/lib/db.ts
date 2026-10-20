import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

interface MindspaceDB extends DBSchema {
  chats: {
    key: string
    value: { id: string; title: string; createdAt: number; messages: ChatMessage[]; companion?: string }
  }
  moods: {
    key: string
    // tags: Batch B "Nigeria-aware patterns" — optional context tags. Older
    // entries simply have no tags; every reader must handle that (b?.tags ?? []).
    value: { id: string; date: string; mood: number; note?: string; tags?: string[]; createdAt: number }
  }
  journal: {
    key: string
    value: { id: string; title: string; body: string; reflection?: string; createdAt: number; updatedAt: number }
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

// Calendar day on the user's own clock (YYYY-MM-DD). toISOString() would use UTC and
// file a just-after-midnight check-in under yesterday.
export function localDay(d: Date = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

let dbPromise: Promise<IDBPDatabase<MindspaceDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MindspaceDB>('mindspace', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('chats')) db.createObjectStore('chats', { keyPath: 'id' })
        if (!db.objectStoreNames.contains('moods')) db.createObjectStore('moods', { keyPath: 'id' })
        if (!db.objectStoreNames.contains('journal')) db.createObjectStore('journal', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

// Chat functions
export async function saveConversation(id: string, title: string, messages: ChatMessage[], companion?: string) {
  const db = await getDB()
  const existing = await db.get('chats', id)
  await db.put('chats', { id, title, createdAt: existing?.createdAt || Date.now(), messages, companion: companion ?? existing?.companion })
}

export async function getConversation(id: string) {
  const db = await getDB()
  return db.get('chats', id)
}

export async function getAllConversations() {
  const db = await getDB()
  const all = await db.getAll('chats')
  return all.sort((a, b) => b.createdAt - a.createdAt)
}

export async function deleteConversation(id: string) {
  const db = await getDB()
  await db.delete('chats', id)
}

// Mood functions
export async function saveMood(mood: number, note?: string, tags?: string[]) {
  const db = await getDB()
  const date = localDay()
  const id = `mood-${date}`
  // A re-save keeps its tags unless new tags are given (tags may be cleared by passing []).
  const existing = await db.get('moods', id)
  const savedTags = tags ?? existing?.tags
  await db.put('moods', { id, date, mood, note, tags: savedTags, createdAt: Date.now() })
}

export async function getMoods() {
  const db = await getDB()
  const all = await db.getAll('moods')
  return all.sort((a, b) => a.date.localeCompare(b.date))
}

export async function getTodayMood() {
  const db = await getDB()
  const date = localDay()
  return db.get('moods', `mood-${date}`)
}

// Journal functions
export async function saveJournalEntry(id: string, title: string, body: string, reflection?: string) {
  const db = await getDB()
  const existing = await db.get('journal', id)
  await db.put('journal', {
    id,
    title,
    body,
    reflection,
    createdAt: existing?.createdAt || Date.now(),
    updatedAt: Date.now(),
  })
}

export async function getJournalEntries() {
  const db = await getDB()
  const all = await db.getAll('journal')
  return all.sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getJournalEntry(id: string) {
  const db = await getDB()
  return db.get('journal', id)
}

export async function deleteJournalEntry(id: string) {
  const db = await getDB()
  await db.delete('journal', id)
}

// Clear all data
export async function clearAllData() {
  const db = await getDB()
  await db.clear('chats')
  await db.clear('moods')
  await db.clear('journal')
}

// Export all data
export async function exportAllData() {
  const [chats, moods, journal] = await Promise.all([
    getAllConversations(),
    getMoods(),
    getJournalEntries(),
  ])
  return { chats, moods, journal, exportedAt: new Date().toISOString() }
}
// Screenshot builds only (VITE_DEMO_SEED=true): fill two weeks of sample check-ins and a few entries.
export async function seedDemoData() {
  const db = await getDB()
  if ((await db.count('moods')) > 0) return
  const moods = [2, 3, 2, 1, 2, 3, 3, 2, 3, 4, 3, 2, 3, 3]
  const notes: Record<number, string> = { 3: 'Long day. Took a walk after.', 9: 'Slept well, felt light.', 13: 'Calmer after breathing.' }
  const day = 86400000
  for (let i = 0; i < moods.length; i++) {
    const t = Date.now() - (moods.length - 1 - i) * day
    const date = localDay(new Date(t))
    await db.put('moods', { id: `mood-${date}`, date, mood: moods[i], note: notes[i], createdAt: t })
  }
  const entries = [
    ['A quieter morning', 'Woke up before the alarm and sat with my tea for ten minutes before checking my phone. It changed the whole morning. I want to keep doing that.', 0],
    ['Things I handled well', 'The meeting went better than I feared. I said what I needed to say, even with my heart racing. Small win, but it counts.', 2],
    ['Letting the week go', 'Today was a lot, and that is okay. Writing it down makes it feel smaller.', 5],
  ] as const
  for (const [title, body, ago] of entries) {
    const t = Date.now() - ago * day - 3600000
    await db.put('journal', { id: `demo-${ago}`, title, body, createdAt: t, updatedAt: t })
  }
}
