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
const SUBTITLE = "AI Full Stack Engineer";
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
          background:
            "linear-gradient(135deg, #0a0a0c 0%, #0e0e10 50%, #0a1820 100%)",
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
                "linear-gradient(135deg, #38bdf8 0%, #22d3ee 50%, #34d399 100%)",
              fontSize: "60px",
              fontWeight: 900,
              color: "#0e0e10",
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
                "linear-gradient(90deg, #38bdf8 0%, #22d3ee 50%, #34d399 100%)",
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
                "linear-gradient(90deg, transparent 0%, #38bdf8 30%, #34d399 70%, transparent 100%)",
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
            React · Node.js · LLM Agents · Cloud Microservices
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
