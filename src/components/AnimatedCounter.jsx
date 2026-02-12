import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { counterItems } from "../constants";
import CountUp from "react-countup";

const AnimatedCounter = () => {
  const counterRef = useRef(null);
  const countersRef = useRef([]);

  useGSAP(() => {
    countersRef.current.forEach((counter, index) => {
      const numberElement = counter.querySelector(".counter-number");
      const item = counterItems[index];

      // Set initial value to 0
      gsap.set(numberElement, { innerText: "0" });

      // Create the counting animation
      gsap.to(numberElement, {
        innerText: item.value,
        duration: 2.5,
        ease: "power2.out",
        snap: { innerText: 1 }, // Ensures whole numbers
        scrollTrigger: {
          trigger: "#counter",
          start: "top center",
        },
        // Add the suffix after counting is complete
        onComplete: () => {
          numberElement.textContent = `${item.value}${item.suffix}`;
        },
      });
    }, counterRef);
  }, []);

  return (
    <div id="counter" ref={counterRef} className="padding-x-lg xl:mt-0 mt-32">
      <div className="mx-auto grid-4-cols">
        {counterItems.map((item, index) => (
          <div
            key={index}
            ref={(el) => el && (countersRef.current[index] = el)}
            className="
  counter-card relative overflow-hidden
  bg-gradient-to-br from-zinc-900 via-slate-900 to-black
  rounded-2xl p-10 flex flex-col justify-center items-center
  shadow-[0_0_20px_rgba(0,0,0,0.4)] backdrop-blur-sm
  motion-rise hover:scale-[1.03]
  hover:shadow-[0_0_35px_rgba(56,189,248,0.25)]
  before:absolute before:inset-0 before:bg-gradient-to-tr before:from-cyan-500/10 before:to-transparent
  before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700
  after:absolute after:inset-0 after:rounded-2xl
  after:bg-gradient-to-br after:from-cyan-400/5 after:to-transparent
  after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-700
"
          >
            <div className="
  counter-number text-white/90 text-4xl md:text-6xl font-semibold
  tracking-tight leading-snug
  drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]
  transition-all duration-500 ease-out
  group-hover:text-white group-hover:scale-[1.03]
">
              <CountUp suffix={item.suffix} end={item.value}/>
            </div>
            <div className="text-white/70 text-lg md:text-xl font-medium text-center
           transition-all duration-500 group-hover:text-cyan-300">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedCounter;
