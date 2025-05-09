import { Link, MetaProvider } from '@solidjs/meta'
import { Route, Router } from '@solidjs/router'
import { Suspense, lazy } from 'solid-js'
import styles from './app.css?url'

const Home = lazy(() => import('./components/home').then((module) => ({ default: module.Home })))
const About = lazy(() => import('./components/about').then((module) => ({ default: module.About })))

export const App = (props: { path?: string }) => (
  <Router
    url={props.path}
    root={(props) => (
      <MetaProvider>
        <Link rel="stylesheet" href={styles} />
        <Suspense>{props.children}</Suspense>
      </MetaProvider>
    )}
  >
    <Route path="/" component={Home} />
    <Route path="/about" component={About} />
  </Router>
)
