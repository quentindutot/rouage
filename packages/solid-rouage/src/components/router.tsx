import { MetaProvider } from '@solidjs/meta'
import { type RouteSectionProps, Router as _Router } from '@solidjs/router'
import { type Component, type JSX, Suspense } from 'solid-js'
import { useAppContext } from './app-context.jsx'

export {
  Route,
  Navigate,
  createAsync,
  createAsyncStore,
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
        <MetaProvider>
          <Suspense>{typeof props.root === 'function' ? props.root(rootProps) : rootProps.children}</Suspense>
        </MetaProvider>
      )}
    >
      {props.children}
    </_Router>
  )
}

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
