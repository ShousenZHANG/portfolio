import { useState, useEffect } from "react";
import Menu from "lucide-react/dist/esm/icons/menu";
import X from "lucide-react/dist/esm/icons/x";

import { navLinks } from "../constants";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
      <div className="inner">
        <a
          href="#hero"
          onClick={closeMenu}
          className="logo text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 text-2xl font-extrabold tracking-tight hover:opacity-90 transition"
        >
          Eddy Zhang
        </a>

        {/* Desktop navigation */}
        <nav className="desktop" aria-label="Main navigation">
          <ul>
            {navLinks.map(({ link, name }) => (
              <li key={name} className="group">
                <a href={link}>
                  <span>{name}</span>
                  <span className="underline" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop CTA */}
        <a href="#contact" className="contact-btn group hidden lg:flex">
          <div className="inner">
            <span>Contact me</span>
          </div>
        </a>

        {/* Mobile hamburger button */}
        <button
          type="button"
          className="lg:hidden flex items-center justify-center w-10 h-10 text-white/90 hover:text-white transition-colors"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="fixed inset-0 top-[64px] z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 animate-fade-in"
        >
          {navLinks.map(({ link, name }) => (
            <a
              key={name}
              href={link}
              onClick={closeMenu}
              className="text-2xl font-semibold text-white/90 hover:text-sky-400 transition-colors duration-300"
            >
              {name}
            </a>
          ))}
          <a
            href="#contact"
            onClick={closeMenu}
            className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-black font-semibold text-lg shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] transition-all duration-300"
          >
            Contact me
          </a>
        </nav>
      )}
    </header>
  );
};

export default NavBar;
