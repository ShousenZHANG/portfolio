import { useEffect, useState } from "react";
import { prefersReducedMotion } from "../lib/motion.js";
import LogoMark from "./LogoMark.jsx";

/**
 * SiteReveal — the opening curtain. First visit only, ≤1.2s, fully
 * compositor-driven (transform/opacity), skipped under reduced motion.
 *
 * Sequence: ink curtain + logo pulse + progress line (0.65s) → curtain
 * splits and slides away (0.5s) → unmount. When done it stamps
 * `data-revealed` on <html>, stores a session flag, and dispatches
 * "ez-reveal-done" — the hero's entrance timeline and the headline
 * decode wait for that signal so the show starts when the curtain is up,
 * not behind it.
 */

const SESSION_KEY = "ez-reveal-done";

const markRevealed = () => {
    document.documentElement.dataset.revealed = "1";
    window.dispatchEvent(new CustomEvent("ez-reveal-done"));
};

const shouldSkip = () => {
    try {
        if (sessionStorage.getItem(SESSION_KEY)) return true;
    } catch { /* storage unavailable → play it */ }
    return prefersReducedMotion();
};

const SiteReveal = () => {
    const [state] = useState(() => (shouldSkip() ? "skipped" : "playing"));
    const [gone, setGone] = useState(state === "skipped");

    useEffect(() => {
        if (state === "skipped") {
            markRevealed();
            return undefined;
        }
        try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* fine */ }
        // Curtain starts opening at 0.65s; hand the stage over right then
        // so the hero entrance plays as the curtain lifts.
        const handoff = setTimeout(markRevealed, 700);
        const unmount = setTimeout(() => setGone(true), 1250);
        return () => { clearTimeout(handoff); clearTimeout(unmount); };
    }, [state]);

    if (gone) return null;

    return (
        <div className="site-reveal" aria-hidden="true">
            <div className="site-reveal-pane pane-top" />
            <div className="site-reveal-pane pane-bottom" />
            <div className="site-reveal-center">
                <div className="site-reveal-mark">
                    <LogoMark size={46} />
                </div>
                <span className="site-reveal-line" />
            </div>
        </div>
    );
};

export default SiteReveal;
