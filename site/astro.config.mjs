import path from 'node:path'
import { unified } from '@astrojs/markdown-remark'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import icon from 'astro-icon'
import { defineConfig } from 'astro/config'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import tokyoNightLight from './src/themes/tokyo-night-light.mjs'

export default defineConfig({
  integrations: [react(), mdx(), icon()],
  markdown: {
    processor: unified({
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            properties: {
              className: ['anchor'],
              'aria-label': 'Link to this section',
              tabIndex: -1,
            },
          },
        ],
      ],
    }),
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