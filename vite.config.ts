import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/velog-api': {
        target: 'https://v2.velog.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/velog-api/, '/graphql'),
      },
    },
  },
})
