---
title: Introduction
---

# Introduction

**Granite** is a minimal server-side rendering (SSR) solution for [SolidJS](https://www.solidjs.com/).

Designed to be fast, flexible, and unopinionated. It provides the essentials: server rendering and client hydration, powered by a Vite plugin — no full-stack framework required.

Granite integrates cleanly with modern servers like Hono, Elysia, H3, and runtimes like Node, Deno, Bun.

## Server Focused

Granite focuses purely on SSR and integrates with the server already in use, enabling full control over it and its ecosystem without limitations.

SSR is hard: streaming, async rendering, asset manifests, styles, preloads, and caching all add complexity. Granite solves this once — cleanly and predictably.

| Rendering Mode          | Ideal Stack                            | Notes                             |
|-------------------------|----------------------------------------|-----------------------------------|
| Static Site Generation  | SolidJS × [Astro](https://astro.build) | Pre-rendered static pages         |
| Single Page Application | SolidJS × [Vite](https://vitejs.dev)   | Rich client-side interactions     |
| Server-Side Rendering   | SolidJS × **Granite**                  | Dynamic pages and custom backends |

## Declarative Routing

While many ecosystems have moved past file-based routing, most JavaScript frameworks still depend on it. It's convenient at first — but brittle as complexity grows.

Granite takes a different approach: **code-defined routing**:
- 📝 Routes are written explicitly, not inferred from filenames
- 🧩 Structure remains flexible, with no imposed conventions
- 🛡️ Type safety and IDE support work naturally
- 🚀 Advanced use cases become straightforward — like i18n or custom logic

> Define routes as code — not as a folder structure.

## Why not SolidStart?

[SolidStart](https://start.solidjs.com) is a great all-in-one solution for building SolidJS apps but its flexibility comes with additional complexity, conventions, and tooling layers.

Granite is just a Vite plugin. No CLI, no runtime, no boilerplate.

|                        | SolidStart             | Granite                  |
|------------------------|------------------------|--------------------------|
| Foundations            | Vinxi x Nitro          | Vite                     |
| Dependencies           | 20+                    | < 10 (core + peer deps)  |
| Client bundle size     | ~90 KB (gzipped)       | ~35 KB (gzipped)         |
| Server bundle size     | ~220 KB                | ~90 KB                   |
| Memory usage (avg)     | 120–150 MB             | 40–60 MB                 |
| CPU usage (avg load)   | Higher                 | Lower                    |

> See the [full comparison repository](https://github.com/granite-dev/granite/tree/main/examples/comparison) for details.

## Acknowledgements

Granite is inspired by several innovative projects in the JavaScript ecosystem:

- **SolidStart** – SolidJS's official meta-framework, full-stack capabilities.
- **SolidHop** – A minimal and unopinionated Vike + Solid + Hono starter.
- **Vike** – A framework-agnostic SSR solution, formerly known as vite-plugin-ssr.
