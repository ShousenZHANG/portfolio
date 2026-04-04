/**
 * Project showcase data.
 * Descriptions use plain text — highlighted phrases are wrapped at render time.
 */
export const projects = [
  {
    id: "jobflow-web",
    title: "Jobflow - End-to-End Job Hunt Workflow",
    desktopReverse: false,
    autoplayDelay: 3800,
    slides: [
      { src: "/images/jobflow_landing.png", alt: "Jobflow landing page" },
      { src: "/images/jobflow_fetch.png", alt: "Jobflow fetch workflow page" },
      { src: "/images/jobflow_resume.png", alt: "Jobflow resume builder page" },
      { src: "/images/jobflow_jobs.png", alt: "Jobflow jobs workspace page" },
    ],
    description:
      "Built Jobflow as an {end-to-end workflow} for modern job hunts: discover roles, review fit quickly, and track every application stage in one place. The product targets the core pain points called out in the README, including information overload, repetitive screening, and fragmented progress tracking.",
    details:
      "Implemented the README fetch pipeline with parsing, exclusion rules, dedupe, upsert, stale-run handling, and run summaries. On the product side, Jobflow ships a two-pane jobs workspace with markdown previews, keyword highlighting, and lifecycle states like {NEW / APPLIED / REJECTED}, plus resume tailoring support.",
    outcomes: [
      "Jobs Workspace: split view + smooth review flow for high-volume role screening",
      "Fetch Console: smart exclusions, flexible location/radius filters, and tracked fetch runs",
      "Reliable import lifecycle with retries, stale-run guardrails, tombstones, and safe upserts",
      "Auth + resume flow aligned with README (Google/GitHub sign-in and structured resume management)",
    ],
    tech: [
      "Next.js App Router",
      "TypeScript",
      "Prisma + PostgreSQL",
      "NextAuth (Google/GitHub)",
      "TanStack Query",
      "Tailwind CSS + shadcn/ui",
      "Python (JobSpy)",
      "Vercel (Blob/Postgres)",
      "GitHub Actions",
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
      "Built a cloud-native competition system with {7+ Spring Cloud microservices}, enabling JWT SSO, role-based access control, and async messaging via RabbitMQ. Deployed with Docker Compose for {95%+ CI/CD consistency} and 80% faster setup, contributing over {40,000 lines of production code}.",
    highlight: {
      title: "Runner-up - Best Project in AI for Education",
      description:
        "Recognized at Coding Fest 2025 (University of Sydney, School of Computer Science) for innovation and community impact.",
      sponsor: "Sponsored by Atlassian and Flow Traders.",
      cta: {
        href: "https://drive.google.com/file/d/1zzoNxecwqmVFIoBu2cUXIJZdHUiay1Hi/view?usp=drive_link",
        label: "View Award Certificate ->",
      },
    },
    links: [{ href: "https://github.com/ShousenZHANG/project-contest-platform.git", label: "View on GitHub ->" }],
  },
];
