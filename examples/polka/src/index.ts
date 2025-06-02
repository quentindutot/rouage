import polka from 'polka'
import { createAdapter, handleRequest } from 'solid-rouage/node'

const app = polka()

app.get('/health', (_req, res) => {
  res.end('OK')
})

app.all('*', async (req, res) => {
  const pathName = req.path
  const acceptEncoding = req.headers['accept-encoding'] || ''

  const response = await handleRequest({ pathName, acceptEncoding })
  res.setHeaders(new Headers(response.headers))
  res.statusCode = response.status
  res.end(response.content)
})

export default createAdapter({
  handle: (req, res, next) => app.handler(req, res, next),
  listen: () => {
    const port = Number(process.env.PORT) || 3000

    app.listen(port, () => {
      console.info(`➜ Listening on: http://localhost:${port}`)
    })
  },
})
