import { useState, useEffect } from "react";
import Menu from "lucide-react/dist/esm/icons/menu";
import X from "lucide-react/dist/esm/icons/x";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";

import { navLinks } from "../constants";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

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

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`navbar ${scrolled ? "scrolled" : "not-scrolled"}`}>
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
          aria-controls="mobile-nav"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu — slide down from top */}
      <div
        id="mobile-nav"
        className={`lg:hidden fixed inset-x-0 top-0 z-[99] bg-[#0a0a0e]/98 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${menuOpen ? "translate-y-0" : "-translate-y-full"}`}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <nav aria-label="Mobile navigation" className="flex flex-col px-6 pt-20 pb-10 min-h-[50vh]">
          <div className="flex flex-col gap-1">
            {navLinks.map(({ link, name }) => {
              const sectionId = link.replace("#", "");
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={name}
                  href={link}
                  onClick={closeMenu}
                  className={`py-3 px-4 rounded-lg text-lg font-medium transition-colors duration-200 ${isActive ? "text-white bg-white/8" : "text-white/60 hover:text-white hover:bg-white/5"}`}
                >
                  {name}
                </a>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-white/8">
            <a
              href="#contact"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-black text-sm font-semibold"
            >
              Contact me
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </nav>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[98] bg-black/50"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default NavBar;
