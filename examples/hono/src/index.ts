import { Hono } from 'hono'
import { rouageHono } from 'solid-rouage/server'

const server = new Hono()

server.get('/health', (context) => context.text('OK'))

server.all('*', rouageHono())

export default server
