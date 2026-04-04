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
      fpsLimit: 30,
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      particles: {
        number: {
          value: 30,
          density: { enable: true, width: 1400, height: 900 },
        },
        color: {
          value: ["#38bdf8", "#22d3ee", "#34d399"],
        },
        shape: { type: "circle" },
        opacity: {
          value: { min: 0.1, max: 0.3 },
        },
        size: {
          value: { min: 1, max: 2 },
        },
        move: {
          enable: true,
          speed: 0.4,
          direction: "none",
          outModes: { default: "out" },
        },
        links: {
          enable: true,
          distance: 140,
          color: "#38bdf8",
          opacity: 0.06,
          width: 1,
        },
      },
      interactivity: {
        events: {
          onHover: { enable: false },
          resize: { enable: true },
        },
      },
      detectRetina: true,
    }),
    []
  );

  if (!ready) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Particles
        id="tsparticles-bg"
        options={options}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default ParticlesBackground;
