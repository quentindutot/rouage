import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { type EventHandler, serveStatic } from 'h3-nightly'
import { sharedConfig } from 'solid-js'
import { generateHydrationScript, getAssets, renderToStringAsync } from 'solid-js/web'

// @ts-expect-error
import { App } from 'virtual:app'

export const granite: EventHandler = async (event) => {
  const path = event.url.pathname

  if (!import.meta.env.DEV) {
    if (path.startsWith('/assets/')) {
      return serveStatic(event, {
        getMeta: async (id) => {
          // biome-ignore lint/suspicious/noEmptyBlockStatements: <explanation>
          const stats = await stat(join('build', id)).catch(() => {})
          if (stats?.isFile()) {
            return { size: stats.size, mtime: stats.mtimeMs }
          }
        },
        getContents: (id) => readFile(join('build', id)),
      })
    }
  }

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
      `<script type="module" src="/@id/virtual:index"></script>`,
    ].join('')
  } else {
    // @ts-ignore
    const manifestModule = await import('virtual:manifest')
    const manifestEntries = manifestModule.default
    // @ts-ignore
    const manifestEntry = manifestEntries['src/virtual:index.tsx']

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
