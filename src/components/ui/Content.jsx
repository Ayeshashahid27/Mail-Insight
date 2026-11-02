import { useState } from 'react'
import { Check, ChevronDown, Copy, Download, FileText, Inbox } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Surface, Empty } from './Surface'
import { dateLabel, reportText, textOf } from '../../utils/format'
import { useToast } from './Toast'

async function copyText(text, notify) { try { await navigator.clipboard.writeText(text); notify('Copied to clipboard') } catch { notify('Clipboard access is unavailable', 'error') } }

export function Briefing({ snapshot, compact = false }) {
  const [expanded, setExpanded] = useState(false)
  const notify = useToast()
  const text = snapshot?.summary
  return <Surface className={`briefing ${compact ? 'briefing-compact' : ''}`}><div className="card-top"><span className="eyebrow light">AI DAILY BRIEFING</span><span className="briefing-mark">✳</span></div><h2>Clarity from your inbox.</h2><p className="briefing-date">{snapshot ? dateLabel(snapshot.date) : 'Latest report'}</p>{text ? <><div className={`briefing-text ${expanded ? 'expanded' : ''}`}>{text.split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div><div className="briefing-actions"><button className="button light-button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>{expanded ? 'Show less' : 'Read full briefing'} <ChevronDown size={16} className={expanded ? 'rotate' : ''} /></button><button className="icon-button light-outline" onClick={() => copyText(text, notify)} aria-label="Copy briefing"><Copy size={17} /></button></div></> : <p className="briefing-placeholder">No AI briefing was included in this snapshot.</p>}</Surface>
}

export function ItemList({ title, items, type = 'action', className = '' }) {
  const Icon = type === 'urgent' ? Inbox : Check
  return <Surface className={className}><div className="card-heading"><span className={`heading-icon ${type}`}><Icon size={19} /></span><div><span className="eyebrow">{type === 'urgent' ? 'ATTENTION' : 'NEXT STEPS'}</span><h2>{title}</h2></div><span className="pill">{items?.length || 0}</span></div>{items?.length ? <ul className="item-list">{items.map((item, i) => <li key={i}><span className="list-index">{String(i + 1).padStart(2, '0')}</span><span>{textOf(item)}</span></li>)}</ul> : <Empty icon={type === 'urgent' ? Inbox : Check} title={type === 'urgent' ? 'No urgent emails listed' : 'No action items listed'}>The latest report did not include {type === 'urgent' ? 'urgent email details' : 'action items'}.</Empty>}</Surface>
}

export function ReportActions({ snapshot }) {
  const notify = useToast()
  const copy = () => copyText(reportText(snapshot), notify)
  const download = () => {
    const blob = new Blob([reportText(snapshot)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `mailsense-report-${snapshot.date.slice(0, 10)}.txt`
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    notify('Report downloaded')
  }
  return <div className="action-row"><button className="button secondary" onClick={copy}><Copy size={16} /> Copy report</button><button className="button primary" onClick={download}><Download size={16} /> Download report</button></div>
}

export function DataWarnings({ snapshot, rejectedCount = 0 }) {
  if (!snapshot && !rejectedCount) return null
  return <AnimatePresence>{(snapshot?.possiblyTruncated || snapshot?.inconsistent || rejectedCount > 0) && <motion.div className="warnings" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>{snapshot?.possiblyTruncated && <div className="warning"><strong>Scan coverage may be incomplete.</strong> The backend marked this snapshot as possibly truncated.</div>}{snapshot?.inconsistent && <div className="warning"><strong>Category counts differ from total.</strong> The source values are shown as received.</div>}{rejectedCount > 0 && <div className="warning"><strong>{rejectedCount} record{rejectedCount === 1 ? '' : 's'} could not be used.</strong> Those records had no valid date.</div>}</motion.div>}</AnimatePresence>
}

export function StatusPanel({ loading, error, empty, refresh }) {
  if (loading) return <div className="loading-grid" aria-label="Loading insights">{Array.from({ length: 6 }, (_, i) => <div className="skeleton" key={i} />)}</div>
  if (error) return <Surface className="status-panel"><span className="status-illustration">!</span><span className="eyebrow">CONNECTION INTERRUPTED</span><h2>We couldn’t load your insights.</h2><p>{error.message}</p><button className="button primary" onClick={refresh}>Try again</button></Surface>
  if (empty) return <Surface className="status-panel"><FileText size={34} /><span className="eyebrow">NO SAVED REPORTS</span><h2>Insights will appear here.</h2><p>The backend returned no valid dated snapshots. Check the Google Sheet or refresh after the next scan.</p><button className="button primary" onClick={refresh}>Refresh data</button></Surface>
  return null
}
