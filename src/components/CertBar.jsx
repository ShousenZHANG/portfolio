import BadgeCheck from "lucide-react/dist/esm/icons/badge-check";
import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right";
import { dict } from "../i18n/index.js";
import { useScrollReveal } from "../hooks/useScrollReveal";

/**
 * Certification strip — two vendor credentials, directly under the counter
 * tiles so they land inside the first meaningful scroll. Each card IS the
 * verify link (the whole tile is the target, not a small trailing anchor):
 * a credential a recruiter cannot check in one click may as well be a claim,
 * and both issuers host a public verification page.
 *
 * One shared BadgeCheck mark instead of vendor logos on purpose — an
 * official-looking Microsoft mark next to a hand-drawn Anthropic one reads
 * as one real badge and one fake. Uniform iconography keeps both credible;
 * the issuer NAME is what carries the weight.
 */
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
                    <a
                        key={c.name}
                        href={c.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ed-tile cert-card"
                    >
                        <span className="cert-badge" aria-hidden="true">
                            <BadgeCheck className="w-5 h-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="cert-name">{c.name}</span>
                            <span className="cert-issuer">{c.issuer}</span>
                        </span>
                        <span className="cert-verify">
                            {dict.certs.verify}
                            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </span>
                    </a>
                ))}
            </div>
        </section>
    );
};

export default CertBar;
