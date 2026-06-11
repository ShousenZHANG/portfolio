import Mail from "lucide-react/dist/esm/icons/mail";
import Phone from "lucide-react/dist/esm/icons/phone";
import Linkedin from "lucide-react/dist/esm/icons/linkedin";
import Github from "lucide-react/dist/esm/icons/github";
import ArrowUp from "lucide-react/dist/esm/icons/arrow-up";
import Magnetic from "../components/Magnetic.jsx";

const Footer = () => {
  return (
    <footer style={{ borderTop: "1px solid var(--hair)" }}>
      <div className="ed-shell py-10 md:py-12">
        {/* Top row: Links + Social */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
          {/* Contact links */}
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-3">
            <a
              href="mailto:eddy.zhang24@gmail.com"
              aria-label="Email eddy.zhang24@gmail.com"
              className="flex items-center gap-2 text-sm transition-colors duration-300 hover:!text-[var(--sig)]"
              style={{ color: "var(--tx-1)" }}
            >
              <Mail className="w-4 h-4" />
              <span>eddy.zhang24@gmail.com</span>
            </a>

            <a
              href="tel:+610468761056"
              aria-label="Phone +61 0468 761 056"
              className="flex items-center gap-2 text-sm transition-colors duration-300 hover:!text-[var(--sig)]"
              style={{ color: "var(--tx-1)" }}
            >
              <Phone className="w-4 h-4" />
              <span>+61 0468 761 056</span>
            </a>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            <Magnetic strength={0.5}>
              <a
                href="https://linkedin.com/in/eddy-shousen-zhang"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
                className="w-11 h-11 flex items-center justify-center rounded-[var(--r-sm)] transition-colors duration-300 hover:!border-[var(--sig-line)] hover:!text-[var(--sig)]"
                style={{ border: "1px solid var(--hair)", color: "var(--tx-1)" }}
              >
                <Linkedin className="w-[18px] h-[18px]" />
              </a>
            </Magnetic>
            <Magnetic strength={0.5}>
              <a
                href="https://github.com/ShousenZHANG"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
                className="w-11 h-11 flex items-center justify-center rounded-[var(--r-sm)] transition-colors duration-300 hover:!border-[var(--sig-line)] hover:!text-[var(--sig)]"
                style={{ border: "1px solid var(--hair)", color: "var(--tx-1)" }}
              >
                <Github className="w-[18px] h-[18px]" />
              </a>
            </Magnetic>

            <span className="w-px h-6 mx-1" style={{ background: "var(--hair)" }} aria-hidden="true" />

            {/* Back to top — routed through Lenis via the global anchor handler */}
            <Magnetic strength={0.5}>
              <a
                href="#hero"
                aria-label="Back to top"
                className="w-11 h-11 flex items-center justify-center rounded-full transition-colors duration-300 hover:!border-[var(--sig-line)] hover:!text-[var(--sig)]"
                style={{ border: "1px solid var(--hair)", color: "var(--tx-1)" }}
              >
                <ArrowUp className="w-[18px] h-[18px]" />
              </a>
            </Magnetic>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px mb-6" style={{ background: "var(--hair)" }} />

        {/* Bottom row: Copyright + Location */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono" style={{ color: "var(--tx-2)" }}>
          <p>&copy; {new Date().getFullYear()} Eddy Zhang. All rights reserved.</p>
          <p>Sydney, Australia</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
