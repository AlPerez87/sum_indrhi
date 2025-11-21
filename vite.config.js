import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Proxy para API routes en desarrollo
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: false,
        // Evitar que intente servir archivos .js como estáticos
        bypass: (req) => {
          // Si la petición es para un archivo .js, no hacer proxy
          if (req.url && req.url.endsWith('.js') && !req.url.startsWith('/api/')) {
            return req.url
          }
        }
      }
    }
  },
  // Optimizar para producción
  build: {
    rollupOptions: {
      external: ['mysql2', 'mysql2/promise']
    },
    // Deshabilitar source maps en desarrollo para evitar problemas
    sourcemap: false
  }
})
