import { assertMethod, getFreeLlmConfig, providerHeaders, readBody, sendJson } from './_freellm.js'
import { claudeEnabled, claude, CLAUDE_MODEL, LIMITS, toClaude, REFUSAL_REPLY } from './_claude.js'

export default async function handler(req, res) {
  if (!assertMethod(req, res, 'POST')) return

  try {
    const { messages = [] } = await readBody(req)
    if (!Array.isArray(messages) || messages.length > LIMITS.maxMessages || JSON.stringify(messages).length > LIMITS.maxChars) {
      sendJson(res, 413, { error: 'Conversation too long' })
      return
    }

    if (claudeEnabled()) {
      const { system, turns } = toClaude(messages)
      if (!turns.length) { sendJson(res, 400, { error: 'No message' }); return }
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.setHeader('Cache-Control', 'no-cache, no-transform')
      const stream = claude().messages.stream({
        model: CLAUDE_MODEL,
        max_tokens: LIMITS.maxTokens,
        output_config: { effort: 'low' }, // a warm chat reply, not deep reasoning
        system,
        messages: turns,
      })
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') res.write(event.delta.text)
      }
      const final = await stream.finalMessage()
      if (final.stop_reason === 'refusal') res.write(REFUSAL_REPLY)
      res.end()
      return
    }

    const { apiKey, baseUrl, model } = getFreeLlmConfig()

    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: providerHeaders(apiKey),
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    })

    if (!upstream.ok || !upstream.body) {
      sendJson(res, upstream.status || 502, { error: 'AI provider request failed' })
      return
    }

    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-transform')

    const reader = upstream.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const events = buffer.split('\n\n')
      buffer = events.pop() || ''

      for (const event of events) {
        for (const line of event.split('\n')) {
          if (!line.startsWith('data:')) continue

          const data = line.slice(5).trim()
          if (!data || data === '[DONE]') continue

          try {
            const json = JSON.parse(data)
            const content = json.choices?.[0]?.delta?.content || ''
            if (content) res.write(content)
          } catch {
            // Ignore malformed provider stream events.
          }
        }
      }
    }

    res.end()
  } catch {
    sendJson(res, 500, { error: 'Unable to reach Mindspace AI' })
  }
}
