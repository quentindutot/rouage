import { resolve } from 'node:path'
import { createRequestAdapter } from '@universal-middleware/express'
import { sendResponse } from '@universal-middleware/express'
import color from 'picocolors'
import type { Plugin, ResolvedConfig, RunnableDevEnvironment } from 'vite'
import {
  deleteManifestViteFolder,
  replaceManifestClientEntry,
  replaceManifestUrlImports,
} from '../features/manifest/process-manifest.js'
import { normalizeManifestEntries } from '../features/manifest/process-manifest.js'
import type { AdapterServeExport } from '../helpers/shared-types.js'

export interface RouageOptions {
  /**
   * Client specific options
   */
  client?: {
    /**
     * Enable minification for client-side code.
     * @default true
     */
    minify?: boolean
    /**
     * Enable source maps for client-side code.
     * @default false
     */
    sourcemap?: boolean
  }
  /**
   * Server specific options
   */
  server?: {
    /**
     * Enable minification for server-side code.
     * @default true
     */
    minify?: boolean
    /**
     * Enable source maps for server-side code.
     * @default false
     */
    sourcemap?: boolean
  }
}

export const rouage = (options?: Partial<RouageOptions>): Plugin => {
  const clientOptions = {
    minify: options?.client?.minify ?? true,
    sourcemap: options?.client?.sourcemap ?? false,
  }
  const serverOptions = {
    minify: options?.server?.minify ?? true,
    sourcemap: options?.server?.sourcemap ?? false,
  }

  let resolvedConfig: ResolvedConfig

  const manifestPath = resolve('build/public/.vite/manifest.json')

  return {
    name: 'rouage',
    config(config, { command }) {
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
            minify: clientOptions.minify,
            sourcemap: clientOptions.sourcemap,
            rollupOptions: { input: { index: 'virtual:entry-client' } },
          },
        },
        server: {
          consumer: 'server',
          resolve: {
            // Only set noExternal in build mode since esbuild has issues with CJS on server
            noExternal: command === 'build' ? true : undefined,
          },
          build: {
            manifest: false,
            ssrManifest: false,
            outDir: 'build/server',
            assetsDir: 'chunks',
            emptyOutDir: true,
            copyPublicDir: false,
            minify: serverOptions.minify,
            sourcemap: serverOptions.sourcemap,
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
      if (id === 'virtual:entry-client') {
        return 'virtual:entry-client.tsx'
      }
      if (id === 'virtual:entry-server') {
        return 'src/index.ts'
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
    async transform(code, path, options) {
      const isServer = !!options?.ssr

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
          const entryDefault = entry.default as AdapterServeExport

          switch (entryDefault?.type) {
            case 'node': {
              await entryDefault.handler(nodeRequest, nodeResponse)
              break
            }

            case 'fetch': {
              const request: Request = createRequestAdapter()(nodeRequest)
              const response: Response = await entryDefault.handler(request)
              sendResponse(response, nodeResponse)
              break
            }

            default: {
              // biome-ignore lint/suspicious/noConsole: <explanation>
              console.error(color.red('🚨 Missing or invalid adapter export.\n'))
              process.exit(1)
            }
          }
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
