import type { Plugin } from 'vite'
import { type Options as SolidPluginOptions, default as solidPlugin } from 'vite-plugin-solid'

export interface SolidOptions extends Pick<SolidPluginOptions, 'babel' | 'include' | 'exclude'> {}

export const solid = (options?: Partial<SolidOptions>): Plugin =>
  solidPlugin({
    ssr: true,
    babel: options?.babel,
    include: options?.include,
    exclude: options?.exclude,
  })
