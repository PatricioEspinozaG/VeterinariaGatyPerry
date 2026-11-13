import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const auth = 'http://127.0.0.1:8081'

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api/v1/auth': auth,
      '/api/v1/admin': auth,
      '/api/v1/mascotas': 'http://127.0.0.1:8082',
      '/api/v1/citas': 'http://127.0.0.1:8083',
      '/api/v1/productos': 'http://127.0.0.1:8084',
      '/api/v1/pedidos': 'http://127.0.0.1:8085',
      '/api/v1/clinica': 'http://127.0.0.1:8086',
    },
  },

  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/main.jsx',
        'src/data/**',
        'src/**/*.test.{js,jsx}',
        'src/test/**',
      ],
    },
  },
})