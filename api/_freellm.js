const DEFAULT_BASE_URL = 'http://localhost:3001/v1'
const DEFAULT_MODEL = 'auto'

export function getFreeLlmConfig() {
  return {
    apiKey: process.env.FREE_LLM_API_KEY || process.env.FREELLM_API_KEY || '',
    baseUrl: (process.env.FREE_LLM_BASE_URL || process.env.FREELLM_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, ''),
    model: process.env.FREE_LLM_MODEL || process.env.FREELLM_MODEL || DEFAULT_MODEL,
  }
}

export function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

export function assertMethod(req, res, method) {
  if (req.method === method) return true
  res.setHeader('Allow', method)
  sendJson(res, 405, { error: 'Method not allowed' })
  return false
}

export async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (!chunks.length) return {}

  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

export function providerHeaders(apiKey) {
  const headers = { 'Content-Type': 'application/json' }
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`
  return headers
}
