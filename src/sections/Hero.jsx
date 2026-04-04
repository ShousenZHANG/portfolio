import { useState } from "react";
import { words } from "../constants/index.js";
import Button from "../components/Button.jsx";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Download from "lucide-react/dist/esm/icons/download";
import AnimatedCounter from "../components/AnimatedCounter.jsx";

const Hero = () => {
    const [videoLoaded, setVideoLoaded] = useState(false);

    useGSAP(() => {
        const isMobile =
            typeof window !== "undefined" &&
            window.matchMedia("(max-width: 768px)").matches;

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Staggered reveal: badge → heading → subheading → description → CTAs
        tl.fromTo(
            ".hero-badge-anim",
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: isMobile ? 0.5 : 0.6 }
        )
        .fromTo(
            ".hero-heading",
            { y: isMobile ? 30 : 50, opacity: 0 },
            { y: 0, opacity: 1, duration: isMobile ? 0.6 : 0.8 },
            "-=0.3"
        )
        .fromTo(
            ".hero-sub",
            { y: isMobile ? 20 : 35, opacity: 0 },
            { y: 0, opacity: 1, duration: isMobile ? 0.5 : 0.7 },
            "-=0.4"
        )
        .fromTo(
            ".hero-desc",
            { y: isMobile ? 16 : 24, opacity: 0 },
            { y: 0, opacity: 1, duration: isMobile ? 0.5 : 0.65 },
            "-=0.3"
        )
        .fromTo(
            ".hero-cta",
            { y: isMobile ? 16 : 24, opacity: 0 },
            { y: 0, opacity: 1, duration: isMobile ? 0.5 : 0.65 },
            "-=0.2"
        )
        .fromTo(
            ".hero-video-wrap",
            { y: isMobile ? 20 : 40, opacity: 0, scale: 0.98 },
            { y: 0, opacity: 1, scale: 1, duration: isMobile ? 0.6 : 0.9 },
            "-=0.4"
        );
    }, []);

    return (
        <>
            <section id="hero" className="relative overflow-hidden">
                {/* Background layers */}
                <div className="hero-bg-layer" aria-hidden="true" />
                <div className="hero-glow" aria-hidden="true" />
                <div className="hero-glow-secondary" aria-hidden="true" />

                <div className="hero-layout">
                    {/* LEFT: Hero Content */}
                    <header className="relative z-10 flex flex-col justify-center xl:w-[45%] md:w-full w-screen md:px-20 px-5">
                        {/* Status badge */}
                        <div className="hero-badge-anim mb-6 md:mb-8">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm text-white/80">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                                </span>
                                Available for opportunities in Sydney
                            </span>
                        </div>

                        {/* Main heading */}
                        <div className="flex flex-col gap-3 md:gap-4">
                            <h1 className="hero-heading text-4xl md:text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight">
                                <span className="text-white">Building</span>
                                <span className="hero-word-slider">
                                    <span className="hero-word-track">
                                        {words.map((word, index) => (
                                            <span key={index} className="hero-word-item">
                                                <img
                                                    src={word.imgPath}
                                                    alt=""
                                                    className="xl:size-11 md:size-9 size-7 p-1 rounded-full bg-white/10"
                                                />
                                                <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                                                    {word.text}
                                                </span>
                                            </span>
                                        ))}
                                    </span>
                                </span>
                            </h1>
                            <p className="hero-sub text-4xl md:text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight bg-gradient-to-r from-white/90 via-sky-200 to-white/70 bg-clip-text text-transparent">
                                into Scalable Systems
                            </p>
                        </div>

                        {/* Description — simplified, fewer highlights */}
                        <p className="hero-desc text-white/75 text-base md:text-lg xl:text-xl max-w-xl leading-relaxed mt-6 md:mt-8">
                            Full-stack developer with{" "}
                            <span className="text-white font-medium">3+ years professional experience</span>.
                            Specializing in Java Spring Boot microservices, React, and cloud architecture.
                        </p>

                        {/* CTAs */}
                        <div className="hero-cta flex flex-wrap gap-4 mt-8 md:mt-10">
                            <Button
                                text="See My Work"
                                className="md:w-60 md:h-13 w-48 h-12"
                                scrollTo="counter"
                            />
                            <a
                                href="/files/Eddy_Zhang_CV.pdf"
                                download="Eddy_Zhang_Resume.pdf"
                                className="hero-btn-secondary group md:w-60 md:h-13 w-48 h-12"
                            >
                                <span className="hero-btn-border" />
                                <span className="relative z-10 flex items-center gap-2.5 font-semibold tracking-wide">
                                    <Download className="w-4 h-4 text-sky-300 transition-all duration-300 group-hover:text-sky-200 group-hover:-translate-y-0.5" />
                                    Download CV
                                </span>
                            </a>
                        </div>
                    </header>

                    {/* RIGHT: Video */}
                    <figure className="video-layout flex justify-center items-center z-20">
                        <div className="hero-video-wrap relative w-full max-w-[850px] aspect-[16/9] flex justify-center items-center">
                            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-black/40 hero-video-container">
                                {/* Skeleton pulse */}
                                {!videoLoaded && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 to-slate-900/60 animate-pulse" />
                                )}
                                <video
                                    src="/videos/eddy_intro.mp4"
                                    controls
                                    loop
                                    playsInline
                                    preload="metadata"
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
                                    onLoadedData={() => setVideoLoaded(true)}
                                />
                            </div>
                        </div>
                    </figure>
                </div>
            </section>
            <section id="counter-section">
                <AnimatedCounter />
            </section>
        </>
    );
};

export default Hero;
