import React from 'react'
import {words} from "../constants/index.js";
import Button from "../components/Button.jsx";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";

const Hero = () => {
    useGSAP(() => {
        gsap.fromTo(
            ".hero-text h1",
            {y: 50, opacity: 0},
            {y: 0, opacity: 1, stagger: 0.2, duration: 1, ease: "power2.inOut"}
        );
    });
    return (
        <section id="hero" className="relative overflow-hidden">

            {/* Background Image */}
            <div className="absolute top-0 left-0 z-10">
                <img src="/images/bg.png" alt=""/>
            </div>

            <div className="hero-layout">
                {/* LEFT: Hero Content */}
                <header className="flex flex-col justify-center md:w-full w-screen md:px-20 px-5">
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
                        <p className="text-white/80 md:text-xl max-w-2xl leading-relaxed mt-4">
                            Hi, I’m{" "}
                            <span
                                className="font-extrabold bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-x drop-shadow-[0_0_10px_rgba(56,189,248,0.6)]">
    Eddy Zhang
  </span>
                            — a Sydney-based full-stack developer passionate about building
                            <span className="text-cyan-300 font-semibold drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
    {" "}
                                scalable, high-performance systems.
  </span>{" "}
                        </p>

                        {/*Button */}
                        <Button
                            text="See My Work"
                            className="md:w-80 md:h-16 w-60 h-12"
                            id="counter"
                        />
                    </div>
                </header>
            </div>



        </section>
    )
}
export default Hero
