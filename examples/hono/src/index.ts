import { rouageHono } from '@rouage/core/server'
import { Hono } from 'hono'

const server = new Hono()

server.get('/health', (context) => context.text('OK'))

server.all('*', rouageHono())

// biome-ignore lint/style/noDefaultExport: <explanation>
export default server
