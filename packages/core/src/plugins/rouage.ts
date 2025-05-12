import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createRequestAdapter, sendResponse } from '@universal-middleware/express'
import type { Plugin, RunnableDevEnvironment, UserConfig } from 'vite'

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
export interface RouageOptions {}

export const rouage = (_options?: Partial<RouageOptions>): Plugin => ({
  name: 'rouage',
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
          rollupOptions: { input: { index: 'virtual:index' } },
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
          rollupOptions: { input: { index: 'src/index.ts' } },
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
    if (id === 'virtual:app_tsx') {
      return id
    }
    if (id === 'virtual:app_css') {
      return id
    }
    if (id === 'virtual:index') {
      return `${id}.tsx`
    }
    if (id === 'virtual:manifest') {
      return 'build/.vite/manifest.json'
    }
  },
  load(id) {
    if (id === 'virtual:app_tsx') {
      return ['/* @refresh reload */', `import { App } from './src/app'`, 'export default App'].join('\n')
    }
    if (id === 'virtual:app_css') {
      return ['/* @refresh reload */', `import styles from './src/app.css?url'`, 'export default styles'].join('\n')
    }
    if (id === 'virtual:index.tsx') {
      return [
        '/* @refresh reload */',
        `import { hydrate } from 'solid-js/web'`,
        `import App from 'virtual:app_tsx'`,
        'hydrate(() => <App />, document.body)',
      ].join('\n')
    }
    if (id === 'virtual:manifest') {
      return 'build/.vite/manifest.json'
    }
  },
  async configureServer(vite) {
    const serverEnvironment = vite.environments.server as RunnableDevEnvironment

    return () => {
      vite.middlewares.use(async (nodeRequest, nodeResponse) => {
        const entry = await serverEnvironment.runner.import('src/index.ts')

        const request: Request = createRequestAdapter()(nodeRequest)
        const response: Response = await entry.default.fetch(request)

        sendResponse(response, nodeResponse)
      })
    }
  },
  async configurePreviewServer(vite) {
    return () => {
      vite.middlewares.use(async (nodeRequest, nodeResponse) => {
        const entry = await import(resolve('build/index.js'))

        const request: Request = createRequestAdapter()(nodeRequest)
        const response: Response = await entry.default.fetch(request)

        sendResponse(response, nodeResponse)
      })
    }
  },
})
