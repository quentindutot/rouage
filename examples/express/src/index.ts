import express from 'express'

const server = express()

server.get('/health', (_req, res) => {
  res.send('OK')
})

// server.all('*', rouage())

// biome-ignore lint/style/noDefaultExport: <explanation>
export default {
  fetch: (_request: Request) => {
    return new Response('OK')
  },
}
