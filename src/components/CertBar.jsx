import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right";
import { dict } from "../i18n/index.js";
import { useTilt } from "../hooks/useTilt.js";
import { prefersReducedMotion } from "../lib/motion.js";

/**
 * Certification strip — two vendor credentials, directly under the counter
 * tiles. Each card IS the verify link: a credential a recruiter cannot check
 * in one click may as well be a claim. The badge art is the issuers' own
 * (Microsoft's Associate hexagon, the Credly-hosted Anthropic medallion),
 * vendored same-origin.
 *
 * The entrance is ONE timeline on ONE ScrollTrigger. The first cut ran a
 * section-level fade and a per-badge flip as separate triggers firing the
 * same instant — a parent animating opacity re-composites its whole subtree
 * every frame, with two 3D rotations inside it, both badges in lockstep. It
 * visibly hitched. Now: cards rise staggered, badges flip staggered inside
 * them, all sequenced in a single timeline, will-change held only while it
 * plays.
 *
 * The badge's depth shadow is a STATIC pseudo-element, not drop-shadow().
 * A filter on an element under 3D rotation re-rasterises every frame — that
 * was the biggest single cost in the hitch. An ellipse under the badge is
 * painted once and never again.
 */
const CertCard = ({ cert, verifyLabel }) => {
    const tiltRef = useTilt(6);
    return (
        <a
            ref={tiltRef}
            href={cert.href}
            target="_blank"
            rel="noopener noreferrer"
            className="ed-tile cert-card"
        >
            <span className="cert-badge" aria-hidden="true">
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
    const sectionRef = useRef(null);

    useGSAP(() => {
        const root = sectionRef.current;
        if (!root) return;
        const eyebrow = root.querySelector(".ed-eyebrow");
        const cards = root.querySelectorAll(".cert-card");
        const badges = root.querySelectorAll(".cert-badge");

        if (prefersReducedMotion()) {
            gsap.set([eyebrow, ...cards, ...badges], { opacity: 1, y: 0, rotationY: 0 });
            return;
        }

        const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: root, start: "top 85%", once: true },
            onStart: () => gsap.set([...cards, ...badges], { willChange: "transform" }),
            onComplete: () => gsap.set([...cards, ...badges], { willChange: "auto" }),
        });
        tl.fromTo(eyebrow, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45 })
            .fromTo(
                cards,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.55, stagger: 0.12 },
                "-=0.25"
            )
            .fromTo(
                badges,
                { rotationY: -85, transformPerspective: 500 },
                { rotationY: 0, duration: 0.75, stagger: 0.12 },
                // Start once its card is essentially opaque — flipping inside a
                // still-fading parent re-composites the whole card per frame.
                "-=0.15"
            );
    }, { scope: sectionRef });

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
