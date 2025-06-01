import type { App, Handler } from '@tinyhttp/app'
import color from 'picocolors'
import { handleRendering } from '../features/rendering/handle-rendering.jsx'
import { handleStaticFile } from '../features/serve-static/handle-static-file.js'
import type { AdapterServeExport } from '../helpers/shared-types.js'

export const solidTinyHttp = (): Handler => async (req, res) => {
  const pathName = req.path
  const acceptEncoding = [req.get('accept-encoding') ?? ''].flat().join(',')

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

export const serveTinyHttp = (app: App): AdapterServeExport => {
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
