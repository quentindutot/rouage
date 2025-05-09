/* @refresh reload */

import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { H3, serveStatic } from 'h3-nightly'
import { generateHydrationScript, getAssets, renderToStringAsync } from 'solid-js/web'
import { App } from './app'

const server = new H3()

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

server.get('/*', async (event) => {
  const path = event.url.pathname

  const content = await renderToStringAsync(() => <App path={path} />)

  let scripts = ''
  let assets = ''

  if (import.meta.env.DEV) {
    scripts = [
      generateHydrationScript(),
      `<script type="module" src="/@vite/client"></script>`,
      `<script type="module" src="/src/entry-client.tsx"></script>`,
    ].join('')

    assets = getAssets()
  } else {
    // @ts-ignore
    const manifestModule = await import('../build/.vite/manifest.json')
    const manifestEntries = manifestModule.default
    const manifestEntry = manifestEntries['src/entry-client.tsx']

    scripts = [generateHydrationScript(), `<script type="module" src="/${manifestEntry.file}"></script>`].join('')

    assets = getAssets()
    // console.log('pre', assets)
    // for (const [originalPath, manifestPath] of Object.entries(manifestEntries)) {
    //   assets = assets.split(`href="/${originalPath}"`).join(`href="${manifestPath}"`)
    // }
    // @ts-ignore
    // assets += manifestEntry.assets.map((asset) => `<link rel="stylesheet" href="${asset}" />`).join('')
    // console.log('post', assets)
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
