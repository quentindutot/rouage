import { resolve } from 'node:path'
import type { EventHandler } from 'h3-nightly'
import { generateHydrationScript, getAssets, renderToStringAsync } from 'solid-js/web'
import { serveStatic } from './helpers/serve-static.js'

// @ts-expect-error
import App from 'virtual:app_tsx'

export const rouage: EventHandler = async (event) => {
  const path = event.url.pathname

  if (!import.meta.env.DEV) {
    const fileResponse = await serveStatic({
      root: resolve('build/public'),
      event,
    })
    if (fileResponse) {
      return fileResponse
    }
  }

  const datum: Record<string, string> = {}

  const fetch = globalThis.fetch
  globalThis.fetch = async (...args) => {
    const response = await fetch(...args)

    if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
      datum[response.url] = await response.clone().json()
    }

    return response
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

  // Serialize datum to be used on client side
  const serializedDatum = JSON.stringify(datum)
  const datumScript = `<script>window.__INITIAL_DATA__ = ${serializedDatum.replace(/</g, '\\u003c')};</script>`

  const html = [
    '<!DOCTYPE html>',
    '<html><head>',
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="initial-scale=1.0, width=device-width" />',
    datumScript,
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

// works fine for Deno, Bun, and Node.js v22.3.0+ or v20.16.0+
// biome-ignore lint/performance/noBarrelFile: <explanation>
export { serve } from 'srvx'
