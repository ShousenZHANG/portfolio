import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

gsap.registerPlugin(ScrollTrigger);

const fadeFix = `
.swiper-slide {
  position: absolute !important;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
  opacity: 0 !important;
  visibility: hidden !important;
  transition: opacity 0.8s ease-in-out, visibility 0s linear 0.8s !important;
}
.swiper-slide-active {
  opacity: 1 !important;
  visibility: visible !important;
  transition: opacity 0.8s ease-in-out, visibility 0s linear 0s !important;
}
`;

const projects = [
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
    description: (
      <>
        Built Jobflow as an <span className="text-cyan-300 font-semibold">end-to-end workflow</span> for modern job
        hunts: discover roles, review fit quickly, and track every application stage in one place. The product
        targets the core pain points called out in the README, including information overload, repetitive
        screening, and fragmented progress tracking.
      </>
    ),
    details: (
      <>
        Implemented the README fetch pipeline with parsing, exclusion rules, dedupe, upsert, stale-run handling,
        and run summaries. On the product side, Jobflow ships a two-pane jobs workspace with markdown previews,
        keyword highlighting, and lifecycle states like{" "}
        <span className="text-cyan-300 font-semibold">NEW / APPLIED / REJECTED</span>, plus resume tailoring support.
      </>
    ),
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
    description: (
      <>
        Built a cloud-native competition system with{" "}
        <span className="text-cyan-300 font-semibold">7+ Spring Cloud microservices</span>, enabling JWT SSO,
        role-based access control, and async messaging via RabbitMQ. Deployed with Docker Compose for{" "}
        <span className="text-emerald-300 font-semibold">95%+ CI/CD consistency</span> and 80% faster setup,
        contributing over <span className="text-sky-300 font-semibold">40,000 lines of production code</span>.
      </>
    ),
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
  {
    id: "enterprise-banking",
    title: "Enterprise Banking Platform Framework",
    desktopReverse: true,
    autoplayDelay: 4200,
    slides: [
      { src: "/images/Insurance_SocketTool.png", alt: "Enterprise Insurance Socket Tool" },
      { src: "/images/Insurance_Cloud.png", alt: "Insurance Cloud" },
    ],
    description: (
      <>
        Developed at <span className="text-cyan-300 font-semibold">Shanghai Newtouch Software Co., Ltd.</span>,
        maintaining and extending a <span className="text-emerald-300 font-semibold">modular enterprise framework</span>{" "}
        for insurance systems. Reduced development time by{" "}
        <span className="text-cyan-300 font-semibold">30%</span> and improved reliability by{" "}
        <span className="text-emerald-300 font-semibold">35%</span>.
      </>
    ),
    details: (
      <>
        Built a <span className="text-cyan-300 font-semibold">socket-based batch processing tool</span> for
        large-scale file transfer, reducing processing time by{" "}
        <span className="text-emerald-300 font-semibold">35%</span> and blocking{" "}
        <span className="text-cyan-300 font-semibold">99% unauthorized access</span> through header-based authentication.
        Led migration from on-premise to cloud-native infrastructure with MinIO and Docker on Linux.
      </>
    ),
    links: [],
  },
  {
    id: "portfolio",
    title: "Personal Developer Portfolio",
    desktopReverse: false,
    autoplayDelay: 4000,
    slides: [{ src: "/images/portfolio_main.png", alt: "Portfolio Home Page" }],
    description: (
      <>
        Designed and developed a <span className="text-cyan-300 font-semibold">modern responsive website</span> using{" "}
        <span className="text-emerald-300 font-semibold">React</span>,{" "}
        <span className="text-sky-300 font-semibold">Tailwind CSS</span>, and{" "}
        <span className="text-cyan-300 font-semibold">JavaScript (ES6+)</span>. Implemented smooth animations,
        dynamic routing, and reusable components following best front-end engineering practices.
      </>
    ),
    details: (
      <>
        Integrated project showcases and contact automation for recruiters, deployed via{" "}
        <span className="text-cyan-300 font-semibold">Vercel</span>. Highlights include responsive layouts,
        modular component design, and CI/CD workflows for continuous updates.
      </>
    ),
    links: [{ href: "https://github.com/ShousenZHANG/portfolio.git", label: "View on GitHub ->" }],
  },
];

