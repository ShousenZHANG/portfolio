import React from "react";

const logoIconsList = [
    // 💻 Backend & Frameworks
    { name: "Java", icon: "java/java-original.svg" },
    { name: "Spring Boot", icon: "spring/spring-original.svg" },
    { name: "Maven", icon: "maven/maven-original.svg" },
    { name: "MySQL", icon: "mysql/mysql-original.svg" },
    { name: "Redis", icon: "redis/redis-original.svg" },
    { name: "RabbitMQ", icon: "rabbitmq/rabbitmq-original.svg" },

    // ⚙️ DevOps & Tools
    { name: "Docker", icon: "docker/docker-original.svg" },
    { name: "Jenkins", icon: "jenkins/jenkins-original.svg" },
    { name: "GitHub", icon: "github/github-original.svg" },
    { name: "Postman", icon: "postman/postman-original.svg" },

    // 🎨 Frontend
    { name: "React", icon: "react/react-original.svg" },
    { name: "Tailwind CSS", icon: "tailwindcss/tailwindcss-original.svg" },
    { name: "JavaScript", icon: "javascript/javascript-original.svg" },
];

const LogoIcon = ({ name, icon }) => (
    <div className="flex-none flex items-center justify-center w-24 sm:w-32 h-16 sm:h-20">
        <img
            src={icon.startsWith("http") ? icon : `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}`}
            alt={name}
            title={name}
            className="object-contain w-12 h-12 sm:w-16 sm:h-16 opacity-70 hover:opacity-100 hover:scale-110 transition-all duration-300"
            loading="lazy"
        />
    </div>
);

const LogoSection = () => {
    return (
        <section className="relative w-full overflow-hidden py-12 md:py-20">
            <div className="absolute left-0 top-0 w-20 sm:w-40 h-full bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 w-20 sm:w-40 h-full bg-gradient-to-l from-black via-black/80 to-transparent pointer-events-none z-10" />

            <div className="marquee">
                <div className="marquee-box">
                    {logoIconsList.concat(logoIconsList).map((logo, index) => (
                        <LogoIcon key={`${logo.name}-${index}`} name={logo.name} icon={logo.icon} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LogoSection;
