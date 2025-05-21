import { lazy } from 'solid-js'
import { type AppProps, Route, Router } from 'solid-rouage/client'
import { Layout } from './components/layout'

export const App = (props: AppProps) => (
  <Router path={props.path} root={(props) => <Layout>{props.children}</Layout>}>
    <Route path="/" component={lazy(() => import('./components/home'))} />
    <Route path="/about" component={lazy(() => import('./components/about'))} />
  </Router>
)
