import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { LayoutDashboard, Mail, ChartNoAxesCombined, FileText, Settings, RefreshCw, Sparkles, Wifi, WifiOff } from 'lucide-react'
import { useInsights } from '../../hooks/useInsights'
import { dateLabel } from '../../utils/format'
import { usePreferences } from '../../hooks/usePreferences'
import { useToast } from '../ui/Toast'

const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, title: 'Overview', subtitle: 'Your inbox, made understandable.' },
  { to: '/insights', label: 'Email Insights', icon: Mail, title: 'Email insights', subtitle: 'See what your inbox is made of.' },
  { to: '/analytics', label: 'Analytics', icon: ChartNoAxesCombined, title: 'Analytics', subtitle: 'Follow each saved snapshot over time.' },
  { to: '/reports', label: 'Daily Reports', icon: FileText, title: 'Daily reports', subtitle: 'Explore every AI generated briefing.' },
  { to: '/settings', label: 'Settings', icon: Settings, title: 'Settings', subtitle: 'Control how MailSense works for you.' }
]

function Brand() { return <div className="brand"><div className="brand-mark"><Mail size={22} strokeWidth={2.2} /><span className="brand-spark">✦</span></div><div><strong>mailsense<span>ai</span></strong><small>INTELLIGENT EMAIL</small></div></div> }

export function AppShell() {
  const location = useLocation()
  const page = links.find(link => link.to === location.pathname) || links[0]
  const { latest, error, isFetching, refresh, dataUpdatedAt } = useInsights()
  const { preferences } = usePreferences()
  const notify = useToast()
  const doRefresh = async () => { await refresh(); notify('Checking for new snapshots') }
  return <div className="app-shell"><aside className="sidebar"><Brand /><div className="nav-caption">WORKSPACE</div><nav aria-label="Main navigation">{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={19} strokeWidth={1.9} /><span>{label}</span></NavLink>)}</nav><div className="sidebar-note"><div className="note-icon"><Sparkles size={18} /></div><strong>Thoughtful email intelligence.</strong><p>Every insight comes from your connected workflow.</p></div><div className="sidebar-foot">MAILSENSE AI <span>© 2026</span></div></aside><div className="main-shell"><header className="topbar"><div className="topbar-brand"><Brand /></div><div className="page-heading"><span className="eyebrow">MAILSENSE / {page.label.toUpperCase()}</span><h1>{page.title}</h1><p>{page.subtitle}</p></div><div className="topbar-tools"><div className={`connection ${error ? 'offline' : ''}`} title={error ? error.message : 'Insights service response'}>{error ? <WifiOff size={15} /> : <Wifi size={15} />}<span>{error ? 'Connection issue' : dataUpdatedAt ? 'Connected' : 'Connecting'}</span></div><div className="snapshot-date"><span>Latest snapshot</span><strong>{latest ? dateLabel(latest.date, 'MMM d, yyyy') : '—'}</strong></div><button className="refresh-button" onClick={doRefresh} disabled={isFetching} aria-label="Refresh data" title="Refresh data"><RefreshCw size={18} className={isFetching ? 'spin' : ''} /></button><div className="avatar" aria-label="MailSense AI">M</div></div></header><main id="main-content"><AnimatePresence mode="wait"><motion.div key={location.pathname} initial={preferences.reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={preferences.reducedMotion ? {} : { opacity: 0, y: -8 }} transition={{ duration: .24 }}><Outlet /></motion.div></AnimatePresence></main></div><nav className="mobile-nav" aria-label="Mobile navigation">{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}><Icon size={19} /><span>{label.replace('Email ', '').replace('Daily ', '')}</span></NavLink>)}</nav></div>
}
