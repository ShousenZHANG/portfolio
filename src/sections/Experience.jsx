import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
            gsap.set(".exp-rail-fill", { scaleY: 1 });
            document.querySelectorAll(".exp-node, .exp-tile").forEach((n) => n.classList.add("lit"));
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
                        // Once: replaying/reversing the entrance on every
                        // upward scroll read as flicker, not delight.
                        once: true,
                    },
                }
            );
        });

        // Stage-lighting timeline: the fill line grows with scroll, a
        // glowing head particle rides its tip, and as the current reaches
        // each entry the year node bursts + the whole card powers on
        // (cards idle dimmed until the light arrives). Transform/opacity
        // only — compositor-cheap.
        const railScroll = {
            trigger: ".exp-rail",
            start: "top 72%",
            end: "bottom 45%",
            scrub: 0.4,
        };
        gsap.to(".exp-rail-fill", { scaleY: 1, ease: "none", scrollTrigger: railScroll });
        gsap.fromTo(
            ".exp-rail-head",
            { y: 0 },
            {
                y: () => {
                    const rail = document.querySelector(".exp-rail");
                    return rail ? rail.offsetHeight - 9 : 0;
                },
                ease: "none",
                scrollTrigger: { ...railScroll, invalidateOnRefresh: true },
            }
        );
        gsap.utils.toArray(".exp-node").forEach((node) => {
            const tile = node.closest(".exp-card")?.querySelector(".exp-tile");
            ScrollTrigger.create({
                trigger: node,
                start: "top 70%",
                toggleClass: { targets: [node, tile].filter(Boolean), className: "lit" },
            });
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
                    {/* Vertical rail — centred on the node (w-14 / 4.6rem). The
                        fill line grows with scroll; nodes light as it passes. */}
                    <div className="exp-rail absolute left-[1.75rem] md:left-[2.3rem] top-0 bottom-0 w-px" aria-hidden="true">
                        <div className="exp-rail-fill" />
                        <div className="exp-rail-head" />
                    </div>

                    <div className="flex flex-col gap-8 md:gap-12">
                        {expCards.map((card, index) => {
                            const [role, company] = card.title.split(" — ");
                            const isCurrent = /present/i.test(card.date);
                            // The rail carries the year, not an index — a sequence
                            // number tells a reader nothing about when this happened.
                            const startYear = card.date.match(/\d{4}/)?.[0] ?? "";
                            const prevYear = index > 0 ? expCards[index - 1].date.match(/\d{4}/)?.[0] : null;
                            // Timeline convention: a year is marked once; further
                            // entries in the same year ride the rail as dots.
                            const repeatYear = startYear === prevYear;
                            return (
                            <div key={card.title} className="exp-card group/exp relative flex gap-5 md:gap-8">
                                {/* Timeline marker — bare editorial year pressed onto
                                    the rail (magazine folio style), or a dot for a
                                    same-year follow-up entry */}
                                <div className="flex-shrink-0 w-14 md:w-[4.6rem] flex flex-col items-center">
                                    {repeatYear ? (
                                        <div className="exp-node exp-dot" aria-hidden="true" />
                                    ) : (
                                        <div className="exp-node exp-yearmark relative font-mono">
                                            <span className="exp-year font-bold tracking-tight leading-none">
                                                {startYear}
                                            </span>
                                            {isCurrent && (
                                                <span className="exp-now" aria-label="current role">
                                                    <span className="exp-now-dot" aria-hidden="true" />
                                                    NOW
                                                </span>
                                            )}
                                        </div>
                                    )}
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
