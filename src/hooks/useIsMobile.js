import { useState, useEffect } from "react";

/**
 * Responsive mobile detection via matchMedia.
 * @param {string} query — media query string, default "(max-width: 768px)"
 * @returns {boolean}
 */
export function useIsMobile(query = "(max-width: 768px)") {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const onChange = (e) => setIsMobile(e.matches);

    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);

    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return isMobile;
}
