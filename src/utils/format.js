import { format, isValid, parseISO } from 'date-fns'

export const dateLabel = (value, pattern = 'MMM d, yyyy') => {
  if (!value) return 'Not provided'
  const date = parseISO(value)
  return isValid(date) ? format(date, pattern) : 'Not provided'
}
export const timeLabel = (value, local = true) => value ? new Date(value).toLocaleString(undefined, local ? {} : { timeZone: 'UTC', timeZoneName: 'short' }) : 'Not provided'
export const countLabel = value => value === null || value === undefined ? '—' : new Intl.NumberFormat().format(value)
export const textOf = value => typeof value === 'string' ? value : value && typeof value === 'object' ? Object.entries(value).map(([key, item]) => `${key.replaceAll('_', ' ')}: ${typeof item === 'object' ? JSON.stringify(item) : item}`).join(' · ') : String(value)
export const reportText = snapshot => [
  `MailSense AI report — ${dateLabel(snapshot.date)}`,
  `Scan window: ${snapshot.window || 'Not provided'}`,
  `Updated: ${timeLabel(snapshot.updatedAt)}`,
  `Scan completeness: ${snapshot.possiblyTruncated === true ? 'Possibly truncated' : snapshot.possiblyTruncated === false ? 'No truncation reported' : 'Not provided'}`,
  '',
  ...['total', 'unread', 'spam', 'educational', 'company', 'personal', 'finance', 'promotions', 'social', 'other', 'high_priority', 'needs_reply'].map(key => `${key.replaceAll('_', ' ')}: ${countLabel(snapshot[key])}`),
  '', 'AI briefing', snapshot.summary || 'Not provided', '', 'Action items', ...(snapshot.actionItems.length ? snapshot.actionItems.map((item, i) => `${i + 1}. ${textOf(item)}`) : ['None provided']),
  '', 'Urgent emails', ...(snapshot.urgentEmails.length ? snapshot.urgentEmails.map((item, i) => `${i + 1}. ${textOf(item)}`) : ['None provided'])
].join('\n')
