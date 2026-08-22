// Dynamic Open Graph image endpoint.
// Renders a 1200×630 PNG branded card for social shares.
// Edge runtime is required by @vercel/og.
//
// React must be imported because Vercel's edge bundler (esbuild) uses
// classic JSX transform by default — JSX expands to React.createElement(...)
// and the file fails at runtime without React in scope.

// eslint-disable-next-line no-unused-vars
import React from "react";
import { ImageResponse } from "@vercel/og";

export const config = { runtime: "edge" };

const TITLE = "Eddy Zhang";
const SUBTITLE = "AI Engineer · Copilot Studio";
const URL_LABEL = "eddyzhang.me";

export default function handler() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          // Ink ladder as literal sRGB — @vercel/og's satori has no access to the
          // :root custom properties in src/index.css. Stops 1-2 are --ink-0 / --ink-1
          // verbatim; the last is --ink-2 held at its exact L and C but rotated to the
          // --sig-2 hue (oklch(0.205 0.018 210)), which keeps the card's violet-to-cyan
          // drift without inventing a lightness that is not on the ladder.
          background:
            "linear-gradient(135deg, #07080e 0%, #0e0f16 55%, #0d191c 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top row — logo mark + URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Gradient "E" mark, matching favicon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "96px",
              height: "96px",
              borderRadius: "22px",
              background:
                "linear-gradient(135deg, #7d7fff 0%, #35c5db 100%)",
              fontSize: "60px",
              fontWeight: 900,
              // --sig-ink: the token for a fill sitting ON the signature gradient,
              // same role the monogram plays in public/favicon.svg.
              color: "#08091b",
              letterSpacing: "-2px",
            }}
          >
            E
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "24px",
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "1px",
            }}
          >
            {URL_LABEL}
          </div>
        </div>

        {/* Center block — title + subtitle */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "120px",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-4px",
              lineHeight: 1,
            }}
          >
            {TITLE}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "56px",
              fontWeight: 700,
              background:
                "linear-gradient(90deg, #7d7fff 0%, #35c5db 100%)",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "-1px",
            }}
          >
            {SUBTITLE}
          </div>
        </div>

        {/* Bottom — gradient divider + tag line */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              height: "3px",
              width: "100%",
              background:
                "linear-gradient(90deg, transparent 0%, #7d7fff 30%, #35c5db 70%, transparent 100%)",
              opacity: 0.7,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: "26px",
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.5px",
            }}
          >
            Power Platform · Dataverse · AI Agents · Microsoft 365
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
