import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { counterItems } from "../constants";
import CountUp from "react-countup";
import { useTilt } from "../hooks/useTilt.js";
import { prefersReducedMotion } from "../lib/motion.js";
import Code2 from "lucide-react/dist/esm/icons/code-2";
import Briefcase from "lucide-react/dist/esm/icons/briefcase";
import Bot from "lucide-react/dist/esm/icons/bot";
import Terminal from "lucide-react/dist/esm/icons/terminal";

const ICONS = [Code2, Briefcase, Bot, Terminal];

const StatTile = ({ item, Icon }) => {
  const tiltRef = useTilt(8);
  return (
    <div
      ref={tiltRef}
      className="counter-card ed-tile group relative overflow-hidden p-5 md:p-6 flex flex-col justify-between min-h-[168px] md:min-h-[200px]"
    >
      {/* signature top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, var(--sig-line), transparent)" }}
        aria-hidden="true"
      />
      {/* hover glow */}
      <div
        className="pointer-events-none absolute -bottom-12 -right-10 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "radial-gradient(circle, var(--sig-glow) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* icon */}
      <div
        className="w-10 h-10 rounded-[var(--r-sm)] flex items-center justify-center"
        style={{ background: "var(--sig-glow)", border: "1px solid var(--sig-line)" }}
        aria-hidden="true"
      >
        <Icon className="w-[18px] h-[18px]" style={{ color: "var(--sig)" }} />
      </div>

      {/* number + label, bottom-anchored */}
      <div className="mt-6">
        <div
          className="counter-number text-4xl md:text-5xl font-semibold tracking-tight tabular-nums"
          style={{ color: "var(--tx-0)" }}
        >
          <CountUp suffix={item.suffix} end={item.value} enableScrollSpy scrollSpyOnce />
        </div>
        <div className="text-sm mt-2 leading-snug" style={{ color: "var(--tx-2)" }}>
          {item.label}
        </div>
      </div>
    </div>
  );
};

const AnimatedCounter = () => {
  const counterRef = useRef(null);

  useGSAP(() => {
    if (prefersReducedMotion()) {
      gsap.set(".counter-card", { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(
      ".counter-card",
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#counter",
          start: "top 80%",
        },
      }
    );
  }, []);

  return (
    <div id="counter" ref={counterRef} className="ed-shell xl:mt-0 mt-16">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {counterItems.map((item, i) => (
          <StatTile key={item.label} item={item} Icon={ICONS[i % ICONS.length]} />
        ))}
      </div>
    </div>
  );
};

export default AnimatedCounter;
