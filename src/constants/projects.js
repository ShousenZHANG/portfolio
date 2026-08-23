/**
 * Project showcase data — structure only: ids, slide srcs/dimensions,
 * hrefs, autoplay timing, tech-brand tags. All copy (titles, alts,
 * descriptions, outcomes, highlight text, link labels) lives in the
 * dictionary, index-aligned with this array.
 * Descriptions use plain text — highlighted phrases are wrapped at render time.
 */
import { dict } from "../i18n/index.js";

const copy = dict.showcase.projects;

export const projects = [
  {
    id: "joblit",
    title: copy[0].title,
    desktopReverse: false,
    autoplayDelay: 3800,
    slides: [
      { src: "/images/joblit_landing.webp", alt: copy[0].alts[0], w: 1600, h: 842 },
      { src: "/images/joblit_jobs.webp", alt: copy[0].alts[1], w: 1600, h: 842 },
      { src: "/images/joblit_autofill.webp", alt: copy[0].alts[2], w: 1600, h: 842 },
      { src: "/images/joblit_resume.webp", alt: copy[0].alts[3], w: 1600, h: 842 },
      { src: "/images/joblit_extension.webp", alt: copy[0].alts[4], w: 1600, h: 842 },
    ],
    description: copy[0].description,
    outcomes: copy[0].outcomes,
    tech: ["Next.js", "TypeScript", "Prisma + PostgreSQL", "Claude", "Chrome Extension"],
    links: [
      { href: "https://github.com/ShousenZHANG/jobflow-web", label: dict.showcase.viewOnGithub },
      { href: "https://www.joblit.tech/", label: dict.showcase.liveDemo },
    ],
  },
  {
    id: "contest-platform",
    title: copy[1].title,
    desktopReverse: false,
    autoplayDelay: 4000,
    slides: [
      { src: "/images/award_certificate.webp", alt: copy[1].alts[0], w: 1524, h: 2252 },
      { src: "/images/award_team_photo.webp", alt: copy[1].alts[1], w: 1400, h: 2099 },
      { src: "/images/Competition_System_Architecture.webp", alt: copy[1].alts[2], w: 1564, h: 845 },
      { src: "/images/Pipeline.webp", alt: copy[1].alts[3], w: 1536, h: 1024 },
    ],
    description: copy[1].description,
    highlight: {
      title: copy[1].highlight.title,
      description: copy[1].highlight.description,
      sponsor: copy[1].highlight.sponsor,
      cta: {
        href: "https://drive.google.com/file/d/1zzoNxecwqmVFIoBu2cUXIJZdHUiay1Hi/view?usp=drive_link",
        label: copy[1].highlight.ctaLabel,
      },
    },
    links: [
      { href: "https://github.com/ShousenZHANG/project-contest-platform.git", label: dict.showcase.viewOnGithub },
      { href: "https://project-contest-platform.vercel.app/", label: dict.showcase.liveDemo },
    ],
  },
];
