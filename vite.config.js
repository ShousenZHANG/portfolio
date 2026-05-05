import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // three-vendor (three + R3F + drei) sits at ~1.2MB raw / ~338KB gzipped
    // and is lazy-loaded only when the user scrolls to the TechStack
    // section, so it never blocks first paint. Splitting it further
    // reintroduces a TDZ initialisation cycle (see manualChunks below),
    // so we accept the size and lift the warning threshold accordingly.
    chunkSizeWarningLimit: 1300,
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
