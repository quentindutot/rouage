import type { IncomingMessage, ServerResponse } from 'node:http'

type MaybePromise<T> = T | Promise<T>

export type FeatureHandleReturn<Content> = {
  status: number
  headers: Record<string, string>
  content: Content
}

export type AdapterServeExport =
  | { type: 'node'; handler: (req: IncomingMessage, res: ServerResponse) => MaybePromise<void> }
  | { type: 'fetch'; handler: (request: Request) => MaybePromise<Response> }
  | undefined
