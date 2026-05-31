import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import TitleHeader from "../components/TitleHeader";
import TechIconCardExperience from "../components/models/tech_logos/TechIconCardExperience";
import { techStackIcons } from "../constants";
import { prefersReducedMotion } from "../lib/motion.js";

const TechStack = () => {
  useGSAP(() => {
    if (prefersReducedMotion()) {
      gsap.set(".tech-card", { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(
      ".tech-card",
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: "#skills",
          start: "top 80%",
        },
      }
    );
  }, []);

  return (
    <section id="skills" className="ed-shell py-[var(--sp-section)]">
      <div>
        <TitleHeader
          title="Technical Expertise"
          sub="04 / Core Stack"
          anchor="skills"
          align="left"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 mt-14">
          {techStackIcons.map((icon) => (
            <div
              key={icon.name}
              className="tech-card ed-tile group relative overflow-hidden"
            >
              <div className="flex flex-col items-center pt-4 pb-5 md:pt-6 md:pb-6">
                <div className="w-32 h-32 md:w-40 md:h-40">
                  <TechIconCardExperience model={icon} />
                </div>
                <p className="text-sm md:text-base font-medium mt-2 transition-colors duration-300 group-hover:!text-[var(--sig)]" style={{ color: "var(--tx-1)" }}>
                  {icon.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
