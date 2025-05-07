// import { createFetchableDevEnvironment, createServer, isRunnableDevEnvironment } from 'vite'
// import fs from 'node:fs'
// import path from 'node:path'
// import { fileURLToPath } from 'node:url'

// const server = await createServer({
//   appType: 'custom',
//   server: {
//     middlewareMode: true,
//   },
//   environments: {},
// })

// console.log('Hello from demo', Object.keys(server.environments))

import express from 'express'
import { createServer as createViteServer } from 'vite'

const app = express()

const vite = await createViteServer({
  appType: 'custom',
  server: {
    middlewareMode: true,
  },
})

app.use(vite.middlewares)

app.use('*all', (_req, res) => {
  // Since `appType` is `'custom'`, should serve response here.
  // Note: if `appType` is `'spa'` or `'mpa'`, Vite includes middlewares
  // to handle HTML requests and 404s so user middlewares should be added
  // before Vite's middlewares to take effect instead
  res.send('Hello from demo')
})

app.listen(5173)

console.log('Server is running on port 5173')
