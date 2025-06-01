import color from 'picocolors'
import type { Protocol, RequestHandler, Service } from 'restana'
import { handleRendering } from '../features/rendering/handle-rendering.jsx'
import { handleStaticFile } from '../features/serve-static/handle-static-file.js'
import type { AdapterServeExport } from '../helpers/shared-types.js'

export const solidRestana = (): RequestHandler<Protocol.HTTP> => async (req, res) => {
  const pathName = req.url ?? ''
  const acceptEncoding = req.headers['accept-encoding'] || ''

  if (!import.meta.env.DEV) {
    const staticFileResult = await handleStaticFile({
      pathName,
      acceptEncoding,
    })
    if (staticFileResult?.content) {
      res.send(staticFileResult.content, staticFileResult.status, staticFileResult.headers)
      return
    }
  }

  const renderingResult = await handleRendering({ pathName })
  res.send(renderingResult.content, renderingResult.status, renderingResult.headers)
}

export const serveRestana = (app: Service<Protocol.HTTP>): AdapterServeExport => {
  if (import.meta.env.DEV) {
    // @ts-expect-error
    return { type: 'node', handler: (req, res) => app.handle(req, res) }
  }

  const port = Number(process.env.PORT) || 3000

  app.start(port)

  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.info(`${color.green('➜ Listening on:')} ${color.cyan(`http://localhost:${port}`)}`)
}
