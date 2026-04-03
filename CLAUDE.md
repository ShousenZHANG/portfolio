# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal developer portfolio for Eddy Zhang — a single-page React app with 3D visuals, scroll animations, and an AI-powered job description matching feature. Deployed on Vercel.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Production build to dist/
npm run preview   # Preview production build
npm run lint      # ESLint (flat config, separate rules for src/ and api/)

# Run tests (Node.js built-in test runner)
node --test test/api/jdPrompt.test.mjs
```

## Architecture

**Frontend** — React 19 + Vite 7, plain JavaScript (JSX, no TypeScript). Tailwind CSS v4 via `@tailwindcss/vite` plugin.

**Page structure** — Single-page app with no router. `App.jsx` composes sections top-to-bottom:
`NavBar → Hero → ShowcaseSection → JDQuickCheck → LogoSection → Experience → TechStack → Contact → Footer → JDAssistant`

Heavy sections (`ShowcaseSection`, `TechStack`, `Contact`, `JDAssistant`) are lazy-loaded with `React.lazy` + `Suspense`.

**Animations** — GSAP with `ScrollTrigger` (registered globally in `main.jsx`). Sections use `useGSAP` hook for scroll-triggered entrance animations. Mobile breakpoints adjust animation parameters.

**3D rendering** — React Three Fiber + Drei for the TechStack section. GLB models live in `public/models/` and are rendered via `TechIconCardExperience` component.

**UI components** — shadcn/ui (new-york style, JSX not TSX) with Radix UI primitives in `src/components/ui/`. Configured via `components.json`. Path alias `@` → `src/`.

**JD Matching feature** — Two frontend surfaces for the same backend:
- `JDQuickCheck` — inline page section with JD paste + results
- `JDAssistant` — floating Sheet (mobile) / Popover (desktop) overlay

Both call `POST /api/agents/jd` which is a Vercel serverless function (`api/agents/jd.js`). It sends the JD + candidate CV to Google Gemini, then normalizes/validates the JSON response with deterministic scoring functions (`deriveAtsScore`, `deriveConfidenceScore`, `deriveFitLabel`, `patchFitTexts`).

**Scoring logic** — The backend does NOT trust Gemini's raw scores. It recomputes `overallScore` from a weighted formula (exact match 42%, related 18%, keyword coverage 15%, dimension average 25%, minus gap penalty). Hard eligibility failures (visa/experience) cap the score.

## Key Directories

- `src/sections/` — Full-page sections composing the portfolio
- `src/components/` — Reusable components (NavBar, Button, AnimatedCounter, TitleHeader)
- `src/components/ui/` — shadcn/ui primitives (badge, button, sheet, tooltip, etc.)
- `src/components/models/` — Three.js model wrapper components
- `src/constants/index.js` — All static content data (nav links, experience cards, tech stack icons, counter items)
- `api/agents/` — Vercel serverless functions
- `public/models/` — GLB 3D model files
- `test/` — Tests using `node:test` + `node:assert/strict`

## Environment Variables

- `GEMINI_API_KEY` — Required for the JD matching API endpoint
- `GEMINI_MODEL` — Optional, defaults to `gemini-2.5-flash-lite`
- EmailJS credentials are used client-side in the Contact section

## Conventions

- ESLint flat config with separate rule sets: browser globals for `src/`, Node globals for `api/`
- `no-unused-vars` allows uppercase and underscore-prefixed variables
- Contact form uses EmailJS (client-side `@emailjs/browser`), not a backend endpoint
- Swiper.js for project showcase carousels with fade effect
- `cn()` utility in `src/lib/utils.js` merges Tailwind classes (clsx + tailwind-merge)
