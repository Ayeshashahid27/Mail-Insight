import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts'
import { CATEGORIES } from '../../config/constants'
import { categoryData, chartRows, percent } from '../../utils/analytics'
import { countLabel } from '../../utils/format'
import { usePreferences } from '../../hooks/usePreferences'
import { Empty } from '../ui/Surface'
import { ChartNoAxesCombined } from 'lucide-react'

const tipStyle = { background: '#fff', border: 'none', borderRadius: 16, boxShadow: '0 12px 30px #25374620', color: '#253746' }
export function Donut({ snapshot }) {
  const { preferences } = usePreferences()
  const rows = categoryData(snapshot).filter(item => item.value > 0)
  if (!rows.length) return <Empty icon={ChartNoAxesCombined} title="No category breakdown">Category counts have not been supplied for this snapshot.</Empty>
  return <div className="donut-layout"><div className="chart-wrap donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={rows} dataKey="value" nameKey="label" innerRadius="66%" outerRadius="88%" stroke="none" paddingAngle={2} isAnimationActive={!preferences.reducedMotion}>{rows.map(item => <Cell key={item.key} fill={item.color} />)}</Pie><Tooltip contentStyle={tipStyle} formatter={value => countLabel(value)} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{countLabel(snapshot.total)}</strong><span>scanned</span></div></div>{preferences.showLegend && <div className="chart-legend">{rows.map(item => <div key={item.key}><i style={{ background: item.color }} /><span>{item.label}</span><strong>{countLabel(item.value)}</strong></div>)}</div>}</div>
}

export function CategoryBars({ snapshot }) {
  const rows = categoryData(snapshot)
  if (!rows.length) return <Empty icon={ChartNoAxesCombined} title="No category comparison">Category counts have not been supplied.</Empty>
  const max = Math.max(...rows.map(row => row.value), 1)
  return <div className="category-bars">{rows.map(item => <div className="category-bar" key={item.key}><span>{item.label}</span><div className="track"><span style={{ width: `${item.value / max * 100}%`, background: item.color }} /></div><strong>{countLabel(item.value)}</strong></div>)}</div>
}

export function TrendChart({ snapshots, fields = ['total'], type = 'line' }) {
  const { preferences } = usePreferences()
  const rows = chartRows(snapshots)
  if (rows.length < 2) return <Empty icon={ChartNoAxesCombined} title="More snapshots needed">This trend will appear after at least two dated snapshots are saved.</Empty>
  const colors = { total: '#416F91', high_priority: '#B68A64', needs_reply: '#7BA9C8', ...Object.fromEntries(CATEGORIES.map(c => [c.key, c.color])) }
  const label = key => key.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase())
  return <div className="trend-chart"><ResponsiveContainer width="100%" height="100%">{type === 'bar' ? <BarChart data={rows} margin={{ top: 10, right: 4, left: -24, bottom: 0 }}><CartesianGrid stroke="#e9eee8" vertical={false} /><XAxis dataKey="label" tick={{ fill: '#718379', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: '#718379', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tipStyle} /><Legend wrapperStyle={{ fontSize: 12 }} />{fields.map(key => <Bar key={key} dataKey={key} name={label(key)} fill={colors[key]} radius={[5, 5, 0, 0]} isAnimationActive={!preferences.reducedMotion} />)}</BarChart> : <LineChart data={rows} margin={{ top: 10, right: 4, left: -24, bottom: 0 }}><CartesianGrid stroke="#e9eee8" vertical={false} /><XAxis dataKey="label" tick={{ fill: '#718379', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: '#718379', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tipStyle} /><Legend wrapperStyle={{ fontSize: 12 }} />{fields.map(key => <Line key={key} type="monotone" dataKey={key} name={label(key)} stroke={colors[key]} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} connectNulls={false} isAnimationActive={!preferences.reducedMotion} />)}</LineChart>}</ResponsiveContainer></div>
}

export function PriorityGauge({ snapshot }) {
  const high = snapshot?.high_priority
  const total = snapshot?.total
  const ratio = percent(high, total)
  return <div className="priority-gauge"><div className="gauge-ring" style={{ '--value': `${ratio ?? 0}%` }}><div><strong>{countLabel(high)}</strong><span>high priority</span></div></div><div className="gauge-copy"><strong>{ratio === null ? 'Share unavailable' : `${Math.round(ratio)}% of scanned emails`}</strong><span>Priority is determined by the AI workflow.</span></div></div>
}
