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
      Object.entries(serverFunctionResult.headers).forEach(([key, value]) => {
        res.setHeader(key, value)
      })
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
      Object.entries(staticFileResult.headers).forEach(([key, value]) => {
        res.setHeader(key, value)
      })
      res.status(staticFileResult.status)
      res.send(staticFileResult.content)
      return
    }
  }

  const renderingResult = await handlerRendering({ pathName })
  Object.entries(renderingResult.headers).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
  res.status(renderingResult.status)
  res.send(renderingResult.content)
}
