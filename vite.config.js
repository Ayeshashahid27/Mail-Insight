import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const target = env.VITE_MAILSENSE_API_URL || 'https://example.invalid/webhook/mailsense-insights'
  const url = new URL(target)
  return { plugins: [react()], server: { proxy: { '/api/insights': { target: url.origin, changeOrigin: true, secure: true, rewrite: () => `${url.pathname}${url.search}` } } } }
})
