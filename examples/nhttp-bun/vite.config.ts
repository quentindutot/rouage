import tailwind from '@tailwindcss/vite'
import { compress, rouage, solid } from 'solid-rouage/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [solid(), rouage(), tailwind(), compress()],
})
