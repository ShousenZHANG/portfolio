import { createElement, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../lib/motion.js";

gsap.registerPlugin(ScrollTrigger);

// Chinese writes no spaces, so `text.split(" ")` hands back a one-element array
// and every heading on /zh collapses into a single mask — the signature kinetic
// reveal stops existing without erroring, which is the worst way for it to
// break. Intl.Segmenter with granularity "word" is the browser's own Chinese
// word segmentation: it yields 「精选」「作品」, not one glyph per mask. Splitting
// per character would technically animate, but a per-character stagger on Han
// reads as a typewriter, not as type assembling itself.
const HAN = /[㐀-䶿一-鿿豈-﫿]/;

// Built ONCE at module scope. Constructing a Segmenter pulls in ICU
// segmentation data, and this component re-renders whenever anything above it
// in the tree changes — per render (let alone per frame) it would be a
// measurable cost for a value that never varies.
const segmenter = (() => {
    // Old WeChat XWeb WebViews predate Intl.Segmenter, and that in-app browser
    // is where most mainland traffic to /zh arrives. Null here means the Latin
    // split below runs instead: one mask for the whole heading, which still
    // rises — degraded, not broken.
    if (typeof Intl === "undefined" || typeof Intl.Segmenter !== "function") return null;
    try {
        return new Intl.Segmenter("zh-Hans", { granularity: "word" });
    } catch {
        return null;
    }
})();

// Each unit carries the separator that follows it, rather than the whole line
// sharing one: Chinese needs no gap between 「精选」 and 「项目」, but the
// hand-authored 盘古之白 space in 「把 JD 和我的简历比一比」 has to survive.
// It cannot survive INSIDE a mask — every unit is an inline-block with
// overflow: hidden, and CSS trims a trailing space at that box edge, which
// silently glued the heading into 「把JD和我的简历比一比」.
//
// Latin uses a NO-BREAK space (U+00A0), exactly as it did before this was made
// locale-aware: with each word in its own inline-block, an ordinary space
// would let the line break between two masks where the design never intended.
const NBSP = " ";
const WS = /^\s+$/;

const splitUnits = (text) => {
    if (!segmenter || !HAN.test(text)) {
        const words = text.split(" ");
        return words.map((t, i) => ({ t, sep: i < words.length - 1 ? NBSP : "" }));
    }
    const units = [];
    for (const { segment, isWordLike } of segmenter.segment(text)) {
        // Whitespace becomes the previous unit's separator — as a NO-BREAK
        // space, for the same reason Latin uses one: the separator still sits
        // inside an overflow-hidden inline-block, and an ordinary space there
        // is collapsible whitespace at a box edge, which the engine trims.
        // Punctuation and other non-word runs stay attached to their unit,
        // where they belong typographically.
        if (WS.test(segment)) {
            if (units.length) units[units.length - 1].sep = NBSP;
            continue;
        }
        if (isWordLike || units.length === 0) units.push({ t: segment, sep: "" });
        else units[units.length - 1].t += segment;
    }
    return units;
};

/**
 * Kinetic word reveal: each word sits in an overflow-hidden mask and
 * rises into view with a stagger — the premium "type assembles itself"
 * effect. Honors prefers-reduced-motion (renders static).
 *
 * @param {string} text       the line to split (one per visual line)
 * @param {string} as         wrapper tag name (default "span")
 * @param {boolean} onScroll  trigger on scroll-in vs immediately
 * @param {number} delay      base delay seconds
 */
const RevealText = ({ text, as = "span", className = "", onScroll = true, delay = 0, ...rest }) => {
    const ref = useRef(null);
    const words = splitUnits(String(text));

    useGSAP(() => {
        if (!ref.current) return;
        const targets = ref.current.querySelectorAll(".reveal-word");
        if (prefersReducedMotion()) {
            gsap.set(targets, { yPercent: 0 });
            return;
        }
        gsap.fromTo(
            targets,
            { yPercent: 115 },
            {
                yPercent: 0,
                duration: 0.9,
                ease: "power4.out",
                stagger: 0.08,
                delay,
                // Promote only for the duration of the one-shot reveal.
                // Declaring will-change up front held a compositing layer
                // per word for every heading on the page, forever.
                onStart: () => gsap.set(targets, { willChange: "transform" }),
                onComplete: () => gsap.set(targets, { willChange: "auto" }),
                scrollTrigger: onScroll
                    ? { trigger: ref.current, start: "top 88%", once: true }
                    : undefined,
            }
        );
    }, { scope: ref });

    return createElement(
        as,
        { ref, className, ...rest },
        words.map(({ t, sep }, i) => (
            <span
                key={`${t}-${i}`}
                style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.12em", marginBottom: "-0.12em" }}
            >
                <span className="reveal-word" style={{ display: "inline-block" }}>
                    {t}
                </span>
                {sep}
            </span>
        ))
    );
};

export default RevealText;
