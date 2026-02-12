import { useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const ParticlesBackground = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const options = useMemo(
    () => ({
      fullScreen: false,
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: {
          value: 60,
          density: { enable: true, area: 900 },
        },
        color: { value: "#38bdf8" },
        opacity: {
          value: { min: 0.15, max: 0.35 },
          animation: { enable: true, speed: 0.4, minimumValue: 0.1, sync: false },
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
          color: "#22d3ee",
          opacity: 0.12,
          distance: 150,
          width: 1,
        },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: "grab" },
          onClick: { enable: true, mode: "push" },
        },
        modes: {
          grab: {
            distance: 200,
            links: { opacity: 0.3, color: "#38bdf8" },
          },
          push: { quantity: 3 },
        },
      },
    }),
    []
  );

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      options={options}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "auto",
      }}
    />
  );
};

export default ParticlesBackground;
