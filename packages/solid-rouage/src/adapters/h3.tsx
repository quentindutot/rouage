import type { EventHandler, H3 } from 'h3-nightly'
import color from 'picocolors'
import { serve } from 'srvx'
import { handleRendering } from '../features/rendering/handle-rendering.jsx'
import { handleStaticFile } from '../features/serve-static/handle-static-file.js'
import type { AdapterServeExport } from '../helpers/shared-types.js'

export const solidH3 = (): EventHandler => async (event) => {
  const pathName = event.url.pathname
  const acceptEncoding = event.req.headers.get('Accept-Encoding') || ''

  const staticFileResult = await handleStaticFile({ pathName, acceptEncoding })
  if (staticFileResult?.content) {
    return new Response(staticFileResult.content, {
      status: staticFileResult.status,
      headers: staticFileResult.headers,
    })
  }

  const renderingResult = await handleRendering({ pathName })
  return new Response(renderingResult.content, {
    status: renderingResult.status,
    headers: renderingResult.headers,
  })
}

export const serveH3 = (app: H3): AdapterServeExport => {
  if (import.meta.env.DEV) {
    return { type: 'fetch', handler: (request) => app.fetch(request) }
  }

  const port = Number(process.env.PORT) || 3000

  serve({ port, fetch: (request) => app.fetch(request), silent: true })

  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.info(`${color.green('➜ Listening on:')} ${color.cyan(`http://localhost:${port}`)}`)
}
