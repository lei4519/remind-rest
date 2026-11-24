import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './',
  plugins: [vue()],
  server: { host: '127.0.0.1', port: 3000, strictPort: true },
  build: { outDir: 'dist/renderer' }
})
