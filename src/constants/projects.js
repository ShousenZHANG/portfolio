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
      { src: "/images/joblit_landing.png", alt: "Joblit AI-powered landing page with live demo" },
      { src: "/images/joblit_jobs.png", alt: "Joblit jobs workspace with AI keyword highlighting" },
      { src: "/images/joblit_autofill.png", alt: "Joblit Chrome Extension auto-filling ATS application form" },
      { src: "/images/joblit_resume.png", alt: "Joblit resume builder with PDF preview" },
      { src: "/images/joblit_extension.png", alt: "Joblit AutoFill Chrome Extension installation page" },
    ],
    description:
      "An {AI-powered job search platform} with {Claude Code} integration, multi-provider LLM orchestration, and structured prompt engineering. Automates the entire workflow from discovering roles to auto-filling applications.",
    outcomes: [
      "Integrated Claude Code with multi-provider LLM orchestration and structured prompt engineering",
      "Designed a portable AI Skill Pack with structured rules and quality gates for consistent LLM output across platforms",
      "Developed a Chrome Extension (Manifest V3) with cross-site form detection and platform-specific ATS adapters",
      "Established CI/CD pipelines, automated testing, and containerized deployment using GitHub Actions and Vercel",
    ],
    tech: [
      "Next.js",
      "TypeScript",
      "Prisma + PostgreSQL",
      "Claude",
      "Chrome Extension",
      "Tailwind + shadcn/ui",
      "Vercel",
    ],
    links: [
      { href: "https://github.com/ShousenZHANG/jobflow-web", label: "View on GitHub ->" },
      { href: "https://www.joblit.tech/", label: "Live Demo ->" },
    ],
  },
  {
    id: "contest-platform",
    title: "Scalable Competition Platform",
    desktopReverse: false,
    autoplayDelay: 4000,
    slides: [
      { src: "/images/award_certificate.jpg", alt: "Coding Fest 2025 Runner-up Certificate" },
      { src: "/images/award_team_photo.jpg", alt: "Coding Fest 2025 Award Ceremony Team Photo" },
      { src: "/images/Competition_System_Architecture.png", alt: "System Architecture" },
      { src: "/images/Pipeline.png", alt: "CI/CD Pipeline" },
    ],
    description:
      "Cloud-native competition system with {7+ Spring Cloud microservices}, JWT SSO, role-based access control, and async messaging via RabbitMQ. {40,000+ lines of production code} with {95%+ CI/CD consistency}.",
    highlight: {
      title: "Runner-up — Best Project in AI for Education",
      description:
        "Recognized at Coding Fest 2025 (University of Sydney) for innovation and community impact.",
      sponsor: "Sponsored by Atlassian and Flow Traders.",
      cta: {
        href: "https://drive.google.com/file/d/1zzoNxecwqmVFIoBu2cUXIJZdHUiay1Hi/view?usp=drive_link",
        label: "View Award Certificate ->",
      },
    },
    links: [{ href: "https://github.com/ShousenZHANG/project-contest-platform.git", label: "View on GitHub ->" }],
  },
];
