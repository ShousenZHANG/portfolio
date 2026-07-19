/**
 * Project showcase data.
 * Descriptions use plain text — highlighted phrases are wrapped at render time.
 */
export const projects = [
  {
    id: "joblit",
    title: "Joblit",
    desktopReverse: false,
    autoplayDelay: 3800,
    slides: [
      { src: "/images/joblit_landing.webp", alt: "Joblit AI-powered landing page with live demo" },
      { src: "/images/joblit_jobs.webp", alt: "Joblit jobs workspace with AI keyword highlighting" },
      { src: "/images/joblit_autofill.webp", alt: "Joblit Chrome Extension auto-filling ATS application form" },
      { src: "/images/joblit_resume.webp", alt: "Joblit resume builder with PDF preview" },
      { src: "/images/joblit_extension.webp", alt: "Joblit AutoFill Chrome Extension installation page" },
    ],
    description:
      "An {AI-powered job search platform} with {Claude Code} integration — orchestrates multi-provider LLMs to automate everything from discovering roles to auto-filling applications.",
    outcomes: [
      "Integrated Claude Code with multi-provider LLM orchestration and structured prompt engineering",
      "Shipped on CI/CD with automated testing and containerized deploys (GitHub Actions + Vercel)",
      "Integrating an open-source LLM with a wiki-style knowledge layer for persistent, grounded agent memory",
    ],
    tech: ["Next.js", "TypeScript", "Prisma + PostgreSQL", "Claude", "Chrome Extension"],
    links: [
      { href: "https://github.com/ShousenZHANG/jobflow-web", label: "View on GitHub" },
      { href: "https://www.joblit.tech/", label: "Live Demo" },
    ],
  },
  {
    id: "contest-platform",
    title: "Scalable Competition Platform",
    desktopReverse: false,
    autoplayDelay: 4000,
    slides: [
      { src: "/images/award_certificate.webp", alt: "Coding Fest 2025 Runner-up Certificate" },
      { src: "/images/award_team_photo.webp", alt: "Coding Fest 2025 Award Ceremony Team Photo" },
      { src: "/images/Competition_System_Architecture.webp", alt: "System Architecture" },
      { src: "/images/Pipeline.webp", alt: "CI/CD Pipeline" },
    ],
    description:
      "Cloud-native competition system — {7+ Spring Cloud microservices}, JWT SSO, RBAC, and async messaging via RabbitMQ. {40,000+ lines} of production code at {95%+ CI/CD consistency}.",
    highlight: {
      title: "Runner-up — Best Project in AI for Education",
      description:
        "Recognized at Coding Fest 2025 (University of Sydney) for innovation and impact.",
      sponsor: "Sponsored by Atlassian and Flow Traders.",
      cta: {
        href: "https://drive.google.com/file/d/1zzoNxecwqmVFIoBu2cUXIJZdHUiay1Hi/view?usp=drive_link",
        label: "View Award Certificate",
      },
    },
    links: [
      { href: "https://github.com/ShousenZHANG/project-contest-platform.git", label: "View on GitHub" },
      { href: "https://project-contest-platform.vercel.app/", label: "Live Demo" },
    ],
  },
];
