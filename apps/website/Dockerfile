FROM node/lts AS builder

WORKDIR /app

COPY apps ./apps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./

RUN pnpm install --frozen-lockfile
RUN cd apps/website && pnpm build

# ----------------------------------------

FROM nginx:alpine

COPY --from=builder /app/apps/website/build /usr/share/nginx/html
