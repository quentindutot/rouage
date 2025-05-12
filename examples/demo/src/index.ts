import { rouage } from '@rouage/core/server'
import { H3 } from 'h3-nightly'

const server = new H3()

server.get('/health', () => new Response('OK'))

server.use('/*', rouage)

// biome-ignore lint/style/noDefaultExport: <explanation>
export default server
