import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createRequestAdapter, sendResponse } from '@universal-middleware/express'
import type { Plugin, RunnableDevEnvironment, UserConfig } from 'vite'
import { type Options as SolidPluginOptions, default as solidPlugin } from 'vite-plugin-solid'

export interface SolidOptions extends Pick<SolidPluginOptions, 'babel' | 'include' | 'exclude'> {}

export const solid = (options?: Partial<SolidOptions>): Plugin =>
  solidPlugin({
    ssr: true,
    babel: options?.babel,
    include: options?.include,
    exclude: options?.exclude,
  })

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
export interface GraniteOptions {}

export const granite = (_options?: Partial<GraniteOptions>): Plugin => ({
  name: 'granite',
  config(config: UserConfig) {
    config.appType = 'custom'
    config.environments = {
      client: {
        consumer: 'client',
        resolve: {
          noExternal: true,
        },
        build: {
          manifest: true,
          outDir: 'build',
          assetsDir: 'assets',
          emptyOutDir: true,
          rollupOptions: { input: 'virtual:entry-client' },
        },
      },
      server: {
        consumer: 'server',
        resolve: {
          noExternal: true,
        },
        build: {
          outDir: 'build',
          assetsDir: 'server',
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
  resolveId(id) {
    if (id === 'virtual:entry-client') {
      return `${id}.tsx`
    }
  },
  load(id) {
    if (id === 'virtual:entry-client.tsx') {
      return [
        '/* @refresh reload */',
        `import { hydrate } from 'solid-js/web'`,
        `import { App } from './src/app'`,
        'hydrate(() => <App />, document.body)',
      ].join('\n')
    }
  },
  async configureServer(vite) {
    const serverEnvironment = vite.environments.server as RunnableDevEnvironment

    return () => {
      vite.middlewares.use(async (nodeRequest, nodeResponse) => {
        const entry = await serverEnvironment.runner.import('src/entry-server.tsx')

        const request: Request = createRequestAdapter()(nodeRequest)
        const response: Response = await entry.default.fetch(request)

        sendResponse(response, nodeResponse)
      })
    }
  },
  async configurePreviewServer(vite) {
    return () => {
      vite.middlewares.use(async (nodeRequest, nodeResponse) => {
        const entry = await import(resolve('build/entry-server.js'))

        const request: Request = createRequestAdapter()(nodeRequest)
        const response: Response = await entry.default.fetch(request)

        sendResponse(response, nodeResponse)
      })
    }
  },
})
