import express from 'express'
import { rouageExpress } from 'solid-rouage/server'

const app = express()

app.get('/health', (_req, res) => {
  res.send('OK')
})

app.all('/{*path}', rouageExpress())

export default app
