import { resolve } from 'node:path'
import { createRequestAdapter, sendResponse } from '@universal-middleware/express'
import color from 'picocolors'
import type { Plugin, ResolvedConfig, RunnableDevEnvironment } from 'vite'
import {
  deleteManifestViteFolder,
  replaceManifestClientEntry,
  replaceManifestUrlImports,
} from '../features/manifest/process-manifest.js'
import { normalizeManifestEntries } from '../features/manifest/process-manifest.js'
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

export const rouage = (options?: Partial<RouageOptions>): Plugin => {
  let resolvedConfig: ResolvedConfig

  const manifestPath = resolve('build/public/.vite/manifest.json')

  return {
    name: 'rouage',
    config(config) {
      config.appType = 'custom'
      config.environments = {
        client: {
          consumer: 'client',
          resolve: {
            noExternal: true,
          },
          build: {
            manifest: true,
            ssrManifest: false,
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
            manifest: false,
            ssrManifest: false,
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
          await normalizeManifestEntries({ manifestPath })
          await vite.build(vite.environments.server)
          await deleteManifestViteFolder({ manifestPath })
        },
      }
    },
    configResolved(config) {
      resolvedConfig = config
    },
    resolveId(id) {
      if (id === 'virtual:app') {
        return 'src/app.tsx'
      }
      if (id === 'virtual:entry-client' || id === 'virtual:entry-server') {
        return `${id}.tsx`
      }
      if (id === 'virtual:server-functions') {
        return 'node_modules/.rouage/server-functions.js'
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
      if (id === 'virtual:entry-server.tsx') {
        return [
          '/* @refresh reload */',
          `import { serve } from 'solid-rouage/srvx'`,
          `import server from './src/index'`,
          'serve({ fetch: server.fetch.bind(server) })',
        ].join('\n')
      }
    },
    async transform(code, path, options) {
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

      if (isServer && resolvedConfig.command === 'build' && code.includes('__ENTRY_CLIENT_ASSET__')) {
        return await replaceManifestClientEntry({ manifestPath, filePath: path, fileCode: code })
      }

      if (isServer && resolvedConfig.command === 'build' && code.includes('?url')) {
        return await replaceManifestUrlImports({ manifestPath, filePath: path, fileCode: code })
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
    configurePreviewServer() {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error(
        color.red('🚨 `vite preview` command is not supported.\n') +
          color.cyan('👉 Start the server with `node build/server/index.js`.\n'),
      )
      process.exit(1)
    },
  }
}
