import { readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { createRequestAdapter, sendResponse } from '@universal-middleware/express'
import type { Plugin, ResolvedConfig, RunnableDevEnvironment } from 'vite'
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
      if (id === 'virtual:manifest') {
        return 'build/public/.vite/manifest.json'
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
        try {
          const manifestPath = resolve('build/public/.vite/manifest.json')
          const manifestContent = await readFile(manifestPath, 'utf-8')
          const manifestEntries = JSON.parse(manifestContent)
          const clientEntry = manifestEntries['src/virtual:entry-client.tsx']
          if (clientEntry?.file) {
            return code.replace('__ENTRY_CLIENT_ASSET__', clientEntry.file)
          }
        } catch (_error) {
          // in dev mode no manifest so no need to replace
        }
      }

      // Only do this on the server side after the client build
      if (isServer && resolvedConfig.command === 'build' && code.includes('?url')) {
        const manifestPath = resolve('build/public/.vite/manifest.json')
        let manifest: Record<string, unknown>
        try {
          manifest = JSON.parse(await readFile(manifestPath, 'utf-8'))
        } catch (_error) {
          // Manifest missing: skip in dev mode
          return code
        }

        // Regex to find all ?url imports
        // Handles both 'import ... from' and 'const ... = require(...)'
        const importUrlRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+\?url)['"];?/g

        let replaced = code
        let match: RegExpExecArray | null

        // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
        while ((match = importUrlRegex.exec(code))) {
          const varName = match[1]
          const assetPath = match[2]

          // biome-ignore lint/performance/useTopLevelRegex: <explanation>
          const assetLookup = assetPath.replace(/\?url$/, '')

          // Vite manifest keys are usually like "src/app.css"
          // Try to resolve to project root
          // (You may need to tweak this if your paths are different)
          let manifestKey = assetLookup
          if (manifestKey.startsWith('./')) {
            manifestKey = manifestKey.slice(2)
          }
          if (manifestKey.startsWith('src/')) {
            // manifestKey = manifestKey
          } else {
            // Try to resolve relative to the current file
            const absAssetPath = resolve(dirname(path), assetLookup)
            manifestKey = relative(process.cwd(), absAssetPath)
          }

          const manifestEntry = manifest[manifestKey] || manifest[`src/${assetLookup.split('/').pop()}`]
          // @ts-expect-error
          const assetFile = manifestEntry?.file || manifestEntry

          if (assetFile) {
            // Replace import with direct assignment to the real URL
            replaced = replaced.replace(match[0], `const ${varName} = "/assets/${assetFile.split('/').pop()}";`)
          }
        }

        return replaced
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
  }
}
