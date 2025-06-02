import express from 'express'
import { createAdapter, handleRequest } from 'solid-rouage/node'

const app = express()

app.get('/health', (_req, res) => {
  res.send('OK')
})

app.all('/{*path}', async (req, res) => {
  const pathName = req.path
  const acceptEncoding = req.get('Accept-Encoding') || ''

  const response = await handleRequest({ pathName, acceptEncoding })
  res.set(response.headers)
  res.status(response.status)
  res.send(response.content)
})

export default createAdapter({
  handle: (req, res) => app(req, res),
  listen: () => {
    const port = Number(process.env.PORT) || 3000

    app.listen(port, () => {
      console.info(`➜ Listening on: http://localhost:${port}`)
    })
  },
})
