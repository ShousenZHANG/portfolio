import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import Hero from "./sections/Hero.jsx";
import NavBar from "./components/NavBar.jsx";
import LogoSection from "./sections/LogoSection.jsx";
import Experience from "./sections/Experience.jsx";
import Footer from "./sections/Footer.jsx";
import JDQuickCheck from "./sections/JDQuickCheck.jsx";
import SkillsConstellation from "./sections/SkillsConstellation.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import CustomCursor from "./components/CustomCursor.jsx";
import InteractiveBackground from "./components/InteractiveBackground.jsx";
import SiteReveal from "./components/SiteReveal.jsx";
import CertBar from "./components/CertBar.jsx";
import OpenSourceBar from "./components/OpenSourceBar.jsx";
import { useSmoothScroll } from "./hooks/useSmoothScroll.js";
import { prefersReducedMotion } from "./lib/motion.js";
import { dict } from "./i18n/index.js";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

// Aurora tiles: one delegated pointermove listener feeds --mx/--my to the
// hovered .ed-tile so its ::after glow tracks the cursor. rAF-coalesced,
// desktop-only, skipped under reduced motion.
function useAuroraTiles() {
    useEffect(() => {
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (!fine || prefersReducedMotion()) return undefined;
        let raf = 0;
        let ev = null;
        // Geometry of the tile under the pointer, measured once on enter.
        // Measuring inside the rAF callback instead would run before the
        // frame's layout, so it flushes whatever GSAP/ScrollTrigger/Lenis
        // queued that tick — a full-document reflow at 60fps whenever you
        // hover a tile while scrolling. The rect is viewport-relative, so
        // scrolling with the pointer parked on a tile would leave it stale —
        // onScroll below slides it by the exact delta instead of re-measuring,
        // which would otherwise read the tile mid-hover-transform (it is
        // lifted 3px) and cost a layout. Same shape in useTilt/useMagnetic.
        let hoverTile = null;
        let hoverRect = null;
        let scrollAt = 0;
        const apply = () => {
            raf = 0;
            if (!hoverTile || !hoverRect || !ev) return;
            hoverTile.style.setProperty("--mx", `${ev.clientX - hoverRect.left}px`);
            hoverTile.style.setProperty("--my", `${ev.clientY - hoverRect.top}px`);
        };
        const onMove = (e) => {
            if (!hoverTile || !hoverRect) return;
            ev = e;
            if (!raf) raf = requestAnimationFrame(apply);
        };
        // pointerover/out bubble, so one delegated pair still covers tiles
        // that lazy sections mount later — no per-tile listeners needed.
        const onOver = (e) => {
            const tile = e.target?.closest?.(".ed-tile") ?? null;
            if (tile === hoverTile) return;
            hoverTile = tile;
            if (tile) {
                const r = tile.getBoundingClientRect();
                hoverRect = { left: r.left, top: r.top };
                scrollAt = window.scrollY;
            } else {
                hoverRect = null;
            }
        };
        const onOut = (e) => {
            if (!hoverTile) return;
            // Moving between children of the same tile also fires pointerout;
            // only drop the cache when the pointer really left the tile.
            const next = e.relatedTarget;
            if (next && hoverTile.contains(next)) return;
            hoverTile = null;
            hoverRect = null;
        };
        // Lenis scrolls the window for real, so the native scroll event still
        // fires. Slide the cached rect by the delta: exact, and it never
        // reads layout on the hottest path on the site.
        const onScroll = () => {
            if (!hoverRect) return;
            const y = window.scrollY;
            hoverRect = { left: hoverRect.left, top: hoverRect.top - (y - scrollAt) };
            scrollAt = y;
        };
        document.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerover", onOver, { passive: true });
        document.addEventListener("pointerout", onOut, { passive: true });
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerover", onOver);
            document.removeEventListener("pointerout", onOut);
            window.removeEventListener("scroll", onScroll);
            cancelAnimationFrame(raf);
            // Drop the DOM/event refs so an unmounted tree isn't retained.
            hoverTile = null;
            hoverRect = null;
            ev = null;
        };
    }, []);
}

const ShowcaseSection = lazy(() => import("./sections/ShowcaseSection.jsx"));
const Contact = lazy(() => import("./sections/Contact.jsx"));
const EDPanel = lazy(() => import("./components/EDPanel.jsx"));

// Warm the heavy chunks during idle time after first paint, so by the
// time the user scrolls to a lazy section the JS is already cached and
// the Suspense fallback never flashes. Browser-default scheduling (no
// network races): runs at low priority, yields to user input.
const prefetchLazyChunks = () => {
    import("./sections/ShowcaseSection.jsx");
    import("./sections/Contact.jsx");
};

const SectionLoader = ({ label = dict.misc.sectionLoader }) => (
    <div className="w-full min-h-[40vh] flex items-center justify-center" role="status" aria-label={label}>
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "2px solid var(--hair)", borderTopColor: "var(--sig)" }} />
    </div>
);

const LazySection = ({ children }) => (
    <ErrorBoundary>
        <Suspense fallback={<SectionLoader />}>{children}</Suspense>
    </ErrorBoundary>
);

const App = () => {
    useSmoothScroll();
    useAuroraTiles();

    // E.D. — opened from the navbar orb (custom event) or the "/" key.
    const [edOpen, setEdOpen] = useState(false);
    // Stable identity matters: EDPanel's mount effect lists onClose in its
    // deps, so a fresh arrow per App render would tear that effect down
    // mid-session — killing a live recording, aborting the in-flight answer,
    // restarting Lenis behind the open dialog and stealing the caret.
    const closeEd = useCallback(() => setEdOpen(false), []);
    useEffect(() => {
        const onOpen = () => setEdOpen(true);
        const onKey = (e) => {
            if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
            const el = document.activeElement;
            if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
            e.preventDefault();
            // Route through the same event as the orb so listeners (e.g.
            // the intro tooltip) see every way of opening the deck.
            window.dispatchEvent(new CustomEvent("ed-open"));
        };
        window.addEventListener("ed-open", onOpen);
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("ed-open", onOpen);
            window.removeEventListener("keydown", onKey);
        };
    }, []);

    useEffect(() => {
        const schedule =
            typeof window !== "undefined" && "requestIdleCallback" in window
                ? window.requestIdleCallback
                : (cb) => window.setTimeout(cb, 1500);
        const handle = schedule(prefetchLazyChunks, { timeout: 4000 });
        return () => {
            if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
                window.cancelIdleCallback?.(handle);
            } else {
                clearTimeout(handle);
            }
        };
    }, []);

    return (
        <>
            <a href="#main-content" className="skip-link">{dict.misc.skipLink}</a>
            <SiteReveal />
            <CustomCursor />
            <div className="ed-grid-bg" aria-hidden="true" />
            <InteractiveBackground />
            <NavBar />
            {/* tabIndex -1 so the skip link can actually park focus here;
                without it focus() is a no-op and Tab falls back to the navbar. */}
            <main id="main-content" tabIndex={-1}>
                <Hero />
                <CertBar />
                <OpenSourceBar />
                <JDQuickCheck />
                <LogoSection />
                <Experience />
                <LazySection><ShowcaseSection /></LazySection>
                <SkillsConstellation />
                <LazySection><Contact /></LazySection>
            </main>
            <Footer />
            {edOpen && (
                <ErrorBoundary>
                    <Suspense fallback={null}>
                        <EDPanel onClose={closeEd} />
                    </Suspense>
                </ErrorBoundary>
            )}
            <SpeedInsights />
            <Analytics />
        </>
    );
};

export default App;
