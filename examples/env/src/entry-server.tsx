/* @refresh reload */

import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { H3, serveStatic } from 'h3-nightly'
import { generateHydrationScript, getAssets, renderToStringAsync } from 'solid-js/web'
import { App } from './app'
import { rpcHandler } from './orpc/server'

const server = new H3({
  onError(error) {
    console.error(error)
  },
})

if (!import.meta.env.DEV) {
  server.use('/assets/**', (event) =>
    serveStatic(event, {
      getMeta: async (id) => {
        // biome-ignore lint/suspicious/noEmptyBlockStatements: <explanation>
        const stats = await stat(join('build', id)).catch(() => {})
        if (stats?.isFile()) {
          return { size: stats.size, mtime: stats.mtimeMs }
        }
      },
      getContents: (id) => {
        return readFile(join('build', id))
      },
    }),
  )
}

server.use('/rpc/**', async (event) => {
  const { matched, response } = await rpcHandler.handle(event.req, {
    prefix: '/rpc',
  })
  return matched ? response : new Response('Not found', { status: 404 })
})

server.get('/*', async (event) => {
  const path = event.url.pathname

  const content = await renderToStringAsync(() => <App path={path} />)
  const assets = getAssets()
  let scripts = ''

  if (import.meta.env.DEV) {
    scripts = [
      generateHydrationScript(),
      `<script type="module" src="/@vite/client"></script>`,
      `<script type="module" src="/src/entry-client.tsx"></script>`,
    ].join('')
  } else {
    // @ts-ignore
    const manifestModule = await import('../build/.vite/manifest.json')
    const manifestEntries = manifestModule.default
    const manifestEntry = manifestEntries['src/entry-client.tsx']

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
})

server.get('/health', () => new Response('OK'))

// biome-ignore lint/style/noDefaultExport: <explanation>
export default server
