import { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import Menu from "lucide-react/dist/esm/icons/menu";
import X from "lucide-react/dist/esm/icons/x";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";

import { navLinks } from "../constants";
import Magnetic from "./Magnetic.jsx";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [hovered, setHovered] = useState(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, show: false });
  const [progress, setProgress] = useState(0);
  const menuRef = useRef(null);
  const ulRef = useRef(null);
  const linkRefs = useRef({});

  // Scroll: glass state + reading-progress bar
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section via IntersectionObserver
  useEffect(() => {
    const ids = navLinks.map((l) => l.link.replace("#", ""));
    const observers = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-45% 0px -45% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Position the sliding indicator behind the hovered (or active) link
  const positionIndicator = useCallback(() => {
    const target = hovered || activeSection;
    const el = target ? linkRefs.current[target] : null;
    const ul = ulRef.current;
    if (!el || !ul) { setIndicator((s) => ({ ...s, show: false })); return; }
    setIndicator({ left: el.offsetLeft, width: el.offsetWidth, show: true });
  }, [hovered, activeSection]);

  useLayoutEffect(() => { positionIndicator(); }, [positionIndicator]);
  useEffect(() => {
    window.addEventListener("resize", positionIndicator);
    return () => window.removeEventListener("resize", positionIndicator);
  }, [positionIndicator]);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("touchstart", onClick);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("touchstart", onClick);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`navbar ${scrolled ? "scrolled" : "not-scrolled"}`} ref={menuRef}>
      {/* reading-progress bar */}
      <span
        className="navbar-progress"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />

      <div className="navbar-inner">
        <a href="#hero" onClick={closeMenu} className="navbar-logo">
          <span className="navbar-logo-mark">E</span>
          <span className="navbar-logo-text">Eddy Zhang</span>
        </a>

        <nav className="navbar-nav" aria-label="Main navigation">
          <ul ref={ulRef} onMouseLeave={() => setHovered(null)}>
            <span
              className="navbar-indicator"
              aria-hidden="true"
              style={{
                transform: `translateX(${indicator.left}px)`,
                width: `${indicator.width}px`,
                opacity: indicator.show ? 1 : 0,
              }}
            />
            {navLinks.map(({ link, name }) => {
              const id = link.replace("#", "");
              const isActive = activeSection === id;
              return (
                <li key={name}>
                  <a
                    ref={(el) => { linkRefs.current[id] = el; }}
                    href={link}
                    className={`navbar-link ${isActive ? "active" : ""}`}
                    aria-current={isActive ? "true" : undefined}
                    onMouseEnter={() => setHovered(id)}
                    onFocus={() => setHovered(id)}
                    onBlur={() => setHovered(null)}
                  >
                    {name}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <Magnetic strength={0.4} className="hidden lg:inline-flex">
          <a href="#contact" className="navbar-cta group">
            <span>Contact me</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>
        </Magnetic>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="lg:hidden flex items-center justify-center w-11 h-11 text-white/80 hover:text-white transition-colors"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-dropdown"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        id="mobile-dropdown"
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${menuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <nav aria-label="Mobile navigation" className="mx-4 mb-4 p-3 rounded-xl" style={{ background: "var(--ink-1)", border: "1px solid var(--hair)" }}>
          {navLinks.map(({ link, name }) => {
            const id = link.replace("#", "");
            const isActive = activeSection === id;
            return (
              <a
                key={name}
                href={link}
                onClick={closeMenu}
                aria-current={isActive ? "true" : undefined}
                className="block py-2.5 px-3 rounded-lg text-[15px] font-medium transition-colors duration-150"
                style={isActive ? { color: "var(--tx-0)", background: "var(--ink-2)" } : { color: "var(--tx-2)" }}
              >
                {name}
              </a>
            );
          })}
          <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--hair)" }}>
            <a
              href="#contact"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-semibold"
              style={{ background: "var(--sig)", color: "var(--sig-ink)" }}
            >
              Contact me
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
