import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { counterItems } from "../constants";
import CountUp from "react-countup";
import { useTilt } from "../hooks/useTilt.js";

const StatTile = ({ item }) => {
  const tiltRef = useTilt(10);
  return (
    <div
      ref={tiltRef}
      className="counter-card ed-tile relative overflow-hidden p-6 md:p-8 flex flex-col"
    >
      {/* Signature accent corner tick */}
      <div
        className="absolute top-0 left-6 right-6 h-px"
        style={{ background: "var(--sig-line)" }}
        aria-hidden="true"
      />
      <div
        className="counter-number text-4xl md:text-5xl font-semibold tracking-tight"
        style={{ color: "var(--tx-0)" }}
      >
        <CountUp suffix={item.suffix} end={item.value} enableScrollSpy scrollSpyOnce />
      </div>
      <div className="text-sm md:text-base mt-2 leading-snug" style={{ color: "var(--tx-2)" }}>
        {item.label}
      </div>
    </div>
  );
};

const AnimatedCounter = () => {
  const counterRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      ".counter-card",
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#counter",
          start: "top center",
        },
      }
    );
  }, []);

  return (
    <div id="counter" ref={counterRef} className="ed-shell xl:mt-0 mt-24">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {counterItems.map((item) => (
          <StatTile key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
};

export default AnimatedCounter;
