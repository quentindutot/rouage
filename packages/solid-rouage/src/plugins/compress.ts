import { readFile, stat, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import zlib from 'node:zlib'
import color from 'picocolors'
import type { Plugin, ResolvedConfig } from 'vite'

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

const replaceFileName = (fileName: string, extension: string): string => {
  const { dir, name, ext } = path.parse(fileName)
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

  let resolvedConfig: ResolvedConfig

  const queue = createQueue()

  const stats = {
    gzip: { count: 0, originalSize: 0, compressedSize: 0 },
    brotli: { count: 0, originalSize: 0, compressedSize: 0 },
  }

  return {
    name: 'rouage-compress',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      resolvedConfig = config
    },
    async writeBundle(_, outputBundle) {
      for (const fileName in outputBundle) {
        if (!ASSETS_REGEX.test(fileName)) {
          continue
        }

        const filePath = path.resolve(resolvedConfig.build.outDir, fileName)

        queue.enqueue(async () => {
          const fileStats = await stat(filePath)
          if (fileStats.size < threshold) {
            return
          }

          const source = await readFile(filePath)

          const gzipCompressed = await gzipCompress(source)
          if (gzipCompressed.length < source.length) {
            const gzipName = replaceFileName(fileName, '.gz')
            const gzipPath = path.resolve(resolvedConfig.build.outDir, gzipName)
            await writeFile(gzipPath, gzipCompressed)

            stats.gzip.count++
            stats.gzip.originalSize += source.length
            stats.gzip.compressedSize += gzipCompressed.length
          }

          const brotliCompressed = await brotliCompress(source)
          if (brotliCompressed.length < source.length) {
            const brotliName = replaceFileName(fileName, '.br')
            const brotliPath = path.resolve(resolvedConfig.build.outDir, brotliName)
            await writeFile(brotliPath, brotliCompressed)

            stats.brotli.count++
            stats.brotli.originalSize += source.length
            stats.brotli.compressedSize += brotliCompressed.length
          }
        })
      }

      await queue.wait().catch((error) => {
        this.error(error)
      })

      if (stats.gzip.count > 0 || stats.brotli.count > 0) {
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.info(`\n${color.green('compressing assets...')}`)

        if (stats.gzip.count > 0) {
          const gzipSaved = (stats.gzip.originalSize - stats.gzip.compressedSize) / 1024
          // biome-ignore lint/suspicious/noConsole: <explanation>
          console.info(
            `${color.cyan('gzip')} ${color.gray(`${stats.gzip.count} compressed, ${gzipSaved.toFixed(2)} kB saved`)}`,
          )
        }

        if (stats.brotli.count > 0) {
          const brotliSaved = (stats.brotli.originalSize - stats.brotli.compressedSize) / 1024
          // biome-ignore lint/suspicious/noConsole: <explanation>
          console.info(
            `${color.cyan('brotli')} ${color.gray(`${stats.brotli.count} compressed, ${brotliSaved.toFixed(2)} kB saved`)}`,
          )
        }

        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.info('')
      }
    },
  }
}
