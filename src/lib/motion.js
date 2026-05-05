export function matchesMedia(query) {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(query).matches
  );
}

export function prefersReducedMotion() {
  return matchesMedia("(prefers-reduced-motion: reduce)");
}

