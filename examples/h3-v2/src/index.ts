import { H3 } from 'h3-nightly'
import { rouageH3 } from 'solid-rouage/server'

const app = new H3()

app.get('/health', () => new Response('OK'))

app.all('/**', rouageH3())

export default app
