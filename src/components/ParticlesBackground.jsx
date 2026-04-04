import { useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

/**
 * Full-page animated particle network background.
 * Uses tsParticles slim bundle for optimal performance.
 * Renders fixed behind all content — cyan/emerald theme matching the portfolio palette.
 */
const ParticlesBackground = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  const options = useMemo(
    () => ({
      fpsLimit: 60,
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      particles: {
        number: {
          value: 50,
          density: { enable: true, width: 1200, height: 800 },
        },
        color: {
          value: ["#38bdf8", "#22d3ee", "#34d399", "#818cf8"],
        },
        shape: { type: "circle" },
        opacity: {
          value: { min: 0.15, max: 0.4 },
          animation: { enable: true, speed: 0.8, sync: false },
        },
        size: {
          value: { min: 1, max: 2.5 },
        },
        move: {
          enable: true,
          speed: { min: 0.3, max: 0.8 },
          direction: "none",
          outModes: { default: "out" },
        },
        links: {
          enable: true,
          distance: 160,
          color: "#38bdf8",
          opacity: 0.08,
          width: 1,
        },
      },
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "grab",
          },
          resize: { enable: true },
        },
        modes: {
          grab: {
            distance: 180,
            links: { opacity: 0.2, color: "#22d3ee" },
          },
        },
      },
      detectRetina: true,
    }),
    []
  );

  if (!ready) return null;

  return (
    <Particles
      id="tsparticles-bg"
      options={options}
      className="!fixed inset-0 -z-10 pointer-events-auto"
    />
  );
};

export default ParticlesBackground;
