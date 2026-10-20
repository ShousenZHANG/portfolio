/**
 * Project showcase data — structure only: ids, slide srcs/dimensions,
 * hrefs, autoplay timing, tech-brand tags. All copy (titles, alts,
 * descriptions, outcomes, highlight text, link labels) lives in the
 * dictionary, index-aligned with the locale's array.
 * Descriptions use plain text — highlighted phrases are wrapped at render time.
 *
 * The two locales show different projects. The English CV leads with two
 * public products that have screenshots; the Chinese CV's three projects are
 * internal enterprise systems with nothing public to capture, so each one is
 * drawn as its real execution path (ProjectDiagram) instead of a carousel.
 * The builders are functions so only the active locale's copy is ever read —
 * the zh dictionary has no slide alts for the English shape to index into.
 */
import { dict, isZh } from "../i18n/index.js";

const buildEn = (copy) => [
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
      // Same-origin, not the Google Drive original: Drive is unreachable from
      // mainland China, so the one link that proves the award would hang
      // there. The file is the same scan already carried in the carousel.
      cta: {
        href: "/images/award_certificate.webp",
        label: copy[1].highlight.ctaLabel,
      },
    },
    links: [
      { href: "https://github.com/ShousenZHANG/project-contest-platform.git", label: dict.showcase.viewOnGithub },
      { href: "https://project-contest-platform.vercel.app/", label: dict.showcase.liveDemo },
    ],
  },
];

// Alternating sides give three diagram-led rows an editorial rhythm; two
// carousel rows on the English page read fine stacked the same way.
const ZH_STRUCTURE = [
  { id: "ticket-agent", desktopReverse: false, tech: ["LangChain", "RAG", "Milvus", "MongoDB", "Prompt Eng."] },
  { id: "nl2sql-agent", desktopReverse: true, tech: ["LangGraph", "NL2SQL", "Milvus", "Elasticsearch", "MySQL"] },
  { id: "bank-platform", desktopReverse: false, tech: ["Java", "Spring Boot", "MyBatis", "Oracle", "Redis", "MinIO", "Docker"] },
];

const buildZh = (copy) =>
  ZH_STRUCTURE.map((p, i) => ({
    ...p,
    title: copy[i].title,
    meta: copy[i].meta,
    slides: [],
    diagram: copy[i].diagram,
    description: copy[i].description,
    outcomes: copy[i].outcomes,
    // Internal systems: no public repo or demo to link, and a dead CTA
    // reads worse than none.
    links: [],
  }));

export const projects = (isZh ? buildZh : buildEn)(dict.showcase.projects);