const AppShowcase = () => {
  const sectionRef = useRef(null);
  const projectRefs = useRef([]);

  useEffect(() => {
    if (typeof window === "undefined" || document.getElementById("swiper-fade-fix")) return;
    const style = document.createElement("style");
    style.id = "swiper-fade-fix";
    style.innerHTML = fadeFix;
    document.head.appendChild(style);
  }, []);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      const isMobile =
        typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;

      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: isMobile ? 24 : 40 },
        { opacity: 1, y: 0, duration: isMobile ? 0.8 : 1, ease: "power2.out" }
      );

      projectRefs.current.forEach((el, index) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: isMobile ? 28 : 48 },
          {
            opacity: 1,
            y: 0,
            duration: isMobile ? 0.7 : 0.9,
            delay: index * (isMobile ? 0.16 : 0.22),
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="projects" ref={sectionRef} className="relative py-24 px-5 md:px-20 bg-transparent">
      <h1 className="text-center text-4xl md:text-5xl font-extrabold mb-16 bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
        Featured Projects
      </h1>

      <div className="flex flex-col gap-24">
        {projects.map((project, index) => (
          <div
            key={project.id}
            ref={(el) => (projectRefs.current[index] = el)}
            className={`flex flex-col ${project.desktopReverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-10`}
          >
            <div className="lg:w-1/2 w-full relative group">
              <div className="relative overflow-hidden rounded-2xl border border-cyan-400/10 shadow-[0_0_30px_rgba(56,189,248,0.2)] h-[400px] md:h-[480px]">
                {project.slides.length > 0 ? (
                  <Swiper
                    modules={[Autoplay, Pagination, EffectFade]}
                    autoplay={{ delay: project.autoplayDelay || 4000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    effect="fade"
                    fadeEffect={{ crossFade: true }}
                    loop={true}
                    className="!bg-transparent h-full w-full"
                  >
                    {project.slides.map((img) => (
                      <SwiperSlide key={`${project.id}-${img.src}`}>
                        <div className="flex items-center justify-center w-full h-full bg-black/10">
                          <img src={img.src} alt={img.alt} className="max-w-full max-h-full object-contain" />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#0d1320] via-[#0a111d] to-[#07131a] p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Latest Project</p>
                      <h3 className="mt-3 text-2xl md:text-3xl font-bold text-white">{project.title}</h3>
                      <p className="mt-4 text-white/75 text-sm md:text-base leading-relaxed">
                        Real-time hiring workflow with robust data intake and recruiter-ready job tracking.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((item) => (
                        <span
                          key={`${project.id}-tech-${item}`}
                          className="px-3 py-1 rounded-full text-xs md:text-sm bg-cyan-400/10 border border-cyan-300/20 text-cyan-100"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:w-1/2 w-full text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{project.title}</h2>
              <p className="text-white/80 md:text-lg leading-relaxed mb-6">{project.description}</p>
              {project.details && <p className="text-white/80 md:text-lg leading-relaxed mb-6">{project.details}</p>}

              {project.outcomes?.length > 0 && (
                <div className="mb-6 space-y-3">
                  {project.outcomes.map((outcome) => (
                    <p key={`${project.id}-outcome-${outcome}`} className="project-outcome text-white/80 text-sm md:text-base">
                      {outcome}
                    </p>
                  ))}
                </div>
              )}

              {project.highlight && (
                <div className="bg-gradient-to-r from-cyan-400/10 via-sky-400/10 to-emerald-400/10 border border-cyan-400/20 rounded-xl p-5 shadow-[0_0_25px_rgba(56,189,248,0.25)] mb-6 transition-all duration-500 hover:shadow-[0_0_40px_rgba(56,189,248,0.45)]">
                  <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-300 via-sky-400 to-emerald-300 bg-clip-text text-transparent">
                    {project.highlight.title}
                  </h3>
                  <p className="text-white/80 text-sm md:text-base leading-relaxed mt-2">{project.highlight.description}</p>
                  <p className="text-white/70 text-sm md:text-base mt-2">{project.highlight.sponsor}</p>
                  <a
                    href={project.highlight.cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 text-black font-semibold shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.6)] transition-all duration-500"
                  >
                    {project.highlight.cta.label}
                  </a>
                </div>
              )}

              {project.links.length > 0 && (
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  {project.links.map((link) => (
                    <a
                      key={`${project.id}-${link.href}`}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-black font-semibold shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.6)] transition-all duration-500"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AppShowcase;
