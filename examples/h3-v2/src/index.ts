import { rouage } from '@rouage/core/server'
import { H3 } from 'h3-nightly'

const server = new H3()

server.get('/health', () => new Response('OK'))

server.all('/**', rouage())

// biome-ignore lint/style/noDefaultExport: <explanation>
export default server
