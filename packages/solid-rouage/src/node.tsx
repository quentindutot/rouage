import { handleRendering } from './features/rendering/handle-rendering.jsx'
import { handleStaticFile } from './features/serve-static/handle-static-file.js'
import type { AdapterServeExport, MaybePromise } from './helpers/shared-types.js'
import type { IncomingMessage, ServerResponse } from 'node:http'

export const handleRequest = async (options: { pathName: string; acceptEncoding: string }) => {
  const staticFileResult = await handleStaticFile({
    pathName: options.pathName,
    acceptEncoding: options.acceptEncoding,
  })
  if (staticFileResult) {
    return new Response(staticFileResult.content, {
      status: staticFileResult.status,
      headers: staticFileResult.headers,
    })
  }

  const renderingResult = await handleRendering({ pathName: options.pathName })
  if (renderingResult) {
    return new Response(renderingResult.content, {
      status: renderingResult.status,
      headers: renderingResult.headers,
    })
  }

  throw new Error('Not found routes should be handled by app rendering')
}

export const createAdapter = (options: {
  handle: (req: IncomingMessage, res: ServerResponse) => MaybePromise<void>
  listen: CallableFunction
}) => {
  if (import.meta.env.DEV) {
    return { type: 'node', handle: options.handle } satisfies AdapterServeExport
  }

  options.listen()
}
