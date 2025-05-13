import { compress, rouage, solid } from '@rouage/core/vite'
import tailwind from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  plugins: [solid(), rouage(), tailwind(), compress()],
})
