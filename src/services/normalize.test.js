import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeResponse, normalizeSnapshot } from './normalize.js'
import { comparison, filterSnapshots, percent } from '../utils/analytics.js'

test('normalizes the live webhook wrapper without duplicating latest', () => {
  const record = { date: '2026-11-01', updated_at: '2026-11-01T12:00:00Z', total: '1,200', unread: '20', possibly_truncated: 'false', action_items: '["Reply to A"]', urgent_emails: '[]', summary: 'Briefing' }
  const result = normalizeResponse({ ok: true, latest: record, history: [record] })
  assert.equal(result.snapshots.length, 1)
  assert.equal(result.latest.total, 1200)
  assert.equal(result.latest.unread, 20)
  assert.equal(result.latest.possiblyTruncated, false)
  assert.deepEqual(result.latest.actionItems, ['Reply to A'])
})

test('preserves missing counts and rejects invalid dates', () => {
  const record = normalizeSnapshot({ date: '2026-11-01', total: '', educational: 'oops', summary: null, action_items: '{bad json' })
  assert.equal(record.total, null)
  assert.equal(record.educational, null)
  assert.equal(record.summary, null)
  assert.deepEqual(record.actionItems, ['{bad json'])
  assert.equal(normalizeResponse([{ date: 'not-a-date' }]).snapshots.length, 0)
})

test('sorts history and flags inconsistent complete category totals', () => {
  const categories = { spam: 0, educational: 1, company: 1, personal: 1, finance: 1, promotions: 1, social: 1, other: 1 }
  const result = normalizeResponse([{ date: '2026-11-02', total: 8, ...categories }, { date: '2026-11-01', total: 7, ...categories }])
  assert.equal(result.latest.inconsistent, true)
  assert.equal(result.snapshots[0].inconsistent, false)
  assert.equal(result.latest.date.slice(0, 10), '2026-11-02')
})

test('compares snapshot values without summing overlapping windows', () => {
  const snapshots = [{ date: '2026-10-20T00:00:00.000Z', total: 10 }, { date: '2026-11-01T00:00:00.000Z', total: 13 }, { date: '2026-11-02T00:00:00.000Z', total: 8 }]
  assert.equal(filterSnapshots(snapshots, '7').length, 2)
  assert.equal(comparison(snapshots[2], snapshots[1], 'total'), -5)
  assert.equal(percent(2, 8), 25)
  assert.equal(percent(null, 8), null)
})
