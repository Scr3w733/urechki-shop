import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/products': 'http://localhost:8080',
      '/api/customers': 'http://localhost:8081',
      '/api/orders': 'http://localhost:8082',
      '/api/notifications': 'http://localhost:8084',
      '/api/payments': 'http://localhost:8085',
    },
  },
})
