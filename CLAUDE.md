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

npm test          # Run all tests (Node.js built-in test runner)

# Run a single test file
node --test test/api/jd/scoring.test.mjs
```

## Architecture

**Frontend** — React 19 + Vite 7, plain JavaScript (JSX, no TypeScript). Tailwind CSS v4 via `@tailwindcss/vite` plugin.

**Page structure** — Single-page app with no router. `App.jsx` composes sections top-to-bottom:
`NavBar → Hero → ShowcaseSection → JDQuickCheck → LogoSection → Experience → TechStack → Contact → Footer`

Heavy sections (`ShowcaseSection`, `TechStack`, `Contact`) are lazy-loaded with `React.lazy` + `Suspense`.

**Animations** — GSAP with `ScrollTrigger` (registered globally in `main.jsx`). Sections use `useGSAP` hook for scroll-triggered entrance animations. Mobile breakpoints adjust animation parameters.

**3D rendering** — React Three Fiber + Drei for the TechStack section. GLB models live in `public/models/` and are rendered via `TechIconCardExperience` component.

**UI components** — shadcn/ui (new-york style, JSX not TSX) with Radix UI primitives in `src/components/ui/`. Configured via `components.json`. Path alias `@` → `src/`.

**JD Matching feature** — Single frontend surface (`JDQuickCheck`) calls `POST /api/agents/jd`. The handler at `api/agents/jd.js` is a thin transport layer that delegates to a JD Evaluator module split across `api/agents/_jd/`:
- `_jd/llm.js` — LLM Adapter. Builds the prompt, calls OpenAI (Chat Completions, JSON mode), repairs malformed JSON, returns a `RawJDLLMResult`. Owns `buildPrompt` + `repairJson` + `callOpenAIJD`.
- `_jd/scoring.js` — Pure-function Scoring. Takes a `RawJDLLMResult`, produces a flat `JDScore`. Owns weights, fit thresholds, eligibility caps, dimension fallback chain. Exports `scoreJD` (main entry) plus `clampScore`, `normalizeDimensionScores`, `deriveAtsScore`, `deriveConfidenceScore`, `deriveFitLabel`, `patchFitTexts` for granular tests.
- `_jd/evaluator.js` — Orchestrator. `evaluateJD(jd, cvText) → JDScore` is `scoreJD(await callOpenAIJD(jd, cvText))`.

The leading underscore in `_jd/` prevents Vercel from routing those files as endpoints.

**Scoring logic** — The backend does NOT trust Gemini's raw scores. `scoreJD` recomputes `overallScore` from a weighted formula (exact match 42%, related 18%, keyword coverage 15%, dimension average 25%, minus gap penalty 20%). Hard eligibility failures (visa/experience Issue) cap `overallScore` at 35; location Issue caps at 75. See [CONTEXT.md](CONTEXT.md) for the domain glossary.

**Response shape** — Flat. Top-level fields: `overallScore`, `exactMatchScore`, `relatedMatchScore`, `gapScore`, `confidenceScore`, `dimensionScores`, `fitLabel`, `fitHeadline`, `fitVerdict`, `eligibility`, `evidencePairs`, `matchedKeywords`, `missingKeywords`, `related`, `riskFlags`, `summary`, `strengths`, `gaps`, `suggestions`. No nested `score` object — frontend reads fields directly.

## Key Directories

- `src/sections/` — Full-page sections composing the portfolio
- `src/components/` — Reusable components (NavBar, Button, AnimatedCounter, TitleHeader)
- `src/components/ui/` — shadcn/ui primitives (badge, button, sheet, tooltip, etc.)
- `src/components/models/` — Three.js model wrapper components
- `src/constants/index.js` — All static content data (nav links, experience cards, tech stack icons, counter items)
- `api/agents/jd.js` — Thin HTTP handler for JD evaluation
- `api/agents/_jd/` — JD Evaluator internals (llm, scoring, evaluator). Underscore prefix excludes from Vercel routing.
- `public/cv/main.txt` — CV plain text fetched at runtime by `useJDAnalysis`
- `public/models/` — GLB 3D model files
- `test/api/jd/` — Tests for `_jd/` modules using `node:test` + `node:assert/strict`

## Environment Variables

- `OPENAI_API_KEY` — Required for the JD matching API endpoint
- `OPENAI_MODEL` — Optional, defaults to `gpt-4o-mini` (cheapest reliable; set to `gpt-4.1-nano` for even lower cost)
- EmailJS credentials are used client-side in the Contact section

## Conventions

- ESLint flat config with separate rule sets: browser globals for `src/`, Node globals for `api/`
- `no-unused-vars` allows uppercase and underscore-prefixed variables
- Contact form uses EmailJS (client-side `@emailjs/browser`), not a backend endpoint
- Swiper.js for project showcase carousels with fade effect
- `src/lib/motion.js` exposes `prefersReducedMotion` for animation gating
