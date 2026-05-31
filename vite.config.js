import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('swiper')) return 'swiper-vendor'
          if (id.includes('gsap')) return 'gsap-vendor'
          if (id.includes('lucide-react')) return 'icons-vendor'
          return undefined
        },
      },
    },
  },
})
