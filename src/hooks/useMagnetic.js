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

        // Cache the centre on enter — avoids a layout read every mousemove.
        let centre = null;
        let scrollAt = 0;
        const onEnter = () => {
            const r = el.getBoundingClientRect();
            centre = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
            scrollAt = window.scrollY;
        };
        const onMove = (e) => {
            if (!centre) onEnter();
            xTo((e.clientX - centre.x) * strength);
            yTo((e.clientY - centre.y) * strength);
        };
        const onLeave = () => { centre = null; xTo(0); yTo(0); };
        // The centre is in viewport coords, so scrolling with the cursor
        // parked on the element (trivial under Lenis' momentum) leaves it off
        // by the scroll delta and the next mousemove yanks the element
        // sideways. Slide it by the delta rather than re-measuring: while
        // hovered the element is already displaced by the magnetic pull, so
        // getBoundingClientRect would return the DISPLACED centre and each
        // scroll-then-move cycle would decay the pull toward zero.
        const onScroll = () => {
            if (!centre) return;
            const y = window.scrollY;
            centre = { x: centre.x, y: centre.y - (y - scrollAt) };
            scrollAt = y;
        };

        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mousemove", onMove);
            el.removeEventListener("mouseleave", onLeave);
            window.removeEventListener("scroll", onScroll);
            gsap.killTweensOf(el);
        };
    }, [strength]);

    return ref;
}
