import type { IncomingMessage, ServerResponse } from 'node:http'

export type FeatureHandleReturn<Content> = {
  status: number
  headers: Record<string, string>
  content: Content
}

export type AdapterServeExport =
  | { type: 'node'; handler: (req: IncomingMessage, res: ServerResponse) => Promise<void> }
  | { type: 'fetch'; handler: (request: Request) => Promise<Response> }
  | undefined
