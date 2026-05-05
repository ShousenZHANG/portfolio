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
          // three.js + R3F + drei must share a chunk: they have circular
          // imports that produce TDZ ("Cannot access X before initialization")
          // when split, because chunk load order isn't deterministic.
          if (
            id.includes('@react-three') ||
            id.includes('/three/') ||
            id.includes('\\three\\') ||
            id.includes('troika-three-text') ||
            id.includes('three-stdlib') ||
            id.includes('three-mesh-bvh') ||
            id.includes('meshline')
          ) {
            return 'three-vendor'
          }
          if (id.includes('lucide-react')) return 'icons-vendor'
          return undefined
        },
      },
    },
  },
})
