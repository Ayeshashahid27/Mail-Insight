import { timingSafeEqual } from 'node:crypto'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'private, no-store, max-age=0')
  response.setHeader('X-Content-Type-Options', 'nosniff')
  const secret = process.env.MAILSENSE_ACCESS_TOKEN
  const upstream = process.env.MAILSENSE_API_URL
  if (!secret || !upstream) return response.status(503).json({ error: 'Server access is not configured.' })
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed.' })
  const supplied = (request.headers.authorization || '').replace(/^Bearer\s+/i, '')
  const a = Buffer.from(supplied)
  const b = Buffer.from(secret)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return response.status(401).json({ error: 'Unauthorized.' })
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)
    try {
      const result = await fetch(upstream, { signal: controller.signal, headers: { Accept: 'application/json' }, cache: 'no-store' })
      const body = await result.text()
      response.status(result.status).setHeader('Content-Type', result.headers.get('content-type') || 'application/json').send(body)
    } finally { clearTimeout(timeout) }
  } catch { response.status(502).json({ error: 'Insights service unavailable.' }) }
}
