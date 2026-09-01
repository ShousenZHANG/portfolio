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

    // Capability check only. This MUST be separate from the wiring below:
    // setEnabled is what mounts the two divs, and a single effect would go on
    // to read the refs on the same synchronous pass — before React has
    // rendered them — find null, and bail before registering one listener.
    // With deps [] it would never re-run, so the cursor stayed dead while its
    // divs still painted two stray fragments in the corner.
    useEffect(() => {
        const fine =
            typeof window !== "undefined" &&
            window.matchMedia("(pointer: fine)").matches;
        if (fine && !prefersReducedMotion()) setEnabled(true);
    }, []);

    useEffect(() => {
        if (!enabled) return undefined;
        const dot = dotRef.current;
        const ring = ringRef.current;
        if (!dot || !ring) return undefined;

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;
        let raf = 0;
        let shown = false;

        const onMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
            // Both elements sit at the viewport origin until something writes
            // a transform, so they stay invisible until the pointer says where
            // they belong.
            if (!shown) {
                shown = true;
                dot.style.opacity = "1";
                ring.style.opacity = "1";
            }
            if (!raf) raf = requestAnimationFrame(tick);
        };

        // The ring eases toward the dot and then STOPS. Left re-queueing
        // unconditionally this is a third permanent rAF loop, allocating a
        // template string and parsing a CSS value every frame of every scroll
        // for the whole visit — to write a byte-identical transform once the
        // lerp has converged. onMove restarts it.
        const tick = () => {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            if (Math.abs(mouseX - ringX) < 0.05 && Math.abs(mouseY - ringY) < 0.05) {
                ringX = mouseX;
                ringY = mouseY;
                ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
                raf = 0;
                return;
            }
            ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
            raf = requestAnimationFrame(tick);
        };

        let wasSuppressed = false;
        let wasInteractive = false;
        const onOver = (e) => {
            // Suppress the decorative cursor where the real one carries meaning:
            // the precise skills graph, and any text field — those get the native
            // I-beam back in CSS, and showing both at once reads as a glitch.
            const suppressed = Boolean(
                e.target.closest('#skills, input, textarea, [contenteditable="true"]')
            );
            if (suppressed !== wasSuppressed) {
                document.documentElement.classList.toggle("cursor-hidden", suppressed);
                wasSuppressed = suppressed;
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
            if (!shown) return; // nothing to show until the pointer has moved
            dot.style.opacity = "1";
            ring.style.opacity = "1";
        };

        // Pause the ring-lerp loop while the tab is hidden — no point burning
        // rAF on an off-screen cursor.
        const onVisibility = () => {
            cancelAnimationFrame(raf);
            raf = 0;
            // Only resume if the ring still has ground to cover; a settled
            // ring needs no loop.
            if (!document.hidden && (mouseX !== ringX || mouseY !== ringY)) {
                raf = requestAnimationFrame(tick);
            }
        };

        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("mouseover", onOver, { passive: true });
        window.addEventListener("mousedown", onDown);
        window.addEventListener("mouseup", onUp);
        document.addEventListener("mouseleave", onLeave);
        document.addEventListener("mouseenter", onEnter);
        document.addEventListener("visibilitychange", onVisibility);
        document.documentElement.classList.add("has-custom-cursor");

        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseover", onOver);
            window.removeEventListener("mousedown", onDown);
            window.removeEventListener("mouseup", onUp);
            document.removeEventListener("mouseleave", onLeave);
            document.removeEventListener("mouseenter", onEnter);
            document.removeEventListener("visibilitychange", onVisibility);
            document.documentElement.classList.remove("has-custom-cursor");
            document.documentElement.classList.remove("cursor-hidden");
            cancelAnimationFrame(raf);
        };
    }, [enabled]);

    if (!enabled) return null;

    return (
        <>
            <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
            <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
        </>
    );
};

export default CustomCursor;
