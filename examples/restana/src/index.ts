import restana from 'restana'
import { createAdapter, handleRequest } from 'solid-rouage/node'

const app = restana()

app.get('/health', (_req, res) => {
  res.send('OK')
})

app.all('/*', async (req, res) => {
  const pathName = req.url ?? ''
  const acceptEncoding = req.headers['accept-encoding'] || ''

  const response = await handleRequest({ pathName, acceptEncoding })
  res.send(response.content, response.status, response.headers)
})

export default createAdapter({
  handle: (req, res) => app.handle(req, res),
  listen: () => {
    const port = Number(process.env.PORT) || 3000

    app.start(port)

    console.info(`➜ Listening on: http://localhost:${port}`)
  },
})
