import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import tailwind from '@tailwindcss/vite'
import { createRequestAdapter, sendResponse } from '@universal-middleware/express'
import { type RunnableDevEnvironment, type UserConfig, defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  plugins: [
    solid({ ssr: true }),
    tailwind(),
    {
      name: 'granite',
      config(config: UserConfig) {
        config.appType = 'custom'
        config.environments = {
          client: {
            consumer: 'client',
            resolve: { noExternal: true },
            build: {
              outDir: 'build',
              manifest: true,
              emptyOutDir: true,
              rollupOptions: { input: 'src/entry-client.tsx' },
            },
          },
          server: {
            consumer: 'server',
            resolve: { noExternal: true },
            build: {
              outDir: 'build',
              emptyOutDir: false,
              rollupOptions: { input: 'src/entry-server.tsx' },
            },
          },
        }
        config.builder = {
          async buildApp(vite) {
            await vite.build(vite.environments.client)

            const manifestPath = resolve('build/.vite/manifest.json')
            const manifestContent = await readFile(manifestPath, 'utf-8')
            const manifestEntries = JSON.parse(manifestContent)

            const normalizedManifest = Object.fromEntries(
              Object.entries(manifestEntries).map(([key, value]) => {
                const normalize = (path: string) => {
                  const filename = path.split('/').pop() ?? path
                  return filename.startsWith('src/') ? filename : `src/${filename}`
                }

                const normalizedKey = normalize(key)
                // @ts-expect-error
                const normalizedValue = { ...value }
                if (normalizedValue.src) {
                  normalizedValue.src = normalize(normalizedValue.src)
                }

                return [normalizedKey, normalizedValue]
              }),
            )

            await writeFile(manifestPath, JSON.stringify(normalizedManifest, null, 2), 'utf-8')

            await vite.build(vite.environments.server)
          },
        }
      },
      async configureServer(vite) {
        const serverEnvironment = vite.environments.server as RunnableDevEnvironment

        return () => {
          vite.middlewares.use(async (nodeRequest, nodeResponse) => {
            const entry = await serverEnvironment.runner.import('/src/entry-server.tsx')

            const request: Request = createRequestAdapter()(nodeRequest)
            const response: Response = await entry.default.fetch(request)

            sendResponse(response, nodeResponse)
          })
        }
      },
      async configurePreviewServer(vite) {
        return () => {
          vite.middlewares.use(async (nodeRequest, nodeResponse) => {
            // @ts-expect-error
            const entry = await import('./build/entry-server.js')

            const request: Request = createRequestAdapter()(nodeRequest)
            const response: Response = await entry.default.fetch(request)

            sendResponse(response, nodeResponse)
          })
        }
      },
    },
  ],
})
