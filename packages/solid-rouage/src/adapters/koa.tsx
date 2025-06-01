import type { Middleware } from 'koa'
import type Koa from 'koa'
import color from 'picocolors'
import { handleRendering } from '../features/rendering/handle-rendering.jsx'
import { handleStaticFile } from '../features/serve-static/handle-static-file.js'
import type { AdapterServeExport } from '../helpers/shared-types.js'

export const solidKoa = (): Middleware => async (context) => {
  const pathName = context.path
  const acceptEncoding = context.headers['accept-encoding'] || ''

  if (!import.meta.env.DEV) {
    const staticFileResult = await handleStaticFile({
      pathName,
      acceptEncoding,
    })
    if (staticFileResult?.content) {
      context.set(staticFileResult.headers)
      context.status = staticFileResult.status
      context.body = staticFileResult.content
      return
    }
  }

  const renderingResult = await handleRendering({ pathName })
  context.set(renderingResult.headers)
  context.status = renderingResult.status
  context.body = renderingResult.content
}

export const serveKoa = (app: Koa): AdapterServeExport => {
  if (import.meta.env.DEV) {
    return {
      type: 'node',
      handler: (req, res) => app.callback()(req, res),
    }
  }

  const port = Number(process.env.PORT) || 3000

  app.listen({ port }, () => {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.info(`${color.green('➜ Listening on:')} ${color.cyan(`http://localhost:${port}`)}`)
  })
}
