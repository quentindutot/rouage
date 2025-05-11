import { Link, MetaProvider } from '@solidjs/meta'
import { type RouteDefinition, type RouteSectionProps, Router as _Router } from '@solidjs/router'
import { type Component, type JSX, Suspense } from 'solid-js'

// @ts-expect-error
import styles from 'virtual:app_css'

// biome-ignore lint/performance/noBarrelFile: <explanation>
export { Title as MetaTitle, Link as MetaLink } from '@solidjs/meta'
export { Route, createAsync } from '@solidjs/router'

interface RouterProps {
  /**
   * The current path to render
   */
  path?: string
  /**
   * Base path for all routes
   */
  base?: string
  /**
   * A component that wraps every route.
   */
  root?: Component<RouteSectionProps>
  /**
   * Can be JSX elements or route definitions
   */
  children?: JSX.Element | RouteDefinition | RouteDefinition[]
}

export const Router = (props: RouterProps) => (
  <_Router
    url={props.path}
    root={(props) => (
      <MetaProvider>
        <Link rel="stylesheet" href={styles} />
        <Suspense>{props.children}</Suspense>
      </MetaProvider>
    )}
  >
    {props.children}
  </_Router>
)

export interface AppProps {
  path?: string
}
