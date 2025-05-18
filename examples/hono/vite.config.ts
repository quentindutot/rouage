import { compress, rouage, solid } from '@rouage/core/vite'
import tailwind from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [solid(), rouage(), tailwind(), compress()],
})
