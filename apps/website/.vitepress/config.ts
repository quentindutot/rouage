import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import llmstxt from 'vitepress-plugin-llms'

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  lang: 'en-US',
  title: 'Granite',
  titleTemplate: ':title - Granite',
  description: 'Minimal SSR for SolidJS',
  head: [['link', { rel: 'icon', href: '/granite-logo.svg' }]],
  srcDir: 'src',
  outDir: 'build',
  cleanUrls: true,
  themeConfig: {
    logo: '/granite-logo.svg',
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/granite-dev/granite' }],
    editLink: {
      pattern: 'https://github.com/granite-dev/granite/blob/main/apps/website/:path',
      text: 'Edit on GitHub',
    },
    nav: [
      { text: 'Examples', link: 'https://github.com/granite-dev/granite/tree/examples' },
      { text: 'Discussions', link: 'https://github.com/granite-dev/granite/discussions' },
    ],
    sidebar: [
      {
        text: '',
        items: [
          {
            text: 'Introduction',
            link: '/introduction',
          },
          {
            text: 'Quick Start',
          },
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
        text: 'Integrations',
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
          {
            text: 'Express',
          },
          {
            text: 'Fastify',
          },
          {
            text: 'Koa',
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
