import { useEffect, useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "../lib/motion.js";

/**
 * Magnetic pull: the element eases toward the cursor while hovered,
 * springs back on leave. Physics-eased (not snap) for the premium
 * feel. Desktop + reduced-motion gated. Returns a ref to attach.
 *
 * @param {number} strength  0..1 pull factor (default 0.4)
 */
export function useMagnetic(strength = 0.4) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const fine =
            typeof window !== "undefined" &&
            window.matchMedia("(pointer: fine)").matches;
        if (!fine || prefersReducedMotion()) return undefined;

        const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            const relX = e.clientX - (r.left + r.width / 2);
            const relY = e.clientY - (r.top + r.height / 2);
            xTo(relX * strength);
            yTo(relY * strength);
        };
        const onLeave = () => {
            xTo(0);
            yTo(0);
        };

        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        return () => {
            el.removeEventListener("mousemove", onMove);
            el.removeEventListener("mouseleave", onLeave);
            gsap.killTweensOf(el);
        };
    }, [strength]);

    return ref;
}
