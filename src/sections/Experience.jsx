import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { expCards } from "../constants";
import TitleHeader from "../components/TitleHeader";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";
import { prefersReducedMotion } from "../lib/motion.js";

const Experience = () => {
    const containerRef = useRef(null);

    useGSAP(() => {
        const blocks = gsap.utils.toArray(".exp-card");
        if (prefersReducedMotion()) {
            gsap.set(blocks, { opacity: 1, x: 0 });
            return;
        }
        blocks.forEach((block) => {
            gsap.fromTo(
                block,
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.7,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: block,
                        start: "top 86%",
                        toggleActions: "play none none reverse",
                    },
                }
            );
        });
    }, []);

    return (
        <section id="experience" className="ed-shell py-[var(--sp-section)]">
            <div ref={containerRef}>
                <TitleHeader
                    title="Professional Experience"
                    sub="02 / Experience"
                    anchor="experience"
                    align="left"
                />

                <div className="relative mt-14">
                    {/* Vertical connecting line */}
                    <div
                        className="absolute left-[1.4rem] md:left-[2.1rem] top-0 bottom-0 w-px"
                        style={{ background: "linear-gradient(to bottom, var(--sig-line), var(--hair), transparent)" }}
                        aria-hidden="true"
                    />

                    <div className="flex flex-col gap-8 md:gap-12">
                        {expCards.map((card, index) => (
                            <div key={card.title} className="exp-card relative flex gap-5 md:gap-8">
                                {/* Step number */}
                                <div className="flex-shrink-0 flex flex-col items-center">
                                    <div
                                        className="w-11 h-11 md:w-[4.2rem] md:h-[4.2rem] rounded-[var(--r-sm)] flex items-center justify-center relative font-mono"
                                        style={{ background: "var(--ink-1)", border: "1px solid var(--sig-line)" }}
                                    >
                                        <span className="text-sm md:text-lg font-bold tracking-tight" style={{ color: "var(--sig)" }}>
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        {index === 0 && (
                                            <div className="absolute inset-0 rounded-[var(--r-sm)] animate-pulse" style={{ border: "1px solid var(--sig-line)" }} />
                                        )}
                                    </div>
                                </div>

                                {/* Card content */}
                                <div className="ed-tile flex-1 p-6 md:p-8">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-5">
                                        <h3 className="text-xl md:text-2xl font-semibold leading-tight" style={{ color: "var(--tx-0)" }}>
                                            {card.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm flex-shrink-0 font-mono" style={{ color: "var(--tx-2)" }}>
                                            <CalendarDays className="w-4 h-4" />
                                            <span>{card.date}</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-3">
                                        {card.responsibilities.map((r) => (
                                            <li
                                                key={r.slice(0, 50)}
                                                className="flex gap-3 text-sm md:text-base leading-relaxed"
                                                style={{ color: "var(--tx-1)" }}
                                            >
                                                <span className="mt-1.5 flex-shrink-0" style={{ color: "var(--sig-dim)" }}>
                                                    <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor"><circle cx="3" cy="3" r="3"/></svg>
                                                </span>
                                                <span>{r}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Experience;
