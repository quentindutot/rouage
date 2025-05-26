import polka from 'polka'
import { servePolka, solidPolka } from 'solid-rouage/server'

const app = polka()

app.get('/health', (_req, res) => {
  res.end('OK')
})

app.all('*', solidPolka())

export default servePolka(app)
