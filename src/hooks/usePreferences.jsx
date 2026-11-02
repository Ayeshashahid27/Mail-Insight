import { createContext, useContext, useEffect, useState } from 'react'

const defaults = { autoRefresh: false, reducedMotion: false, showLegend: true, localTime: true }
const PreferencesContext = createContext(null)

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(() => {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem('mailsense-preferences')) } } catch { return defaults }
  })
  useEffect(() => { localStorage.setItem('mailsense-preferences', JSON.stringify(preferences)) }, [preferences])
  const update = (key, value) => setPreferences(current => ({ ...current, [key]: value }))
  return <PreferencesContext.Provider value={{ preferences, update }}>{children}</PreferencesContext.Provider>
}

export const usePreferences = () => useContext(PreferencesContext)
