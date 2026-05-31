import { useEffect, useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "../lib/motion.js";

/**
 * Game-feel 3D tilt: the element pitches/rolls toward the cursor with
 * perspective, plus a tiny lift, then springs back on leave. Physics-
 * eased via GSAP quickTo. Desktop + reduced-motion gated.
 *
 * @param {number} max  max tilt in degrees (default 8)
 */
export function useTilt(max = 8) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const fine =
            typeof window !== "undefined" &&
            window.matchMedia("(pointer: fine)").matches;
        if (!fine || prefersReducedMotion()) return undefined;

        gsap.set(el, { transformPerspective: 700, transformStyle: "preserve-3d" });
        const rx = gsap.quickTo(el, "rotationX", { duration: 0.4, ease: "power3.out" });
        const ry = gsap.quickTo(el, "rotationY", { duration: 0.4, ease: "power3.out" });
        const lift = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            ry(px * max * 2);
            rx(-py * max * 2);
            lift(-6);
        };
        const onLeave = () => {
            rx(0);
            ry(0);
            lift(0);
        };

        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        return () => {
            el.removeEventListener("mousemove", onMove);
            el.removeEventListener("mouseleave", onLeave);
            gsap.killTweensOf(el);
        };
    }, [max]);

    return ref;
}
