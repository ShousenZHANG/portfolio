<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/GSAP-3.13-88CE02?style=flat-square&logo=greensock&logoColor=white" />
  <img src="https://img.shields.io/badge/OpenAI-API-412991?style=flat-square&logo=openai&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel&logoColor=white" />
</p>

<h1 align="center">Eddy Zhang — Portfolio</h1>

<p align="center">
  An editorial developer portfolio with an award-site motion layer, a quantum-field
  canvas background, and a live AI-powered JD matching engine.
</p>

<p align="center">
  <a href="https://eddyzhang.me/"><strong>Live Site</strong></a> &nbsp;&middot;&nbsp;
  <a href="https://linkedin.com/in/eddy-shousen-zhang">LinkedIn</a> &nbsp;&middot;&nbsp;
  <a href="https://github.com/ShousenZHANG">GitHub</a>
</p>

---

## Tech Stack

```
Frontend        React 19  ·  Vite 7  ·  Tailwind CSS v4  ·  JavaScript (JSX)
Design system   OKLCH token system + editorial primitives in src/index.css (no UI library)
Motion          GSAP + ScrollTrigger  ·  Lenis smooth scroll  ·  custom cursor / magnetic / tilt
Background      Quantum-field canvas (2D harmonic-oscillator probability densities)
AI Integration  OpenAI API (gpt-4o-mini default)  ·  Vercel Serverless  ·  deterministic scoring
Contact         EmailJS (client-side, auto-reply)
Testing         Node.js built-in test runner (node:test) — 44 tests
CI              GitHub Actions (lint · test · build) + Lighthouse budget
Deployment      Vercel (frontend + serverless API)
```

---

## Key Features

**AI-Powered JD Matching** — Paste any job description and get an instant fit score.
The serverless handler calls the OpenAI API, then **recomputes** every score
deterministically (exact match 42%, related 18%, keyword coverage 15%, dimension
average 25%, minus a 20% gap penalty). Hard eligibility failures (visa/experience)
cap the overall score — the LLM's raw numbers are never trusted.

**Quantum-Field Background** — A Canvas 2D field whose particles are seeded from the
probability density |ψ|² of a 2D quantum harmonic oscillator; the cursor acts as an
observation that collapses nearby particles. Pauses past the hero and under
`prefers-reduced-motion`.

**Award-Site Motion Layer** — Lenis smooth scroll synced to the GSAP ticker, kinetic
word-mask reveals, a two-element custom cursor, magnetic buttons, and 3D tilt cards —
all gated on `prefers-reduced-motion` and `(pointer: fine)`.

**Interactive Skill Constellation** — An SVG skill graph; hover to trace a node's
links, click to see the projects and roles where each skill shipped. Fully keyboard
accessible.

**Editorial Design System** — One owned signature palette (electric indigo-violet +
cyan on a violet near-black ink ladder). All tokens and primitives live in
`src/index.css` — no component library.

**Responsive & Accessible** — Adaptive 320px–4K, glass-pill mobile navbar, skip-link,
reduced-motion and focus-visible support, WCAG-AA text contrast.

---

## Architecture

```
src/
  sections/        Page sections (Hero, JDQuickCheck, Experience, ShowcaseSection,
                   SkillsConstellation, LogoSection, Contact, Footer)
  components/      NavBar, AnimatedCounter, TitleHeader, RevealText, Magnetic,
                   CustomCursor, InteractiveBackground, LogoMark, ErrorBoundary
  hooks/           useSmoothScroll, useMagnetic, useTilt, useScrollReveal, useJDAnalysis
  constants/       Static data (navLinks, expCards, counterItems; projects.js)
  lib/             motion helpers (prefersReducedMotion)
api/
  agents/jd.js     Thin HTTP handler — rate-limit, validate, delegate, respond
  agents/_jd/      LLM adapter · pure scoring · orchestrator · rate limiter
                   (the leading _ keeps Vercel from routing these as endpoints)
  og.jsx           Dynamic Open Graph image (edge runtime)
test/
  api/jd/          LLM adapter + scoring tests (44 tests)
```

The JD Evaluator is split so each part has one job: `_jd/llm.js` owns the prompt and
the OpenAI call, `_jd/scoring.js` is a pure deterministic function, and
`_jd/evaluator.js` composes them. See [CONTEXT.md](CONTEXT.md) for the domain glossary.

---

## Quick Start

```bash
git clone https://github.com/ShousenZHANG/portfolio.git
cd portfolio
npm install
npm run dev       # http://localhost:5173
```

```bash
npm run build     # Production build to dist/
npm run lint      # ESLint (flat config)
npm test          # 44 tests (node:test)
```

### Environment Variables

| Variable          | Required | Default       | Purpose                                          |
| ----------------- | -------- | ------------- | ------------------------------------------------ |
| `OPENAI_API_KEY`  | Yes      | —             | Powers the JD matching serverless endpoint       |
| `OPENAI_MODEL`    | No       | `gpt-4o-mini` | Override the model (e.g. `gpt-4.1-nano`)          |

> Set `OPENAI_API_KEY` in **Vercel → Settings → Environment Variables**, then redeploy.
> EmailJS credentials (`VITE_APP_EMAILJS_*`) are read client-side for the contact form.

---

## License

MIT
