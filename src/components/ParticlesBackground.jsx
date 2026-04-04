import { useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

/**
 * Full-page animated particle network background.
 * Balanced for visual impact + smooth scrolling.
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
          value: 55,
          density: { enable: true, width: 1200, height: 800 },
        },
        color: {
          value: ["#38bdf8", "#22d3ee", "#34d399", "#818cf8"],
        },
        shape: { type: "circle" },
        opacity: {
          value: { min: 0.2, max: 0.5 },
        },
        size: {
          value: { min: 1, max: 3 },
        },
        move: {
          enable: true,
          speed: { min: 0.2, max: 0.6 },
          direction: "none",
          outModes: { default: "out" },
        },
        links: {
          enable: true,
          distance: 150,
          color: "#38bdf8",
          opacity: 0.12,
          width: 1,
        },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: "grab" },
          resize: { enable: true },
        },
        modes: {
          grab: {
            distance: 160,
            links: { opacity: 0.25, color: "#22d3ee" },
          },
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
        style={{ width: "100%", height: "100%", pointerEvents: "auto" }}
      />
    </div>
  );
};

export default ParticlesBackground;
