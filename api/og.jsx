// Dynamic Open Graph image endpoint.
// Renders a 1200×630 PNG branded card for social shares, per locale:
//   /api/og          → English card
//   /api/og?lang=zh  → Chinese card (linked from zh/index.html)
// Edge runtime is required by @vercel/og.
//
// React must be imported because Vercel's edge bundler (esbuild) uses
// classic JSX transform by default — JSX expands to React.createElement(...)
// and the file fails at runtime without React in scope.
//
// Satori (the renderer inside @vercel/og) ships a Latin face only, so CJK
// would paint as tofu. api/_og/ holds two Noto Sans SC (OFL) subsets cut to
// the EXACT ~86 characters this card can render — ~12 KB per weight, which
// keeps the edge bundle small. The underscore prefix stops Vercel routing
// those files as endpoints. Regenerate them if the zh copy below changes.

// eslint-disable-next-line no-unused-vars
import React from "react";
import { ImageResponse } from "@vercel/og";

export const config = { runtime: "edge" };

const COPY = {
  en: {
    title: "Eddy Zhang",
    subtitle: "AI Engineer · Copilot Studio",
    urlLabel: "eddyzhang.me",
    tagline: "Power Platform · Dataverse · AI Agents · Microsoft 365",
  },
  zh: {
    title: "张守森",
    subtitle: "AI 应用工程师 · Copilot Studio",
    urlLabel: "eddyzhang.me",
    tagline: "企业级 Agent 落地 · 大模型输出可验证 · Microsoft 365",
  },
};

// Resolved once per edge instance, then reused across requests.
let zhFontsPromise = null;
function loadZhFonts() {
  zhFontsPromise ||= Promise.all([
    fetch(new URL("./_og/og-zh-bold.ttf", import.meta.url)).then((r) => r.arrayBuffer()),
    fetch(new URL("./_og/og-zh-regular.ttf", import.meta.url)).then((r) => r.arrayBuffer()),
  ]).then(([bold, regular]) => [
    { name: "Noto Sans SC", data: bold, weight: 700, style: "normal" },
    { name: "Noto Sans SC", data: regular, weight: 400, style: "normal" },
  ]);
  return zhFontsPromise;
}

export default async function handler(req) {
  // Allowlisted — the raw param is never interpolated into rendered text.
  const zh = new URL(req.url).searchParams.get("lang") === "zh";
  const t = zh ? COPY.zh : COPY.en;
  // The subset ships 400/700 only, so the zh card pins to those; the en card
  // keeps 800/900 on the system Latin face. Negative tracking is a Latin
  // display technique — on Han it makes glyphs collide, so zh gets 0.
  const fonts = zh ? await loadZhFonts() : undefined;

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
          fontFamily: zh ? '"Noto Sans SC"' : "sans-serif",
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
              fontWeight: zh ? 700 : 900,
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
            {t.urlLabel}
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
              fontWeight: zh ? 700 : 800,
              color: "white",
              letterSpacing: zh ? "0" : "-4px",
              lineHeight: 1,
            }}
          >
            {t.title}
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
              letterSpacing: zh ? "0" : "-1px",
            }}
          >
            {t.subtitle}
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
              fontWeight: 400,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.5px",
            }}
          >
            {t.tagline}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      ...(fonts ? { fonts } : {}),
    }
  );
}
