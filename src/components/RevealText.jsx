import { createElement, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../lib/motion.js";

gsap.registerPlugin(ScrollTrigger);

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
    const words = String(text).split(" ");

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
                scrollTrigger: onScroll
                    ? { trigger: ref.current, start: "top 88%", once: true }
                    : undefined,
            }
        );
    }, { scope: ref });

    return createElement(
        as,
        { ref, className, ...rest },
        words.map((word, i) => (
            <span
                key={`${word}-${i}`}
                style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}
            >
                <span className="reveal-word" style={{ display: "inline-block", willChange: "transform" }}>
                    {word}
                </span>
                {i < words.length - 1 ? " " : ""}
            </span>
        ))
    );
};

export default RevealText;
