import restana from 'restana'
import { serveRestana, solidRestana } from 'solid-rouage/server'

const app = restana()

app.get('/health', (_req, res) => {
  res.send('OK')
})

app.all('/', solidRestana())

export default serveRestana(app)
