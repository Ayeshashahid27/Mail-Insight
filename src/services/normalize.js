import { COUNT_FIELDS, CATEGORIES } from '../config/constants.js'

const parseMaybeJson = value => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (!trimmed) return null
  if (!/^[{[]/.test(trimmed)) return trimmed
  try { return JSON.parse(trimmed) } catch { return trimmed }
}

const parseCount = value => {
  if (value === '' || value === null || value === undefined) return null
  const number = Number(String(value).replaceAll(',', '').trim())
  return Number.isFinite(number) && number >= 0 ? number : null
}

const parseBoolean = value => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1 ? true : value === 0 ? false : null
  if (typeof value === 'string') {
    if (['true', 'yes', '1'].includes(value.trim().toLowerCase())) return true
    if (['false', 'no', '0'].includes(value.trim().toLowerCase())) return false
  }
  return null
}

const validDate = value => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

const asList = value => {
  const parsed = parseMaybeJson(value)
  if (parsed === null || parsed === undefined || parsed === '') return []
  if (Array.isArray(parsed)) return parsed.filter(item => item !== null && item !== '')
  return [parsed]
}

const asText = value => {
  const parsed = parseMaybeJson(value)
  if (parsed === null || parsed === undefined || parsed === '') return null
  if (typeof parsed === 'string') return parsed
  if (Array.isArray(parsed)) return parsed.map(item => typeof item === 'string' ? item : JSON.stringify(item)).join('\n\n')
  return JSON.stringify(parsed)
}

export const normalizeSnapshot = (record, index = 0) => {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return null
  const date = validDate(record.date)
  const updatedAt = validDate(record.updated_at)
  if (!date && !updatedAt) return null
  const counts = Object.fromEntries(COUNT_FIELDS.map(key => [key, parseCount(record[key])]))
  const categoryValues = CATEGORIES.map(category => counts[category.key])
  const categorySum = categoryValues.every(value => value !== null) ? categoryValues.reduce((sum, value) => sum + value, 0) : null
  return {
    id: `${date || updatedAt}-${index}`,
    date: date || updatedAt,
    updatedAt,
    window: typeof record.window === 'string' && record.window.trim() ? record.window.trim() : null,
    ...counts,
    possiblyTruncated: parseBoolean(record.possibly_truncated),
    summary: asText(record.summary),
    actionItems: asList(record.action_items),
    urgentEmails: asList(record.urgent_emails),
    categorySum,
    inconsistent: counts.total !== null && categorySum !== null && counts.total !== categorySum
  }
}

const unwrap = payload => {
  if (Array.isArray(payload)) return payload.flatMap(unwrap)
  if (!payload || typeof payload !== 'object') return []
  if (payload.latest || Array.isArray(payload.history)) return [...unwrap(payload.history || []), ...unwrap(payload.latest || [])]
  for (const key of ['snapshots', 'records', 'data', 'rows', 'items', 'results']) {
    if (Array.isArray(payload[key])) return payload[key].flatMap(unwrap)
  }
  if (payload.json && typeof payload.json === 'object') return unwrap(payload.json)
  return [payload]
}

export const normalizeResponse = payload => {
  const records = unwrap(payload)
  const unique = new Map()
  const normalized = records.map(normalizeSnapshot)
  normalized.filter(Boolean).forEach(snapshot => unique.set(`${snapshot.date}|${snapshot.updatedAt || ''}`, snapshot))
  const snapshots = [...unique.values()].sort((a, b) => new Date(a.date) - new Date(b.date) || new Date(a.updatedAt || a.date) - new Date(b.updatedAt || b.date))
  return { snapshots, latest: snapshots.at(-1) || null, rejectedCount: normalized.filter(snapshot => !snapshot).length }
}
