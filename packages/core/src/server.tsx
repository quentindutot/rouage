import { resolve } from 'node:path'
import type { EventHandler } from 'h3-nightly'
import { generateHydrationScript, getAssets, renderToStringAsync } from 'solid-js/web'
import { serveStatic } from './helpers/serve-static/serve-static.js'

// @ts-expect-error
import App from 'virtual:app_tsx'

export const rouage =
  (options: { getServerFunction: (identifier: string) => unknown }): EventHandler =>
  async (event) => {
    const path = event.url.pathname

    if (path.startsWith('/_server/')) {
      const sfnId = path.replace('/_server/', '')
      const handler = options.getServerFunction(sfnId)
      if (handler) {
        return handler(event)
      }
    }

    if (!import.meta.env.DEV) {
      const fileResponse = await serveStatic({
        root: resolve('build/public'),
        event,
      })
      if (fileResponse) {
        return fileResponse
      }
    }

    const content = await renderToStringAsync(() => <App path={path} />)
    const assets = getAssets().split('/chunks/').join('/assets/')
    let scripts = ''

    if (import.meta.env.DEV) {
      scripts = [
        generateHydrationScript(),
        `<script type="module" src="/@vite/client"></script>`,
        `<script type="module" src="/@id/virtual:entry-client"></script>`,
      ].join('')
    } else {
      // @ts-ignore
      const manifestModule = await import('virtual:manifest')
      const manifestEntries = manifestModule.default
      // @ts-ignore
      const manifestEntry = manifestEntries['src/virtual:entry-client.tsx']

      scripts = [generateHydrationScript(), `<script type="module" src="/${manifestEntry.file}"></script>`].join('')
    }

    const html = [
      '<!DOCTYPE html>',
      '<html><head>',
      '<meta charset="utf-8" />',
      '<meta name="viewport" content="initial-scale=1.0, width=device-width" />',
      scripts,
      assets,
      '</head><body>',
      content,
      '</body></html>',
    ].join('')

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    })
  }
