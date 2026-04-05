<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Three.js-r180-000000?style=flat-square&logo=threedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/GSAP-3.13-88CE02?style=flat-square&logo=greensock&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_API-AI-4285F4?style=flat-square&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel&logoColor=white" />
</p>

<h1 align="center">Eddy Zhang — Portfolio</h1>

<p align="center">
  Full-stack AI developer portfolio featuring 3D visuals, scroll animations, particle network background, and an AI-powered JD matching engine.
</p>

<p align="center">
  <a href="[https://eddy-zhang-portfolio.vercel.app/](https://eddyzhang.me/)"><strong>Live Site</strong></a> &nbsp;&middot;&nbsp;
  <a href="https://linkedin.com/in/eddy-shousen-zhang">LinkedIn</a> &nbsp;&middot;&nbsp;
  <a href="https://github.com/ShousenZHANG">GitHub</a>
</p>

---

## Tech Stack

```
Frontend        React 19  ·  Vite 7  ·  Tailwind CSS v4  ·  JavaScript (JSX)
3D & Animation  Three.js  ·  React Three Fiber  ·  Drei  ·  GSAP + ScrollTrigger
AI Integration  Google Gemini API  ·  Vercel Serverless  ·  Deterministic scoring
Background      tsParticles (particle network with mouse-grab interactivity)
Contact         EmailJS (client-side, auto-reply)
Testing         Node.js built-in test runner (node:test) — 45 tests
Deployment      Vercel (frontend + serverless API)
```

---

## Key Features

**Interactive 3D Tech Stack** — GLB models rendered with React Three Fiber, each card with independent Canvas, Float animation, and OrbitControls.

**Particle Network Background** — tsParticles with 55 cyan/emerald particles, connecting lines, and mouse-grab interactivity at 30fps.

**AI-Powered JD Matching** — Paste a job description, get an instant fit score. Backend calls Gemini API, then recomputes scores deterministically (exact match 42%, related 18%, keyword coverage 15%, dimension average 25%, minus gap penalty).

**Scroll Animations** — GSAP + ScrollTrigger for staggered entrance animations across all sections. Hero uses orchestrated timeline sequence.

**Responsive Design** — CSS Grid hero layout, mobile hamburger dropdown, adaptive at 320px–4K. Reduced-motion and focus-visible support built in.

---

## Architecture

```
src/
  sections/        Page sections (Hero, ShowcaseSection, Experience, TechStack, Contact, etc.)
  components/      Reusable components (NavBar, Button, AnimatedCounter, TitleHeader)
  hooks/           Custom hooks (useJDAnalysis, useIsMobile, useScrollReveal)
  constants/       Static data (navLinks, projects, expCards, techStackIcons)
  lib/             Utilities (jd-normalize, api-client)
api/
  agents/jd.js     Vercel serverless — Gemini API integration + scoring
test/
  api/             Backend scoring function tests (29 tests)
  lib/             Frontend normalize + API client tests (16 tests)
```

---

## Quick Start

```bash
git clone https://github.com/ShousenZHANG/portfolio.git
cd portfolio
npm install
npm run dev       # http://localhost:5173
```

```bash
npm run build     # Production build
npm run lint      # ESLint
npm test          # 45 tests
```

> Requires `GEMINI_API_KEY` environment variable for the JD matching feature.

---

## License

MIT

