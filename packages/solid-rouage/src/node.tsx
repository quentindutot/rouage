import { handleRendering } from './features/rendering/handle-rendering.jsx'
import { handleStaticFile } from './features/serve-static/handle-static-file.js'
import type { AdapterServeExport, MaybePromise } from './helpers/shared-types.js'

export const handleRequest = async (options: { pathName: string; acceptEncoding: string }) => {
  const staticFileResult = await handleStaticFile({
    pathName: options.pathName,
    acceptEncoding: options.acceptEncoding,
  })
  if (staticFileResult) {
    return staticFileResult
  }

  const renderingResult = await handleRendering({ pathName: options.pathName })
  if (renderingResult) {
    return renderingResult
  }

  throw new Error('Not found routes should be handled by app rendering')
}

export const createAdapter = (options: {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  handle: (req: any, res: any, next: any) => MaybePromise<void>
  listen: CallableFunction
}) => {
  if (import.meta.env.DEV) {
    // @ts-expect-error
    return { type: 'node', handle: options.handle } satisfies AdapterServeExport
  }

  options.listen()
}
