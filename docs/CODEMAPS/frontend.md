<!-- Generated: 2026-04-03 | Files scanned: 28 | Token estimate: ~700 -->

# Frontend

## Component Hierarchy

```
App.jsx
  NavBar              (sticky header, scroll-aware bg, reads navLinks from constants)
  Hero                (animated text + video + Download CV, GSAP entrance)
    AnimatedCounter   (CountUp + GSAP scroll-triggered counting)
  ShowcaseSection*    (project cards with Swiper fade carousels)
  JDQuickCheck        (inline JD paste -> POST /api/agents/jd -> results display)
  LogoSection         (infinite CSS marquee of devicon logos)
  Experience          (alternating timeline cards, GSAP staggered entrance)
  TechStack*          (3D GLB model cards)
    TechIconCardExperience  (R3F Canvas + Float + OrbitControls per card)
  Contact*            (EmailJS form, GSAP entrance)
  Footer              (static links)
  JDAssistant*        (Sheet on mobile / Popover on desktop, same JD API)

* = React.lazy loaded
```

## Section → ID Mapping (anchor navigation)

| Section | DOM id | Nav link |
|---------|--------|----------|
| Hero | `#hero` | Logo click |
| ShowcaseSection | `#projects` | "Projects" |
| Experience | `#experience` | "Experience" |
| TechStack | `#skills` | "Skills" |
| Contact | `#contact` | "Contact me" button |
| AnimatedCounter | `#counter` | "See My Work" scrolls here |

## State Management

No global state library. All state is local per component:
- `NavBar` — `scrolled` (boolean, scroll listener)
- `Contact` — `form` object, `loading`, `sent` flags
- `JDQuickCheck` — JD text, analysis result, loading/error
- `JDAssistant` — same pattern as JDQuickCheck, plus open/close state

## Animation Pattern

All scroll animations follow the same pattern:
```
useGSAP(() => {
  gsap.fromTo(selector, { opacity: 0, y: N }, {
    opacity: 1, y: 0, duration: D, ease: "power2.out",
    scrollTrigger: { trigger, start: "top 80-85%" }
  });
});
```
Mobile breakpoints reduce `y` offset and duration for smoother performance.

## UI Primitives (shadcn/ui)

Configured in `components.json` — new-york style, JSX (not TSX), CSS variables enabled.
Variants extracted to separate files: `button-variants.js`, `badge-variants.js`.
All primitives in `src/components/ui/`: badge, button, hover-card, popover, progress, separator, sheet, textarea, tooltip.

## Static Content

All portfolio content (nav links, hero words, counter items, tech stack icons, experience cards) lives in `src/constants/index.js`. Project showcase data is defined inline in `ShowcaseSection.jsx`.
