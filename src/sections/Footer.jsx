import Mail from "lucide-react/dist/esm/icons/mail";
import Phone from "lucide-react/dist/esm/icons/phone";
import Linkedin from "lucide-react/dist/esm/icons/linkedin";

const Footer = () => {
  return (
      <footer className="relative mt-20 py-10 border-t border-white/10 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-white/60">
          {/* Left Section – Copyright */}
          <div className="text-center md:text-left">
            <p>
              © {new Date().getFullYear()}{" "}
              <span className="text-sky-400 font-semibold">Eddy Zhang</span>. All
              rights reserved.
            </p>
          </div>

          {/* Middle Section – Contact Info */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sky-400">
            {/* Email */}
            <a
                href="mailto:eddy.zhang24@gmail.com"
                className="flex items-center gap-2 hover:text-sky-300 transition-all duration-300 hover:scale-105"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">eddy.zhang24@gmail.com</span>
            </a>

            {/* Divider */}
            <span className="text-white/30">•</span>

            {/* Phone */}
            <a
                href="tel:+610468761056"
                className="flex items-center gap-2 hover:text-sky-300 transition-all duration-300 hover:scale-105"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">+61&nbsp;0468&nbsp;761&nbsp;056</span>
            </a>

            {/* Divider */}
            <span className="text-white/30">•</span>

            {/* LinkedIn */}
            <a
                href="https://linkedin.com/in/eddy-shousen-zhang"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-sky-300 transition-all duration-300 hover:scale-105"
            >
              <Linkedin className="w-4 h-4" />
              <span className="hidden sm:inline">LinkedIn</span>
            </a>
          </div>

          {/* Right Section – Tagline */}
          <div className="text-center md:text-right text-white/50 italic">
            <p>Crafted with ☕ + 💻 in Sydney</p>
          </div>
        </div>

        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sky-400/40 to-transparent blur-sm" />
      </footer>
  );
};

export default Footer;
