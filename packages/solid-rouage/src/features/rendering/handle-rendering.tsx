import { generateHydrationScript, getAssets, renderToStringAsync } from 'solid-js/web'
import { createMetaContext } from '../../components/metas/meta-context.jsx'
import { stringHtmlAttributes } from '../../utilities/html-attributes.js'

// @ts-expect-error
import App from 'virtual:app_tsx'

export const handlerRendering = async (options: { pathName: string }) => {
  const metaStore = createMetaContext()

  const content = await renderToStringAsync(() => <App path={options.pathName} meta={metaStore} />)

  const assets = getAssets().split('/chunks/').join('/assets/')

  const [htmlAttributes, headAttributes, bodyAttributes] = ['html', 'head', 'body'].map((tag) => {
    const attributes = stringHtmlAttributes(metaStore.attrs[tag] || {})
    return attributes ? ` ${attributes}` : ''
  })

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
    `<html${htmlAttributes}>`,
    `<head${headAttributes}>`,
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="initial-scale=1.0, width=device-width" />',
    assets,
    scripts,
    '</head>',
    `<body${bodyAttributes}>`,
    content,
    '</body>',
    '</html>',
  ].join('')

  const responseHeaders = new Headers()
  responseHeaders.set('Content-Type', 'text/html')

  return { headers: responseHeaders, content: htmlContent }
}
