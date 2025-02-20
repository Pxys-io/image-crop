import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      'https://year-book-back.replit.app/*': { // Proxy all requests
        target: 'https://year-book-back.replit.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\//, ''), // Remove the leading slash
        proxyTimeout: 10000, // Add proxy timeout
        timeout: 10000,      // Add timeout
      },
    },
  },
})

