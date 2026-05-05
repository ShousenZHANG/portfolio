import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('@tsparticles')) return 'particles-vendor'
          if (id.includes('swiper')) return 'swiper-vendor'
          if (id.includes('@react-three/fiber')) return 'r3f-vendor'
          if (id.includes('@react-three/drei')) return 'drei-vendor'
          if (id.includes('three')) return 'three-vendor'
          if (id.includes('lucide-react')) return 'icons-vendor'
          return undefined
        },
      },
    },
  },
})
