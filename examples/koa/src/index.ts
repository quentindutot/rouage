import KoaRouter from '@koa/router'
import Koa from 'koa'
import { serveKoa, solidKoa } from 'solid-rouage/server'

const app = new Koa()
const router = new KoaRouter()

router.get('/health', (context) => {
  context.body = 'OK'
})

router.all('(.*)', solidKoa())

app.use(router.routes()).use(router.allowedMethods())

export default serveKoa(app)
