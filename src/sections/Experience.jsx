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
                    {/* Vertical connecting line — centred on the node (w-14 / 4.6rem) */}
                    <div
                        className="absolute left-[1.75rem] md:left-[2.3rem] top-0 bottom-0 w-px"
                        style={{ background: "linear-gradient(to bottom, var(--sig-line), var(--hair), transparent)" }}
                        aria-hidden="true"
                    />

                    <div className="flex flex-col gap-8 md:gap-12">
                        {expCards.map((card) => {
                            const [role, company] = card.title.split(" — ");
                            const isCurrent = /present/i.test(card.date);
                            // The rail carries the year, not an index — a sequence
                            // number tells a reader nothing about when this happened.
                            const startYear = card.date.match(/\d{4}/)?.[0] ?? "";
                            return (
                            <div key={card.title} className="exp-card group/exp relative flex gap-5 md:gap-8">
                                {/* Timeline node — the year makes the rail a real time axis */}
                                <div className="flex-shrink-0 flex flex-col items-center">
                                    <div
                                        className="exp-node w-14 h-14 md:w-[4.6rem] md:h-[4.6rem] rounded-[var(--r-sm)] flex flex-col items-center justify-center relative font-mono transition-all duration-300"
                                        style={{ background: "var(--ink-1)", border: "1px solid var(--sig-line)" }}
                                    >
                                        <span className="text-[15px] md:text-xl font-bold tracking-tight leading-none transition-colors duration-300" style={{ color: "var(--sig)" }}>
                                            {startYear}
                                        </span>
                                        {isCurrent && (
                                            <>
                                                <span className="mt-1 text-[8px] md:text-[9px] uppercase tracking-[0.18em] leading-none" style={{ color: "var(--tx-2)" }}>
                                                    now
                                                </span>
                                                <div className="absolute inset-0 rounded-[var(--r-sm)] animate-pulse" style={{ border: "1px solid var(--sig-line)" }} />
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Card content */}
                                <div className="exp-tile ed-tile flex-1 p-6 md:p-8 transition-all duration-300">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2.5 flex-wrap">
                                                <h3 className="text-xl md:text-2xl font-semibold leading-tight" style={{ color: "var(--tx-0)" }}>
                                                    {role}
                                                </h3>
                                                {isCurrent && (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider"
                                                          style={{ background: "var(--sig-glow)", color: "var(--sig)", border: "1px solid var(--sig-line)" }}>
                                                        <span className="ed-status-dot" style={{ width: 6, height: 6 }} aria-hidden="true" />
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                            {company && (
                                                <p className="text-sm md:text-base mt-1 font-medium" style={{ color: "var(--sig-2)" }}>
                                                    {company}
                                                </p>
                                            )}
                                        </div>
                                        {/* Dates read as data, not as a footnote: brighter
                                            text, and the signature accent while current. */}
                                        <div className="flex items-center gap-2 text-[13px] flex-shrink-0 font-mono px-3 py-1.5 rounded-full self-start tracking-tight"
                                             style={isCurrent
                                                 ? { color: "var(--sig)", background: "var(--sig-glow)", border: "1px solid var(--sig-line)" }
                                                 : { color: "var(--tx-0)", background: "var(--ink-0)", border: "1px solid var(--hair-bright)" }}>
                                            <CalendarDays className="w-3.5 h-3.5 opacity-80" />
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
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Experience;
