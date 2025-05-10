import { H3 } from 'h3-nightly'
import { granite } from '@granite/core/server'

const server = new H3()

server.get('/health', () => new Response('OK'))

granite({ server })

// biome-ignore lint/style/noDefaultExport: <explanation>
export default server
