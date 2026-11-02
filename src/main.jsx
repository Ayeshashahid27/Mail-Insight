import { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PreferencesProvider } from './hooks/usePreferences'
import { ToastProvider } from './components/ui/Toast'
import { AppShell } from './components/layout/AppShell'
import './styles/global.css'

const Overview = lazy(() => import('./pages/Overview').then(module => ({ default: module.Overview })))
const Insights = lazy(() => import('./pages/Insights').then(module => ({ default: module.Insights })))
const Analytics = lazy(() => import('./pages/Analytics').then(module => ({ default: module.Analytics })))
const Reports = lazy(() => import('./pages/Reports').then(module => ({ default: module.Reports })))
const SettingsPage = lazy(() => import('./pages/Settings').then(module => ({ default: module.SettingsPage })))

const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } })

createRoot(document.getElementById('root')).render(<QueryClientProvider client={queryClient}><PreferencesProvider><ToastProvider><BrowserRouter><Suspense fallback={<div className="route-loading">Loading MailSense…</div>}><Routes><Route element={<AppShell />}><Route index element={<Overview />} /><Route path="insights" element={<Insights />} /><Route path="analytics" element={<Analytics />} /><Route path="reports" element={<Reports />} /><Route path="settings" element={<SettingsPage />} /></Route></Routes></Suspense></BrowserRouter></ToastProvider></PreferencesProvider></QueryClientProvider>)
