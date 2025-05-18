import { rouageHono } from '@rouage/core/server'
import { Hono } from 'hono'

const server = new Hono()

server.get('/health', (context) => context.text('OK'))

server.all('*', rouageHono())

export default server
