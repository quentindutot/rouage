import { type Options, defineConfig } from 'tsup'
import packageJson from './package.json'

const baseOptions: Options = {
  format: 'esm',
  outDir: 'build',
  splitting: false,
  clean: false,
  dts: true,
  external: [/^virtual:/, ...Object.keys(packageJson.devDependencies), ...Object.keys(packageJson.peerDependencies)],
  noExternal: [...Object.keys(packageJson.dependencies)],
}

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig([
  {
    entry: ['src/client.tsx'],
    ...baseOptions,
    esbuildOptions(esOptions) {
      esOptions.jsx = 'preserve'
    },
    outExtension: () => ({ js: '.jsx' }),
  },
  {
    entry: ['src/server.tsx'],
    ...baseOptions,
    esbuildOptions(esOptions) {
      esOptions.jsx = 'preserve'
    },
    outExtension: () => ({ js: '.jsx' }),
  },
  {
    entry: ['src/vite.ts'],
    ...baseOptions,
  },
])
