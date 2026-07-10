import { SYSTEM_PROMPT, JOURNAL_REFLECTION_PROMPT } from './prompts'

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'llama3.2'

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

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: fullMessages,
      stream: true,
    }),
    signal,
  })

  if (!res.ok) {
    throw new Error(`Ollama API error: ${res.status}`)
  }

  const reader = res.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) throw new Error('No response body')

  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const json = JSON.parse(line)
        if (json.message?.content) {
          yield json.message.content
        }
      } catch {
        // skip malformed lines
      }
    }
  }
}

export async function getJournalReflection(entry: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: JOURNAL_REFLECTION_PROMPT },
        { role: 'user', content: entry },
      ],
      stream: false,
    }),
  })

  if (!res.ok) {
    throw new Error(`Ollama API error: ${res.status}`)
  }

  const data = await res.json()
  return data.message?.content || 'I hear you. Thank you for sharing this.'
}

export async function checkOllamaConnection(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}