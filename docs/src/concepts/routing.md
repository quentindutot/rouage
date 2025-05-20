---
title: Routing
---

# Routing

Rouage is powered internally by Solid Router. Most APIs are directly re-exported, while some are extended or newly added.

Installation of `@solidjs/router` is not needed, all features are provided by `solid-rouage`.

:::info
This page covers application-level routing. For server routes, consult the documentation for frameworks such as H3, Hono, or Elysia.
:::

## Basic Example

Below is a routing setup using Router and Route from solid-rouage. Use the root prop to apply a layout across all routes.

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

## Router Concepts

| Concept           | Documentation                                                                                                                  |
|-------------------|--------------------------------------------------------------------------------------------------------------------------------|
| Path Parameters   | [/solid-router/concepts/path-parameters](https://docs.solidjs.com/solid-router/concepts/path-parameters)                       |
| Search parameters | [/solid-router/concepts/search-parameters](https://docs.solidjs.com/solid-router/concepts/search-parameters)                   |
| Catch-all routes  | [/solid-router/concepts/catch-all](https://docs.solidjs.com/solid-router/concepts/catch-all)                                   |
| Nesting routes    | [/solid-router/concepts/nesting](https://docs.solidjs.com/solid-router/concepts/nesting)                                       |
| Layouts           | [/solid-router/concepts/layouts](https://docs.solidjs.com/solid-router/concepts/layouts)                                       |
| Preload           | [/solid-router/reference/preload-functions/preload](https://docs.solidjs.com/solid-router/reference/preload-functions/preload) |

## Router Primitives

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

## Feature Differences

Rouage introduces a few differences from Solid Router to better fit its intended use cases:

- **No `<A>` or `<Link>` Components:** Use standard HTML `<a>` elements.

- **No Alternative Router Modes:**  Hash mode and memory mode are not supported.

- **No `query`/`action` APIs:** Prefer [Server Functions](/concepts/server-functions) for data handling.

- **Component-Based Routing:** Use `<Route>` components over config-based routes.

- **Preload Function Intent:** The preload function is only triggered on link hover.
