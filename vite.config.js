import { defineConfig } from 'vite'

export default defineConfig({
  base: '/talkfolkdance/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  }
})
