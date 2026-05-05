import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link2 from "lucide-react/dist/esm/icons/link-2";
import Check from "lucide-react/dist/esm/icons/check";
import { prefersReducedMotion } from "../lib/motion.js";

const TitleHeader = ({ title, sub, anchor }) => {
    const ref = useRef(null);
    const [copied, setCopied] = useState(false);

    useGSAP(() => {
        if (!ref.current) return;
        if (prefersReducedMotion()) {
            gsap.set(ref.current, { opacity: 1, y: 0, scale: 1 });
            return;
        }
        gsap.fromTo(
            ref.current,
            { opacity: 0, y: 28, scale: 0.98 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: ref.current,
                    start: "top 82%",
                },
            }
        );
    }, { scope: ref });

    const handleCopy = async () => {
        if (!anchor) return;
        try {
            const url = `${window.location.origin}${window.location.pathname}#${anchor}`;
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch {
            // clipboard write failure is non-fatal
        }
    };

    return (
        <div ref={ref} className="section-header flex flex-col items-center justify-center text-center gap-3">
            {sub && (
                <p className="text-sm md:text-base font-medium tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">
                    {sub}
                </p>
            )}

            <div className="group relative flex items-center justify-center gap-2">
                <h1 className="font-extrabold text-3xl md:text-4xl xl:text-5xl bg-gradient-to-r from-white via-sky-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                    {title}
                </h1>

                {anchor && (
                    <button
                        type="button"
                        onClick={handleCopy}
                        aria-label={copied ? "Link copied" : `Copy link to ${title} section`}
                        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/8"
                    >
                        {copied ? (
                            <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                        ) : (
                            <Link2 className="w-4 h-4" aria-hidden="true" />
                        )}
                    </button>
                )}
            </div>

            <div className="mt-2 w-24 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-70" />

            {copied && (
                <p
                    role="status"
                    aria-live="polite"
                    className="text-xs text-emerald-300/90"
                >
                    Link copied
                </p>
            )}
        </div>
    );
};

export default TitleHeader;
