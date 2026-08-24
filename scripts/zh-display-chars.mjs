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
import { writeFileSync } from "node:fs";
import { zh } from "../src/i18n/zh.js";

const displayStrings = [
  ...zh.hero.headline.map((w) => w.t),
  zh.jd.title,
  zh.experience.title,
  zh.showcase.title,
  zh.skills.title,
  zh.contact.title,
  zh.footer.wordmark,
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
