import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/motion.js";

/**
 * Quantum field background. Particles are seeded by the probability
 * density |ψ|² of a 2D quantum harmonic oscillator — each carries a
 * quantum number n (energy level), a phase that evolves over time, and
 * zero-point jitter that scales with √n (uncertainty principle). Colour
 * runs cold→warm with energy. The cursor acts as an observation that
 * collapses nearby particles toward it (wavefunction collapse), lighting
 * entanglement-style links.
 *
 * Same per-frame cost as the prior neural field (only the seeding maths
 * and colour mapping changed), so scroll stays smooth: Canvas 2D, DPR-
 * capped, paused off-hero/hidden, skipped under prefers-reduced-motion.
 */
const InteractiveBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (prefersReducedMotion()) return undefined;
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return undefined;

        const SIG = "112, 90, 230";   // indigo-violet (ground / low energy)
        const CYAN = "90, 190, 230";  // cyan (excited / high energy, + observation)

        let width = 0;
        let height = 0;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        let nodes = [];
        let raf = 0;
        let running = true;
        let t = 0; // global phase clock
        const mouse = { x: -9999, y: -9999, active: false };

        // Entanglement flashes — every few seconds two nearby particles link
        // with a bright violet→cyan arc that blooms and fades (~0.9s).
        let flashes = [];
        let nextFlashAt = 2.5;

        // Depth field: each particle carries a z-factor. The whole field
        // parallaxes gently against the cursor and lags behind scroll —
        // the flat plane becomes a volume.
        let lastScrollY = 0;
        let scrollLag = 0;

        const LINK_DIST = 150;
        const MOUSE_RADIUS = 220;

        // Hermite polynomials H0..H3 → 1D harmonic-oscillator eigenstates.
        const hermite = (n, x) => {
            switch (n) {
                case 0: return 1;
                case 1: return 2 * x;
                case 2: return 4 * x * x - 2;
                default: return 8 * x * x * x - 12 * x; // n=3
            }
        };
        // Unnormalised |ψ_n(x)|² for the QHO (Gaussian × Hermite²).
        const psi2 = (n, x) => {
            const h = hermite(n, x);
            return h * h * Math.exp(-x * x);
        };

        const nodeCount = () => {
            const target = Math.round((width * height) / 34000);
            return Math.max(28, Math.min(58, target));
        };

        // Deterministic PRNG (seeded) so layout is stable across renders.
        const rng = (s) => {
            let x = s + 0x6d2b79f5;
            x = Math.imul(x ^ (x >>> 15), x | 1);
            x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
            return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
        };

        // Rejection-sample a coordinate from |ψ_n|² along one axis.
        const sampleAxis = (n, seed) => {
            const SPREAD = 3.2;        // ± range in oscillator units
            const peak = n === 0 ? 1 : psi2(n, Math.sqrt(n + 0.5)) * 1.3 + 0.4;
            for (let k = 0; k < 24; k++) {
                const x = (rng(seed + k * 131) * 2 - 1) * SPREAD;
                const y = rng(seed + k * 977) * peak;
                if (y <= psi2(n, x)) return x / SPREAD; // → -1..1
            }
            return (rng(seed) * 2 - 1) * 0.5;
        };

        const seed = () => {
            const count = nodeCount();
            nodes = Array.from({ length: count }, (_, i) => {
                // Energy level: most particles low-energy, a few excited.
                const r0 = rng(i * 17 + 3);
                const n = r0 < 0.5 ? 0 : r0 < 0.8 ? 1 : r0 < 0.95 ? 2 : 3;
                const nx = sampleAxis(n, i * 1009 + 7);
                const ny = sampleAxis(n, i * 6151 + 29);
                return {
                    // home position from |ψ|² (centered), kept for restoring
                    hx: width / 2 + nx * width * 0.46,
                    hy: height / 2 + ny * height * 0.46,
                    x: 0,
                    y: 0,
                    n,
                    phase: rng(i * 53 + 11) * Math.PI * 2,
                    // angular frequency grows with energy (E_n = ħω(n+½))
                    omega: 0.6 + n * 0.5,
                    // zero-point jitter amplitude ∝ √(n+½) (uncertainty)
                    amp: 6 * Math.sqrt(n + 0.5),
                    r: 1.1 + n * 0.5,
                    // depth 0.35 (far) → 1 (near): drives parallax strength
                    depth: 0.35 + rng(i * 271 + 5) * 0.65,
                };
            });
            nodes.forEach((nd) => { nd.x = nd.hx; nd.y = nd.hy; });
        };

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            seed();
        };

        const step = () => {
            ctx.clearRect(0, 0, width, height);
            t += 0.016;

            // Scroll inertia: the field lags behind scroll then settles.
            const sy = window.scrollY;
            scrollLag += ((sy - lastScrollY) - scrollLag) * 0.12;
            lastScrollY = sy;
            // Cursor parallax offsets (0 when the mouse is idle/off-window).
            const pxo = mouse.active ? (mouse.x - width / 2) * 0.018 : 0;
            const pyo = mouse.active ? (mouse.y - height / 2) * 0.018 : 0;

            for (let i = 0; i < nodes.length; i++) {
                const nd = nodes[i];
                const ph = nd.phase + t * nd.omega;
                // Quantum jitter around the home (|ψ|²) position, displaced
                // by depth-scaled cursor parallax + scroll lag.
                nd.x = nd.hx + Math.cos(ph) * nd.amp + pxo * nd.depth;
                nd.y = nd.hy + Math.sin(ph * 0.9 + nd.n) * nd.amp + pyo * nd.depth + scrollLag * nd.depth * 0.8;

                // Observation = collapse toward the cursor.
                if (mouse.active) {
                    const dx = mouse.x - nd.x;
                    const dy = mouse.y - nd.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < MOUSE_RADIUS * MOUSE_RADIUS) {
                        const d = Math.sqrt(d2) || 1;
                        const force = (1 - d / MOUSE_RADIUS) * 0.6;
                        nd.x += (dx / d) * force * 14;
                        nd.y += (dy / d) * force * 14;
                    }
                }
            }

            // Links (entanglement)
            for (let i = 0; i < nodes.length; i++) {
                const a = nodes[i];
                for (let j = i + 1; j < nodes.length; j++) {
                    const b = nodes[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < LINK_DIST * LINK_DIST) {
                        const d = Math.sqrt(d2);
                        const alpha = (1 - d / LINK_DIST) * 0.2;
                        ctx.strokeStyle = `rgba(${SIG}, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            // Entanglement flashes — spawn, draw, expire
            if (t >= nextFlashAt && nodes.length > 1) {
                nextFlashAt = t + 2.5 + ((t * 997) % 2); // every ~2.5-4.5s
                const a = nodes[Math.floor((t * 131) % nodes.length)];
                let best = null;
                let bestD2 = 220 * 220;
                for (let j = 0; j < nodes.length; j++) {
                    const b = nodes[j];
                    if (b === a) continue;
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < bestD2 && d2 > 40 * 40) { bestD2 = d2; best = b; }
                }
                if (best) flashes.push({ a, b: best, t0: t });
            }
            if (flashes.length > 0) {
                flashes = flashes.filter((f) => t - f.t0 < 0.9);
                for (const f of flashes) {
                    const p = (t - f.t0) / 0.9;              // 0→1
                    const glow = Math.sin(Math.PI * p);       // bloom then fade
                    const grad = ctx.createLinearGradient(f.a.x, f.a.y, f.b.x, f.b.y);
                    grad.addColorStop(0, `rgba(${SIG}, ${glow * 0.85})`);
                    grad.addColorStop(1, `rgba(${CYAN}, ${glow * 0.85})`);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(f.a.x, f.a.y);
                    ctx.lineTo(f.b.x, f.b.y);
                    ctx.stroke();
                    // endpoint blooms
                    ctx.fillStyle = `rgba(${SIG}, ${glow * 0.9})`;
                    ctx.beginPath();
                    ctx.arc(f.a.x, f.a.y, f.a.r + glow * 2.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = `rgba(${CYAN}, ${glow * 0.9})`;
                    ctx.beginPath();
                    ctx.arc(f.b.x, f.b.y, f.b.r + glow * 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Particles + observation links
            for (let i = 0; i < nodes.length; i++) {
                const nd = nodes[i];
                // Probability-amplitude shimmer (|cos(phase)|).
                const shimmer = 0.5 + 0.5 * Math.abs(Math.cos(nd.phase + t * nd.omega));
                let near = false;
                if (mouse.active) {
                    const dx = mouse.x - nd.x;
                    const dy = mouse.y - nd.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < MOUSE_RADIUS * MOUSE_RADIUS) {
                        near = true;
                        const d = Math.sqrt(d2);
                        const alpha = (1 - d / MOUSE_RADIUS) * 0.5;
                        ctx.strokeStyle = `rgba(${CYAN}, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(mouse.x, mouse.y);
                        ctx.lineTo(nd.x, nd.y);
                        ctx.stroke();
                    }
                }
                // Colour: cold (ground) → warm (excited); observation = cyan.
                const energyMix = nd.n / 3;
                const base = near
                    ? CYAN
                    : energyMix > 0.5 ? CYAN : SIG;
                const a = (near ? 0.9 : 0.4 + shimmer * 0.4);
                ctx.fillStyle = `rgba(${base}, ${a})`;
                ctx.beginPath();
                ctx.arc(nd.x, nd.y, nd.r, 0, Math.PI * 2);
                ctx.fill();
            }

            if (running) raf = requestAnimationFrame(step);
        };

        const onMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.active = true;
        };
        const onLeave = () => { mouse.active = false; };

        const shouldRun = () => !document.hidden && window.scrollY < window.innerHeight * 0.95;
        const sync = () => {
            const next = shouldRun();
            if (next && !running) { running = true; raf = requestAnimationFrame(step); }
            else if (!next && running) {
                running = false;
                cancelAnimationFrame(raf);
                // Clear on pause — otherwise the last frame stays frozen on
                // this fixed canvas, ghosting over every section below.
                ctx.clearRect(0, 0, width, height);
            }
        };

        resize();
        raf = requestAnimationFrame(step);
        window.addEventListener("resize", resize, { passive: true });
        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("scroll", sync, { passive: true });
        document.addEventListener("mouseleave", onLeave);
        document.addEventListener("visibilitychange", sync);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("scroll", sync);
            document.removeEventListener("mouseleave", onLeave);
            document.removeEventListener("visibilitychange", sync);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
        />
    );
};

export default InteractiveBackground;
