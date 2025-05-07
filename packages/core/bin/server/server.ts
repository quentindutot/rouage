import { connectToWeb } from '@universal-middleware/express'
import { H3, serve } from 'h3-nightly'
import { createServer as createViteServer, isRunnableDevEnvironment } from 'vite'

export const createServer = async () => {
  const server = new H3()

  const vite = await createViteServer({
    appType: 'custom',
    server: {
      middlewareMode: true,
    },
  })

  console.log('vite', Object.keys(vite.environments))

  const { serverRender } = await (async () => {
    if (!isRunnableDevEnvironment(vite.environments.ssr)) {
      throw new Error('SSR environment is not runnable')
    }

    const serverEntry = await vite.environments.ssr.runner.import('/src/entry-server.ts')
    if (!serverEntry) {
      throw new Error('Server entry is not defined')
    }
    if (!serverEntry.render) {
      throw new Error('Render function is not defined')
    }

    return {
      serverEnvironment: vite.environments.ssr,
      serverRender: serverEntry.render,
    }
  })()

  server.use(async (event) => {
    try {
      const handler = connectToWeb(vite.middlewares)
      const response = await handler(event.req)
      console.log('vite middleware response', response)
      return response
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error(error)
    }
  })

  server.all('*', async (event) => {
    console.log('handler', event.url)
    try {
      const html = await serverRender(event.url)

      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      })
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error(error)
    }
  })

  serve(server, { port: 5173 })
}

// biome-ignore lint/suspicious/useAwait: <explanation>
const render = async (_url: string) => {
  return `<html>
    <body>
      <h1>Hello from ssr</h1>
      <script type="module" src="http://localhost:5173/@vite/client"></script>
       <script type="module" src="http://localhost:5173/src/entry-client.ts"></script>
    </body>
  </html>
  `
}
