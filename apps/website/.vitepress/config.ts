import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import llmstxt from 'vitepress-plugin-llms'

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  lang: 'en-US',
  title: 'Granite',
  titleTemplate: 'Granite - :title',
  description: 'Minimal SSR for SolidJS',
  head: [['link', { rel: 'icon', href: '/granite-logo.svg' }]],
  outDir: 'build',
  cleanUrls: true,
  themeConfig: {
    logo: '/granite-logo.svg',
    socialLinks: [{ icon: 'github', link: 'https://github.com/granite-dev/granite' }],
    editLink: {
      pattern: 'https://github.com/granite-dev/granite/blob/main/apps/website/:path',
      text: 'Edit on GitHub',
    },
    nav: [
      { text: 'Docs', link: '/docs/getting-started', activeMatch: '/docs/' },
      { text: 'Examples', link: 'https://github.com/granite-dev/granite/tree/examples' },
      { text: 'Discussions', link: 'https://github.com/granite-dev/granite/discussions' },
    ],
    sidebar: {
      '/docs/': [
        {
          text: 'Getting Started',
          link: '/docs/getting-started',
        },
      ],
    },
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
