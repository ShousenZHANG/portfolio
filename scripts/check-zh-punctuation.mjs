// Chinese punctuation gate for the shipped copy.
//
// Chinese sentences take full-width punctuation: ，：；？（）. An ASCII comma
// has no full-width advance, so 「文档,可回溯」 renders visibly cramped — it is
// the loudest "not written by a native" tell a page can carry. It also makes
// `line-break: strict` and `text-spacing-trim` dead letters, since both act
// only on full-width marks.
//
// The test is ADJACENCY, not presence: ASCII punctuation is correct inside a
// Latin run (Next.js, C#/Python, 17368139916@163.com, "(+86) 173 6813 9916",
// "25-40K·14薪"), and only wrong when it sits against a Han character. Spaces
// around full-width marks are flagged too — the glyph already carries its own
// side bearing.
//
// Run: node scripts/check-zh-punctuation.mjs
import { zh } from "../src/i18n/zh.js";
import { PERSONA_ZH, STYLE_SHOTS_ZH, SUGGESTED_QUESTIONS_ZH } from "../api/agents/_ask/persona.zh.js";

const HAN = /[㐀-䶿一-鿿豈-﫿]/;
const FULLWIDTH = /[，。、；：？！「」『』（）《》]/;
const ASCII_PUNCT = { ",": "，", ":": "：", ";": "；", "?": "？", "(": "（", ")": "）" };

const violations = [];

function scan(path, text) {
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const prev = text[i - 1] || "";
    const next = text[i + 1] || "";

    if (ASCII_PUNCT[c] && (HAN.test(prev) || HAN.test(next) || FULLWIDTH.test(prev) || FULLWIDTH.test(next))) {
      violations.push({ path, kind: `ASCII ${c} beside Han`, at: i, ctx: text.slice(Math.max(0, i - 12), i + 12) });
    }
    // A space at a line edge is source indentation in a multi-line prompt
    // literal, not a gap in a sentence.
    const atLineEdge = (sp, other) => sp === " " && (other === "\n" || other === "");
    const gapBefore = prev === " " && !atLineEdge(prev, text[i - 2] || "");
    const gapAfter = next === " " && !atLineEdge(next, text[i + 2] || "");
    if (FULLWIDTH.test(c) && (gapBefore || gapAfter)) {
      violations.push({ path, kind: `space around ${c}`, at: i, ctx: text.slice(Math.max(0, i - 12), i + 12) });
    }
  }
}

function walk(obj, prefix) {
  if (typeof obj === "string") return scan(prefix, obj);
  if (Array.isArray(obj)) return obj.forEach((v, i) => walk(v, `${prefix}[${i}]`));
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) walk(v, prefix ? `${prefix}.${k}` : k);
  }
  // Functions are skipped: their template literals are checked by eye, and
  // calling them here with fake args would scan text no visitor ever sees.
}

walk(zh, "zh");
scan("persona.PERSONA_ZH", PERSONA_ZH);
STYLE_SHOTS_ZH.forEach((s, i) => {
  scan(`persona.STYLE_SHOTS_ZH[${i}].user`, s.user);
  scan(`persona.STYLE_SHOTS_ZH[${i}].assistant`, s.assistant);
});
SUGGESTED_QUESTIONS_ZH.forEach((q, i) => scan(`persona.SUGGESTED_QUESTIONS_ZH[${i}]`, q));

if (violations.length) {
  const byPath = new Map();
  for (const v of violations) {
    if (!byPath.has(v.path)) byPath.set(v.path, []);
    byPath.get(v.path).push(v);
  }
  for (const [path, vs] of byPath) {
    console.log(`\n${path}  (${vs.length})`);
    for (const v of vs.slice(0, 4)) console.log(`   ${v.kind}  …${v.ctx}…`);
    if (vs.length > 4) console.log(`   …and ${vs.length - 4} more`);
  }
  console.error(`\nzh punctuation FAILED — ${violations.length} violations across ${byPath.size} strings`);
  process.exit(1);
}
console.log("zh punctuation OK");
