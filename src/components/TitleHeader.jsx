import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link2 from "lucide-react/dist/esm/icons/link-2";
import Check from "lucide-react/dist/esm/icons/check";
import { prefersReducedMotion } from "../lib/motion.js";
import RevealText from "./RevealText.jsx";

/**
 * Editorial section header. Renders an h2 by default (the single h1
 * lives in the Hero), keeping a valid heading hierarchy site-wide.
 */
const TitleHeader = ({ title, sub, anchor, align = "center" }) => {
    const ref = useRef(null);
    const [copied, setCopied] = useState(false);

    useGSAP(() => {
        if (!ref.current) return;
        const fades = ref.current.querySelectorAll(".th-fade");
        if (prefersReducedMotion()) {
            gsap.set(fades, { opacity: 1, y: 0 });
            return;
        }
        gsap.fromTo(
            fades,
            { opacity: 0, y: 16 },
            {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: "power3.out",
                stagger: 0.1,
                scrollTrigger: { trigger: ref.current, start: "top 86%" },
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

    const alignClass = align === "left" ? "items-start text-left" : "items-center text-center";

    return (
        <div ref={ref} className={`flex flex-col gap-4 ${alignClass}`}>
            {sub && <p className="ed-eyebrow th-fade">{sub}</p>}

            <div className="group relative flex items-center gap-2">
                <RevealText as="h2" className="ed-h2" text={title} />
                {anchor && (
                    <button
                        type="button"
                        onClick={handleCopy}
                        aria-label={copied ? "Link copied" : `Copy link to ${title} section`}
                        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 p-1.5 rounded-md hover:bg-white/8"
                        style={{ color: "var(--tx-2)" }}
                    >
                        {copied
                            ? <Check className="w-4 h-4" style={{ color: "var(--sig)" }} aria-hidden="true" />
                            : <Link2 className="w-4 h-4" aria-hidden="true" />}
                    </button>
                )}
            </div>

            {copied && (
                <p role="status" aria-live="polite" className="text-xs" style={{ color: "var(--sig)" }}>
                    Link copied
                </p>
            )}
        </div>
    );
};

export default TitleHeader;
