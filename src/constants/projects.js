/**
 * Project showcase data.
 * Descriptions use plain text — highlighted phrases are wrapped at render time.
 */
export const projects = [
  {
    id: "jobflow-web",
    title: "Jobflow",
    desktopReverse: false,
    autoplayDelay: 3800,
    slides: [
      { src: "/images/jobflow_landing.png", alt: "Jobflow landing page" },
      { src: "/images/jobflow_fetch.png", alt: "Jobflow fetch workflow page" },
      { src: "/images/jobflow_resume.png", alt: "Jobflow resume builder page" },
      { src: "/images/jobflow_jobs.png", alt: "Jobflow jobs workspace page" },
    ],
    description:
      "An {AI-powered job hunt platform} that automates the entire workflow — from discovering roles to tailoring resumes to auto-filling applications. Built to eliminate the repetitive grind of modern job searching.",
    outcomes: [
      "AI Agent Skill system: modular skill architecture that chains LLM reasoning with structured data extraction for JD analysis and resume matching",
      "Smart Fetch Engine: automated job scraping with exclusion rules, deduplication, location/radius filtering, and stale-run guardrails",
      "Dynamic Resume Builder: template-driven resume generation that adapts content and keywords based on target JD requirements",
      "Chrome Extension: one-click autofill for ATS forms (Greenhouse, Lever, Workday) using structured profile data from the platform",
    ],
    tech: [
      "Next.js",
      "TypeScript",
      "Prisma + PostgreSQL",
      "Python (JobSpy)",
      "Chrome Extension",
      "Tailwind + shadcn/ui",
      "Vercel",
    ],
    links: [
      { href: "https://github.com/ShousenZHANG/jobflow-web", label: "View on GitHub ->" },
      { href: "https://jobflow-web.vercel.app", label: "Live Demo ->" },
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
