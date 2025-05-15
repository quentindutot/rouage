import { isServer } from 'solid-js/web'

const sfnRegistry = new Map<string, unknown>()

export const getServerFunction = (identifier: string) => {
  return sfnRegistry.get(identifier)
}

export const setServerFunction = (identifier: string, handler: unknown) => {
  sfnRegistry.set(identifier, handler)
}

export const createServerFunction = <Handler>(identifier: string, handler: Handler): Handler => {
  if (isServer) {
    setServerFunction(identifier, handler)
  }

  return handler
}
