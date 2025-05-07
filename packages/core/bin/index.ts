import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { connectToWeb } from '@universal-middleware/express'
import { H3, serve } from 'h3-nightly'
import { generateHydrationScript, renderToStringAsync } from 'solid-js/web'
import { type RunnableDevEnvironment, createServer as createViteServer } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import type { GraniteConfig } from '../src/config'

const loadAndParseConfig = async () => {
  const configPath = resolve(cwd(), 'granite.config.ts')
  if (!existsSync(configPath)) {
    throw new Error('No granite.config.ts found in the current directory')
  }

  try {
    const configModule = await import(configPath)
    const configDefault = configModule.default as GraniteConfig
    return configDefault
  } catch (error) {
    throw new Error('Error processing granite.config.ts', { cause: error })
  }
}

const config = await loadAndParseConfig()
console.log('Found granite.config.ts:', config)

const server = new H3()

const vite = await createViteServer({
  appType: 'custom',
  server: {
    middlewareMode: true,
  },
  plugins: [
    solidPlugin({ ssr: true }),
    {
      name: 'virtual-entry',
      resolveId(id: string) {
        if (id === 'virtual:entry-client') {
          return `${id}.tsx`
        }
      },
      load(id: string) {
        if (id === 'virtual:entry-client.tsx') {
          return `
            import { hydrate } from 'solid-js/web'
            import App from '/src/index.tsx'
            hydrate(App, document)
          `
        }
      },
    },
  ],
})

const viteClientEnvironment = vite.environments.client as RunnableDevEnvironment
const viteSsrEnvironment = vite.environments.ssr as RunnableDevEnvironment

const indexPath = resolve(cwd(), 'src/index.tsx')
const indexModule = await viteSsrEnvironment.runner.import(indexPath)
const indexDefault = indexModule.default

server.use(async (event) => {
  try {
    const handler = connectToWeb(vite.middlewares)
    const response = await handler(event.req)
    return response
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.error(error)
  }
})

const hydrationScript = generateHydrationScript()

server.all('*', async (event) => {
  console.log('handler', event.url)
  try {
    const html = await renderToStringAsync(indexDefault)
    const htmlUpdated = html.replace(
      '</head>',
      [
        hydrationScript,
        `<script type="module" src="http://localhost:5173/@vite/client"></script>`,
        `<script type="module" src="/@id/virtual:entry-client.tsx"></script>`,
        '</head>',
      ].join(''),
    )

    return new Response(htmlUpdated, {
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
