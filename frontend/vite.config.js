import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/aadhar': {
        target: 'https://aadhar-parser-api.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/aadhar/, '/api/v1/aadhaar')
      },
      '/api/donors': {
        target: 'https://blood-compatibility-model.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/donors/, '/get_donors')
      }
    }
  }
})
