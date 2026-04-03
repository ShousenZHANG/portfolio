<!-- Generated: 2026-04-03 | Files scanned: 31 | Token estimate: ~400 -->

# Dependencies

## External Services

| Service | Usage | Config |
|---------|-------|--------|
| Google Gemini | JD matching AI | `GEMINI_API_KEY` env, model via `GEMINI_MODEL` |
| EmailJS | Contact form send + auto-reply | Client-side SDK, credentials in component |
| Vercel | Hosting + serverless functions | `api/` directory convention |
| devicons CDN | Tech logo SVGs | `cdn.jsdelivr.net/gh/devicons/devicon` |

## Key Runtime Dependencies

| Package | Purpose | Used in |
|---------|---------|---------|
| `react` / `react-dom` 19 | UI framework | Everywhere |
| `gsap` + `@gsap/react` | Scroll animations | Hero, Experience, TechStack, Contact, TitleHeader, AnimatedCounter |
| `three` + `@react-three/fiber` + `@react-three/drei` | 3D rendering | TechStack section |
| `@react-three/postprocessing` | 3D post effects | TechStack |
| `swiper` | Carousel/slider | ShowcaseSection |
| `@emailjs/browser` | Email sending | Contact section |
| `@google/generative-ai` | Gemini SDK | api/agents/jd.js (server-side only) |
| `react-countup` | Number animation | AnimatedCounter |
| `react-responsive` | Media query hooks | Layout |
| `react-hot-toast` | Toast notifications | Forms |
| `react-icons` | Icon library | Various |
| `lucide-react` | Icon library (primary) | NavBar, Hero, Contact, Footer, Experience |

## UI Framework

| Package | Purpose |
|---------|---------|
| `tailwindcss` v4 | Utility CSS (via `@tailwindcss/vite` plugin) |
| `tw-animate-css` | Animation utilities |
| `@radix-ui/*` | Accessible primitives (dialog, hover-card, popover, progress, separator, slot, tooltip) |
| `class-variance-authority` | Variant management for shadcn components |
| `clsx` + `tailwind-merge` | Classname utility (`cn()` in `src/lib/utils.js`) |

## Dev Dependencies

| Package | Purpose |
|---------|---------|
| `vite` 7 | Build tool + dev server |
| `@vitejs/plugin-react` | React fast refresh |
| `eslint` 9 | Linting (flat config) |
| `eslint-plugin-react-hooks` | Hooks lint rules |
| `eslint-plugin-react-refresh` | HMR boundary checks |
