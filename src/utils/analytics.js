import { CATEGORIES } from '../config/constants.js'

export const categoryData = snapshot => CATEGORIES.map(category => ({ ...category, value: snapshot?.[category.key] ?? null })).filter(item => item.value !== null)
export const percent = (value, total) => value === null || value === undefined || !total ? null : value / total * 100
export const filterSnapshots = (snapshots, filter, start, end) => {
  if (filter === 'latest') return snapshots.slice(-1)
  if (filter === 'all') return snapshots
  const latest = snapshots.at(-1)
  if (!latest) return []
  const floor = filter === 'custom' ? (start ? new Date(`${start}T00:00:00`).getTime() : -Infinity) : new Date(latest.date).getTime() - (filter === '7' ? 7 : 30) * 86400000
  const ceiling = filter === 'custom' && end ? new Date(`${end}T23:59:59.999`).getTime() : Infinity
  return snapshots.filter(snapshot => { const time = new Date(snapshot.date).getTime(); return time >= floor && time <= ceiling })
}
export const comparison = (current, previous, field) => {
  const a = current?.[field], b = previous?.[field]
  return a === null || a === undefined || b === null || b === undefined ? null : a - b
}
export const chartRows = snapshots => snapshots.map(snapshot => ({ ...snapshot, label: new Date(snapshot.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }))
