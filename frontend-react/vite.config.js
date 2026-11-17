import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const auth = 'http://127.0.0.1:8081'

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api/v1': 'http://127.0.0.1:8080',
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