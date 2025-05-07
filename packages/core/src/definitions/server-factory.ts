import type { EventHandler, EventHandlerRequest, HTTPMethod } from 'h3-nightly'
import type { JSX } from 'solid-js'

// export interface RouteConfig {
//   preload?: () => void
//   component: () => JSX.Element
// }

// export const createRoute = (config: RouteConfig): RouteConfig => config

// export interface HandlerConfig {
//   handler: () => void
// }

// export const createHandler = (config: HandlerConfig): HandlerConfig => config

// export interface FunctionConfig {
//   function: () => void
// }

// export const createFunction = (config: FunctionConfig): FunctionConfig => config

interface ServerRouteComponent {
  path: string
  method?: HTTPMethod
  preload?: () => void
  component: () => JSX.Element
  children?: ServerRoute[]
}

export const isRouteComponent = (config: ServerRoute): config is ServerRouteComponent => 'component' in config

interface ServerRouteHandler {
  path: string
  method?: HTTPMethod
  handler: EventHandler<EventHandlerRequest, unknown>
  children?: ServerRoute[]
}

export const isRouteHandler = (config: ServerRoute): config is ServerRouteHandler => 'handler' in config

type ServerRoute = ServerRouteComponent | ServerRouteHandler

export interface ServerConfig {
  routes: ServerRoute[]
  plugins?: unknown[]
}

export const createServer = (config: ServerConfig) => config
