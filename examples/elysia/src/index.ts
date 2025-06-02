import { Elysia } from 'elysia'
import { createAdapter, handleRequest } from 'solid-rouage/fetch'
import { serve } from 'srvx'

const app = new Elysia().get('/health', 'OK').all('*', async ({ request }) => {
  const pathName = new URL(request.url).pathname
  const acceptEncoding = request.headers.get('Accept-Encoding') || ''

  const response = await handleRequest({ pathName, acceptEncoding })
  return response
})

export default createAdapter({
  handle: (request) => app.fetch(request),
  listen: () => serve({ fetch: app.fetch }),
})
