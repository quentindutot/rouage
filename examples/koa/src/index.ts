import KoaRouter from '@koa/router'
import Koa from 'koa'
import { createAdapter, handleRequest } from 'solid-rouage/node'

const app = new Koa()
const router = new KoaRouter()

router.get('/health', (context) => {
  context.body = 'OK'
})

router.all('(.*)', async (context) => {
  const pathName = context.path
  const acceptEncoding = context.headers['accept-encoding'] || ''

  const response = await handleRequest({ pathName, acceptEncoding })
  context.set(response.headers)
  context.status = response.status
  context.body = response.content
})

app.use(router.routes()).use(router.allowedMethods())

export default createAdapter({
  handle: (req, res) => app.callback()(req, res),
  listen: () => {
    const port = Number(process.env.PORT) || 3000

    app.listen({ port }, () => {
      console.info(`➜ Listening on: http://localhost:${port}`)
    })
  },
})
