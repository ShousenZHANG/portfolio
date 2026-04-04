import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import { projects } from "../constants/projects";
import TitleHeader from "../components/TitleHeader";

/**
 * Render plain-text description, highlighting {curly brace} phrases.
 */
function renderHighlighted(text) {
  if (!text) return null;
  const parts = text.split(/\{([^}]+)\}/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={`hl-${i}`} className="text-cyan-300 font-semibold">{part}</span>
    ) : (
      <span key={`t-${i}`}>{part}</span>
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

      projectRefs.current.forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: isMobile ? 24 : 40 },
          {
            opacity: 1,
            y: 0,
            duration: isMobile ? 0.6 : 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="projects" ref={sectionRef} className="relative py-20 md:py-28 px-5 md:px-12 lg:px-20">
      <div className="max-w-[1400px] mx-auto">
        <TitleHeader
          title="Featured Projects"
          sub="What I've Built"
        />

        <div className="flex flex-col gap-16 mt-16">
          {projects.map((project, index) => (
            <div
              key={project.id}
              ref={(el) => (projectRefs.current[index] = el)}
              className={`flex flex-col ${project.desktopReverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-stretch gap-8 lg:gap-12`}
            >
              {/* Image / Carousel */}
              <div className="lg:w-1/2 w-full">
                <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-black/30 h-[280px] sm:h-[340px] md:h-[400px]">
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
                          <div className="flex items-center justify-center w-full h-full bg-black/10 p-3 sm:p-4">
                            <img src={img.src} alt={img.alt} className="max-w-full max-h-full object-contain rounded-lg" loading="lazy" />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#0d1320] via-[#0a111d] to-[#07131a] p-6 md:p-8 flex flex-col justify-center items-center text-center">
                      <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">Enterprise Project</p>
                      <h3 className="mt-3 text-xl md:text-2xl font-bold text-white/90">{project.title}</h3>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="lg:w-1/2 w-full flex flex-col justify-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">{project.title}</h2>

                <p className="text-white/75 md:text-base leading-relaxed mb-4">{renderHighlighted(project.description)}</p>

                {project.details && (
                  <p className="text-white/65 text-sm md:text-base leading-relaxed mb-4">{renderHighlighted(project.details)}</p>
                )}

                {/* Tech tags */}
                {project.tech?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {project.tech.map((item) => (
                      <span
                        key={`${project.id}-tech-${item}`}
                        className="px-2.5 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-white/70"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}

                {/* Outcomes */}
                {project.outcomes?.length > 0 && (
                  <div className="mb-5 space-y-2">
                    {project.outcomes.map((outcome) => (
                      <p key={`${project.id}-o-${outcome.slice(0, 20)}`} className="project-outcome text-white/70 text-sm">
                        {outcome}
                      </p>
                    ))}
                  </div>
                )}

                {/* Award highlight */}
                {project.highlight && (
                  <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/5 p-4 mb-5">
                    <h3 className="text-base md:text-lg font-semibold bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                      {project.highlight.title}
                    </h3>
                    <p className="text-white/70 text-sm mt-1.5">{project.highlight.description}</p>
                    <p className="text-white/55 text-sm mt-1">{project.highlight.sponsor}</p>
                    <a
                      href={project.highlight.cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-cyan-300 hover:text-cyan-200 transition-colors"
                    >
                      {project.highlight.cta.label}
                    </a>
                  </div>
                )}

                {/* CTA links */}
                {project.links.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {project.links.map((link, linkIndex) => (
                      <a
                        key={`${project.id}-${link.href}`}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkIndex === 0
                          ? "px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-black text-sm font-semibold hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all duration-300"
                          : "px-5 py-2.5 rounded-lg border border-white/15 text-white/80 text-sm font-medium hover:bg-white/5 hover:text-white transition-all duration-300"
                        }
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
      </div>
    </section>
  );
};

export default AppShowcase;
