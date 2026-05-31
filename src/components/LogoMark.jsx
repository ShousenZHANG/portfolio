/**
 * Eddy Zhang brand mark — geometric "E" monogram with a neural signal
 * node, on the signature violet→cyan gradient. Matches favicon.svg.
 */
const LogoMark = ({ className = "", size = 34 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    role="img"
    aria-label="Eddy Zhang"
  >
    <defs>
      <linearGradient id="logoMarkGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="var(--sig)" />
        <stop offset="1" stopColor="var(--sig-2)" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="15" fill="url(#logoMarkGrad)" />
    <g fill="var(--sig-ink)">
      <rect x="18" y="17" width="6.5" height="30" rx="3.25" />
      <rect x="18" y="17" width="27" height="6.5" rx="3.25" />
      <rect x="18" y="28.75" width="18" height="6.5" rx="3.25" />
      <rect x="18" y="40.5" width="27" height="6.5" rx="3.25" />
    </g>
    <circle cx="42.5" cy="32" r="3.6" fill="var(--sig-ink)" />
  </svg>
);

export default LogoMark;
