import { createServer } from '@granite/core'

// biome-ignore lint/style/noDefaultExport: <explanation>
export default createServer({
  routes: [
    {
      path: '/',
      preload: () => {
        console.log('home preload function')
      },
      component: '/src/components/home.tsx',
    },
    {
      path: '/about',
      preload: () => {
        console.log('about preload function')
      },
      component: '/src/components/about.tsx',
    },
    {
      path: '/api/health',
      handler: () => new Response('ok'),
    },
  ],
})
