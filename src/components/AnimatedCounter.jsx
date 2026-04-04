import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { counterItems } from "../constants";
import CountUp from "react-countup";

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
    <div id="counter" ref={counterRef} className="padding-x-lg xl:mt-0 mt-32">
      <div className="mx-auto grid-4-cols">
        {counterItems.map((item) => (
          <div
            key={item.label}
            className="counter-card relative overflow-hidden bg-gradient-to-br from-zinc-900 via-slate-900 to-black rounded-2xl p-10 flex flex-col justify-center items-center shadow-[0_0_20px_rgba(0,0,0,0.4)] backdrop-blur-sm motion-rise hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(56,189,248,0.25)]"
          >
            {/* Accent top border */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${item.accent} opacity-60`} />

            <div className="counter-number text-white/90 text-4xl md:text-5xl xl:text-6xl font-semibold tracking-tight leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-all duration-500 ease-out">
              <CountUp suffix={item.suffix} end={item.value} enableScrollSpy scrollSpyOnce />
            </div>
            <div className="text-white/75 text-lg md:text-xl font-medium text-center mt-2 transition-all duration-500 hover:text-sky-300">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedCounter;
