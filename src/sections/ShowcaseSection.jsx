import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { projects } from "../constants/projects";
import TitleHeader from "../components/TitleHeader";
import ProjectDiagram from "../components/ProjectDiagram.jsx";
import { prefersReducedMotion } from "../lib/motion.js";
import { dict } from "../i18n/index.js";
import { mixedTrack } from "../lib/mixedTrack.jsx";

/**
 * Render plain-text description, highlighting {curly brace} phrases.
 */
function renderHighlighted(text) {
  if (!text) return null;
  const parts = text.split(/\{([^}]+)\}/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={`hl-${i}`} className="hl" style={{ color: "var(--sig)" }}>{part}</span>
    ) : (
      <span key={`t-${i}`}>{part}</span>
    )
  );
}

const AppShowcase = () => {
  const projectRefs = useRef([]);

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
            // `once` like the wipe below it — play-forward only.
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }
        );
        // Diagram reveal — clip-path wipe from the leading edge
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
    <section id="projects" className="ed-shell py-[var(--sp-section)]">
      <TitleHeader
        title={dict.showcase.title}
        sub={dict.showcase.sub}
        anchor="projects"
        align="left"
      />

      <div className="flex flex-col gap-16 md:gap-20 mt-14">
        {projects.map((project, index) => (
          <article
            key={project.id}
            id={project.id}
            ref={(el) => (projectRefs.current[index] = el)}
            className={`project-row flex flex-col ${project.desktopReverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-stretch gap-8 lg:gap-12`}
          >
            {/* The diagram follows its title on a phone — a pipeline read
                before you know what system it belongs to is just boxes. It
                sizes to its steps (a fixed height would clip it on a narrow
                screen) and stretches with the copy column on desktop. */}
            <div className="lg:w-1/2 w-full order-last lg:order-none lg:self-start">
              <div className="project-media ed-tile relative overflow-hidden">
                <ProjectDiagram diagram={project.diagram} />
                <span className="sheen" aria-hidden="true" />
              </div>
            </div>

            {/* Top-aligned with the diagram's own label (same top inset), so
                all three rows share one baseline grid instead of floating the
                copy to whatever height centring gave each. */}
            <div className="lg:w-1/2 w-full flex flex-col lg:pt-7">
              <p className="ed-eyebrow mb-3">
                {mixedTrack(`${String(index + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")} · ${project.meta}`)}
              </p>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 leading-tight" style={{ color: "var(--tx-0)" }}>{project.title}</h3>

              <p className="md:text-base leading-relaxed mb-4" style={{ color: "var(--tx-1)" }}>{renderHighlighted(project.description)}</p>

              <ul className="flex flex-wrap gap-2 mb-5">
                {project.tech.map((item) => (
                  <li
                    key={`${project.id}-tech-${item}`}
                    className="px-2.5 py-1 rounded-full text-xs font-mono"
                    style={{ background: "var(--ink-2)", border: "1px solid var(--hair)", color: "var(--tx-1)" }}
                  >
                    {item}
                  </li>
                ))}
              </ul>

              {/* One focal number per project — the result the whole pipeline
                  on the left exists to produce. */}
              <p className="project-lead">
                <span className="project-lead-value">{project.lead.value}</span>
                <span className="project-lead-label">{project.lead.label}</span>
              </p>

              <ul className="space-y-2">
                {project.outcomes.map((outcome) => (
                  <li key={`${project.id}-o-${outcome.slice(0, 20)}`} className="project-outcome text-sm" style={{ color: "var(--tx-1)" }}>
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default AppShowcase;
