import path from 'node:path'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import tokyoNightLight from './src/themes/tokyo-night-light.mjs'

export default defineConfig({
  integrations: [react(), mdx()],
  markdown: {
    shikiConfig: {
      themes: { light: tokyoNightLight, dark: 'tokyo-night' },
      defaultColor: false,
    },
  },
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