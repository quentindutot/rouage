import { generateHydrationScript, getAssets, renderToStringAsync } from 'solid-js/web'
import { createPageContext } from '../../components/app-context.jsx'
import { dedupeHeadTags, stringHtmlAttributes } from '../../helpers/html-helpers.js'
import type { FeatureHandleReturn } from '../../helpers/shared-types.js'

// @ts-expect-error
import { App } from 'virtual:app'

export const handleRendering = async (options: { pathName: string }): Promise<FeatureHandleReturn<string>> => {
  const pageContext = createPageContext()

  const renderedContent = await renderToStringAsync(() => (
    <App initialPath={options.pathName} pageContext={pageContext} />
  ))

  const renderedAssets = getAssets()
  const dedupedAssets = dedupeHeadTags(renderedAssets) // https://github.com/solidjs/solid/discussions/2294

  const responseStatus = pageContext.status
  const responseHeaders: Record<string, string> = { ...pageContext.headers, 'Content-Type': 'text/html' }

  const [htmlAttributes, headAttributes, bodyAttributes] = ['html', 'head', 'body'].map((tag) => {
    const attributes = stringHtmlAttributes(pageContext.attributes[tag] || {})
    return attributes ? ` ${attributes}` : ''
  })

  const dynamicScripts = import.meta.env.DEV
    ? [
        generateHydrationScript(),
        `<script type="module" src="/@vite/client"></script>`,
        `<script type="module" src="/@id/virtual:entry-client"></script>`,
      ].join('')
    : [generateHydrationScript(), `<script type="module" src="/__ENTRY_CLIENT_ASSET__"></script>`].join('')

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
