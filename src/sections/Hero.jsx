import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Download from "lucide-react/dist/esm/icons/download";
import ArrowDown from "lucide-react/dist/esm/icons/arrow-down";
import AnimatedCounter from "../components/AnimatedCounter.jsx";
import { prefersReducedMotion } from "../lib/motion.js";
import { useMagnetic } from "../hooks/useMagnetic.js";
import { useInView } from "../hooks/useInView.js";
import { dict, isZh } from "../i18n/index.js";

// CTA is a plain anchor: the global Lenis click handler routes #-links
// through lenis.scrollTo, so easing matches every other in-page jump.

// Quantum-decode: the signature word "collapses" out of scrambled glyphs
// into its final state — the site's measurement-collapse motif, applied to
// the very first thing a visitor reads. Static under reduced motion.
const GLYPHS = "!<>-_\\/[]{}—=+*^?#";
// Han is full-width; the ASCII pool above is half-width. Scrambling a Chinese
// headline with it collapses the word to roughly half its width and pumps it
// back every 70ms, which at display size reads as the layout breaking rather
// than as the word resolving. These are dense, common hanzi — noise that looks
// like it is resolving into meaning — and every one is inside the subset face,
// so nothing falls through to the system stack mid-animation.
const GLYPHS_CJK = "口日田由甲申网目回品晶森淼囍罒面";
const HAN_RE = /[一-鿿]/;

