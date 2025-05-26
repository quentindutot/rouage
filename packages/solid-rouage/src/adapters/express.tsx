import type { Express, RequestHandler } from 'express'
import color from 'picocolors'
import { handleRendering } from '../features/rendering/handle-rendering.jsx'
import { handleStaticFile } from '../features/serve-static/handle-static-file.js'
import { handleServerFunction } from '../features/server-function/handle-serve-function.js'
import type { AdapterServeExport } from '../helpers/shared-types.js'

export const solidExpress = (): RequestHandler => async (req, res) => {
  const pathName = req.path
  const acceptEncoding = req.get('Accept-Encoding') || ''

  if (pathName.startsWith('/_server/')) {
    const serverFunctionResult = await handleServerFunction({ pathName })
    if (serverFunctionResult?.content) {
      res.set(serverFunctionResult.headers)
      res.status(serverFunctionResult.status)
      res.send(serverFunctionResult.content)
      return
    }
  }

  if (!import.meta.env.DEV) {
    const staticFileResult = await handleStaticFile({
      pathName,
      acceptEncoding,
    })
    if (staticFileResult?.content) {
      res.set(staticFileResult.headers)
      res.status(staticFileResult.status)
      res.send(staticFileResult.content)
      return
    }
  }

  const renderingResult = await handleRendering({ pathName })
  res.set(renderingResult.headers)
  res.status(renderingResult.status)
  res.send(renderingResult.content)
}

export const serveExpress = (app: Express): AdapterServeExport => {
  if (import.meta.env.DEV) {
    return { type: 'node', handler: (req, res) => app(req, res) }
  }

  const port = process.env.PORT || 3000

  app.listen(port, () => {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.info(`${color.green('➜ Listening on:')} ${color.cyan(`http://localhost:${port}`)}`)
  })
}
