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
      '/api/loyalty': 'http://localhost:8086',
      '/api/tracking': 'http://localhost:8087',
      '/api/favorites': 'http://localhost:8088',
      '/api/analytics': 'http://localhost:8089',
      '/api/mobile': 'http://localhost:8090',
    },
  },
})
