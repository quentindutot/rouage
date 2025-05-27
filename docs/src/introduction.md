---
title: Introduction
---

# Introduction

**Rouage** is a minimal server-side rendering (SSR) solution for [SolidJS](https://www.solidjs.com/).

Designed to be fast, flexible, and unopinionated. It provides the essentials: server rendering and client hydration, powered by a Vite plugin — no full-stack framework required.

> ⚙️ “Rouage” means “cog” in French
> 
> A small, precise part that powers a larger system.

## Quick Start

The recommended way to create a new Rouage project:

::: code-group

```sh [npm]
npm create rouage@latest
```

```sh [yarn]
yarn create rouage
```

```sh [pnpm]
pnpm create rouage@latest
```

```sh [bun]
bun create rouage@latest
```

```sh [deno]
deno init --npm rouage@latest
```

:::

## Server Focused

Rouage is purpose-built for SSR, integrating seamlessly with custom servers and runtimes enabling complete control over the server environment and ecosystem.

SSR is hard to set up right: streaming, async rendering, asset manifests, styles, preloads, caching, HMR. Rouage handles these complexities in a straightforward and maintainable way.

| Rendering Mode         | Ideal Stack                                       | Best For                        |
|------------------------|---------------------------------------------------|---------------------------------|
| Static Site Generation | SolidJS + [Astro](https://astro.build)            | Pre-rendered static pages       |
| Client-Side Rendering  | SolidJS + [Vite](https://vitejs.dev)              | Rich client-side interactions   |
| Server-Side Rendering  | SolidJS + **Rouage**                              | Dynamic pages, custom backends  |
| Edge / Cloud Rendering | SolidJS + [SolidStart](https://start.solidjs.com) | Serverless and edge deployments |

<!-- ## Why not SolidStart?

[SolidStart](https://start.solidjs.com) is a great all-in-one solution for building SolidJS apps but its flexibility comes with additional complexity, conventions, and tooling layers.

Rouage is a Vite plugin. No CLI, no runtime, no boilerplate.

|                        | SolidStart             | Rouage                  |
|------------------------|------------------------|--------------------------|
| Foundations            | Vinxi x Nitro          | Vite                     |
| Dependencies           | 20+                    | < 10 (core + peer deps)  |
| Client bundle size     | ~90 KB (gzipped)       | ~35 KB (gzipped)         |
| Server bundle size     | ~220 KB                | ~90 KB                   |
| Memory usage (avg)     | 120–150 MB             | 40–60 MB                 |
| CPU usage (avg load)   | Higher                 | Lower                    |

*See the [full comparison repository](https://github.com/quentindutot/rouage/tree/main/examples) for details.* -->

## Acknowledgements

Rouage is inspired by several innovative projects in the JavaScript ecosystem:

- **SolidStart** – SolidJS's official meta-framework, full-stack capabilities.
- **SolidHop** – A minimal and unopinionated Vike + Solid + Hono starter.
- **Vike** – A framework-agnostic SSR solution, formerly known as vite-plugin-ssr.
