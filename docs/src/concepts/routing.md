---
title: Routing
---

# Routing

Rouage is powered internally by Solid Router. Most APIs are directly re-exported, while some are extended or newly added.

Installation of `@solidjs/router` is not needed, all features are provided by `solid-rouage`.

:::info
This page covers application-level routing. For server routes, consult the documentation for frameworks such as H3, Hono, or Elysia.
:::

## Usage

The top-level component that manages routing in your application. The optional `root` prop can wrap the application in a layout component that persists across page changes.

```jsx
import { lazy } from 'solid-js'
import { type AppProps, Router, Route } from 'solid-rouage'

const Home = lazy(() => import('./Home'))
const About = lazy(() => import('./About'))
const NotFound = lazy(() => import('./NotFound'))

export const App = (props: AppProps) => (
  <Router path={props.path}>
    <Route path="/" component={Home} />
    <Route path="/about" component={About} />
    <Route path="*" component={NotFound} />
  </Router>
)
```

## Concepts

| Concept           | Documentation                                                                                                                  |
|-------------------|--------------------------------------------------------------------------------------------------------------------------------|
| Path Parameters   | [/solid-router/concepts/path-parameters](https://docs.solidjs.com/solid-router/concepts/path-parameters)                       |
| Search parameters | [/solid-router/concepts/search-parameters](https://docs.solidjs.com/solid-router/concepts/search-parameters)                   |
| Catch-all routes  | [/solid-router/concepts/catch-all](https://docs.solidjs.com/solid-router/concepts/catch-all)                                   |
| Nesting routes    | [/solid-router/concepts/nesting](https://docs.solidjs.com/solid-router/concepts/nesting)                                       |
| Layouts           | [/solid-router/concepts/layouts](https://docs.solidjs.com/solid-router/concepts/layouts)                                       |
| Preload           | [/solid-router/reference/preload-functions/preload](https://docs.solidjs.com/solid-router/reference/preload-functions/preload) |

## Primitives

The following primitives are re-exported from Solid Router.

Import them directly from `solid-rouage` instead of `@solidjs/router`.

| Primitive         | Documentation                                                                                                                            |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| useNavigate       | [/solid-router/reference/primitives/use-navigate](https://docs.solidjs.com/solid-router/reference/primitives/use-navigate)               |
| useLocation       | [/solid-router/reference/primitives/use-location](https://docs.solidjs.com/solid-router/reference/primitives/use-location)               |
| useParams         | [/solid-router/reference/primitives/use-params](https://docs.solidjs.com/solid-router/reference/primitives/use-params)                   |
| useSearchParams   | [/solid-router/reference/primitives/use-search-params](https://docs.solidjs.com/solid-router/reference/primitives/use-search-params)     |
| useMatch          | [/solid-router/reference/primitives/use-match](https://docs.solidjs.com/solid-router/reference/primitives/use-match)                     |
| useBeforeLeave    | [/solid-router/reference/primitives/use-before-leave](https://docs.solidjs.com/solid-router/reference/primitives/use-before-leave)       |
| useCurrentMatches | [/solid-router/reference/primitives/use-current-matches](https://docs.solidjs.com/solid-router/reference/primitives/use-current-matches) |
| useIsRouting      | [/solid-router/reference/primitives/use-is-routing](https://docs.solidjs.com/solid-router/reference/primitives/use-is-routing)           |
| usePreloadRoute   | [/solid-router/reference/primitives/use-preload-route](https://docs.solidjs.com/solid-router/reference/primitives/use-preload-route)     |

## Limitations

- No `A` or `Link` components (use standard `<a>` elements instead).
- No alternative routers (hash mode and memory mode are not supported).
- No query/action (these APIs are too closely tied to SolidStart).
- Only component-based routing is supported (not config-based).
- No intent passed to preload functions; preloading is always triggered by link hover.
