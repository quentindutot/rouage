import express from 'express'
import { serveExpress, solidExpress } from 'solid-rouage/server'

const app = express()

app.get('/health', (_req, res) => {
  res.send('OK')
})

app.all('/{*path}', solidExpress())

export default serveExpress(app)
