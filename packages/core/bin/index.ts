import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { type EventHandlerRequest, H3, type H3Event, serve } from 'h3-nightly'
import { generateHydrationScript, renderToStringAsync } from 'solid-js/web'
import type { ServerConfig } from '../src'
import { isRouteComponent } from '../src/definitions/server-factory'
import { loadAndParseConfig } from './stuff/config'
import { createVite } from './stuff/vite'

const config = await loadAndParseConfig()
console.log('Found granite.config.ts:', config)

const indexPath = resolve(cwd(), 'src/index.ts')
if (!existsSync(indexPath)) {
  throw new Error('No src/index.ts found in the current directory')
}

const server = new H3()

const { viteHandler, ssrImport } = await createVite()

server.use((event) => viteHandler(event.req))

const hydrationScript = generateHydrationScript()

const indexModule = await ssrImport(indexPath)
const indexDefault = indexModule.default as ServerConfig
console.log(indexDefault)

for (const route of indexDefault.routes) {
  const method = route.method ?? 'GET'
  const path = route.path

  const handler = isRouteComponent(route)
    ? async (_event: H3Event<EventHandlerRequest>) => {
        const componentHtml = await renderToStringAsync(route.component)
        const templateHtml = [
          '<!DOCTYPE html>',
          '<html><head>',
          hydrationScript,
          `<script type="module" src="/@vite/client"></script>`,
          `<script type="module" src="/@id/virtual:entry-client.tsx"></script>`,
          '</head><body>',
          componentHtml,
          '</body></html>',
        ].join('')

        return new Response(templateHtml, {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
          },
        })
      }
    : route.handler

  server.on(method, path, handler)
}

serve(server, { port: 5173 })
