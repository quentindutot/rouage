import { Link, MetaProvider } from '@solidjs/meta'
import { Route, Router } from '@solidjs/router'
import styles from './app.css?url'

import { About } from './components/about'
import { Home } from './components/home'

export const App = (props: { path?: string }) => (
  <Router
    url={props.path}
    root={(props) => (
      <MetaProvider>
        <Link rel="stylesheet" href={styles} />
        {props.children}
      </MetaProvider>
    )}
  >
    <Route path="/" component={Home} />
    <Route path="/about" component={About} />
  </Router>
)
