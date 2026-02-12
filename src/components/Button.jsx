import ArrowDown from "lucide-react/dist/esm/icons/arrow-down";

const Button = ({ text, className, id }) => {
  return (
    <a
      onClick={(e) => {
        e.preventDefault();
        const target = document.getElementById("counter");
        if (target && id) {
          const offset = window.innerHeight * 0.15;
          const top =
            target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }}
      className={`${className ?? ""} hero-btn-primary group`}
    >
      <span className="hero-btn-shimmer" />
      <span className="relative z-10 flex items-center gap-2.5 font-semibold tracking-wide">
        {text}
        <ArrowDown className="w-4.5 h-4.5 transition-transform duration-300 group-hover:translate-y-0.5" />
      </span>
    </a>
  );
};

export default Button;
