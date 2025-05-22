import type { EventHandler } from 'h3-nightly'
import { handlerRendering } from '../features/rendering/handle-rendering.jsx'
import { handleStaticFile } from '../features/serve-static/handle-static-file.js'
import { handleServerFunction } from '../features/server-function/handle-serve-function.js'

export const rouageH3 = (): EventHandler => async (event) => {
  const pathName = event.url.pathname
  const acceptEncoding = event.req.headers.get('Accept-Encoding') || ''

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

  const renderingResult = await handlerRendering({ pathName })
  return new Response(renderingResult.content, {
    status: renderingResult.status,
    headers: renderingResult.headers,
  })
}
