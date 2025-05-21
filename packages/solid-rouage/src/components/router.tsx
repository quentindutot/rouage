import { Link, MetaProvider } from '@solidjs/meta'
import { type MatchFilters, type Params, Route as _Route, Router as _Router } from '@solidjs/router'
import { type Component, type JSX, Suspense } from 'solid-js'
import { isServer } from 'solid-js/web'

// @ts-expect-error
import styles from 'virtual:app_css'

export { createAsync } from '@solidjs/router'

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
  children?: JSX.Element
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

export interface RoutePreloadFuncArgs {
  params: Params
  location: Location
}

export type RoutePreloadFunc = (args: RoutePreloadFuncArgs) => void

export interface RouteSectionProps {
  params: Params
  location: Location
  children?: JSX.Element
}

export type RouteProps<Path extends string> = {
  path?: Path | Path[]
  preload?: RoutePreloadFunc
  component?: Component<RouteSectionProps>
  matchFilters?: MatchFilters<Path>
  children?: JSX.Element
}

export const Route = <Path extends string>(props: RouteProps<Path>) => (
  // @ts-expect-error
  <_Route
    {...props}
    preload={(args) => {
      if (!isServer) {
        if (args.intent === 'preload' && args.location.pathname !== window.location.pathname) {
          // @ts-expect-error
          props.preload?.({ params: args.params, location: args.location })
        }
      }
    }}
  />
)

// const fetchCache = new Map<string, { response: Response; timestamp: number }>()
// const FETCH_CACHE_TTL = 5000 // 5 seconds in milliseconds

// if (!isServer) {
//   console.log('setup preload cache')

//   const originalFetch = window.fetch

//   // @ts-expect-error
//   window.fetch = async (input: string | URL | Request, init?: RequestInit) => {
//     const cacheKey = typeof input === 'string' ? input : input instanceof Request ? input.url : input.toString()
//     const cached = fetchCache.get(cacheKey)

//     if (cached && Date.now() - cached.timestamp < FETCH_CACHE_TTL) {
//       // Clone the cached response since responses can only be used once
//       return cached.response.clone()
//     }

//     // Do the actual fetch
//     const response = await originalFetch(input, init)

//     // Cache a clone of the response
//     fetchCache.set(cacheKey, {
//       response: response.clone(),
//       timestamp: Date.now(),
//     })

//     return response
//   }
// }
