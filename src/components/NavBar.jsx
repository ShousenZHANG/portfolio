import { useState, useEffect, useRef } from "react";
import { navLinks } from "../constants";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(-1);
  const pillRef = useRef(null);
  const linkRefs = useRef([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* close mobile menu on resize to desktop */
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* sliding pill indicator */
  useEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;
    if (hoverIdx < 0 || !linkRefs.current[hoverIdx]) {
      pill.style.opacity = "0";
      return;
    }
    const el = linkRefs.current[hoverIdx];
    const parent = el.parentElement;
    const left = el.offsetLeft - parent.offsetLeft;
    const width = el.offsetWidth;
    pill.style.opacity = "1";
    pill.style.transform = `translateX(${left}px)`;
    pill.style.width = `${width}px`;
  }, [hoverIdx]);

  /* lock body scroll when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header className={`nav-bar ${scrolled ? "nav-bar--scrolled" : ""}`}>
      <div className="nav-inner">
        {/* Logo */}
        <a href="#hero" className="nav-logo">
          Eddy Zhang
        </a>

        {/* Desktop nav */}
        <nav
          className="nav-links"
          onMouseLeave={() => setHoverIdx(-1)}
        >
          <span ref={pillRef} className="nav-indicator" />
          {navLinks.map(({ link, name }, i) => (
            <a
              key={name}
              href={link}
              ref={(el) => (linkRefs.current[i] = el)}
              onMouseEnter={() => setHoverIdx(i)}
              className="nav-link"
            >
              {name}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <a href="#contact" className="nav-cta">
          <span className="nav-cta-glow" />
          <span className="relative z-10">Contact me</span>
        </a>

        {/* Mobile hamburger */}
        <button
          className="nav-burger"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className={`nav-burger-line ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`nav-burger-line ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
          <span className={`nav-burger-line ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </div>

      {/* Mobile overlay + sheet */}
      <div
        className={`nav-overlay ${mobileOpen ? "nav-overlay--open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />
      <nav className={`nav-sheet ${mobileOpen ? "nav-sheet--open" : ""}`}>
        {navLinks.map(({ link, name }) => (
          <a
            key={name}
            href={link}
            className="nav-sheet-link"
            onClick={() => setMobileOpen(false)}
          >
            {name}
          </a>
        ))}
        <a
          href="#contact"
          className="nav-sheet-cta"
          onClick={() => setMobileOpen(false)}
        >
          Contact me
        </a>
      </nav>
    </header>
  );
};

export default NavBar;
