import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import zlib from 'node:zlib'
import type { Logger, Plugin } from 'vite'

const ASSETS_REGEX = /^assets\/.*\.(html|xml|css|json|js|mjs|svg|yaml|yml|toml)$/
const MAX_CONCURRENT = Math.max(1, (os.cpus()?.length || 1) - 1)

const gzipAsync = promisify(zlib.gzip)
const gzipCompress = (source: Uint8Array) =>
  gzipAsync(source, {
    level: zlib.constants.Z_BEST_COMPRESSION,
  })

const brotliAsync = promisify(zlib.brotliCompress)
const brotliCompress = (source: Uint8Array) =>
  brotliAsync(source, {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
    },
  })

const createQueue = () => {
  const queue: Array<() => Promise<void>> = []
  let running = 0
  const errors: Error[] = []

  const run = async (): Promise<void> => {
    while (running < MAX_CONCURRENT && queue.length > 0) {
      const task = queue.shift()
      if (!task) {
        break
      }

      running++

      try {
        await task()
      } catch (error) {
        errors.push(error as Error)
      } finally {
        running--
        run()
      }
    }
  }

  return {
    enqueue: (task: () => Promise<void>) => {
      queue.push(task)
      run()
    },
    wait: async () => {
      while (running > 0) {
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
      if (errors.length > 0) {
        throw new AggregateError(errors, 'Compression tasks failed')
      }
    },
  }
}

const stringToBytes = (input: string | Uint8Array): Uint8Array =>
  typeof input === 'string' ? new TextEncoder().encode(input) : input

const replaceFileName = (staticPath: string, extension: string): string => {
  const { dir, name, ext } = path.parse(staticPath)
  const basePath = dir ? `${dir}/` : ''
  return `${basePath}${name}${ext}${extension}`
}

export interface CompressOptions {
  /**
   * The minimum size of the file to compress.
   * @default 2048
   */
  threshold?: number
}

export const compress = (options?: Partial<CompressOptions>): Plugin => {
  const threshold = options?.threshold ?? 2048

  const queue = createQueue()
  let logger: Logger

  return {
    name: 'rouage-compress',
    apply: 'build',
    enforce: 'post',
    configResolved(resolvedConfig) {
      logger = resolvedConfig.logger
    },
    async generateBundle(_, outputBundle) {
      for (const fileName in outputBundle) {
        if (!ASSETS_REGEX.test(fileName)) {
          continue
        }

        const bundle = outputBundle[fileName]
        const source = stringToBytes(bundle.type === 'asset' ? bundle.source : bundle.code)
        if (source.length < threshold) {
          continue
        }

        // Compress with both gzip and brotli
        queue.enqueue(async () => {
          try {
            // Gzip compression
            const gzipCompressed = await gzipCompress(source)
            if (gzipCompressed.length < source.length) {
              const gzipName = replaceFileName(fileName, '.gz')
              this.emitFile({ type: 'asset', fileName: gzipName, source: gzipCompressed })
            }

            // Brotli compression
            const brotliCompressed = await brotliCompress(source)
            if (brotliCompressed.length < source.length) {
              const brotliName = replaceFileName(fileName, '.br')
              this.emitFile({ type: 'asset', fileName: brotliName, source: brotliCompressed })
            }
          } catch (error) {
            logger?.error(`Failed to compress ${fileName}: ${error}`)
          }
        })
      }

      await queue.wait().catch((error) => {
        this.error(error)
      })
    },
  }
}
