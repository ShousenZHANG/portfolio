// Prints the exact character set the Chinese DISPLAY face has to cover.
//
// Only two primitives resolve through --font-zh-display: .ed-display (the hero
// h1) and .ed-h2 (every section heading), plus the footer wordmark. Everything
// else on /zh renders in the system stack, so subsetting against the whole
// dictionary would ship ~100 KB to style text that never uses the face.
//
// A hanzi outside the subset falls through to the system stack rather than
// drawing tofu — but a heading that is half Noto and half YaHei looks worse
// than one that is all YaHei, so this must be re-run whenever the display copy
// in src/i18n/zh.js changes.
//
// Usage:
//   node scripts/zh-display-chars.mjs > .zh-display-chars.txt
//   python scripts/gen-zh-subset.py --from-dict .zh-display-chars.txt
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { zh } from "../src/i18n/zh.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// The decode animations substitute these INTO the headline and the nav, so
// they are display glyphs too — a scramble character outside the subset falls
// back mid-animation and the word visibly changes face while it resolves.
// Read from source rather than duplicated here, so the pools cannot drift.
const poolFrom = (file, name) => {
  const src = readFileSync(resolve(root, file), "utf8");
  return new RegExp(`${name} = "([^"]+)"`).exec(src)?.[1] ?? "";
};

const displayStrings = [
  ...zh.hero.headline.map((w) => w.t),
  zh.jd.title,
  zh.experience.title,
  zh.showcase.title,
  zh.skills.title,
  zh.contact.title,
  zh.footer.wordmark,
  poolFrom("src/sections/Hero.jsx", "GLYPHS_CJK"),
  poolFrom("src/components/NavBar.jsx", "NAV_GLYPHS_CJK"),
];

const chars = [...new Set(displayStrings.join("").split(""))]
  .filter((c) => c.charCodeAt(0) > 127)
  .sort()
  .join("");

const out = process.argv[2];
if (out) {
  writeFileSync(out, chars, "utf8");
  process.stderr.write(`${chars.length} glyphs -> ${out}\n`);
} else {
  process.stdout.write(chars);
}
