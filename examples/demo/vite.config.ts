import { granite, solid } from '@granite/core/plugin'
import tailwind from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  plugins: [solid(), granite(), tailwind()],
})
