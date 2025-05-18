import { resolve } from 'node:path'
import type { EventHandler } from 'h3-nightly'
import { generateHydrationScript, getAssets, renderToStringAsync } from 'solid-js/web'
import { handleStaticFile } from './features/serve-static/handle-static-file.js'
import { handleServerFunction } from './features/server-function/handle-serve-function.js'

// @ts-expect-error
import App from 'virtual:app_tsx'

export const rouage = (): EventHandler => async (event) => {
  const pathName = event.url.pathname
  const acceptEncoding = event.req.headers.get('Accept-Encoding') || ''

  if (pathName.startsWith('/_server/')) {
    const serverFunctionResult = await handleServerFunction({ pathName })
    if (serverFunctionResult?.content) {
      return new Response(serverFunctionResult.content, {
        status: 200,
        headers: serverFunctionResult.headers,
      })
    }
  }

  if (!import.meta.env.DEV) {
    const staticFileResult = await handleStaticFile({
      root: resolve('build/public'),
      pathName,
      acceptEncoding,
    })
    if (staticFileResult?.content) {
      return new Response(staticFileResult.content, {
        status: 200,
        headers: staticFileResult.headers,
      })
    }
  }

  const content = await renderToStringAsync(() => <App path={pathName} />)
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
