import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  // Em produção, a VITE_API_URL é injetada pelo Render; em dev usa proxy local.
  server: {
    proxy: mode === 'development' ? {
      '/api': {
        target: process.env.VITE_API_URL ?? 'http://localhost:5044',
        changeOrigin: true,
      }
    } : undefined
  }
}))
