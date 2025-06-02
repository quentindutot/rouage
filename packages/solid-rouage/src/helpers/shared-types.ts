import type { IncomingMessage, ServerResponse } from 'node:http'

export type MaybePromise<T> = T | Promise<T>

export type FeatureHandleReturn<Content> = {
  status: number
  headers: Record<string, string>
  content: Content
}

export type AdapterServeExport =
  | { type: 'node'; handle: (req: IncomingMessage, res: ServerResponse) => MaybePromise<void> }
  | { type: 'fetch'; handle: (request: Request) => MaybePromise<Response> }
  | undefined
