import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right";
import { dict } from "../i18n/index.js";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useTilt } from "../hooks/useTilt.js";
import { prefersReducedMotion } from "../lib/motion.js";

/**
 * Certification strip — two vendor credentials, directly under the counter
 * tiles so they land inside the first meaningful scroll. Each card IS the
 * verify link (the whole tile is the target, not a small trailing anchor):
 * a credential a recruiter cannot check in one click may as well be a claim,
 * and both issuers host a public verification page.
 *
 * The badge art is the ISSUERS' OWN — Microsoft's Associate badge and the
 * Credly-hosted Anthropic badge, vendored same-origin (Credly/MS Learn are
 * reachable from the mainland, but same-origin is faster everywhere and the
 * CSP's img-src is 'self'). Official art is the whole point: a recruiter
 * recognises these shapes, and no hand-drawn "badge" carries that.
 *
 * The 3D is deliberately faux. A real WebGL badge was tried elsewhere on this
 * site once and deleted — jank on integrated GPUs, dead weight in WeChat's
 * WebView. Here: the badge flips in once on scroll (GSAP rotationY, once) and
 * the card tilts under a fine pointer (useTilt — the same physics the counter
 * tiles have), with the existing .sheen sweep for the metallic pass. All
 * compositor-only, all gated, nothing runs at rest.
 */
const CertCard = ({ cert, verifyLabel }) => {
    const tiltRef = useTilt(6);
    const badgeRef = useRef(null);

    useGSAP(() => {
        const el = badgeRef.current;
        if (!el) return;
        if (prefersReducedMotion()) {
            gsap.set(el, { opacity: 1, rotationY: 0 });
            return;
        }
        gsap.fromTo(
            el,
            { opacity: 0, rotationY: -85, transformPerspective: 600 },
            {
                opacity: 1,
                rotationY: 0,
                duration: 0.9,
                ease: "power3.out",
                // Promote only while the one-shot flip runs.
                onStart: () => gsap.set(el, { willChange: "transform" }),
                onComplete: () => gsap.set(el, { willChange: "auto" }),
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
            }
        );
    }, []);

    return (
        <a
            ref={tiltRef}
            href={cert.href}
            target="_blank"
            rel="noopener noreferrer"
            className="ed-tile cert-card"
        >
            <span className="cert-badge" ref={badgeRef} aria-hidden="true">
                {/* Decorative: the credential's name sits right beside it. */}
                <img src={cert.badge} alt="" width={64} height={64} loading="lazy" decoding="async" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="cert-name">{cert.name}</span>
                <span className="cert-issuer">{cert.issuer}</span>
            </span>
            <span className="cert-verify">
                {verifyLabel}
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
            <span className="sheen" aria-hidden="true" />
        </a>
    );
};

const CertBar = () => {
    const sectionRef = useScrollReveal({ y: 24, duration: 0.7 });

    return (
        <section
            id="certifications"
            ref={sectionRef}
            className="ed-shell pt-10 md:pt-12"
            aria-label={dict.certs.listAria}
        >
            <p className="ed-eyebrow mb-4">{dict.certs.eyebrow}</p>
            <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
                {dict.certs.items.map((c) => (
                    <CertCard key={c.name} cert={c} verifyLabel={dict.certs.verify} />
                ))}
            </div>
        </section>
    );
};

export default CertBar;
