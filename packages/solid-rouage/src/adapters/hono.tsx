import type { Handler, Hono } from 'hono'
import color from 'picocolors'
import { serve } from 'srvx'
import { handleRendering } from '../features/rendering/handle-rendering.jsx'
import { handleStaticFile } from '../features/serve-static/handle-static-file.js'
import { handleServerFunction } from '../features/server-function/handle-serve-function.js'
import type { AdapterServeExport } from '../helpers/shared-types.js'

export const solidHono = (): Handler => async (context) => {
  const pathName = new URL(context.req.url).pathname
  const acceptEncoding = context.req.header('Accept-Encoding') || ''

  if (pathName.startsWith('/_server/')) {
    const serverFunctionResult = await handleServerFunction({ pathName })
    if (serverFunctionResult?.content) {
      return new Response(serverFunctionResult.content, {
        status: serverFunctionResult.status,
        headers: serverFunctionResult.headers,
      })
    }
  }

  if (!import.meta.env.DEV) {
    const staticFileResult = await handleStaticFile({
      pathName,
      acceptEncoding,
    })
    if (staticFileResult?.content) {
      return new Response(staticFileResult.content, {
        status: staticFileResult.status,
        headers: staticFileResult.headers,
      })
    }
  }

  const renderingResult = await handleRendering({ pathName })
  return new Response(renderingResult.content, {
    status: renderingResult.status,
    headers: renderingResult.headers,
  })
}

export const serveHono = (app: Hono): AdapterServeExport => {
  if (import.meta.env.DEV) {
    return { type: 'fetch', handler: (request) => app.fetch(request) }
  }

  const port = process.env.PORT || 3000

  serve({ port, fetch: (request) => app.fetch(request), silent: true })

  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.info(`${color.green('➜ Listening on:')} ${color.cyan(`http://localhost:${port}`)}`)
}
