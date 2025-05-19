import { H3 } from 'h3-nightly'
import { rouageH3 } from 'solid-rouage/server'

const server = new H3()

server.get('/health', () => new Response('OK'))

server.all('/**', rouageH3())

export default server
