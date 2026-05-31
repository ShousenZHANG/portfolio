import { useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Download from "lucide-react/dist/esm/icons/download";
import ArrowDown from "lucide-react/dist/esm/icons/arrow-down";
import AnimatedCounter from "../components/AnimatedCounter.jsx";
import { prefersReducedMotion } from "../lib/motion.js";

const HERO_ANIM_TARGETS = [
    ".hero-eyebrow",
    ".hero-display",
    ".hero-lead",
    ".hero-cta",
    ".hero-meta",
    ".hero-aside",
];

const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = prefersReducedMotion();
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
};

const Hero = () => {
    const [videoLoaded, setVideoLoaded] = useState(false);

    useGSAP(() => {
        if (prefersReducedMotion()) {
            gsap.set(HERO_ANIM_TARGETS, { opacity: 1, y: 0 });
            return;
        }
        gsap.fromTo(
            HERO_ANIM_TARGETS,
            { y: 28, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power3.out",
                stagger: 0.09,
            }
        );
    }, []);

    return (
        <>
            <section id="hero" className="relative overflow-hidden">
                <div className="ed-shell grid items-center gap-10 lg:gap-16 lg:grid-cols-[1.05fr_0.95fr] pt-28 pb-20 md:pt-36 md:pb-28 min-h-[88vh]">
                    {/* LEFT — editorial headline */}
                    <div className="flex flex-col">
                        <p className="hero-eyebrow ed-eyebrow mb-6">
                            AI Full-Stack Engineer · Sydney
                        </p>

                        <h1 className="hero-display ed-display">
                            I build<br />
                            <span className="sig">intelligent</span> systems.
                        </h1>

                        <p className="hero-lead ed-lead mt-7">
                            3+ years shipping LLM agents, cloud microservices, and
                            production web apps. Below is a live one — paste any job
                            description and watch my AI score the fit in real time.
                        </p>

                        <div className="hero-cta mt-9 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={() => scrollToId("jd-check")}
                                className="ed-btn"
                            >
                                Try the live AI matcher
                                <ArrowDown className="w-4 h-4" />
                            </button>
                            <a
                                href="/files/Eddy_Zhang_CV.pdf"
                                download="Eddy_Zhang_CV.pdf"
                                className="ed-btn-ghost"
                            >
                                <Download className="w-4 h-4" />
                                Download CV
                            </a>
                        </div>

                        <div className="hero-meta mt-10 flex items-center gap-3 text-sm" style={{ color: "var(--tx-2)" }}>
                            <span className="ed-status-dot" aria-hidden="true" />
                            <span>Available for work</span>
                            <span aria-hidden="true" style={{ color: "var(--hair-bright)" }}>/</span>
                            <span className="font-mono text-xs tracking-wider">React · Node · Python · LLMs</span>
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
                                    src="/videos/eddy_intro.mp4"
                                    controls
                                    loop
                                    playsInline
                                    preload="metadata"
                                    aria-label="Personal introduction video by Eddy Zhang"
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
                                    onLoadedData={() => setVideoLoaded(true)}
                                />
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
