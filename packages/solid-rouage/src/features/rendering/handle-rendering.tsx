import { generateHydrationScript, getAssets, renderToStringAsync } from 'solid-js/web'
import { createPageContext } from '../../components/app-context.jsx'
import { dedupeHeadTags, stringHtmlAttributes } from '../../helpers/html-helpers.js'

// @ts-expect-error
import { App } from 'virtual:app'

export const handlerRendering = async (options: { pathName: string }) => {
  const pageContext = createPageContext()

  const renderedContent = await renderToStringAsync(() => (
    <App initialPath={options.pathName} pageContext={pageContext} />
  ))

  const renderedAssets = getAssets().split('/chunks/').join('/assets/')
  const dedupedAssets = dedupeHeadTags(renderedAssets) // https://github.com/solidjs/solid/discussions/2294

  const responseStatus = pageContext.status
  const responseHeaders = new Headers({
    'Content-Type': 'text/html',
    ...pageContext.headers,
  })

  const [htmlAttributes, headAttributes, bodyAttributes] = ['html', 'head', 'body'].map((tag) => {
    const attributes = stringHtmlAttributes(pageContext.attributes[tag] || {})
    return attributes ? ` ${attributes}` : ''
  })

  let dynamicScripts = ''
  if (import.meta.env.DEV) {
    dynamicScripts = [
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

    dynamicScripts = [generateHydrationScript(), `<script type="module" src="/${manifestEntry.file}"></script>`].join(
      '',
    )
  }

  const htmlContent = [
    '<!DOCTYPE html>',
    `<html${htmlAttributes}>`,
    `<head${headAttributes}>`,
    dedupedAssets,
    dynamicScripts,
    '</head>',
    `<body${bodyAttributes}>`,
    renderedContent,
    '</body>',
    '</html>',
  ].join('')

  return { status: responseStatus, headers: responseHeaders, content: htmlContent }
}
