---
title: Project Structure
---

# Project Structure

This page highlights the main structure and entry setup of a Rouage application.

This example uses H3, check the [examples](https://github.com/quentindutot/rouage/tree/main/examples) for other supported frameworks.

```sh
public/
  favicon.ico
src/
  app.css
  app.tsx
  index.ts
package.json
tsconfig.json
vite.config.ts
```

## Client Entry

The client entry initializes the application for server rendering and client hydration, and uses the `createApp` helper to integrate with Vite in both development and production modes.

Unlike SolidStart, routes are defined explicitly in code rather than generated from files.

::: code-group

```jsx [src/app.tsx]
import { lazy } from 'solid-js'
import { Route, Router, createApp } from 'solid-rouage'
import { Layout } from './components/layout'

export const App = createApp(() => (
  <Router root={Layout}>
    <Route path="/" component={lazy(() => import('./components/home'))} />
    <Route path="/about" component={lazy(() => import('./components/about'))} />
  </Router>
))
```

```css [src/app.css]
@import "tailwindcss";
```

:::

## Server Entry

The server entry initializes the application server and uses the `solidH3` SSR handler along with the `serveH3` helper to integrate with Vite in both development and production modes.

```js [src/index.ts]
import { H3 } from 'h3-nightly'
import { serveH3, solidH3 } from 'solid-rouage/server'

const app = new H3()

app.get('/health', () => new Response('OK'))

app.all('/**', solidH3())

export default serveH3(app)
```

## Configuration

Rouage integrates with [Vite](https://vite.dev) and comes with preconfigured plugins.

:::info
The tailwind and compression plugins are optional and can be removed if not needed.
:::

```js [vite.config.ts]
import tailwind from '@tailwindcss/vite'
import { compress, rouage, solid } from 'solid-rouage/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [solid(), rouage(), tailwind(), compress()],
})
```

### Solid Plugin Options

```ts
interface SolidOptions {
  babel?: Record<string, any>
  include?: string | RegExp | (string | RegExp)[]
  exclude?: string | RegExp | (string | RegExp)[]
}
```

### Rouage Plugin Options

```ts
interface RouageOptions {
  client?: {
    minify?: boolean
    sourcemap?: boolean
  }
  server?: {
    minify?: boolean
    sourcemap?: boolean
  }
}
```

### Compress Plugin Options

```ts
interface CompressOptions {
  algorithm?: 'brotli' | 'gzip'
}
```
