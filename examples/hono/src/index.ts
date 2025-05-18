import { rouage } from '@rouage/core/server'
import { Hono } from 'hono'

const server = new Hono()

server.get('/health', (context) => context.text('OK'))

server.all('*', rouage())

// biome-ignore lint/style/noDefaultExport: <explanation>
export default server
