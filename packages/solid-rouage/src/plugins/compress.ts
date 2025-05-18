import type { Plugin } from 'vite'
import { compression } from 'vite-plugin-compression2'

const ASSETS_REGEX = /^assets\/.*\.(html|xml|css|json|js|mjs|svg|yaml|yml|toml)$/

export interface CompressOptions {
  /**
   * The algorithm to use for compression.
   * @default 'brotli'
   */
  algorithm?: 'gzip' | 'brotli'
}

export const compress = (options?: Partial<CompressOptions>): Plugin =>
  compression({
    include: ASSETS_REGEX,
    algorithm: options?.algorithm === 'gzip' ? 'gzip' : 'brotliCompress',
    threshold: 2048, // 2 KB
    skipIfLargerOrEqual: true,
  })
