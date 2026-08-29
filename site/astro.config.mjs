import path from 'node:path'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
  integrations: [react(), mdx()],
  vite: {
    plugins: [tailwindcss()],
    resolve:
      process.env.NODE_ENV !== 'production'
        ? {
            alias: {
              'react-touch-drag-slider': path.resolve(
                import.meta.dirname,
                '../src/lib/index.ts'
              ),
            },
          }
        : undefined,
  },
})