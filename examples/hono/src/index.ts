import { Hono } from 'hono'
import { serveHono, solidHono } from 'solid-rouage/server'

const app = new Hono()

app.get('/health', (context) => context.text('OK'))

app.all('*', solidHono())

export default serveHono(app)
