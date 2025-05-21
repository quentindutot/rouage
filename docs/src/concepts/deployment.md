---
title: Deployment
---

# Deployment

This page provides guidance for deploying a Rouage application.  

## Build & Start

First build the project:

```sh
npm run build
```

Then start the server:

::: code-group

```sh [node]
node build/server/index.js
```

```sh [bun]
bun build/server/index.js
```

```sh [deno]
deno run --allow-net --allow-read build/server/index.js
```

:::

## Dockerfile

Below is an example Dockerfile for deploying with the Node.js runtime.

```Dockerfile
FROM node:lts-alpine AS build

WORKDIR /app

COPY public ./public
COPY src ./src
COPY package.json package-lock.json vite.config.ts tsconfig.json ./

ENV NODE_ENV=production
RUN npm ci
RUN npm run build

FROM node:lts-alpine

WORKDIR /app

COPY --from=build /app/build ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server/index.js"]
```
