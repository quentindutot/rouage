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
        ],
      },
      {
        text: 'Concepts',
        items: [
          {
            text: 'Routing',
          },
          {
            text: 'Page Metas',
          },
          {
            text: 'Server Functions',
          },
          {
            text: 'Deployment',
          },
        ],
      },
      {
        text: 'Examples',
        items: [
          {
            text: 'H3 (v2)',
            link: 'https://github.com/quentindutot/rouage/tree/main/examples/h3-v2',
          },
          {
            text: 'Hono',
            link: 'https://github.com/quentindutot/rouage/tree/main/examples/hono',
          },
          {
            text: 'Elysia',
            link: 'https://github.com/quentindutot/rouage/tree/main/examples/elysia',
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
    // @ts-expect-error
    plugins: [llmstxt(), groupIconVitePlugin()],
  },
})
