import { MetaProvider } from '@solidjs/meta'
import { Router } from '@solidjs/router'
import { Suspense, lazy } from 'solid-js'

interface Props {
  path: string | undefined
  routes: { path: string; preload: () => void; component: string }[]
}

// biome-ignore lint/style/noDefaultExport: <explanation>
export default (props: Props) => () => (
  <Router
    url={props.path}
    root={(props) => (
      <MetaProvider>
        <Suspense>{props.children}</Suspense>
      </MetaProvider>
    )}
  >
    {props.routes.map((route) => ({
      path: route.path,
      preload: route.preload,
      component: lazy(() => import(/* @vite-ignore */ route.component)),
    }))}
  </Router>
)
