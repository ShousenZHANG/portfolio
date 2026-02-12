import { useEffect } from "react";
import gsap from "gsap";

const TitleHeader = ({ title, sub }) => {
    useEffect(() => {
        const headers = gsap.utils.toArray(".section-header");
        headers.forEach((header) => {
            gsap.fromTo(
                header,
                { opacity: 0, y: 28, scale: 0.98 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: header,
                        start: "top 82%",
                    },
                }
            );
        });
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
