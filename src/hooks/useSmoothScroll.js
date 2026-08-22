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
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.5,
            // Elements marked data-lenis-prevent (e.g. E.D.'s message
            // stream) keep native scrolling — Lenis stays hands-off.
            prevent: (node) => !!node?.closest?.("[data-lenis-prevent]"),
        });

        // Freeze page scroll entirely while the E.D. deck is open — the
        // wheel belongs to the dialog, not the page behind it.
        const onEdOpen = () => lenis.stop();
        const onEdClose = () => lenis.start();
        window.addEventListener("ed-open", onEdOpen);
        window.addEventListener("ed-close", onEdClose);

        lenis.on("scroll", ScrollTrigger.update);

        // NOTE: no scroll-coupled transform on #main-content. Skewing the
        // whole page promoted a ~7000px-tall compositing layer and tore it
        // down after every scroll — the re-rasterisation caused visible
        // jank. Scroll smoothness > the liquid-skew flourish.
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
            // preventDefault() cancels the fragment navigation, and with it
            // the browser's move of the sequential-focus origin — so the skip
            // link scrolled but the next Tab went straight back to the navbar.
            // Move the origin by hand. Targets that aren't natively focusable
            // (tabIndex < 0 with no attribute) need the tabindex or focus() is
            // a silent no-op — the guard keeps natively focusable targets in
            // the tab order instead of quietly evicting them. No stray ring for
            // mouse users: the only outline rule in index.css is :focus-visible,
            // which programmatic focus after a click does not match.
            if (target.tabIndex < 0 && !target.hasAttribute("tabindex")) {
                target.setAttribute("tabindex", "-1");
            }
            target.focus({ preventScroll: true });
        };
        document.addEventListener("click", onAnchorClick);

        return () => {
            document.removeEventListener("click", onAnchorClick);
            window.removeEventListener("ed-open", onEdOpen);
            window.removeEventListener("ed-close", onEdClose);
            gsap.ticker.remove(onTick);
            lenis.destroy();
        };
    }, []);
}
