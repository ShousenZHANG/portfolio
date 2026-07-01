import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../lib/motion.js";

/**
 * Premium two-element cursor: a precise dot + a lagging ring that
 * eases toward it (rAF lerp). Grows on interactive targets, hides the
 * native pointer. Desktop-only (fine pointer) and reduced-motion safe.
 */
const CustomCursor = () => {
    const dotRef = useRef(null);
    const ringRef = useRef(null);
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const fine =
            typeof window !== "undefined" &&
            window.matchMedia("(pointer: fine)").matches;
        if (!fine || prefersReducedMotion()) return undefined;
        setEnabled(true);

        const dot = dotRef.current;
        const ring = ringRef.current;
        if (!dot || !ring) return undefined;

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;
        let raf = 0;

        const onMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        };

        const tick = () => {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
            raf = requestAnimationFrame(tick);
        };

        let wasInGraph = false;
        let wasInteractive = false;
        const onOver = (e) => {
            // Over the precise skills graph, suppress the custom cursor.
            const inGraph = Boolean(e.target.closest("#skills"));
            if (inGraph !== wasInGraph) {
                document.documentElement.classList.toggle("cursor-hidden", inGraph);
                wasInGraph = inGraph;
            }
            const interactive = Boolean(
                e.target.closest('a, button, [role="button"], input, textarea, [data-magnetic]')
            );
            if (interactive !== wasInteractive) {
                ring.classList.toggle("cursor-ring--hover", interactive);
                wasInteractive = interactive;
            }
        };
        const onDown = () => ring.classList.add("cursor-ring--down");
        const onUp = () => ring.classList.remove("cursor-ring--down");
        const onLeave = () => {
            dot.style.opacity = "0";
            ring.style.opacity = "0";
        };
        const onEnter = () => {
            dot.style.opacity = "1";
            ring.style.opacity = "1";
        };

        // Pause the ring-lerp loop while the tab is hidden — no point burning
        // rAF on an off-screen cursor.
        const onVisibility = () => {
            cancelAnimationFrame(raf);
            if (!document.hidden) raf = requestAnimationFrame(tick);
        };

        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("mouseover", onOver, { passive: true });
        window.addEventListener("mousedown", onDown);
        window.addEventListener("mouseup", onUp);
        document.addEventListener("mouseleave", onLeave);
        document.addEventListener("mouseenter", onEnter);
        document.addEventListener("visibilitychange", onVisibility);
        document.documentElement.classList.add("has-custom-cursor");
        raf = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseover", onOver);
            window.removeEventListener("mousedown", onDown);
            window.removeEventListener("mouseup", onUp);
            document.removeEventListener("mouseleave", onLeave);
            document.removeEventListener("mouseenter", onEnter);
            document.removeEventListener("visibilitychange", onVisibility);
            document.documentElement.classList.remove("has-custom-cursor");
            cancelAnimationFrame(raf);
        };
    }, []);

    if (!enabled) return null;

    return (
        <>
            <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
            <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
        </>
    );
};

export default CustomCursor;
