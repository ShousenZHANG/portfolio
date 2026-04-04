import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import TitleHeader from "../components/TitleHeader";
import TechIconCardExperience from "../components/models/tech_logos/TechIconCardExperience";
import { techStackIcons } from "../constants";

const TechStack = () => {
  useGSAP(() => {
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
    <section id="skills" className="py-20 md:py-28 px-5 md:px-12 lg:px-20">
      <div className="max-w-[1200px] mx-auto">
        <TitleHeader
          title="Technical Expertise"
          sub="Core Stack"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mt-14">
          {techStackIcons.map((icon) => (
            <div
              key={icon.name}
              className="tech-card group relative bg-[#0d0f15] border border-white/8 rounded-2xl overflow-hidden hover:border-sky-400/25 transition-colors duration-500"
            >
              <div className="flex flex-col items-center pt-4 pb-5 md:pt-6 md:pb-6">
                <div className="w-32 h-32 md:w-40 md:h-40">
                  <TechIconCardExperience model={icon} />
                </div>
                <p className="text-sm md:text-base font-medium text-white/70 group-hover:text-sky-300 transition-colors duration-300 mt-2">
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
