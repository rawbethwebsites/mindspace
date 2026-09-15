import { getFreeLlmConfig, providerHeaders, sendJson } from './_freellm.js'

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  try {
    const { apiKey, baseUrl, model } = getFreeLlmConfig()
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: providerHeaders(apiKey),
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
        stream: false,
      }),
    })

    if (!upstream.ok) {
      sendJson(res, 503, { ok: false })
      return
    }

    if (req.method === 'HEAD') {
      res.statusCode = 204
      res.end()
      return
    }

    sendJson(res, 200, { ok: true })
  } catch {
    sendJson(res, 503, { ok: false })
  }
}
