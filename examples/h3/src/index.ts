import { H3, serve } from 'h3'
import { createAdapter, handleRequest } from 'solid-rouage/fetch'

const app = new H3()

app.get('/health', () => new Response('OK'))

app.all('/**', async (event) => {
  const pathName = event.url.pathname
  const acceptEncoding = event.req.headers.get('Accept-Encoding') || ''

  const response = await handleRequest({ pathName, acceptEncoding })
  return response
})

export default createAdapter({
  handle: (request) => app.fetch(request),
  listen: () => serve(app),
})
