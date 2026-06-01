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

        // Cache the rect on enter — avoids a layout read every mousemove.
        let cx = 0;
        let cy = 0;
        const onEnter = () => {
            const r = el.getBoundingClientRect();
            cx = r.left + r.width / 2;
            cy = r.top + r.height / 2;
        };
        const onMove = (e) => {
            xTo((e.clientX - cx) * strength);
            yTo((e.clientY - cy) * strength);
        };
        const onLeave = () => { xTo(0); yTo(0); };

        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        return () => {
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mousemove", onMove);
            el.removeEventListener("mouseleave", onLeave);
            gsap.killTweensOf(el);
        };
    }, [strength]);

    return ref;
}
