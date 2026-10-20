import { assertMethod, getFreeLlmConfig, providerHeaders, readBody, sendJson } from './_freellm.js'
import { claudeEnabled, claude, CLAUDE_MODEL, LIMITS } from './_claude.js'

export default async function handler(req, res) {
  if (!assertMethod(req, res, 'POST')) return

  try {
    const { system, entry } = await readBody(req)
    if (String(entry || '').length > LIMITS.maxChars) { sendJson(res, 413, { error: 'Entry too long' }); return }

    if (claudeEnabled()) {
      const msg = await claude().messages.create({
        model: CLAUDE_MODEL,
        max_tokens: LIMITS.maxTokens,
        output_config: { effort: 'low' },
        system: system || 'Offer a brief, supportive reflection.',
        messages: [{ role: 'user', content: String(entry || '') }],
      })
      const text = msg.stop_reason === 'refusal' ? '' : msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('')
      sendJson(res, 200, { content: text || 'I hear you. Thank you for sharing this.' })
      return
    }

    const { apiKey, baseUrl, model } = getFreeLlmConfig()

    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: providerHeaders(apiKey),
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system || 'Offer a brief, supportive reflection.' },
          { role: 'user', content: entry || '' },
        ],
        stream: false,
      }),
    })

    if (!upstream.ok) {
      sendJson(res, upstream.status || 502, { error: 'AI provider request failed' })
      return
    }

    const data = await upstream.json()
    sendJson(res, 200, {
      content: data.choices?.[0]?.message?.content || 'I hear you. Thank you for sharing this.',
    })
  } catch {
    sendJson(res, 500, { error: 'Unable to reach Mindspace AI' })
  }
}
