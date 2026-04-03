<!-- Generated: 2026-04-03 | Files scanned: 31 | Token estimate: ~650 -->

# Architecture

## System Type
Single-page portfolio app (React SPA) + Vercel serverless API.

## Data Flow

```
Browser (React SPA)
  |
  |-- static sections (Hero, Showcase, Experience, TechStack, Contact, Footer)
  |       reads constants/index.js for all static content
  |
  |-- JD matching (JDQuickCheck section + JDAssistant overlay)
  |       POST /api/agents/jd  { jd, cvText }
  |       |
  |       Vercel Serverless Function (api/agents/jd.js)
  |         |-- Google Gemini API (generative AI)
  |         |-- Normalize + recompute scores (deterministic)
  |         |-- Return JSON response
  |
  |-- Contact form
  |       EmailJS client-side SDK (no backend)
  |
  |-- 3D models
        public/models/*.glb -> React Three Fiber <Canvas>
```

## Entry Points

| Entry | File | Purpose |
|-------|------|---------|
| App | `src/main.jsx` | React root + GSAP ScrollTrigger registration |
| API | `api/agents/jd.js` | Vercel serverless JD matching endpoint |

## Lazy Loading Boundary

Eagerly loaded: NavBar, Hero, LogoSection, Experience, JDQuickCheck, Footer
Lazy loaded: ShowcaseSection, TechStack, Contact, JDAssistant

## Key Design Decisions

1. **No router** — single scrollable page, anchor links for navigation
2. **Scores recomputed server-side** — Gemini output is treated as raw signal, not final scores
3. **Dual JD UI** — JDQuickCheck (inline) and JDAssistant (floating) share the same API but have independent normalizeResult() functions
4. **3D per-card Canvas** — each TechStack card has its own `<Canvas>`, not a shared scene
5. **GSAP global** — ScrollTrigger registered once in main.jsx, used across all sections via useGSAP
