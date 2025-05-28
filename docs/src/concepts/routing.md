---
title: Routing
---

# Routing

Rouage is powered internally by Solid Router. Most APIs are directly re-exported, while some are extended or newly added.

Installation of `@solidjs/router` is not needed, all features are provided by `solid-rouage`.

```jsx
import { lazy } from 'solid-js'
import { Router, Route, createApp } from 'solid-rouage'
import { Layout } from './layout'

export const App = createApp(() => (
  <Router root={Layout}>
    <Route path="/" component={lazy(() => import('./Home'))} />
    <Route path="/about" component={lazy(() => import('./About'))} />
  </Router>
))
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

## Router Components

| Component         | Documentation                                                                                                      |
|-------------------|--------------------------------------------------------------------------------------------------------------------|
| Router            | [/solid-router/reference/components/router](https://docs.solidjs.com/solid-router/reference/components/router)     |
| Route             | [/solid-router/reference/components/route](https://docs.solidjs.com/solid-router/reference/components/route)       |
| Navigate          | [/solid-router/reference/components/navigate](https://docs.solidjs.com/solid-router/reference/components/navigate) |

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

- **No `query`/`action` APIs:** Prefer [Server Functions](/concepts/server-functions) for data loading.
