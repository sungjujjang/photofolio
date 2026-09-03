import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [tailwindcss()],
  server: {
    port: 5010,
    strictPort: true,
    host: true,
    proxy: {
      '/velog-api': {
        target: 'https://v2.velog.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/velog-api/, '/graphql'),
      },
    },
  },
})
