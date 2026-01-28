import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/zervio-dining/",
  plugins: [react()],
  build: {
    sourcemap: false,
    minify: "esbuild",
  },
  server: {
    proxy: {
      "/api": {
        target: "http://checkwebsite.co.in/tummly",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    }
  }
})
