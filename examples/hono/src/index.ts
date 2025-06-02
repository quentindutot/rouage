import { Hono } from 'hono'
import { createAdapter, handleRequest } from 'solid-rouage/fetch'
import { serve } from 'srvx'

const app = new Hono()

app.get('/health', (context) => context.text('OK'))

app.all('*', async (context) => {
  const pathName = context.req.path
  const acceptEncoding = context.req.header('Accept-Encoding') || ''

  const response = await handleRequest({ pathName, acceptEncoding })
  return response
})

export default createAdapter({
  handle: (request) => app.fetch(request),
  listen: () => serve(app),
})