const DecodeWord = ({ text }) => {
    const [out, setOut] = useState(text);
    useEffect(() => {
        if (prefersReducedMotion()) return undefined;
        const pool = HAN_RE.test(text) ? GLYPHS_CJK : GLYPHS;
        let frame = 0;
        let raf = 0;
        let cancelled = false;
        const run = (delayMs) => {
            const start = performance.now() + delayMs;
            const tick = (now) => {
                if (cancelled) return;
                if (now < start) { raf = requestAnimationFrame(tick); return; }
                frame += 1;
                const settled = Math.floor((now - start) / 70); // one char per 70ms
                if (settled >= text.length) { setOut(text); return; }
                let s = "";
                for (let i = 0; i < text.length; i++) {
                    s += i < settled
                        ? text[i]
                        : pool[(i * 7 + frame * 3) % pool.length];
                }
                setOut(s);
                raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
        };
        // Wait for the curtain: the decode is the opening line of the show,
        // so it must not play behind the reveal overlay.
        const onGo = () => run(320);
        if (document.documentElement.dataset.revealed === "1") {
            run(550); // no curtain this visit — let the mask-rise land first
        } else {
            window.addEventListener("ez-reveal-done", onGo, { once: true });
        }
        return () => {
            cancelled = true;
            cancelAnimationFrame(raf);
            window.removeEventListener("ez-reveal-done", onGo);
        };
    }, [text]);
    return <>{out}</>;
};

const HERO_ANIM_TARGETS = [
    ".hero-eyebrow",
    ".hero-lead",
    ".hero-cta",
    ".hero-meta",
];

// Word array for the masked stagger — `sig` marks the decode word, `br`
// breaks the line after it. headlineAria is the assembled sentence.
const HEADLINE = dict.hero.headline;

const Hero = () => {
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [videoStarted, setVideoStarted] = useState(false);
    const magneticCta = useMagnetic(0.45);
    // The availability dot pings forever; park it once the hero has scrolled
    // away — the CSS half keys off `.ping-scope:not(.in-view)`.
    const [pingRef, pingInView] = useInView();

    const rootRef = useRef(null);
    const videoRef = useRef(null);

    const startVideo = () => {
        const v = videoRef.current;
        if (!v) return;
        v.play();
        setVideoStarted(true);
    };

    // Measurement-collapse link: when the WebGL field fires a collapse pulse
    // (hero click), the headline takes a sympathetic jolt — one motif, two
    // media. No-op when the field runs in fallback (event never fires).
    useEffect(() => {
        const el = rootRef.current?.querySelector(".hero-display");
        if (!el) return undefined;
        const onCollapse = () => {
            el.classList.remove("hero-jolt");
            void el.offsetWidth; // restart the animation
            el.classList.add("hero-jolt");
        };
        window.addEventListener("qf-collapse", onCollapse);
        return () => window.removeEventListener("qf-collapse", onCollapse);
    }, []);

    useGSAP(() => {
        if (prefersReducedMotion()) {
            gsap.set([...HERO_ANIM_TARGETS, ".hero-word", ".hero-aside"], { opacity: 1, y: 0, yPercent: 0 });
            // No timeline is built on this path, so nothing ever reaches the
            // onComplete below that hands the words' layers back.
            gsap.set(".hero-word", { willChange: "auto" });
            return;
        }
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        // Hold the entrance until the reveal curtain is up (first visit).
        if (document.documentElement.dataset.revealed !== "1") {
            tl.pause();
            window.addEventListener("ez-reveal-done", () => tl.play(), { once: true });
        }
        tl.fromTo(
            ".hero-word",
            { yPercent: 118 },
            {
                yPercent: 0,
                duration: 0.9,
                ease: "power4.out",
                stagger: 0.09,
                // One-shot entrance — release the compositing layers after.
                onComplete: () => gsap.set(".hero-word", { willChange: "auto" }),
            }
        )
        .fromTo(
            HERO_ANIM_TARGETS,
            { y: 26, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 },
            "-=0.5"
        )
        .fromTo(
            ".hero-aside",
            { y: 40, opacity: 0, scale: 0.97 },
            { y: 0, opacity: 1, scale: 1, duration: 0.9 },
            "-=0.7"
        );

        // Parallax: video drifts up slightly as you scroll past the hero.
        // Pass the element, not "#hero" — selector strings inside a scoped
        // useGSAP resolve within the scope, and the scope IS #hero.
        gsap.to(".hero-aside", {
            yPercent: -12,
            ease: "none",
            scrollTrigger: {
                trigger: rootRef.current,
                start: "top top",
                end: "bottom top",
                scrub: 0.5,
            },
        });
    }, { scope: rootRef });

    return (
        <>
            <section id="hero" ref={rootRef} className="relative overflow-hidden">
                <div className="ed-shell grid items-center gap-10 lg:gap-16 lg:grid-cols-[1.05fr_0.95fr] pt-28 pb-20 md:pt-36 md:pb-28 min-h-[88vh]">
                    {/* LEFT — editorial headline */}
                    <div className="flex flex-col">
                        <p className="hero-eyebrow ed-eyebrow mb-6">
                            {dict.hero.eyebrow}
                        </p>

                        <h1 className="hero-display ed-display" aria-label={dict.hero.headlineAria}>
                            {HEADLINE.map((w, i) => (
                                <span key={`${w.t}-${i}`}>
                                    <span
                                        aria-hidden="true"
                                        style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.14em", marginBottom: "-0.14em" }}
                                    >
                                        <span
                                            className={`hero-word${w.sig ? " sig" : ""}`}
                                            style={{ display: "inline-block", willChange: "transform" }}
                                        >
                                            {w.sig ? <DecodeWord text={w.t} /> : w.t}
                                        </span>
                                    </span>
                                    {/* English keeps the space alongside <br> so the h1's
                                        text content still reads as a sentence for crawlers —
                                        a bare <br> glues the words together. Chinese has no
                                        inter-word space, and injecting one opens a ~0.25em
                                        gap mid-line that reads as a typesetting fault at
                                        display size, so zh emits the break alone. */}
                                    {w.br
                                        ? (isZh ? <br /> : <> <br /></>)
                                        : !isZh && i < HEADLINE.length - 1 ? " " : ""}
                                </span>
                            ))}
                        </h1>

                        <p className="hero-lead ed-lead mt-7">
                            {dict.hero.lead}
                        </p>

                        <div className="hero-cta mt-9 flex flex-wrap items-center gap-3">
                            <a
                                ref={magneticCta}
                                href="#jd-check"
                                data-magnetic
                                className="ed-btn"
                            >
                                {dict.hero.ctaPrimary}
                                <ArrowDown className="w-4 h-4" />
                            </a>
                            <a
                                href={dict.hero.cvHref}
                                download={dict.hero.cvDownloadName}
                                className="ed-btn-ghost"
                            >
                                <Download className="w-4 h-4" />
                                {dict.hero.ctaCv}
                            </a>
                        </div>

                        <div ref={pingRef} className={`hero-meta ping-scope ${pingInView ? "in-view" : ""} mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm`} style={{ color: "var(--tx-2)" }}>
                            <span className="ed-status-dot" aria-hidden="true" />
                            <span>{dict.hero.available}</span>
                            <span aria-hidden="true" style={{ color: "var(--hair-bright)" }}>/</span>
                            <span className="font-mono text-xs tracking-wider">{dict.hero.stackLine}</span>
                            <span aria-hidden="true" style={{ color: "var(--hair-bright)" }}>/</span>
                            <button
                                type="button"
                                className="hero-ed-link font-mono text-xs tracking-wider"
                                onClick={() => window.dispatchEvent(new CustomEvent("ed-open"))}
                            >
                                {dict.hero.askEd}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT — editorial framed video */}
                    <div className="hero-aside">
                        <figure className="ed-tile p-2.5 rounded-[var(--r-lg)]">
                            <div className="sheen-host relative w-full aspect-[16/10] rounded-[var(--r-md)] overflow-hidden bg-black/50">
                                {!videoLoaded && (
                                    <div className="absolute inset-0 animate-pulse" style={{ background: "var(--ink-2)" }} />
                                )}
                                <video
                                    ref={videoRef}
                                    src="/videos/eddy_intro.mp4"
                                    poster="/images/hero_poster.webp"
                                    controls={videoStarted}
                                    loop
                                    playsInline
                                    preload="metadata"
                                    aria-label={dict.hero.videoAria}
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
                                    onLoadedData={() => setVideoLoaded(true)}
                                    onPlay={() => setVideoStarted(true)}
                                />

                                <span className="sheen" aria-hidden="true" />

                                {/* At-rest cover — designed play affordance instead of raw
                                    native controls, so the right column reads as crafted. */}
                                {!videoStarted && (
                                    <button
                                        type="button"
                                        onClick={startVideo}
                                        aria-label={dict.hero.playAria}
                                        className="absolute inset-0 flex flex-col items-center justify-center gap-4 group/play"
                                        style={{ background: "linear-gradient(180deg, oklch(0.135 0.014 280 / 0.15) 0%, oklch(0.135 0.014 280 / 0.65) 100%)" }}
                                    >
                                        <span
                                            className="flex items-center justify-center rounded-full transition-transform duration-300 group-hover/play:scale-110"
                                            style={{ width: 64, height: 64, background: "var(--sig)", color: "var(--sig-ink)", boxShadow: "0 10px 40px -8px var(--sig-glow)" }}
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.29-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14z" />
                                            </svg>
                                        </span>
                                        <span className="ed-eyebrow" style={{ color: "var(--tx-1)" }}>{dict.hero.playLabel}</span>
                                    </button>
                                )}
                            </div>
                            <figcaption className="ed-eyebrow mt-3 px-1 pb-1">
                                {dict.hero.figcaption}
                            </figcaption>
                        </figure>
                    </div>
                </div>
            </section>
            <section id="counter-section">
                <AnimatedCounter />
            </section>
        </>
    );
};

export default Hero;
