import { type Options, defineConfig } from 'tsdown'

const baseOptions: Options = {
  format: 'esm',
  outDir: 'build',
  clean: false,
  dts: true,
  external: [/^virtual:/],
}

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig([
  {
    entry: ['src/client.tsx'],
    ...baseOptions,
    inputOptions: { jsx: 'preserve' },
    outExtensions: () => ({ js: '.jsx' }),
  },
  {
    entry: ['src/fetch.tsx'],
    ...baseOptions,
    inputOptions: { jsx: 'preserve' },
    outExtensions: () => ({ js: '.jsx' }),
  },
  {
    entry: ['src/node.tsx'],
    ...baseOptions,
    inputOptions: { jsx: 'preserve' },
    outExtensions: () => ({ js: '.jsx' }),
  },
  {
    entry: ['src/vite.ts'],
    ...baseOptions,
  },
])
