import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Star from "lucide-react/dist/esm/icons/star";
import GitMerge from "lucide-react/dist/esm/icons/git-merge";
import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right";
import { dict } from "../i18n/index.js";
import { useTilt } from "../hooks/useTilt.js";
import { prefersReducedMotion } from "../lib/motion.js";

/**
 * Open-source strip — merged upstream work on two frameworks a recruiter in
 * this field already knows by name. Sits under the certifications: same
 * "third-party verified" band, one step deeper. Certs prove an exam was
 * passed; a merged PR into a 150k-star repo proves maintainers accepted the
 * code, which is the harder thing to fake.
 *
 * The star count is the hero element rather than the repo name, because scale
 * is what the number buys: "Dify" means nothing to a generalist recruiter,
 * "150k+ stars" means everything. The GitHub mark carries the context in one
 * glyph so no sentence has to.
 *
 * Each card links to GitHub's own filtered list of HIS merged PRs in that
 * repo — the same self-verifying move the certification cards make. The mark
 * is vendored from /logos (already self-hosted for the marquee; jsDelivr is
 * unreliable from the mainland).
 *
 * Entrance mirrors the certification stamp so the two bands read as one
 * system: cards rise staggered, then the star figure counts into place with a
 * small overshoot. Compositor-only, one timeline, one ScrollTrigger.
 */
const OssCard = ({ item, mergedLabel, starsLabel }) => {
    const tiltRef = useTilt(6);
    return (
        <a
            ref={tiltRef}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="ed-tile oss-card"
        >
            <span className="oss-mark" aria-hidden="true">
                <img src="/logos/github-original.svg" alt="" width={28} height={28} loading="lazy" decoding="async" />
            </span>

            <span className="oss-body">
                <span className="oss-head">
                    <span className="oss-name">{item.name}</span>
                    <span className="oss-stars">
                        <Star className="w-3.5 h-3.5" aria-hidden="true" />
                        {item.stars}
                        <span className="oss-stars-label">{starsLabel}</span>
                    </span>
                </span>
                <span className="oss-work">{item.work}</span>
                <span className="oss-meta">
                    <span className="oss-merged">
                        <GitMerge className="w-3.5 h-3.5" aria-hidden="true" />
                        {mergedLabel(item.prs)}
                    </span>
                    <span className="oss-blurb">{item.blurb}</span>
                </span>
            </span>

            <ArrowUpRight className="oss-go w-4 h-4" aria-hidden="true" />
            <span className="sheen" aria-hidden="true" />
        </a>
    );
};

const OpenSourceBar = () => {
    const sectionRef = useRef(null);

    useGSAP(() => {
        const root = sectionRef.current;
        if (!root) return;
        const eyebrow = root.querySelector(".ed-eyebrow");
        const cards = root.querySelectorAll(".oss-card");
        const stars = root.querySelectorAll(".oss-stars");

        if (prefersReducedMotion()) {
            gsap.set([eyebrow, ...cards, ...stars], { opacity: 1, y: 0, scale: 1 });
            return;
        }

        const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: root, start: "top 85%", once: true },
            onStart: () => gsap.set([...cards, ...stars], { willChange: "transform" }),
            onComplete: () => gsap.set([...cards, ...stars], { willChange: "auto" }),
        });
        tl.fromTo(eyebrow, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45 })
            .fromTo(
                cards,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.55, stagger: 0.12 },
                "-=0.25"
            )
            // The star figure lands last and slightly hard — it is the number
            // the whole card exists to deliver.
            .fromTo(
                stars,
                { opacity: 0, scale: 0.72 },
                { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2.6)", stagger: 0.12 },
                "-=0.2"
            );
    }, { scope: sectionRef });

    return (
        <section
            id="open-source"
            ref={sectionRef}
            className="ed-shell pt-8 md:pt-10"
            aria-label={dict.oss.listAria}
        >
            <p className="ed-eyebrow mb-4">{dict.oss.eyebrow}</p>
            <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
                {dict.oss.items.map((item) => (
                    <OssCard
                        key={item.repo}
                        item={item}
                        mergedLabel={dict.oss.merged}
                        starsLabel={dict.oss.stars}
                    />
                ))}
            </div>
        </section>
    );
};

export default OpenSourceBar;
