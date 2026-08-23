import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

// The display face sits two hops from the document: index.html loads the CSS bundle,
// and only once that has downloaded AND parsed does the `@fontsource-variable/mona-sans`
// import inside src/index.css reveal the woff2 URL. The hero h1 is the LCP candidate and
// the element DecodeWord animates, so both round trips are paid in fallback text that
// then reflows. A preload collapses them into one — but Vite content-hashes the filename,
// so it cannot be written by hand in index.html; the name has to be read back out of the
// emitted bundle.
function preloadDisplayFont() {
  // Anchored on `latin-wght` so the latin-ext and vietnamese cuts do not match. Those
  // cover glyphs this site never paints, and preloading all of them would spend more
  // bandwidth up front than the late discovery costs — the opposite of the fix.
  const LATIN_WGHT = /(^|\/)mona-sans-latin-wght-normal-[\w-]+\.woff2$/

  let base = '/'
  let logger = console

  return {
    name: 'preload-display-font',
    // Dev serves the font unhashed straight from node_modules, so there is nothing to
    // resolve and no bundle to resolve it from.
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      base = config.base
      logger = config.logger
    },
    transformIndexHtml(html, ctx) {
      const file = Object.keys(ctx.bundle ?? {}).find((name) => LATIN_WGHT.test(name))
      if (!file) {
        // A fontsource upgrade that renames the file would otherwise drop the preload
        // in silence: the page still works, just slower — exactly the class of bug that
        // never gets noticed.
        logger.warn('[preload-display-font] no mona-sans latin woff2 in the bundle — preload skipped')
        return
      }

      return {
        html,
        tags: [
          {
            tag: 'link',
            attrs: {
              rel: 'preload',
              as: 'font',
              type: 'font/woff2',
              // Not optional. Fonts are always fetched in CORS mode, so a preload without
              // this lands in a different cache partition than the @font-face request and
              // the browser downloads the file twice.
              crossorigin: true,
              href: base + file,
            },
            injectTo: 'head',
          },
        ],
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadDisplayFont()],
  build: {
    rollupOptions: {
      // Two static entries — / (en) and /zh. Declaring `input` REPLACES Vite's
      // implicit root entry, so the root index.html must be listed explicitly
      // or it silently vanishes from the build (a deploy that "works" and
      // serves nothing). Baidu does not reliably execute JS, which is why /zh
      // is a real prerendered HTML file with a Chinese <head>, not a client-
      // side rewrite.
      input: {
        main: resolve(__dirname, 'index.html'),
        zh: resolve(__dirname, 'zh/index.html'),
      },
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
