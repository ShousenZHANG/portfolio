import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether the referenced element is anywhere near the viewport.
 *
 * Used to park decorative animations while they're off-screen: CSS
 * animations keep running (and repainting) even when nothing can see them,
 * which is pure main-thread cost during scroll.
 *
 * @param {string} [rootMargin]  how early to wake up (default: one viewport)
 * @returns {[import("react").RefObject, boolean]}
 */
export function useInView(rootMargin = "300px 0px") {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        if (typeof IntersectionObserver === "undefined") {
            setInView(true);
            return undefined;
        }
        const obs = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { rootMargin }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [rootMargin]);

    return [ref, inView];
}
