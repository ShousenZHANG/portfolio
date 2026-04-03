import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import { projects } from "../constants/projects";

/**
 * Render a plain-text description, highlighting phrases wrapped in {curly braces}
 * as cyan-colored spans. This replaces the old inline-JSX approach.
 */
function renderHighlighted(text) {
  if (!text) return null;
  const parts = text.split(/\{([^}]+)\}/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="text-cyan-300 font-semibold">{part}</span>
    ) : (
      part
    )
  );
}

const AppShowcase = () => {
  const sectionRef = useRef(null);
  const projectRefs = useRef([]);

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
                      {project.tech?.map((item) => (
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
              <p className="text-white/80 md:text-lg leading-relaxed mb-6">{renderHighlighted(project.description)}</p>
              {project.details && <p className="text-white/80 md:text-lg leading-relaxed mb-6">{renderHighlighted(project.details)}</p>}

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
