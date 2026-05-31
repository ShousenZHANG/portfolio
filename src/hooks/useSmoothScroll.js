import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../lib/motion.js";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scroll, synced to GSAP's ticker + ScrollTrigger.
 * The premium "glide" feel award sites use. Skipped entirely under
 * prefers-reduced-motion (native scroll, no interception).
 */
export function useSmoothScroll() {
    useEffect(() => {
        if (prefersReducedMotion()) return undefined;

        const lenis = new Lenis({
            duration: 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.5,
        });

        lenis.on("scroll", ScrollTrigger.update);

        const onTick = (time) => lenis.raf(time * 1000);
        gsap.ticker.add(onTick);
        gsap.ticker.lagSmoothing(0);

        // Anchor links route through Lenis so in-page nav stays smooth
        const onAnchorClick = (e) => {
            const anchor = e.target.closest('a[href^="#"]');
            if (!anchor) return;
            const id = anchor.getAttribute("href");
            if (!id || id === "#") return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            lenis.scrollTo(target, { offset: -80 });
        };
        document.addEventListener("click", onAnchorClick);

        return () => {
            document.removeEventListener("click", onAnchorClick);
            gsap.ticker.remove(onTick);
            lenis.destroy();
        };
    }, []);
}
