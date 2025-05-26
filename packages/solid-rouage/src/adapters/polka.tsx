import type { IncomingMessage } from 'node:http'
import color from 'picocolors'
import type { Middleware, Polka } from 'polka'
import { handleRendering } from '../features/rendering/handle-rendering.jsx'
import { handleStaticFile } from '../features/serve-static/handle-static-file.js'
import { handleServerFunction } from '../features/server-function/handle-serve-function.js'
import type { AdapterServeExport } from '../helpers/shared-types.js'

export const solidPolka = (): Middleware<IncomingMessage> => async (req, res) => {
  const pathName = req.path
  const acceptEncoding = req.headers['accept-encoding'] || ''

  if (pathName.startsWith('/_server/')) {
    const serverFunctionResult = await handleServerFunction({ pathName })
    if (serverFunctionResult?.content) {
      res.setHeaders(new Headers(serverFunctionResult.headers))
      res.statusCode = serverFunctionResult.status
      res.end(serverFunctionResult.content)
      return
    }
  }

  if (!import.meta.env.DEV) {
    const staticFileResult = await handleStaticFile({
      pathName,
      acceptEncoding,
    })
    if (staticFileResult?.content) {
      res.setHeaders(new Headers(staticFileResult.headers))
      res.statusCode = staticFileResult.status
      res.end(staticFileResult.content)
      return
    }
  }

  const renderingResult = await handleRendering({ pathName })
  res.setHeaders(new Headers(renderingResult.headers))
  res.statusCode = renderingResult.status
  res.end(renderingResult.content)
}

export const servePolka = (app: Polka): AdapterServeExport => {
  if (import.meta.env.DEV) {
    // @ts-expect-error
    return { type: 'node', handler: (req, res) => app.handler(req, res) }
  }

  const port = Number(process.env.PORT) || 3000

  app.listen(port, () => {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.info(`${color.green('➜ Listening on:')} ${color.cyan(`http://localhost:${port}`)}`)
  })
}
