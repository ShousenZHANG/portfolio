import { useState, useEffect, useRef } from "react";
import Menu from "lucide-react/dist/esm/icons/menu";
import X from "lucide-react/dist/esm/icons/x";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";

import { navLinks } from "../constants";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sectionIds = navLinks.map((l) => l.link.replace("#", ""));
    const observers = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-40% 0px -40% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
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
      <div className="navbar-inner">
        <a href="#hero" onClick={closeMenu} className="navbar-logo">
          <span className="navbar-logo-mark">E</span>
          <span className="navbar-logo-text">Eddy Zhang</span>
        </a>

        <nav className="navbar-nav" aria-label="Main navigation">
          <ul>
            {navLinks.map(({ link, name }) => {
              const sectionId = link.replace("#", "");
              const isActive = activeSection === sectionId;
              return (
                <li key={name}>
                  <a href={link} className={`navbar-link ${isActive ? "active" : ""}`}>
                    {name}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <a href="#contact" className="navbar-cta group hidden lg:flex">
          <span>Contact me</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </a>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="lg:hidden flex items-center justify-center w-10 h-10 text-white/80 hover:text-white transition-colors"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-dropdown"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown — compact card below navbar */}
      <div
        id="mobile-dropdown"
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${menuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <nav
          aria-label="Mobile navigation"
          className="mx-4 mb-4 p-3 rounded-xl bg-[#111318] border border-white/8"
        >
          {navLinks.map(({ link, name }) => {
            const sectionId = link.replace("#", "");
            const isActive = activeSection === sectionId;
            return (
              <a
                key={name}
                href={link}
                onClick={closeMenu}
                className={`block py-2.5 px-3 rounded-lg text-[15px] font-medium transition-colors duration-150 ${isActive ? "text-white bg-white/8" : "text-white/55 active:bg-white/5"}`}
              >
                {name}
              </a>
            );
          })}

          <div className="mt-2 pt-2 border-t border-white/6">
            <a
              href="#contact"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-black text-sm font-semibold"
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
