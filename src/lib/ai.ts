import { SYSTEM_PROMPT, JOURNAL_REFLECTION_PROMPT } from './prompts'

const API_BASE = import.meta.env.VITE_MINDSPACE_API_BASE || ''

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function* streamChat(
  messages: Message[],
  signal?: AbortSignal
): AsyncGenerator<string> {
  const systemMessage: Message = { role: 'system', content: SYSTEM_PROMPT }
  const fullMessages = [systemMessage, ...messages.slice(-10)]

  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: fullMessages,
      stream: true,
    }),
    signal,
  })

  if (!res.ok) {
    throw new Error(`Mindspace AI error: ${res.status}`)
  }

  const reader = res.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) throw new Error('No response body')

  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    yield buffer
    buffer = ''
  }
}

export async function getJournalReflection(entry: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/journal-reflection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: JOURNAL_REFLECTION_PROMPT,
      entry,
    }),
  })

  if (!res.ok) {
    throw new Error(`Mindspace AI error: ${res.status}`)
  }

  const data = await res.json()
  return data.content || 'I hear you. Thank you for sharing this.'
}

export async function checkOllamaConnection(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/ai-health`, { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}
