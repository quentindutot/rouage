import { H3 } from 'h3-nightly'
import { serveH3, solidH3 } from 'solid-rouage/server'

const app = new H3()

app.get('/health', () => new Response('OK'))

app.all('/**', solidH3())

export default serveH3(app)
