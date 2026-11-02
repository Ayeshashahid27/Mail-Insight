import { API_URL } from '../config/constants'
import { normalizeResponse } from './normalize'

export class ApiError extends Error {
  constructor(message, code, status) { super(message); this.name = 'ApiError'; this.code = code; this.status = status }
}

export async function fetchInsights(signal) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort('timeout'), 20000)
  const cancel = () => controller.abort('cancelled')
  signal?.addEventListener('abort', cancel, { once: true })
  try {
    const accessKey = sessionStorage.getItem('mailsense-access-key')
    const response = await fetch(API_URL, { signal: controller.signal, headers: { Accept: 'application/json', ...(accessKey ? { Authorization: `Bearer ${accessKey}` } : {}) }, cache: 'no-store' })
    if (response.status === 401) throw new ApiError('Access key required or incorrect. Add your deployment access key in Settings.', 'auth', 401)
    if (!response.ok) throw new ApiError(`The insights service returned HTTP ${response.status}.`, 'http', response.status)
    let payload
    try { payload = await response.json() } catch { throw new ApiError('The insights service returned invalid JSON.', 'json') }
    return normalizeResponse(payload)
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (signal?.aborted) throw error
    if (controller.signal.aborted) throw new ApiError('The insights request timed out. Please try again.', 'timeout')
    throw new ApiError('The insights service could not be reached. Check your network or browser CORS settings.', 'network')
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', cancel)
  }
}
