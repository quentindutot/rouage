import { Link, MetaProvider } from '@solidjs/meta'
import { type RouteDefinition, type RouteSectionProps, Router as _Router } from '@solidjs/router'
import { type Component, type JSX, Suspense } from 'solid-js'

// @ts-expect-error
import styles from 'virtual:app_css'

// biome-ignore lint/performance/noBarrelFile: <explanation>
export { Route, createAsync, type RouteDefinition } from '@solidjs/router'

export interface RouterProps {
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
