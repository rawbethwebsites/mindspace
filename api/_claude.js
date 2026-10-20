// Hosted AI for the website: Claude Haiku 5.5 through the official Anthropic SDK.
// Switched on by setting ANTHROPIC_API_KEY in Vercel; without it the routes fall back to FreeLLM.
import Anthropic from '@anthropic-ai/sdk'

export const CLAUDE_MODEL = 'claude-haiku-5-5'
export const claudeEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY)

let client = null
export function claude() {
  if (!client) client = new Anthropic() // reads ANTHROPIC_API_KEY
  return client
}

// Shared limits that keep cost and abuse in check.
export const LIMITS = { maxMessages: 20, maxChars: 24000, maxTokens: 1024 }

// The chat sends OpenAI-style messages with a leading system message; Claude takes `system` separately.
export function toClaude(messages) {
  const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n')
  const turns = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: String(m.content ?? '') }))
    .filter((m) => m.content.trim())
  // The API expects the conversation to start with the person.
  while (turns.length && turns[0].role !== 'user') turns.shift()
  return { system, turns }
}

export const REFUSAL_REPLY =
  "I can't help with that one here. If you're going through something hard, tap Help at the top for people you can talk to right now."
