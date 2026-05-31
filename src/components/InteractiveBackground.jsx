import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/motion.js";

/**
 * Cursor-reactive neural field. Nodes drift slowly; lines connect
 * neighbours; the cursor pulls nearby nodes and lights their links —
 * an "intelligent system" coming alive under your hand. Canvas 2D
 * (no WebGL weight), DPR-capped, paused when hidden/off-screen, and
 * fully skipped under prefers-reduced-motion.
 */
const InteractiveBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (prefersReducedMotion()) return undefined;
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return undefined;

        const SIG = "112, 90, 230";   // indigo-violet rgb (approx --sig)
        const CYAN = "90, 190, 230";  // cyan rgb (approx --sig-2)

        let width = 0;
        let height = 0;
        let dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        let nodes = [];
        let raf = 0;
        let running = true;
        const mouse = { x: -9999, y: -9999, active: false };

        const LINK_DIST = 150;
        const MOUSE_RADIUS = 220;

        const nodeCount = () => {
            const target = Math.round((width * height) / 22000);
            return Math.max(36, Math.min(110, target));
        };

        const seed = () => {
            nodes = Array.from({ length: nodeCount() }, (_, i) => ({
                x: ((i * 9301 + 49297) % 233280) / 233280 * width,
                y: ((i * 49297 + 9301) % 233280) / 233280 * height,
                vx: (((i * 1103515245 + 12345) % 100) / 100 - 0.5) * 0.25,
                vy: (((i * 1103515245 + 54321) % 100) / 100 - 0.5) * 0.25,
                r: 1 + ((i * 7) % 100) / 100 * 1.4,
            }));
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

            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > width) n.vx *= -1;
                if (n.y < 0 || n.y > height) n.vy *= -1;

                // Cursor pull
                if (mouse.active) {
                    const dx = mouse.x - n.x;
                    const dy = mouse.y - n.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < MOUSE_RADIUS * MOUSE_RADIUS) {
                        const d = Math.sqrt(d2) || 1;
                        const force = (1 - d / MOUSE_RADIUS) * 0.6;
                        n.x += (dx / d) * force;
                        n.y += (dy / d) * force;
                    }
                }
            }

            // Links
            for (let i = 0; i < nodes.length; i++) {
                const a = nodes[i];
                for (let j = i + 1; j < nodes.length; j++) {
                    const b = nodes[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < LINK_DIST * LINK_DIST) {
                        const d = Math.sqrt(d2);
                        const alpha = (1 - d / LINK_DIST) * 0.22;
                        ctx.strokeStyle = `rgba(${SIG}, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            // Nodes + cursor links
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                let near = false;
                if (mouse.active) {
                    const dx = mouse.x - n.x;
                    const dy = mouse.y - n.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < MOUSE_RADIUS * MOUSE_RADIUS) {
                        near = true;
                        const d = Math.sqrt(d2);
                        const alpha = (1 - d / MOUSE_RADIUS) * 0.5;
                        ctx.strokeStyle = `rgba(${CYAN}, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(mouse.x, mouse.y);
                        ctx.lineTo(n.x, n.y);
                        ctx.stroke();
                    }
                }
                ctx.fillStyle = near ? `rgba(${CYAN}, 0.9)` : `rgba(${SIG}, 0.55)`;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
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

        // The field is decorative and mainly seen at the top. Pause its rAF
        // when the tab is hidden OR the user has scrolled past the hero —
        // frees the main thread so the rest of the page stays buttery.
        const shouldRun = () => !document.hidden && window.scrollY < window.innerHeight * 1.2;
        const sync = () => {
            const next = shouldRun();
            if (next && !running) { running = true; raf = requestAnimationFrame(step); }
            else if (!next && running) { running = false; cancelAnimationFrame(raf); }
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
