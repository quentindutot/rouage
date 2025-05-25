import express from 'express'
import { rouageExpress } from 'solid-rouage/server'

const server = express()

server.get('/health', (_req, res) => {
  res.send('OK')
})

server.all('/{*path}', rouageExpress())

export default server
