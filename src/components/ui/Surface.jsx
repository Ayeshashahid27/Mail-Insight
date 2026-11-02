import { motion } from 'motion/react'
import { usePreferences } from '../../hooks/usePreferences'

export function Surface({ children, className = '', hover = false, ...props }) {
  const { preferences } = usePreferences()
  return <motion.section className={`surface ${className}`} whileHover={hover && !preferences.reducedMotion ? { y: -3 } : undefined} transition={{ type: 'spring', stiffness: 280, damping: 26 }} {...props}>{children}</motion.section>
}
export function Empty({ icon: Icon, title, children }) { return <div className="empty-state">{Icon && <span className="empty-icon"><Icon size={22} /></span>}<h3>{title}</h3><p>{children}</p></div> }
export function SectionTitle({ eyebrow, title, action }) { return <div className="section-title"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{action}</div> }
