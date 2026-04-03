import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * Unified scroll-triggered entrance animation.
 *
 * @param {object} options
 * @param {number} [options.y=50]           Desktop Y offset
 * @param {number} [options.mobileY=24]     Mobile Y offset
 * @param {number} [options.duration=0.9]   Desktop duration
 * @param {number} [options.mobileDuration=0.7] Mobile duration
 * @param {string} [options.ease="power2.out"]
 * @param {string} [options.start="top 85%"]
 * @param {number} [options.delay=0]
 * @returns {import("react").RefObject}
 */
export function useScrollReveal(options = {}) {
  const {
    y = 50,
    mobileY = 24,
    duration = 0.9,
    mobileDuration = 0.7,
    ease = "power2.out",
    start = "top 85%",
    delay = 0,
  } = options;

  const ref = useRef(null);

  useGSAP(() => {
    if (!ref.current) return;
    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 768px)").matches;

    gsap.fromTo(
      ref.current,
      { opacity: 0, y: isMobile ? mobileY : y },
      {
        opacity: 1,
        y: 0,
        duration: isMobile ? mobileDuration : duration,
        ease,
        delay,
        scrollTrigger: {
          trigger: ref.current,
          start,
          toggleActions: "play none none reverse",
        },
      }
    );
  }, []);

  return ref;
}
