import { rouage } from '@rouage/core/server'
import { H3 } from 'h3-nightly'
import { getServerFunction } from './sfn'

const server = new H3()

server.get('/health', () => new Response('OK'))

server.all('/**', rouage({ getServerFunction }))

// biome-ignore lint/style/noDefaultExport: <explanation>
export default server
