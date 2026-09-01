import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link2 from "lucide-react/dist/esm/icons/link-2";
import Check from "lucide-react/dist/esm/icons/check";
import { prefersReducedMotion } from "../lib/motion.js";
import { dict } from "../i18n/index.js";
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
                // Play-forward only, so `once` is pixel-identical — and it
                // lets GSAP dispose the trigger instead of walking it on
                // every scroll frame for the rest of the visit.
                scrollTrigger: { trigger: ref.current, start: "top 86%", once: true },
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
                    /* The reveal is hover-driven, so on a touch device this was a
                       permanently invisible ~30px target parked against the heading:
                       one stray thumb and a URL was silently on the clipboard. Killing
                       the hit test is enough — `display: none` would also drop it out of
                       the tab order, and `pointer: coarse` describes the PRIMARY pointer,
                       so it fires on a tablet that has a hardware keyboard attached.
                       Keyboard users there still reach it, and focus-visible reveals it.
                       Not made permanently visible: a copy glyph welded beside every h2
                       costs more of the editorial line than the shortcut is worth. */
                    <button
                        type="button"
                        onClick={handleCopy}
                        aria-label={copied ? dict.misc.linkCopied : dict.misc.copyLink(title)}
                        className="pointer-coarse:pointer-events-none opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 p-1.5 rounded-md hover:bg-white/8"
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
                    {dict.misc.linkCopied}
                </p>
            )}
        </div>
    );
};

export default TitleHeader;
