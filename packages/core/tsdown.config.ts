import { type Options, defineConfig } from 'tsdown'
import packageJson from './package.json'

const baseOptions: Options = {
  format: 'esm',
  outDir: 'build',
  clean: false,
  external: [/^virtual:/, ...Object.keys(packageJson.devDependencies), ...Object.keys(packageJson.peerDependencies)],
  noExternal: [...Object.keys(packageJson.dependencies)],
}

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig([
  {
    entry: ['src/client.tsx'],
    ...baseOptions,
    dts: true,
    inputOptions: { jsx: 'preserve' },
    outExtensions: () => ({ js: '.jsx' }),
  },
  {
    entry: ['src/client-internal.tsx'],
    ...baseOptions,
    dts: false,
    inputOptions: { jsx: 'preserve' },
    outExtensions: () => ({ js: '.jsx' }),
  },
  {
    entry: ['src/server.tsx'],
    ...baseOptions,
    dts: true,
    inputOptions: { jsx: 'preserve' },
    outExtensions: () => ({ js: '.jsx' }),
  },
  {
    entry: ['src/server-internal.tsx'],
    ...baseOptions,
    dts: false,
    inputOptions: { jsx: 'preserve' },
    outExtensions: () => ({ js: '.jsx' }),
  },
  {
    entry: ['src/vite.ts'],
    ...baseOptions,
    dts: true,
  },
])
