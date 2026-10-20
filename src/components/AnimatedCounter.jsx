import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { counterItems } from "../constants";
import CountUp from "react-countup";
import { prefersReducedMotion } from "../lib/motion.js";
import { isZh } from "../i18n/index.js";
// No icon per stat. Four stock glyphs (code, briefcase, bot, terminal) in
// tinted squares said nothing about "45% shorter fault triage" — they were the
// most template-looking thing on the page. Each stat carries the editorial
// index the section eyebrows use ("01 / 04") instead.
const StatTile = ({ item, index, total }) => (
  <div className="counter-card stat">
    <div className="counter-index" aria-hidden="true">
      <span style={{ color: "var(--sig)" }}>{String(index + 1).padStart(2, "0")}</span>
      <span>/ {String(total).padStart(2, "0")}</span>
    </div>
    <div
      className="counter-number stat-number font-semibold tracking-tight tabular-nums"
      style={{ color: "var(--tx-0)" }}
    >
      {/* Thousands separator only where the locale writes one: "2,000"
          in English, 「2000」 in Chinese, as both CVs print it. */}
      <CountUp suffix={item.suffix} end={item.value} separator={isZh ? "" : ","} enableScrollSpy scrollSpyOnce />
    </div>
    <div className="stat-label">{item.label}</div>
  </div>
);

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
        // See TitleHeader: play-forward only, so `once` costs nothing
        // visually and retires the trigger once the tiles are past.
        scrollTrigger: {
          trigger: "#counter",
          start: "top 80%",
          once: true,
        },
      }
    );
  }, []);

  return (
    <div id="counter" ref={counterRef} className="ed-shell xl:mt-0 mt-16">
      {/* One band divided by hairlines, not four boxed tiles with an icon
          each: the strip reads as a single statement, and the numerals are
          the only loud thing in it. */}
      <div className="stat-band grid grid-cols-2 lg:grid-cols-4">
        {counterItems.map((item, i) => (
          <StatTile key={item.label} item={item} index={i} total={counterItems.length} />
        ))}
      </div>
    </div>
  );
};

export default AnimatedCounter;
