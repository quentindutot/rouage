import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import llmstxt from 'vitepress-plugin-llms'

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  lang: 'en-US',
  title: 'Rouage',
  titleTemplate: ':title - Rouage',
  description: 'Minimal SSR for SolidJS',
  head: [['link', { rel: 'icon', href: '/rouage-logo.svg' }]],
  srcDir: 'src',
  outDir: 'build',
  cleanUrls: true,
  themeConfig: {
    logo: '/rouage-logo.svg',
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/quentindutot/rouage' }],
    editLink: {
      pattern: 'https://github.com/quentindutot/rouage/blob/main/docs/:path',
      text: 'Edit on GitHub',
    },
    nav: [
      { text: 'Examples', link: 'https://github.com/quentindutot/rouage/tree/main/examples' },
      { text: 'Discussions', link: 'https://github.com/quentindutot/rouage/discussions' },
    ],
    sidebar: [
      {
        text: '',
        items: [
          {
            text: 'Introduction',
            link: '/introduction',
          },
          // {
          //   text: 'Quick Start',
          // },
        ],
      },
      {
        text: 'Concepts',
        items: [
          {
            text: 'Metas',
          },
          {
            text: 'Routing',
          },
          // {
          //   text: 'Data Fetching',
          // },
          // {
          //   text: 'Server Functions',
          // },
        ],
      },
      {
        text: 'Servers',
        items: [
          {
            text: 'H3 (v2)',
          },
          {
            text: 'Hono',
          },
          {
            text: 'Elysia',
          },
        ],
      },
      {
        text: 'Runtimes',
        items: [
          {
            text: 'Node',
          },
          {
            text: 'Bun',
          },
          {
            text: 'Deno',
          },
        ],
      },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 - present',
    },
  },
  markdown: {
    config(markdown) {
      markdown.use(groupIconMdPlugin)
    },
  },
  vite: {
    plugins: [llmstxt(), groupIconVitePlugin()],
  },
})
