import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { expCards } from "../constants";
import TitleHeader from "../components/TitleHeader";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";
import ArrowDown from "lucide-react/dist/esm/icons/arrow-down";
import { projects } from "../constants/projects";
import { prefersReducedMotion } from "../lib/motion.js";
import { useInView } from "../hooks/useInView.js";
import { dict } from "../i18n/index.js";

// A bullet written as "Label: body" (「标签：正文」 on /zh) gets its label
// lifted to the primary text colour, so a scanning reader can run down the
// left edge and read the headings without reading the paragraphs. The label
// must be short — a long run before the first colon is a sentence, not a
// label, and is left alone. "Short" differs by script: 14 hanzi is already a
// clause, 32 Latin characters is a four-word label.
const LEAD_IN = /^(?:[^：]{2,14}：|[^:：]{2,32}: )/;

function leadIn(text) {
    const m = LEAD_IN.exec(text);
    if (!m) return text;
    return (
        <>
            <span className="exp-lead-in">{m[0]}</span>
            {text.slice(m[0].length)}
        </>
    );
}

const Experience = () => {
    const containerRef = useRef(null);
    // One observer on the timeline block, two duties: it parks the two NOW
    // pings (CSS keys off `.ping-scope:not(.in-view)`) and it hands back the
    // rail's compositing layers while the scrub is nowhere near the viewport.
    const [scopeRef, scopeInView] = useInView();

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
                    title={dict.experience.title}
                    sub={dict.experience.sub}
                    anchor="experience"
                    align="left"
                />

                <div ref={scopeRef} className={`relative mt-14 ping-scope ${scopeInView ? "in-view" : ""}`}>
                    {/* Vertical rail — centred on the node (w-14 / 4.6rem). The
                        fill line grows with scroll; nodes light as it passes. */}
                    <div className="exp-rail hidden sm:block absolute left-[1.75rem] md:left-[2.3rem] top-0 bottom-0 w-px" aria-hidden="true">
                        {/* The scrub transforms both of these on every scroll frame,
                            so the layer earns its keep — but only here. Inline wins
                            over the base rule's blanket `will-change: transform`,
                            which held two layers for the whole session for a scrub
                            that runs across one section. Gated on the observer, not
                            on ScrollTrigger: a scrub keeps lerping for its 0.4s
                            catch-up after the trigger goes inactive, so onToggle
                            would drop the layer mid-motion. */}
                        <div className="exp-rail-fill" style={{ willChange: scopeInView ? "transform" : "auto" }} />
                        <div className="exp-rail-head" style={{ willChange: scopeInView ? "transform" : "auto" }} />
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
                            const hasBody = card.responsibilities.length > 0 || card.projects.length > 0;
                            return (
                            <div key={card.title} className="exp-card group/exp relative flex gap-5 md:gap-8">
                                {/* Timeline marker — bare editorial year pressed onto
                                    the rail (magazine folio style), or a dot for a
                                    same-year follow-up entry */}
                                {/* On a phone the year column cost ~95 of 390px and squeezed
                                    every line to ~25 characters; the date pill already says
                                    when, so the rail and the folio sit out below sm. */}
                                <div className="hidden sm:flex flex-shrink-0 w-14 md:w-[4.6rem] flex-col items-center">
                                    {repeatYear ? (
                                        <div className="exp-node exp-dot" aria-hidden="true" />
                                    ) : (
                                        <div className="exp-node exp-yearmark relative font-mono">
                                            <span className="exp-year font-bold tracking-tight leading-none">
                                                {startYear}
                                            </span>
                                            {isCurrent && (
                                                <span className="exp-now" aria-label={dict.experience.currentAria}>
                                                    <span className="exp-now-dot" aria-hidden="true" />
                                                    {dict.experience.nowBadge}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Card content */}
                                {/* With a body, a wide card splits: who/where/when on the
                                    left, what on the right — the bullets ran ~150 characters
                                    a line across the full card. */}
                                {/* An entry with no body (the bachelor's) is a single compact row —
                                    as a split card it was a 190px box with an empty
                                    700px right column. */}
                                <div className={`exp-tile ed-tile flex-1 min-w-0 transition-all duration-300 ${hasBody ? "exp-split p-6 md:p-8" : "exp-compact p-5 md:px-8 md:py-6"}`}>
                                    <div className={`exp-head flex flex-col md:flex-row md:items-start md:justify-between gap-3 ${hasBody ? "mb-5" : ""}`}>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2.5 flex-wrap">
                                                <h3 className="text-xl md:text-2xl font-semibold leading-tight" style={{ color: "var(--tx-0)" }}>
                                                    {role}
                                                </h3>
                                                {isCurrent && (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider"
                                                          style={{ background: "var(--sig-glow)", color: "var(--sig)", border: "1px solid var(--sig-line)" }}>
                                                        <span className="ed-status-dot" style={{ width: 6, height: 6 }} aria-hidden="true" />
                                                        {dict.experience.currentBadge}
                                                    </span>
                                                )}
                                            </div>
                                            {company && (() => {
                                                // 「科尔斯律师事务所（Corrs Chambers Westgarth）」 wrapped
                                                // mid-name in the narrow left column; the bracketed
                                                // original goes on its own quieter line instead.
                                                const m = company.match(/^(.+?)[（(](.+)[）)]$/);
                                                return (
                                                    <p className="text-sm md:text-base mt-1 font-medium" style={{ color: "var(--sig-2)" }}>
                                                        {m ? m[1] : company}
                                                        {m && <span className="exp-company-alt">{m[2]}</span>}
                                                    </p>
                                                );
                                            })()}
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

                                    {hasBody && (
                                    <div className="exp-body">
                                    {card.responsibilities.length > 0 && (
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
                                                <span>{leadIn(r)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    )}
                                    {card.projects.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-5">
                                            {card.projects.map((pi) => (
                                                <a key={projects[pi].id} href={`#${projects[pi].id}`} className="exp-proj">
                                                    <span className="exp-proj-k">{dict.experience.seeProject}</span>
                                                    {projects[pi].title}
                                                    <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                    </div>
                                    )}
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
