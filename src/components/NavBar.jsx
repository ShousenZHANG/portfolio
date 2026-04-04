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

  // Track active section via IntersectionObserver
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

  // Close menu on Escape key
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`navbar ${scrolled ? "scrolled" : "not-scrolled"}`}>
      <div className="navbar-inner">
        {/* Logo */}
        <a
          href="#hero"
          onClick={closeMenu}
          className="navbar-logo"
        >
          <span className="navbar-logo-mark">E</span>
          <span className="navbar-logo-text">Eddy Zhang</span>
        </a>

        {/* Desktop navigation */}
        <nav className="navbar-nav" aria-label="Main navigation">
          <ul>
            {navLinks.map(({ link, name }) => {
              const sectionId = link.replace("#", "");
              const isActive = activeSection === sectionId;
              return (
                <li key={name}>
                  <a
                    href={link}
                    className={`navbar-link ${isActive ? "active" : ""}`}
                  >
                    {name}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Desktop CTA */}
        <a href="#contact" className="navbar-cta group hidden lg:flex">
          <span>Contact me</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </a>

        {/* Mobile hamburger button */}
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

      {/* Mobile menu overlay */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="fixed inset-0 top-[60px] z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 animate-fade-in"
        >
          {navLinks.map(({ link, name }) => (
            <a
              key={name}
              href={link}
              onClick={closeMenu}
              className="text-2xl font-semibold text-white/80 hover:text-white transition-colors duration-300"
            >
              {name}
            </a>
          ))}
          <a
            href="#contact"
            onClick={closeMenu}
            className="mt-4 px-8 py-3 rounded-xl bg-white/10 border border-white/15 text-white font-semibold text-lg backdrop-blur-sm hover:bg-white/15 transition-all duration-300"
          >
            Contact me
          </a>
        </nav>
      )}
    </header>
  );
};

export default NavBar;
