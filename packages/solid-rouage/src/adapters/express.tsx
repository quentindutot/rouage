import type { RequestHandler } from 'express'
import { handlerRendering } from '../features/rendering/handle-rendering.jsx'
import { handleStaticFile } from '../features/serve-static/handle-static-file.js'
import { handleServerFunction } from '../features/server-function/handle-serve-function.js'

export const rouageExpress = (): RequestHandler => async (req, res) => {
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

  const renderingResult = await handlerRendering({ pathName })
  res.set(renderingResult.headers)
  res.status(renderingResult.status)
  res.send(renderingResult.content)
}
