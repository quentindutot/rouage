import { lazy } from 'solid-js'
import { Route, Router, createApp } from 'solid-rouage/client'
import { Layout } from './components/layout'

export const App = createApp(() => (
  <Router root={Layout}>
    <Route path="/" component={lazy(() => import('./components/home'))} />
    <Route path="/about" component={lazy(() => import('./components/about'))} />
  </Router>
))
