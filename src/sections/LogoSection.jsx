const logoIconsList = [
    // Cloud & AI platform
    { name: "Microsoft Azure", icon: "azure/azure-original.svg" },
    { name: "Python", icon: "python/python-original.svg" },

    // Backend & data
    { name: "Java", icon: "java/java-original.svg" },
    { name: "Spring Boot", icon: "spring/spring-original.svg" },
    { name: "PostgreSQL", icon: "postgresql/postgresql-original.svg" },
    { name: "MySQL", icon: "mysql/mysql-original.svg" },
    { name: "RabbitMQ", icon: "rabbitmq/rabbitmq-original.svg" },

    // Frontend
    { name: "React", icon: "react/react-original.svg" },
    { name: "TypeScript", icon: "typescript/typescript-original.svg" },
    { name: "Tailwind CSS", icon: "tailwindcss/tailwindcss-original.svg" },
    { name: "JavaScript", icon: "javascript/javascript-original.svg" },

    // DevOps
    { name: "Docker", icon: "docker/docker-original.svg" },
    { name: "GitHub", icon: "github/github-original.svg" },
];

import { useInView } from "../hooks/useInView.js";

const LogoIcon = ({ name, icon }) => (
    <div className="logo-cell flex-none flex items-center justify-center w-24 sm:w-28 h-16">
        <img
            src={icon.startsWith("http") ? icon : `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}`}
            alt={name}
            title={name}
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
            <p className="ed-eyebrow ed-shell mb-7 md:mb-9">Tools I work with daily</p>

            {/* Edge fades — match the page floor so the track dissolves cleanly */}
            <div className="logo-fade logo-fade-left" aria-hidden="true" />
            <div className="logo-fade logo-fade-right" aria-hidden="true" />

            <div className="marquee" ref={trackRef}>
                <div className={`marquee-box ${inView ? "in-view" : ""}`}>
                    {logoIconsList.concat(logoIconsList).map((logo, index) => (
                        <LogoIcon key={`${logo.name}-${index}`} name={logo.name} icon={logo.icon} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LogoSection;
