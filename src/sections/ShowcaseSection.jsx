import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import { projects } from "../constants/projects";
import TitleHeader from "../components/TitleHeader";
import { prefersReducedMotion } from "../lib/motion.js";
import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right";

/**
 * Render plain-text description, highlighting {curly brace} phrases.
 */
function renderHighlighted(text) {
  if (!text) return null;
  const parts = text.split(/\{([^}]+)\}/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={`hl-${i}`} className="font-semibold" style={{ color: "var(--sig)" }}>{part}</span>
    ) : (
      <span key={`t-${i}`}>{part}</span>
    )
  );
}

const AppShowcase = () => {
  const sectionRef = useRef(null);
  const projectRefs = useRef([]);
  const swiperRefs = useRef([]);

  // Swiper autoplay keeps cross-fading (and repainting a ~400px image plus
  // its pagination bullets) even when the carousel is nowhere near the
  // viewport. Run it only while the project is on screen.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const observers = projectRefs.current.filter(Boolean).map((el, i) => {
      const obs = new IntersectionObserver(
        ([entry]) => {
          const swiper = swiperRefs.current[i];
          if (!swiper || swiper.destroyed || !swiper.autoplay) return;
          if (entry.isIntersecting) swiper.autoplay.start();
          else swiper.autoplay.stop();
        },
        { rootMargin: "200px 0px" }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set(projectRefs.current.filter(Boolean), { opacity: 1, y: 0 });
        return;
      }

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
        // Image reveal — clip-path wipe from the leading edge
        const media = el.querySelector(".project-media");
        if (media) {
          gsap.fromTo(
            media,
            { clipPath: "inset(0 100% 0 0)" },
            {
              clipPath: "inset(0 0% 0 0)",
              duration: 1,
              ease: "power3.inOut",
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            }
          );
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="projects" ref={sectionRef} className="ed-shell py-[var(--sp-section)]">
      <div>
        <TitleHeader
          title="Selected Work"
          sub="03 / Selected Work"
          anchor="projects"
          align="left"
        />

        <div className="flex flex-col gap-16 mt-14">
          {projects.map((project, index) => (
            <div
              key={project.id}
              ref={(el) => (projectRefs.current[index] = el)}
              className={`flex flex-col ${project.desktopReverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-stretch gap-8 lg:gap-12`}
            >
              {/* Image / Carousel */}
              <div className="lg:w-1/2 w-full">
                <div className="project-media ed-tile relative overflow-hidden h-[280px] sm:h-[340px] md:h-[400px]">
                  {project.slides.length > 0 ? (
                    <Swiper
                      onSwiper={(s) => { swiperRefs.current[index] = s; }}
                      modules={[Autoplay, Pagination, EffectFade]}
                      autoplay={{ delay: project.autoplayDelay || 4000, disableOnInteraction: false }}
                      pagination={{ clickable: true }}
                      effect="fade"
                      fadeEffect={{ crossFade: true }}
                      loop={true}
                      className="!bg-transparent h-full w-full"
                    >
                      {project.slides.map((img, slideIndex) => (
                        <SwiperSlide key={`${project.id}-${img.src}`}>
                          <div className="flex items-center justify-center w-full h-full bg-black/10 p-3 sm:p-4">
                            <img
                              src={img.src}
                              alt={img.alt}
                              className="max-w-full max-h-full object-contain rounded-lg"
                              loading={slideIndex === 0 ? "eager" : "lazy"}
                              decoding="async"
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <div className="h-full w-full p-6 md:p-8 flex flex-col justify-center items-center text-center" style={{ background: "var(--ink-2)" }}>
                      <p className="ed-eyebrow">Enterprise Project</p>
                      <h3 className="mt-3 text-xl md:text-2xl font-bold" style={{ color: "var(--tx-0)" }}>{project.title}</h3>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="lg:w-1/2 w-full flex flex-col justify-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 leading-tight" style={{ color: "var(--tx-0)" }}>{project.title}</h3>

                <p className="md:text-base leading-relaxed mb-4" style={{ color: "var(--tx-1)" }}>{renderHighlighted(project.description)}</p>

                {project.details && (
                  <p className="text-sm md:text-base leading-relaxed mb-4" style={{ color: "var(--tx-2)" }}>{renderHighlighted(project.details)}</p>
                )}

                {/* Tech tags */}
                {project.tech?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {project.tech.map((item) => (
                      <span
                        key={`${project.id}-tech-${item}`}
                        className="px-2.5 py-1 rounded-full text-xs font-mono"
                        style={{ background: "var(--ink-2)", border: "1px solid var(--hair)", color: "var(--tx-1)" }}
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
                      <p key={`${project.id}-o-${outcome.slice(0, 20)}`} className="project-outcome text-sm" style={{ color: "var(--tx-1)" }}>
                        {outcome}
                      </p>
                    ))}
                  </div>
                )}

                {/* Award highlight */}
                {project.highlight && (
                  <div className="rounded-[var(--r-sm)] p-4 mb-5" style={{ border: "1px solid var(--sig-line)", background: "var(--sig-glow)" }}>
                    <h4 className="text-base md:text-lg font-semibold" style={{ color: "var(--sig)" }}>
                      {project.highlight.title}
                    </h4>
                    <p className="text-sm mt-1.5" style={{ color: "var(--tx-1)" }}>{project.highlight.description}</p>
                    <p className="text-sm mt-1" style={{ color: "var(--tx-2)" }}>{project.highlight.sponsor}</p>
                    <a
                      href={project.highlight.cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/cta inline-flex items-center gap-1 mt-3 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: "var(--sig)" }}
                    >
                      {project.highlight.cta.label}
                      <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
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
                        className={`group/btn ${linkIndex === 0 ? "ed-btn" : "ed-btn-ghost"}`}
                      >
                        {link.label}
                        <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
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
