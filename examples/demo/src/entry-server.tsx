/* @refresh reload */

import { createServer } from '@granite/core/server'
import { sharedConfig } from 'solid-js'
import { generateHydrationScript, getAssets, renderToStringAsync } from 'solid-js/web'
import { App } from './app'
import { rpcHandler } from './orpc/server'

const server = createServer()

server.use('/rpc/**', async (event) => {
  const { matched, response } = await rpcHandler.handle(event.req, {
    prefix: '/rpc',
  })
  return matched ? response : new Response('Not found', { status: 404 })
})

server.get('/*', async (event) => {
  const path = event.url.pathname

  const content = await renderToStringAsync(() => <App path={path} />)
  const assets = getAssets().split('/server/').join('/assets/')
  let scripts = ''

  // @ts-expect-error
  const datum = sharedConfig.context?.datum ?? {}
  // @ts-expect-error
  sharedConfig.context.datum = {}

  if (import.meta.env.DEV) {
    scripts = [
      generateHydrationScript(),
      `<script type="module" src="/@vite/client"></script>`,
      `<script type="module" src="/@id/virtual:entry-client"></script>`,
    ].join('')
  } else {
    // @ts-ignore
    const manifestModule = await import('../build/.vite/manifest.json')
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
})

server.get('/health', () => new Response('OK'))

// biome-ignore lint/style/noDefaultExport: <explanation>
export default server
