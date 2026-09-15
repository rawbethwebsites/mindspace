import { assertMethod, getFreeLlmConfig, providerHeaders, readBody, sendJson } from './_freellm.js'

export default async function handler(req, res) {
  if (!assertMethod(req, res, 'POST')) return

  try {
    const { system, entry } = await readBody(req)
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
