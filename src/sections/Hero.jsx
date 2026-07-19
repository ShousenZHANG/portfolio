import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Download from "lucide-react/dist/esm/icons/download";
import ArrowDown from "lucide-react/dist/esm/icons/arrow-down";
import AnimatedCounter from "../components/AnimatedCounter.jsx";
import { prefersReducedMotion } from "../lib/motion.js";
import { useMagnetic } from "../hooks/useMagnetic.js";

// CTA is a plain anchor: the global Lenis click handler routes #-links
// through lenis.scrollTo, so easing matches every other in-page jump.

// Quantum-decode: the signature word "collapses" out of scrambled glyphs
// into its final state — the site's measurement-collapse motif, applied to
// the very first thing a visitor reads. Static under reduced motion.
const GLYPHS = "!<>-_\\/[]{}—=+*^?#";
const DecodeWord = ({ text }) => {
    const [out, setOut] = useState(text);
    useEffect(() => {
        if (prefersReducedMotion()) return undefined;
        let frame = 0;
        let raf = 0;
        const start = performance.now() + 550; // let the mask-rise land first
        const tick = (now) => {
            if (now < start) { raf = requestAnimationFrame(tick); return; }
            frame += 1;
            const settled = Math.floor((now - start) / 70); // one char per 70ms
            if (settled >= text.length) { setOut(text); return; }
            let s = "";
            for (let i = 0; i < text.length; i++) {
                s += i < settled
                    ? text[i]
                    : GLYPHS[(i * 7 + frame * 3) % GLYPHS.length];
            }
            setOut(s);
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [text]);
    return <>{out}</>;
};

const HERO_ANIM_TARGETS = [
    ".hero-eyebrow",
    ".hero-lead",
    ".hero-cta",
    ".hero-meta",
];

const HEADLINE = [
    { t: "I", sig: false },
    { t: "build", sig: false, br: true },
    { t: "intelligent", sig: true },
    { t: "agents.", sig: false },
];

const Hero = () => {
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [videoStarted, setVideoStarted] = useState(false);
    const magneticCta = useMagnetic(0.45);

    const rootRef = useRef(null);
    const videoRef = useRef(null);

    const startVideo = () => {
        const v = videoRef.current;
        if (!v) return;
        v.play();
        setVideoStarted(true);
    };

    useGSAP(() => {
        if (prefersReducedMotion()) {
            gsap.set([...HERO_ANIM_TARGETS, ".hero-word", ".hero-aside"], { opacity: 1, y: 0, yPercent: 0 });
            return;
        }
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
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
                            AI Engineer · Copilot Studio · Sydney
                        </p>

                        <h1 className="hero-display ed-display" aria-label="I build intelligent agents.">
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
                                    {/* The space is kept alongside <br> so the h1's text
                                        content stays "I build intelligent agents." for
                                        crawlers — a bare <br> glues the words together. */}
                                    {w.br ? <> <br /></> : i < HEADLINE.length - 1 ? " " : ""}
                                </span>
                            ))}
                        </h1>

                        <p className="hero-lead ed-lead mt-7">
                            3+ years as a software engineer, now shipping AI agents that
                            make it into production — and into daily use. Copilot Studio
                            across the Microsoft 365 ecosystem, built end to end. Below is
                            a live one — paste any job description and watch my AI score
                            the fit in real time.
                        </p>

                        <div className="hero-cta mt-9 flex flex-wrap items-center gap-3">
                            <a
                                ref={magneticCta}
                                href="#jd-check"
                                data-magnetic
                                className="ed-btn"
                            >
                                Try the live AI matcher
                                <ArrowDown className="w-4 h-4" />
                            </a>
                            <a
                                href="/files/Eddy_Zhang_CV.pdf"
                                download="Eddy_Zhang_CV.pdf"
                                className="ed-btn-ghost"
                            >
                                <Download className="w-4 h-4" />
                                Download CV
                            </a>
                        </div>

                        <div className="hero-meta mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm" style={{ color: "var(--tx-2)" }}>
                            <span className="ed-status-dot" aria-hidden="true" />
                            <span>Available for work</span>
                            <span aria-hidden="true" style={{ color: "var(--hair-bright)" }}>/</span>
                            <span className="font-mono text-xs tracking-wider">Copilot Studio · Power Automate · Dataverse · MCP</span>
                        </div>
                    </div>

                    {/* RIGHT — editorial framed video */}
                    <div className="hero-aside">
                        <figure className="ed-tile p-2.5 rounded-[var(--r-lg)]">
                            <div className="relative w-full aspect-[16/10] rounded-[var(--r-md)] overflow-hidden bg-black/50">
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
                                    aria-label="Personal introduction video by Eddy Zhang"
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
                                    onLoadedData={() => setVideoLoaded(true)}
                                    onPlay={() => setVideoStarted(true)}
                                />

                                {/* At-rest cover — designed play affordance instead of raw
                                    native controls, so the right column reads as crafted. */}
                                {!videoStarted && (
                                    <button
                                        type="button"
                                        onClick={startVideo}
                                        aria-label="Play 30-second intro"
                                        className="absolute inset-0 flex flex-col items-center justify-center gap-4 group/play"
                                        style={{ background: "linear-gradient(180deg, oklch(0.16 0.018 280 / 0.15) 0%, oklch(0.16 0.018 280 / 0.65) 100%)" }}
                                    >
                                        <span
                                            className="flex items-center justify-center rounded-full transition-transform duration-300 group-hover/play:scale-110"
                                            style={{ width: 64, height: 64, background: "var(--sig)", color: "var(--sig-ink)", boxShadow: "0 10px 40px -8px var(--sig-glow)" }}
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.29-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14z" />
                                            </svg>
                                        </span>
                                        <span className="ed-eyebrow" style={{ color: "var(--tx-1)" }}>Play intro · 30s</span>
                                    </button>
                                )}
                            </div>
                            <figcaption className="ed-eyebrow mt-3 px-1 pb-1">
                                30s intro · who I am
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
