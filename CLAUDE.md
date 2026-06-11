# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal developer portfolio for Eddy Zhang — a single-page React app with an editorial design system, award-site motion layer, and an AI-powered job description matching feature. Deployed on Vercel.

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
`NavBar → Hero (+AnimatedCounter) → JDQuickCheck → LogoSection → Experience → ShowcaseSection → SkillsConstellation → Contact → Footer`

Heavy sections (`ShowcaseSection`, `Contact`) are lazy-loaded with `React.lazy` + `Suspense` and prefetched during idle time.

**Design system** — All visual tokens live in `src/index.css` `:root`: signature accents (`--sig` indigo-violet, `--sig-2` cyan), ink surface ladder (`--ink-0/1/2`), text ladder (`--tx-0/1/2`), hairlines, radius/type/spacing scales. Editorial primitives (`.ed-shell`, `.ed-eyebrow`, `.ed-display`, `.ed-tile`, `.ed-btn`) are the building blocks — no component library.

**Motion layer** — Lenis smooth scroll synced to GSAP's ticker (`useSmoothScroll`); in-page `#` anchors are intercepted and routed through `lenis.scrollTo`. GSAP `ScrollTrigger` (registered in `main.jsx`) drives section entrances via `useGSAP`. Custom two-element cursor, magnetic hover (`useMagnetic`), 3D tilt (`useTilt`), kinetic word reveals (`RevealText`). Everything gates on `prefersReducedMotion` and `(pointer: fine)` where appropriate.

**Background** — `InteractiveBackground` renders a quantum-field canvas (particles seeded from QHO probability densities); it pauses past the hero and under reduced motion.

**JD Matching feature** — Single frontend surface (`JDQuickCheck`) calls `POST /api/agents/jd`. The handler at `api/agents/jd.js` is a thin transport layer that delegates to a JD Evaluator module split across `api/agents/_jd/`:
- `_jd/llm.js` — LLM Adapter. Builds the prompt, calls OpenAI (Chat Completions, JSON mode), repairs malformed JSON, returns a `RawJDLLMResult`. Owns `buildPrompt` + `repairJson` + `callOpenAIJD`.
- `_jd/scoring.js` — Pure-function Scoring. Takes a `RawJDLLMResult`, produces a flat `JDScore`. Owns weights, fit thresholds, eligibility caps, dimension fallback chain. Exports `scoreJD` (main entry) plus `clampScore`, `normalizeDimensionScores`, `deriveAtsScore`, `deriveConfidenceScore`, `deriveFitLabel`, `patchFitTexts` for granular tests.
- `_jd/evaluator.js` — Orchestrator. `evaluateJD(jd, cvText) → JDScore` is `scoreJD(await callOpenAIJD(jd, cvText))`.

The leading underscore in `_jd/` prevents Vercel from routing those files as endpoints.

**Scoring logic** — The backend does NOT trust the LLM's raw scores. `scoreJD` recomputes `overallScore` from a weighted formula (exact match 42%, related 18%, keyword coverage 15%, dimension average 25%, minus gap penalty 20%). Hard eligibility failures (visa/experience Issue) cap `overallScore` at 35; location Issue caps at 75. See [CONTEXT.md](CONTEXT.md) for the domain glossary.

**Response shape** — Flat. Top-level fields: `overallScore`, `exactMatchScore`, `relatedMatchScore`, `gapScore`, `confidenceScore`, `dimensionScores`, `fitLabel`, `fitHeadline`, `fitVerdict`, `eligibility`, `evidencePairs`, `matchedKeywords`, `missingKeywords`, `related`, `riskFlags`, `summary`, `strengths`, `gaps`, `suggestions`. No nested `score` object — frontend reads fields directly.

## Key Directories

- `src/sections/` — Full-page sections composing the portfolio
- `src/components/` — Reusable components (NavBar, AnimatedCounter, TitleHeader, RevealText, Magnetic, CustomCursor, InteractiveBackground, LogoMark)
- `src/hooks/` — Motion + data hooks (useSmoothScroll, useMagnetic, useTilt, useScrollReveal, useJDAnalysis)
- `src/constants/index.js` — Static content data (nav links, experience cards, counter items); `projects.js` for showcase entries
- `api/agents/jd.js` — Thin HTTP handler for JD evaluation
- `api/agents/_jd/` — JD Evaluator internals (llm, scoring, evaluator). Underscore prefix excludes from Vercel routing.
- `public/cv/main.txt` — CV plain text fetched at runtime by `useJDAnalysis`
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
