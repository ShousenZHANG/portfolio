import Mail from "lucide-react/dist/esm/icons/mail";
import Phone from "lucide-react/dist/esm/icons/phone";
import Linkedin from "lucide-react/dist/esm/icons/linkedin";
import Github from "lucide-react/dist/esm/icons/github";

const Footer = () => {
  return (
    <footer className="border-t border-white/8 mt-16">
      <div className="max-w-[1200px] mx-auto px-5 md:px-12 lg:px-16 py-10 md:py-12">
        {/* Top row: Links + Social */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
          {/* Contact links */}
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-3">
            <a
              href="mailto:eddy.zhang24@gmail.com"
              aria-label="Email eddy.zhang24@gmail.com"
              className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm transition-colors duration-300"
            >
              <Mail className="w-4 h-4" />
              <span>eddy.zhang24@gmail.com</span>
            </a>

            <a
              href="tel:+610468761056"
              aria-label="Phone +61 0468 761 056"
              className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm transition-colors duration-300"
            >
              <Phone className="w-4 h-4" />
              <span>+61 0468 761 056</span>
            </a>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://linkedin.com/in/eddy-shousen-zhang"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/8 text-white/40 hover:text-white/80 hover:border-white/20 transition-all duration-300"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/ShousenZHANG"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/8 text-white/40 hover:text-white/80 hover:border-white/20 transition-all duration-300"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/6 mb-6" />

        {/* Bottom row: Copyright + Location */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/35">
          <p>
            &copy; {new Date().getFullYear()} Eddy Zhang. All rights reserved.
          </p>
          <p>Sydney, Australia</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
