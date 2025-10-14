import { useEffect } from "react";
import gsap from "gsap";

const TitleHeader = ({ title, sub }) => {
    useEffect(() => {
        gsap.fromTo(
            ".section-header",
            { opacity: 0, y: 40, scale: 0.95 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.9,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: ".section-header",
                    start: "top 80%",
                },
            }
        );
    }, []);

    return (
        <div className="section-header flex flex-col items-center justify-center text-center gap-3">
            {sub && (
                <p className="text-sm md:text-base font-medium tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">
                    {sub}
                </p>
            )}

            <h1 className="font-extrabold text-3xl md:text-5xl bg-gradient-to-r from-white via-sky-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                {title}
            </h1>

            <div className="mt-2 w-24 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-70" />
        </div>
    );
};

export default TitleHeader;
