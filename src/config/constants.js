export const API_URL = '/api/insights'
export const BACKEND_URL = import.meta.env?.DEV ? import.meta.env.VITE_MAILSENSE_API_URL || 'Not configured' : 'Protected server endpoint'
export const CATEGORIES = [
  { key: 'spam', label: 'Spam', color: '#B8A89B' },
  { key: 'educational', label: 'Educational', color: '#416F91' },
  { key: 'company', label: 'Company', color: '#7299B7' },
  { key: 'personal', label: 'Personal', color: '#B68A64' },
  { key: 'finance', label: 'Finance', color: '#92B5CF' },
  { key: 'promotions', label: 'Promotions', color: '#D0AC84' },
  { key: 'social', label: 'Social', color: '#A9C5D9' },
  { key: 'other', label: 'Other', color: '#C7D8E5' }
]
export const COUNT_FIELDS = ['total', 'unread', 'high_priority', 'needs_reply', ...CATEGORIES.map(category => category.key)]
