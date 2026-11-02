import { createContext, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, X } from 'lucide-react'

const ToastContext = createContext(null)
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const notify = (message, kind = 'success') => { setToast({ message, kind, id: Date.now() }); setTimeout(() => setToast(null), 4200) }
  return <ToastContext.Provider value={notify}>{children}<AnimatePresence>{toast && <motion.div key={toast.id} className="toast" role="status" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}><span className="toast-icon">{toast.kind === 'success' ? <Check size={16} /> : <X size={16} />}</span>{toast.message}<button onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={16} /></button></motion.div>}</AnimatePresence></ToastContext.Provider>
}
export const useToast = () => useContext(ToastContext)
