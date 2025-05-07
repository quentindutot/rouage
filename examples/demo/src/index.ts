import { createServer } from '@granite/core'
import { HomeRoute } from './components/home'

// biome-ignore lint/style/noDefaultExport: <explanation>
export default createServer({
  routes: [
    {
      path: '/',
      component: HomeRoute,
      children: [
        {
          path: '/about',
          component: HomeRoute,
        },
      ],
    },
    {
      path: '/api/health',
      handler: () => new Response('ok'),
    },
  ],
})
