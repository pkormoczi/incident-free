import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // GitHub Pages serves this as a project site under /incident-free/ — only
  // apply that base in production builds so `npm run dev` stays at the root.
  base: mode === 'production' ? '/incident-free/' : '/',
  plugins: [react()],
}))
