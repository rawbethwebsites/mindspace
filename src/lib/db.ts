import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

interface MindspaceDB extends DBSchema {
  chats: {
    key: string
    value: { id: string; title: string; createdAt: number; messages: ChatMessage[] }
  }
  moods: {
    key: string
    value: { id: string; date: string; mood: number; note?: string; createdAt: number }
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
export async function saveConversation(id: string, title: string, messages: ChatMessage[]) {
  const db = await getDB()
  const existing = await db.get('chats', id)
  await db.put('chats', { id, title, createdAt: existing?.createdAt || Date.now(), messages })
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
export async function saveMood(mood: number, note?: string) {
  const db = await getDB()
  const date = new Date().toISOString().split('T')[0]
  const id = `mood-${date}`
  await db.put('moods', { id, date, mood, note, createdAt: Date.now() })
}

export async function getMoods() {
  const db = await getDB()
  const all = await db.getAll('moods')
  return all.sort((a, b) => a.date.localeCompare(b.date))
}

export async function getTodayMood() {
  const db = await getDB()
  const date = new Date().toISOString().split('T')[0]
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