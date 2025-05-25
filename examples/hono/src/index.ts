import { Hono } from 'hono'
import { rouageHono } from 'solid-rouage/server'

const app = new Hono()

app.get('/health', (context) => context.text('OK'))

app.all('*', rouageHono())

export default app
