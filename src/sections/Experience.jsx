import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { expCards } from "../constants";
import TitleHeader from "../components/TitleHeader";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";

const Experience = () => {
    const containerRef = useRef(null);

    useGSAP(() => {
        const blocks = gsap.utils.toArray(".exp-card");
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
        <section id="experience" className="py-20 md:py-28 px-5 md:px-12 lg:px-20">
            <div className="max-w-[1100px] mx-auto" ref={containerRef}>
                <TitleHeader
                    title="Professional Experience"
                    sub="My Journey"
                />

                <div className="relative mt-16">
                    {/* Vertical connecting line */}
                    <div
                        className="absolute left-[1.4rem] md:left-[2.1rem] top-0 bottom-0 w-px"
                        style={{
                            background: "linear-gradient(to bottom, rgba(56,189,248,0.4), rgba(56,189,248,0.15), transparent)",
                        }}
                        aria-hidden="true"
                    />

                    <div className="flex flex-col gap-10 md:gap-14">
                        {expCards.map((card, index) => (
                            <div key={card.title} className="exp-card relative flex gap-5 md:gap-8">
                                {/* Step number */}
                                <div className="flex-shrink-0 flex flex-col items-center">
                                    <div className="w-11 h-11 md:w-[4.2rem] md:h-[4.2rem] rounded-xl bg-[#0e1018] border border-sky-400/25 flex items-center justify-center relative">
                                        <span className="text-sm md:text-lg font-bold text-sky-400 tracking-tight">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        {/* Glow ring on first item */}
                                        {index === 0 && (
                                            <div className="absolute inset-0 rounded-xl border border-sky-400/40 animate-pulse" />
                                        )}
                                    </div>
                                </div>

                                {/* Card content */}
                                <div className="flex-1 bg-[#0d0f15] rounded-xl border border-white/8 p-6 md:p-8 hover:border-white/15 transition-colors duration-500">
                                    {/* Header row */}
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-5">
                                        <h2 className="text-xl md:text-2xl font-semibold text-white leading-tight">
                                            {card.title}
                                        </h2>
                                        <div className="flex items-center gap-2 text-white/50 text-sm flex-shrink-0">
                                            <CalendarDays className="w-4 h-4" />
                                            <span>{card.date}</span>
                                        </div>
                                    </div>

                                    {/* Responsibility list */}
                                    <ul className="space-y-3">
                                        {card.responsibilities.map((r) => (
                                            <li
                                                key={r.slice(0, 50)}
                                                className="flex gap-3 text-sm md:text-base text-white/70 leading-relaxed"
                                            >
                                                <span className="text-sky-400/60 mt-1.5 flex-shrink-0">
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
