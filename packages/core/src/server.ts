import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { H3, type H3Event, serveStatic } from 'h3-nightly'

export interface ServerInstance {
  fetch: (request: Request) => Response | Promise<Response>
  get: (path: string, handler: (event: H3Event) => Response | Promise<Response>) => void
  use: (path: string, handler: (event: H3Event) => Response | Promise<Response>) => void
}

export const createServer = (): ServerInstance => {
  const server = new H3({
    // onError(error) {
    //   console.error(error)
    // },
  })

  if (!import.meta.env.DEV) {
    server.use('/assets/**', (event) =>
      serveStatic(event, {
        getMeta: async (id) => {
          // biome-ignore lint/suspicious/noEmptyBlockStatements: <explanation>
          const stats = await stat(join('build', id)).catch(() => {})
          if (stats?.isFile()) {
            return { size: stats.size, mtime: stats.mtimeMs }
          }
        },
        getContents: (id) => {
          return readFile(join('build', id))
        },
      }),
    )
  }

  return { fetch: server.fetch.bind(server), get: server.get.bind(server), use: server.use.bind(server) }
}
