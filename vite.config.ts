/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'
import dts from 'unplugin-dts/vite'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      exclude: [
        'src/**/*.test.*',
        'src/test-setup.ts',
        'src/App.tsx',
        'src/images.ts',
        'src/main.tsx',
      ],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/lib/index.ts'),
      formats: ['es'],
      fileName: () => 'lib.es.js',
    },
    rolldownOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-dom/client',
      ],
    },
  },
})
