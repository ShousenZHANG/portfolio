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
 * The entrance is ONE timeline on ONE ScrollTrigger — an earlier cut ran a
 * section-level fade and per-badge animations as separate triggers firing
 * the same instant, and a parent animating opacity re-composites its whole
 * subtree every frame. will-change is held only while the timeline plays.
 *
 * The entrance is a STAMP, not a flip. A flat badge image rotated through
 * a large Y angle spends its first frames as a sliver — "half a badge" — and
 * no easing hides that; it is inherent to rotating a plane you view edge-on.
 * A credential's native gesture is being stamped anyway: the badge drops in
 * from slightly above at ~1.6x with a touch of rotation, lands with a small
 * overshoot, and its shadow contracts from wide-and-faint to tight as it
 * touches down. The art stays face-on for every frame, and scale/y/opacity
 * are pure compositor properties — cheaper than 3D rotation ever was.
 *
 * The shadow is a real <span>, not a pseudo-element, because GSAP animates
 * elements only — and it must move with the landing. No filter anywhere near
 * the animation: drop-shadow() under transform re-rasterises per frame.
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
                <span className="cert-badge-shadow" />
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
        const imgs = root.querySelectorAll(".cert-badge img");
        const shadows = root.querySelectorAll(".cert-badge-shadow");

        if (prefersReducedMotion()) {
            gsap.set([eyebrow, ...cards, ...imgs, ...shadows], {
                opacity: 1, y: 0, scale: 1, rotation: 0,
            });
            return;
        }

        const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: root, start: "top 85%", once: true },
            onStart: () => gsap.set([...cards, ...imgs], { willChange: "transform" }),
            onComplete: () => gsap.set([...cards, ...imgs], { willChange: "auto" }),
        });
        tl.fromTo(eyebrow, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45 })
            .fromTo(
                cards,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.55, stagger: 0.12 },
                "-=0.25"
            )
            // The stamp: in from above at 1.6x with a hint of wrist-turn,
            // landing with a small overshoot. back.out overshoots scale AND
            // rotation together, which is what sells the "pressed in" read.
            .fromTo(
                imgs,
                { opacity: 0, scale: 1.6, y: -12, rotation: -8 },
                {
                    opacity: 1, scale: 1, y: 0, rotation: 0,
                    duration: 0.55, ease: "back.out(2.4)", stagger: 0.14,
                },
                "-=0.2"
            )
            // The shadow contracts as the badge touches down — wide and faint
            // while it is "airborne", tight when it lands.
            .fromTo(
                shadows,
                { opacity: 0, scale: 1.7 },
                { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out", stagger: 0.14 },
                "<0.1"
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
