import type { Plugin } from 'vite'
import { compression } from 'vite-plugin-compression2'

const ASSETS_REGEX = /^assets\/.*\.(html|xml|css|json|js|mjs|svg|yaml|yml|toml)$/

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
export interface CompressOptions {}

export const compress = (options?: Partial<CompressOptions>): Plugin =>
  compression({
    include: ASSETS_REGEX,
    algorithm: 'brotliCompress',
    // threshold: 8192, // 8 KB
    skipIfLargerOrEqual: true,
  })
