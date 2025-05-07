import { connectToWeb } from '@universal-middleware/express'
import { createServer, isRunnableDevEnvironment } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export const createVite = async () => {
  const vite = await createServer({
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
              import { HydrationScript } from 'solid-js/web'
              import { HomeRoute } from '/src/components/home.tsx'
              hydrate(HomeRoute, document.body)
            `
          }
        },
      },
    ],
  })

  if (!isRunnableDevEnvironment(vite.environments.ssr)) {
    throw new Error('Vite is not running in dev mode')
  }

  return {
    viteHandler: connectToWeb(vite.middlewares),
    ssrImport: vite.environments.ssr.runner.import.bind(vite.environments.ssr.runner),
  }
}
