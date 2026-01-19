import React from 'react'
import {words} from "../constants/index.js";
import Button from "../components/Button.jsx";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import {Download} from "lucide-react";
import AnimatedCounter from "../components/AnimatedCounter.jsx";

const Hero = () => {
    useGSAP(() => {
        const isMobile =
            typeof window !== "undefined" &&
            window.matchMedia("(max-width: 768px)").matches;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".hero-text h1",
                {y: isMobile ? 24 : 50, opacity: 0},
                {
                    y: 0,
                    opacity: 1,
                    stagger: isMobile ? 0.1 : 0.16,
                    duration: isMobile ? 0.75 : 0.95,
                    ease: "power2.out",
                }
            );
            gsap.fromTo(
                ".hero-desc, .hero-cta",
                {y: isMobile ? 12 : 24, opacity: 0},
                {
                    y: 0,
                    opacity: 1,
                    duration: isMobile ? 0.65 : 0.85,
                    ease: "power2.out",
                    delay: isMobile ? 0.18 : 0.26,
                }
            );
        });
        return () => ctx.revert();
    });
    return (
        <>
            <section id="hero" className="relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute top-0 left-0 z-10">
                    <img src="/images/bg.png" alt=""/>
                </div>

                <div className="hero-layout">
                    {/* LEFT: Hero Content */}
                    <header className="relative flex flex-col justify-center md:w-full w-screen md:px-20 px-5">
                        <div className="hero-glow" aria-hidden="true" />
                        <div className="flex flex-col gap-7">
                            <div className="hero-text">
                                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                                    Building
                                    <span className="slide">
                  <span className="wrapper">
                    {words.map((word, index) => (
                        <span
                            key={index}
                            className="flex items-center md:gap-3 gap-1 pb-2"
                        >
                        <img
                            src={word.imgPath}
                            alt="person"
                            className="xl:size-12 md:size-10 size-7 md:p-2 p-1 rounded-full bg-white-50"
                        />
                        <span>{word.text}</span>
                      </span>
                    ))}
                  </span>
                </span>
                                </h1>
                                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-x">into
                                    Scalable Systems</h1>
                                <h1 className="text-4xl md:text-6xl font-semibold leading-tight bg-gradient-to-r from-purple-400 via-pink-400 to-fuchsia-500 bg-clip-text text-transparent">that
                                    Empower Innovation</h1>
                            </div>

                            {/* Description */}
                            <p className="hero-desc text-white/80 md:text-xl max-w-2xl leading-relaxed mt-4">
                                Hi, I’m{" "}
                                <span
                                    className="font-extrabold bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400
               bg-clip-text text-transparent animate-gradient-x
               drop-shadow-[0_0_10px_rgba(56,189,248,0.6)]">
    Eddy Zhang
  </span>
                                — a{" "}
                                <span className="text-cyan-300 font-semibold drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
    full-stack developer
  </span>{" "}
                                with{" "}
                                <span className="text-emerald-300 font-semibold">
    3 years of full-time experience
  </span>{" "}
                                and{" "}
                                <span className="text-emerald-300 font-semibold">
    5 years in total software development
  </span>.
                            </p>

                            {/* Buttons */}
                            <div className="hero-cta flex flex-wrap gap-4 mt-6">
                                {/* View Work Button */}
                                <Button
                                    text="See My Work"
                                    className="md:w-80 md:h-16 w-60 h-12"
                                    id="counter"
                                />

                                {/* Download Resume Button */}
                                <a
                                    href="/files/Eddy_Zhang_CV.pdf"
                                    download="Eddy_Zhang_Resume.pdf"
                                    className="md:w-80 md:h-16 w-60 h-12 flex items-center justify-center rounded-xl
               border border-sky-400/40 bg-sky-600/20 text-white font-semibold
               hover:bg-sky-500/40 hover:shadow-[0_0_25px_rgba(56,189,248,0.3)]
               transition-all duration-500 ease-out backdrop-blur-sm"
                                >
    <span className="flex items-center gap-2">
      <Download className="w-5 h-5 text-sky-300 group-hover:text-sky-100 transition-colors duration-300"/>
      Download CV
    </span>
                                </a>
                            </div>
                        </div>
                    </header>
                    {/* RIGHT: Video */}
                    <figure className="video-layout flex justify-center items-center">
                        <div
                            className="relative w-full max-w-[850px] aspect-[16/9] flex justify-center items-center"
                            style={{
                                filter: "drop-shadow(0 0 35px rgba(56,189,248,0.5))",
                            }}
                        >
                            <div
                                className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-black/30">
                                <video
                                    src="/videos/eddy_intro.mp4"
                                    controls
                                    loop
                                    playsInline
                                    preload="metadata"
                                    className="absolute top-0 left-0 w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </figure>
                </div>
            </section>
            <section id="counter-section">
                <AnimatedCounter/>
            </section>
        </>
    )
}
export default Hero
