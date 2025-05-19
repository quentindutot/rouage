import { readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { createRequestAdapter, sendResponse } from '@universal-middleware/express'
import type { Plugin, RunnableDevEnvironment, UserConfig } from 'vite'
import { processServerFunctions } from '../features/server-function/process-server-functions.js'

export interface RouageOptions {
  /**
   * Enable minification for client-side code.
   * @default true
   */
  clientMinify?: boolean
  /**
   * Enable source maps for client-side code.
   * @default false
   */
  clientSourcemap?: boolean
  /**
   * Enable minification for server-side code.
   * @default true
   */
  serverMinify?: boolean
  /**
   * Enable source maps for server-side code.
   * @default false
   */
  serverSourcemap?: boolean
}

export const rouage = (options?: Partial<RouageOptions>): Plugin => ({
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
          outDir: 'build/public',
          assetsDir: 'assets',
          emptyOutDir: true,
          copyPublicDir: true,
          minify: options?.clientMinify ?? true,
          sourcemap: options?.clientSourcemap ?? false,
          rollupOptions: { input: { index: 'virtual:entry-client' } },
        },
      },
      server: {
        consumer: 'server',
        resolve: {
          noExternal: true,
        },
        build: {
          outDir: 'build/server',
          assetsDir: 'chunks',
          emptyOutDir: true,
          copyPublicDir: false,
          minify: options?.serverMinify ?? true,
          sourcemap: options?.serverSourcemap ?? false,
          rollupOptions: { input: { index: 'virtual:entry-server' } },
        },
      },
    }
    config.builder = {
      async buildApp(vite) {
        await vite.build(vite.environments.client)

        const manifestPath = resolve('build/public/.vite/manifest.json')
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

        await rm(dirname(manifestPath), { recursive: true })
      },
    }
  },
  resolveId(id) {
    if (id === 'virtual:app_tsx' || id === 'virtual:app_css') {
      return id
    }
    if (id === 'virtual:entry-client' || id === 'virtual:entry-server') {
      return `${id}.tsx`
    }
    if (id === 'virtual:manifest') {
      return 'build/public/.vite/manifest.json'
    }
    if (id === 'virtual:server-functions') {
      return 'node_modules/.rouage/server-functions.js'
    }
  },
  load(id) {
    if (id === 'virtual:app_tsx') {
      return ['/* @refresh reload */', `import { App } from './src/app'`, 'export default App'].join('\n')
    }
    if (id === 'virtual:app_css') {
      return ['/* @refresh reload */', `import styles from './src/app.css?url'`, 'export default styles'].join('\n')
    }
    if (id === 'virtual:entry-client.tsx') {
      return [
        '/* @refresh reload */',
        `import { hydrate } from 'solid-js/web'`,
        `import App from 'virtual:app_tsx'`,
        'hydrate(() => <App />, document.body)',
      ].join('\n')
    }
    if (id === 'virtual:entry-server.tsx') {
      return [
        '/* @refresh reload */',
        `import { serve } from 'solid-rouage/srvx'`,
        `import server from './src/index'`,
        'serve({ fetch: server.fetch.bind(server) })',
      ].join('\n')
    }
  },
  transform(code, path, options) {
    const isServer = !!options?.ssr

    if (!isServer && code.includes('createServerFunction(')) {
      return processServerFunctions({
        code,
        path,
        template: (serverFunctionId) => `
          const response = await fetch('/_server/${serverFunctionId}');
          const data = await response.json();
          return data;
        `,
      })
    }

    return code
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
        const entry = await import(resolve('build/server/index.js'))

        const request: Request = createRequestAdapter()(nodeRequest)
        const response: Response = await entry.default.fetch(request)

        sendResponse(response, nodeResponse)
      })
    }
  },
})
