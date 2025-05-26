import { App } from '@tinyhttp/app'
import { serveTinyHttp, solidTinyHttp } from 'solid-rouage/server'

const app = new App()

app
  .get('/health', (_req, res) => {
    res.send('OK')
  })
  .all('*', solidTinyHttp())

export default serveTinyHttp(app)
