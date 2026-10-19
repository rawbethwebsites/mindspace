// Local test server for the AI chat: serves api/*.js on :3002 against the FreeLLM router on this Mac.
// Testing only (simulator/browser on this Mac). The key is read from ~/.hermes/.env and never shipped.
import http from 'node:http'
import fs from 'node:fs'
import os from 'node:os'

const env = fs.readFileSync(`${os.homedir()}/.hermes/.env`, 'utf8')
process.env.FREE_LLM_API_KEY = env.match(/^HERMES_CUSTOM_LOCALHOST_3001_API_KEY=(.*)$/m)?.[1]?.trim().replace(/^"|"$/g, '') || ''
process.env.FREE_LLM_BASE_URL = 'http://127.0.0.1:3001/v1'

const routes = {
  '/api/chat': (await import('./api/chat.js')).default,
  '/api/journal-reflection': (await import('./api/journal-reflection.js')).default,
  '/api/ai-health': (await import('./api/ai-health.js')).default,
}

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end() }
  const route = routes[new URL(req.url, 'http://x').pathname]
  if (!route) { res.statusCode = 404; return res.end() }
  route(req, res)
}).listen(3002, '127.0.0.1', () => console.log('Mindspace dev AI on http://127.0.0.1:3002'))
