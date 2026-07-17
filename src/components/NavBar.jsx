import { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import Menu from "lucide-react/dist/esm/icons/menu";
import X from "lucide-react/dist/esm/icons/x";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";

import { navLinks } from "../constants";
import Magnetic from "./Magnetic.jsx";
import LogoMark from "./LogoMark.jsx";
import { prefersReducedMotion } from "../lib/motion.js";

// Hover-decode: nav labels scramble briefly and collapse back — the same
// measurement motif as the hero headline, echoed in the chrome.
const NAV_GLYPHS = "!<>-_\\/[]{}=+*^?#";
const ScrambleText = ({ text, active }) => {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!active || prefersReducedMotion()) { setDisplay(text); return undefined; }
    let f = 0;
    const iv = setInterval(() => {
      f += 1;
      const settled = Math.floor((f / 9) * text.length);
      if (settled >= text.length) { setDisplay(text); clearInterval(iv); return; }
      let s = "";
      for (let i = 0; i < text.length; i++) {
        s += i < settled ? text[i] : NAV_GLYPHS[(i * 5 + f * 3) % NAV_GLYPHS.length];
      }
      setDisplay(s);
    }, 26);
    return () => clearInterval(iv);
  }, [active, text]);
  return display;
};

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [hovered, setHovered] = useState(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, show: false });
  const menuRef = useRef(null);
  const ulRef = useRef(null);
  const linkRefs = useRef({});
  const progressRef = useRef(null);

  // Scroll: glass state + reading-progress bar.
  // Under Lenis, native scroll fires ~every frame — so coalesce reads into a
  // single rAF, drive the progress bar imperatively (no React render per
  // frame), and only setScrolled when the boolean actually flips.
  useEffect(() => {
    let raf = 0;
    let ticking = false;
    const read = () => {
      ticking = false;
      const y = window.scrollY;
      setScrolled((prev) => (y > 10 === prev ? prev : y > 10));
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 ? Math.min(1, y / max) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; raf = requestAnimationFrame(read); }
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Active section via IntersectionObserver.
  // Some targets (#projects) live in lazy-loaded chunks and don't exist at
  // mount — watch the DOM until every id is registered, else their nav link
  // never activates.
  useEffect(() => {
    const ids = navLinks.map((l) => l.link.replace("#", ""));
    const observers = [];
    const pending = new Set(ids);

    const register = (id) => {
      const el = document.getElementById(id);
      if (!el) return false;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-45% 0px -45% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
      pending.delete(id);
      return true;
    };

    ids.forEach(register);

    let mo = null;
    if (pending.size > 0) {
      mo = new MutationObserver(() => {
        pending.forEach((id) => register(id));
        if (pending.size === 0) { mo.disconnect(); mo = null; }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      observers.forEach((o) => o.disconnect());
      mo?.disconnect();
    };
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
      {/* reading-progress bar — transform driven imperatively via ref */}
      <span
        ref={progressRef}
        className="navbar-progress"
        style={{ transform: "scaleX(0)" }}
        aria-hidden="true"
      />

      <div className="navbar-inner">
        <a href="#hero" onClick={closeMenu} className="navbar-logo">
          <LogoMark className="navbar-logo-mark" size={34} />
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
                    <ScrambleText text={name} active={hovered === id} />
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

        {/* Mobile hamburger — glass pill button */}
        <button
          type="button"
          className="navbar-burger lg:hidden flex items-center justify-center"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-dropdown"
        >
          {menuOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
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
