import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import llmstxt from 'vitepress-plugin-llms'

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  lang: 'en-US',
  title: 'Rouage',
  titleTemplate: ':title - Rouage',
  description: 'Minimal Solid SSR',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/rouage.svg' }],
    ['meta', { property: 'og:url', content: 'https://rouage.dev' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Minimal Solid SSR - Rouage' }],
    ['meta', { property: 'og:description', content: 'Minimal Solid SSR' }],
    ['meta', { property: 'og:image', content: '/og-image.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: '/og-image.png' }],
  ],
  sitemap: {
    hostname: 'https://rouage.dev',
  },
  srcDir: 'src',
  outDir: 'build',
  cleanUrls: true,
  themeConfig: {
    logo: '/rouage.svg',
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
          {
            text: 'Project Structure',
            link: '/project-structure',
          },
        ],
      },
      {
        text: 'Concepts',
        items: [
          {
            text: 'Routing',
            link: '/concepts/routing',
          },
          {
            text: 'Page Metas',
            link: '/concepts/page-metas',
          },
          // {
          //   text: 'Server Functions',
          //   link: '/concepts/server-functions',
          // },
          {
            text: 'Deployment',
            link: '/concepts/deployment',
          },
        ],
      },
      {
        text: 'Examples',
        items: [
          {
            text: 'H3',
            link: 'https://github.com/quentindutot/rouage/tree/main/examples/h3',
          },
          {
            text: 'Hono',
            link: 'https://github.com/quentindutot/rouage/tree/main/examples/hono',
          },
          {
            text: 'Elysia',
            link: 'https://github.com/quentindutot/rouage/tree/main/examples/elysia',
          },
          {
            text: 'Express',
            link: 'https://github.com/quentindutot/rouage/tree/main/examples/express',
          },
          {
            text: 'Koa',
            link: 'https://github.com/quentindutot/rouage/tree/main/examples/koa',
          },
          {
            text: 'TinyHttp',
            link: 'https://github.com/quentindutot/rouage/tree/main/examples/tinyhttp',
          },
          {
            text: 'Restana',
            link: 'https://github.com/quentindutot/rouage/tree/main/examples/restana',
          },
          {
            text: 'Polka',
            link: 'https://github.com/quentindutot/rouage/tree/main/examples/polka',
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
