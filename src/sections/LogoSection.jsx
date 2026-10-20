// Brand names — identical in every locale, so the list stays hardcoded; only
// the eyebrow above the marquee is dictionary copy. The set is the stack the
// CV describes: LangChain retrieval agents on a Java backend.
//
// The SVGs are served from /logos, not from jsDelivr. They are devicon's
// originals (MIT), vendored: jsDelivr is intermittently unreachable from
// mainland China, and a blank logo wall is exactly the wrong first impression
// on the page written for that audience. It also removes a third-party origin
// from the critical path for everyone else. Linux is devicon's "plain" cut —
// the "original" Tux is a 190 KB illustration.
const logoIconsList = [
    // Agent & retrieval
    { name: "Python", icon: "python-original.svg" },
    { name: "Elasticsearch", icon: "elasticsearch-original.svg" },
    { name: "MongoDB", icon: "mongodb-original.svg" },
    { name: "MySQL", icon: "mysql-original.svg" },

    // Java backend & middleware
    { name: "Java", icon: "java-original.svg" },
    { name: "Spring Boot", icon: "spring-original.svg" },
    { name: "Redis", icon: "redis-original.svg" },
    { name: "RabbitMQ", icon: "rabbitmq-original.svg" },

    // Deployment
    { name: "Docker", icon: "docker-original.svg" },
    { name: "Linux", icon: "linux-plain.svg" },
    { name: "GitHub", icon: "github-original.svg" },
];

import { useInView } from "../hooks/useInView.js";
import { dict } from "../i18n/index.js";
import { mixedTrack } from "../lib/mixedTrack.jsx";

// `duplicate` marks the second pass of the list — the half that exists only so
// translateX(-50%) can loop seamlessly. Announcing all 13 logos twice is the
// screen-reader version of a visual artifact, so that pass leaves the a11y tree.
// Named under the mark: eight unlabelled grey glyphs of uneven weight read as
// decoration; a name makes the strip a stack you can read at a glance.
const LogoIcon = ({ name, icon, duplicate }) => (
    <div className="logo-cell flex-none flex flex-col items-center justify-center gap-2.5 w-24 sm:w-28 h-24" aria-hidden={duplicate || undefined}>
        <img
            src={`/logos/${icon}`}
            alt={name}
            title={name}
            width={48}
            height={48}
            className="logo-img object-contain w-9 h-9 sm:w-10 sm:h-10"
            loading="lazy"
            decoding="async"
        />
        <span className="logo-name" aria-hidden="true">{name}</span>
    </div>
);

const LogoSection = () => {
    // The 25s marquee keeps compositing while off-screen — park it.
    const [trackRef, inView] = useInView();

    return (
        <section className="relative w-full overflow-hidden py-10 md:py-14">
            {/* The shell is its own block: .ed-eyebrow is inline-flex, and
                margin-inline:auto does not centre an inline-level box, so on a
                wide screen the label sat ~60px left of every other section. */}
            <div className="ed-shell mb-7 md:mb-9">
                <p className="ed-eyebrow">{mixedTrack(dict.logos.eyebrow)}</p>
            </div>

            <div className="marquee" ref={trackRef}>
                <div className={`marquee-box ${inView ? "in-view" : ""}`}>
                    {logoIconsList.concat(logoIconsList).map((logo, index) => (
                        <LogoIcon
                            key={`${logo.name}-${index}`}
                            name={logo.name}
                            icon={logo.icon}
                            duplicate={index >= logoIconsList.length}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LogoSection;
