import { type AppProps, Route, Router } from '@rouage/core/client'
import { lazy } from 'solid-js'

const Home = lazy(() => import('./components/home').then((module) => ({ default: module.Home })))
const About = lazy(() => import('./components/about').then((module) => ({ default: module.About })))

export const App = (props: AppProps) => (
  <Router path={props.path}>
    <Route path="/" component={Home} />
    <Route path="/about" component={About} />
  </Router>
)
