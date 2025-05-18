import { defineConfig } from 'tsdown'

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  outDir: 'build',
  clean: true,
  dts: false,
})
