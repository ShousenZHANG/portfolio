// Brand names — identical in every locale, so the lists stay hardcoded; only
// the eyebrow above the marquee is dictionary copy. Each page shows the stack
// its own CV describes: /zh's CV is LangChain retrieval agents on a Java
// backend (Redis, MongoDB, Elasticsearch), not the Microsoft and
// front-end set the English page leads with.
//
// The SVGs are served from /logos, not from jsDelivr. They are devicon's
// originals (MIT), vendored: jsDelivr is intermittently unreachable from
// mainland China, and a blank logo wall is exactly the wrong first impression
// on the page written for that audience. It also removes a third-party origin
// from the critical path for everyone else. Linux is devicon's "plain" cut —
// the "original" Tux is a 190 KB illustration.
const LOGOS_EN = [
    // Cloud & AI platform
    { name: "Microsoft Azure", icon: "azure-original.svg" },
    { name: "Python", icon: "python-original.svg" },

    // Backend & data
    { name: "Java", icon: "java-original.svg" },
    { name: "Spring Boot", icon: "spring-original.svg" },
    { name: "PostgreSQL", icon: "postgresql-original.svg" },
    { name: "MySQL", icon: "mysql-original.svg" },
    { name: "RabbitMQ", icon: "rabbitmq-original.svg" },

    // Frontend
    { name: "React", icon: "react-original.svg" },
    { name: "TypeScript", icon: "typescript-original.svg" },
    { name: "Tailwind CSS", icon: "tailwindcss-original.svg" },
    { name: "JavaScript", icon: "javascript-original.svg" },

    // DevOps
    { name: "Docker", icon: "docker-original.svg" },
    { name: "GitHub", icon: "github-original.svg" },
];

const LOGOS_ZH = [
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
import { dict, isZh } from "../i18n/index.js";
import { mixedTrack } from "../lib/mixedTrack.jsx";

const logoIconsList = isZh ? LOGOS_ZH : LOGOS_EN;

// `duplicate` marks the second pass of the list — the half that exists only so
// translateX(-50%) can loop seamlessly. Announcing all 13 logos twice is the
// screen-reader version of a visual artifact, so that pass leaves the a11y tree.
const LogoIcon = ({ name, icon, duplicate }) => (
    <div className="logo-cell flex-none flex items-center justify-center w-24 sm:w-28 h-16" aria-hidden={duplicate || undefined}>
        <img
            src={`/logos/${icon}`}
            alt={name}
            title={name}
            width={48}
            height={48}
            className="logo-img object-contain w-10 h-10 sm:w-12 sm:h-12"
            loading="lazy"
            decoding="async"
        />
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

            {/* Edge fades — match the page floor so the track dissolves cleanly */}
            <div className="logo-fade logo-fade-left" aria-hidden="true" />
            <div className="logo-fade logo-fade-right" aria-hidden="true" />

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
