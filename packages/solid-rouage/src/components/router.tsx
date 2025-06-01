import { MetaProvider } from '@solidjs/meta'
import { type RouteSectionProps, Router as _Router } from '@solidjs/router'
import type { Component, JSX } from 'solid-js'
import { useAppContext } from './app-context.jsx'

export {
  Route,
  Navigate,
  createAsync,
  createAsyncStore,
  type RoutePreloadFuncArgs,
  type RoutePreloadFunc,
  type RouteSectionProps,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  useMatch,
  useBeforeLeave,
  useCurrentMatches,
  useIsRouting,
  usePreloadRoute,
} from '@solidjs/router'

export interface RouterProps {
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

export const Router = (props: RouterProps) => {
  const appContext = useAppContext()

  return (
    <_Router
      url={appContext.initialPath}
      base={props.base}
      root={(rootProps) => (
        <MetaProvider>{typeof props.root === 'function' ? props.root(rootProps) : rootProps.children}</MetaProvider>
      )}
    >
      {props.children}
    </_Router>
  )
}
