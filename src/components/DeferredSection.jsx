import { useEffect, useRef, useState } from "react";

const DeferredSection = ({
  id,
  children,
  fallback,
  minHeight = "60vh",
  rootMargin = "720px 0px",
  ariaLabel = "Deferred section",
}) => {
  const markerRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setShouldRender(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );

    if (markerRef.current) observer.observe(markerRef.current);
    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  if (shouldRender) return children;

  return (
    <section
      id={id}
      ref={markerRef}
      aria-label={ariaLabel}
      className="deferred-section flex items-center justify-center px-5"
      style={{ minHeight }}
    >
      {fallback}
    </section>
  );
};

export default DeferredSection;
