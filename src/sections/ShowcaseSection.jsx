import { useRef } from "react";
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
if (typeof window !== "undefined" && !document.getElementById("swiper-fade-fix")) {
  const style = document.createElement("style");
  style.id = "swiper-fade-fix";
  style.innerHTML = fadeFix;
  document.head.appendChild(style);
}

const AppShowcase = () => {
  const sectionRef = useRef(null);
  const projectRefs = useRef([]);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      const isMobile =
          typeof window !== "undefined" &&
          window.matchMedia("(max-width: 768px)").matches;

      gsap.fromTo(
          sectionRef.current,
          { opacity: 0, y: isMobile ? 24 : 40 },
          { opacity: 1, y: 0, duration: isMobile ? 0.8 : 1, ease: "power2.out" }
      );

      projectRefs.current.forEach((el, index) => {
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
      <section
          id="projects"
          ref={sectionRef}
          className="relative py-24 px-5 md:px-20 bg-transparent"
      >
        {/* Section Title */}
        <h1 className="text-center text-4xl md:text-5xl font-extrabold mb-16 bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Featured Projects
        </h1>

        <div className="flex flex-col gap-24">
          {/* 🧠 Project 1 */}
          <div
              ref={(el) => (projectRefs.current[0] = el)}
              className="flex flex-col lg:flex-row items-center gap-10"
          >
            {/* 🎞️ Left: Swiper with Award Certificate */}
            <div className="lg:w-1/2 w-full relative group">
              <div className="relative overflow-hidden rounded-2xl border border-cyan-400/10 shadow-[0_0_30px_rgba(56,189,248,0.2)] h-[400px] md:h-[480px]">
                <Swiper
                    modules={[Autoplay, Pagination, EffectFade]}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    effect="fade"
                    fadeEffect={{ crossFade: true }}
                    loop={true}
                    className="!bg-transparent h-full w-full"
                >
                  {[
                    {
                      src: "/images/award_certificate.jpg",
                      alt: "Coding Fest 2025 Runner-up Certificate",
                    },
                    {
                      src: "/images/award_team_photo.jpg",
                      alt: "Coding Fest 2025 Award Ceremony – Team Photo",
                    },
                    {
                      src: "/images/Competition_System_Architecture.png",
                      alt: "System Architecture",
                    },
                    {
                      src: "/images/Pipeline.png",
                      alt: "CI/CD Pipeline",
                    },
                  ].map((img, i) => (
                      <SwiperSlide key={i}>
                        <div className="flex items-center justify-center w-full h-full bg-black/10">
                          <img
                              src={img.src}
                              alt={img.alt}
                              className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>

            {/* 📜 Right: Description + Award Info */}
              <div className="lg:w-1/2 w-full text-center lg:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      Scalable Competition Platform
                  </h2>
                  <p className="project-outcome text-white/85 md:text-lg leading-relaxed mb-4">
                      <span className="text-emerald-300 font-semibold">Outcome:</span>{" "}
                      95%+ CI/CD consistency and 80% faster setup for a competition platform,
                      powering 7+ microservices and 40k+ production lines.
                  </p>
                  <p className="text-white/75 md:text-base leading-relaxed mb-6">
                      <span className="text-cyan-300 font-semibold">How:</span>{" "}
                      Architected Spring Cloud services with JWT SSO, RBAC, and RabbitMQ async messaging;
                      containerized and orchestrated with Docker Compose.
                  </p>
                  {/* 🏆 Award Section */}
                  <div
                      className="bg-gradient-to-r from-cyan-400/10 via-sky-400/10 to-emerald-400/10 border border-cyan-400/20 rounded-xl p-5 shadow-[0_0_25px_rgba(56,189,248,0.25)] mb-6 transition-all duration-500 hover:shadow-[0_0_40px_rgba(56,189,248,0.45)]">
                      <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">🏆</span>
                          <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-300 via-sky-400 to-emerald-300 bg-clip-text text-transparent">
                              Runner-up – Best Project in AI for Education
                          </h3>
                      </div>
                      <p className="text-white/80 text-sm md:text-base leading-relaxed">
                          Recognized at{" "}
                          <span className="text-cyan-300 font-semibold">Coding Fest 2025</span>{" "}
                          (University of Sydney, School of Computer Science) for excellence in{" "}
                          <span className="text-emerald-300 font-semibold">
      innovation and community impact.
    </span>
                      </p>
                      <p className="text-white/70 text-sm md:text-base mt-2">
                          Sponsored by{" "}
                          <span className="text-[#2684FF] font-semibold">Atlassian</span>{" "}
                          and{" "}
                          <span className="text-[#E32B23] font-semibold">Flow Traders</span>.
                      </p>

                      {/* 🔗 View Certificate Button */}
                  <a
                          href="https://drive.google.com/file/d/1zzoNxecwqmVFIoBu2cUXIJZdHUiay1Hi/view?usp=drive_link"
                          target="_blank"
                          rel="noopener noreferrer"
                      className="project-cta inline-block mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 text-black font-semibold shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.6)] transition-all duration-500"
                      >
                          View Award Certificate →
                      </a>
                  </div>

                  {/* 🔗 GitHub Button */}
                  <a
                      href="https://github.com/ShousenZHANG/project-contest-platform.git"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-cta inline-block mt-2 px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-black font-semibold shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.6)] transition-all duration-500"
                  >
                      View on GitHub →
                  </a>
              </div>
          </div>

            {/* ⚙️ Project 2 */}
            <div
                ref={(el) => (projectRefs.current[1] = el)}
                className="flex flex-col-reverse lg:flex-row items-center gap-10"
            >
                <div className="lg:w-1/2 w-full text-center lg:text-left">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Enterprise Banking Platform Framework
                    </h2>

                    <p className="project-outcome text-white/85 md:text-lg leading-relaxed mb-4">
                        <span className="text-emerald-300 font-semibold">Outcome:</span>{" "}
                        Cut delivery time by 30% and improved reliability by 35% for enterprise
                        insurance systems.
                    </p>

                    <p className="text-white/75 md:text-base leading-relaxed mb-6">
                        <span className="text-cyan-300 font-semibold">How:</span>{" "}
                        Extended a modular framework, built a secure socket-based batch transfer tool,
                        and led cloud migration with MinIO + Docker on Linux.
                    </p>
                </div>

                <div className="lg:w-1/2 w-full relative group">
                    <div className="relative overflow-hidden rounded-2xl border border-cyan-400/10 shadow-[0_0_30px_rgba(56,189,248,0.2)] h-[400px] md:h-[480px]">
                        <Swiper
                            modules={[Autoplay, Pagination, EffectFade]}
                            autoplay={{ delay: 4200, disableOnInteraction: false }}
                            pagination={{ clickable: true }}
                            effect="fade"
                            fadeEffect={{ crossFade: true }}
                            loop={true}
                            className="!bg-transparent h-full w-full"
                        >
                            {[
                                {
                                    src: "/images/Insurance_SocketTool.png",
                                    alt: "Enterprise Insurance SocketTool",
                                },
                                {
                                    src: "/images/Insurance_Cloud.png",
                                    alt: "Insurance Cloud",
                                },
                            ].map((img, i) => (
                                <SwiperSlide key={i}>
                                    <div className="flex items-center justify-center w-full h-full bg-black/10">
                                        <img
                                            src={img.src}
                                            alt={img.alt}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </div>

            {/* 💼 Project 3 */}
            <div
                ref={(el) => (projectRefs.current[2] = el)}
                className="flex flex-col lg:flex-row items-center gap-10"
            >
                {/* Image Slider */}
                <div className="lg:w-1/2 w-full relative group">
                    <div className="relative overflow-hidden rounded-2xl border border-cyan-400/10 shadow-[0_0_30px_rgba(56,189,248,0.2)] h-[400px] md:h-[480px]">
                        <Swiper
                            modules={[Autoplay, Pagination, EffectFade]}
                            autoplay={{ delay: 4000, disableOnInteraction: false }}
                            pagination={{ clickable: true }}
                            effect="fade"
                            fadeEffect={{ crossFade: true }}
                            loop={true}
                            className="!bg-transparent h-full w-full"
                        >
                            {[
                                {
                                    src: "/images/portfolio_main.png",
                                    alt: "Portfolio Home Page",
                                },
                            ].map((img, i) => (
                                <SwiperSlide key={i}>
                                    <div className="flex items-center justify-center w-full h-full bg-black/10">
                                        <img
                                            src={img.src}
                                            alt={img.alt}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>

                {/* Text Section */}
                <div className="lg:w-1/2 w-full text-center lg:text-left">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Personal Developer Portfolio
                    </h2>

                    <p className="project-outcome text-white/85 md:text-lg leading-relaxed mb-4">
                        <span className="text-emerald-300 font-semibold">Outcome:</span>{" "}
                        Delivered a modern, recruiter-friendly portfolio with fast load time,
                        polished motion, and clear project storytelling.
                    </p>

                    <p className="text-white/75 md:text-base leading-relaxed mb-6">
                        <span className="text-cyan-300 font-semibold">How:</span>{" "}
                        Built with React + Tailwind, reusable components, and automated deployment
                        via GitHub + CI/CD.
                    </p>

                    <a
                        href="https://github.com/ShousenZHANG/portfolio.git"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-cta inline-block mt-2 px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-black font-semibold shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.6)] transition-all duration-500"
                    >
                        View on GitHub →
                    </a>
                </div>
            </div>


        </div>
      </section>
  );
};

export default AppShowcase;
