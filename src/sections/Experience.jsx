import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { expCards } from "../constants";
import TitleHeader from "../components/TitleHeader";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";

const Experience = () => {
    useGSAP(() => {
        const ctx = gsap.context(() => {
            const isMobile = window.innerWidth < 768;
            const blocks = gsap.utils.toArray(".exp-block");

            blocks.forEach((block, i) => {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: block,
                        start: "top 84%",
                        toggleActions: "play none none reverse",
                    },
                });

                if (!isMobile) {
                    tl.from(block, {
                        opacity: 0,
                        y: 56,
                        scale: 0.98,
                        duration: 0.9,
                        ease: "power2.out",
                        delay: i * 0.08,
                    }).from(
                        block.querySelector(".timeline-dot"),
                        {
                            opacity: 0,
                            scale: 0.7,
                            filter: "blur(4px)",
                            duration: 0.6,
                            ease: "power2.out",
                        },
                        "-=0.5"
                    );
                } else {
                    gsap.from(block, {
                        opacity: 0,
                        y: 28,
                        duration: 0.7,
                        ease: "power2.out",
                        delay: i * 0.06,
                    });
                }
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="experience"
            className="flex-center md:mt-20 mt-20 section-padding xl:px-0"
        >
            <div className="w-full h-full md:px-20 px-5">
                <TitleHeader
                    title="Professional Work Experience"
                    sub="💼 My Journey Through Code & Innovation"
                />

                {/* Timeline wrapper */}
                <div className="relative mt-24 before:content-[''] before:absolute before:top-0 before:bottom-0 before:left-1/2 before:w-[2px] before:bg-gradient-to-b before:from-sky-400/30 before:to-transparent max-md:before:hidden">
                    {expCards.map((card, index) => (
                        <div
                            key={card.title}
                            className={`exp-block relative flex flex-col md:flex-row items-center md:items-start ${
                                index % 2 === 0 ? "md:flex-row-reverse" : ""
                            } md:justify-between gap-10 mb-24 md:mb-28`}
                        >
                            <div className="timeline-dot absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-sky-400 rounded-full shadow-[0_0_12px_rgba(56,189,248,0.4)] z-10 max-md:hidden"></div>

                            <div
                                className={`group relative glass-card p-7 sm:p-8 md:p-10 hover:border-sky-400/20 hover:shadow-[var(--shadow-md)] hover:-translate-y-1 transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] md:w-[45%] w-full ${
                                    index % 2 === 0 ? "md:text-right" : "md:text-left"
                                }`}
                            >
                                <h1
                                    className={`font-semibold text-2xl sm:text-3xl md:text-4xl bg-gradient-to-r from-white via-sky-200 to-indigo-400 bg-clip-text text-transparent tracking-tight ${
                                        index % 2 === 0 ? "md:text-right" : "md:text-left"
                                    }`}
                                >
                                    {card.title}
                                </h1>

                                <div
                                    className={`flex items-center gap-2 mb-5 mt-3 ${
                                        index % 2 === 0 ? "md:justify-end" : "md:justify-start"
                                    }`}
                                >
                                    <CalendarDays className="w-5 h-5 text-sky-400 shrink-0" />
                                    <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-slate-300 via-sky-200 to-slate-400 tracking-wide drop-shadow-[0_0_6px_rgba(56,189,248,0.25)] text-sm sm:text-base">
                    {card.date}
                  </span>
                                </div>

                                <p className="text-sky-300 italic font-medium text-base sm:text-lg mb-4 tracking-wide">
                                    Responsibilities
                                </p>

                                <ul
                                    className={`relative border-l border-sky-900/60 ${
                                        index % 2 === 0 ? "md:border-r md:border-l-0 md:pr-6" : "pl-6"
                                    } flex flex-col gap-3 sm:gap-4`}
                                >
                                    {card.responsibilities.map((r, i) => (
                                        <li
                                            key={i}
                                            className="text-[15px] sm:text-base md:text-lg text-slate-300/90 leading-relaxed font-light hover:text-sky-300 transition-all duration-300"
                                        >
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Experience;
