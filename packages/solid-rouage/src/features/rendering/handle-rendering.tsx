import { generateHydrationScript, getAssets, renderToStringAsync } from 'solid-js/web'

// @ts-expect-error
import App from 'virtual:app_tsx'

export const handlerRendering = async (options: { pathName: string }) => {
  const content = await renderToStringAsync(() => <App path={options.pathName} />)
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

  const htmlContent = [
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

  const responseHeaders = new Headers()
  responseHeaders.set('Content-Type', 'text/html')

  return { headers: responseHeaders, content: htmlContent }
}
