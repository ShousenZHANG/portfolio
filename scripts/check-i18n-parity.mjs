// Structural parity gate for the locale dictionaries.
//
// src/i18n/index.js deliberately carries no fallback merge: a key present in
// en.js and missing in zh.js renders the literal text "undefined" on the page,
// silently and only in the locale nobody is looking at. This walks both trees
// and fails the build on any divergence in key path, value type, function
// arity or array length.
//
// Run: node scripts/check-i18n-parity.mjs
import { en } from "../src/i18n/en.js";
import { zh } from "../src/i18n/zh.js";

// hero.headline is legitimately shaped differently per locale: the component
// maps over it, and a Chinese sentence does not split into the same number of
// words as its English counterpart. Exempt the whole subtree, not just its
// length — the per-index leaves diverge with it.
const SUBTREE_EXEMPT = ["hero.headline"];
const exempt = (key) => SUBTREE_EXEMPT.some((p) => key === p || key.startsWith(p + "["));

function leaves(obj, prefix = "") {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (exempt(key)) {
      out.push(`${key}:<locale-shaped>`);
    } else if (Array.isArray(v)) {
      out.push(`${key}[] len=${v.length}`);
      v.forEach((item, i) => {
        if (item && typeof item === "object") out.push(...leaves(item, `${key}[${i}]`));
        else out.push(`${key}[${i}]:${typeof item}`);
      });
    } else if (v && typeof v === "object") {
      out.push(...leaves(v, key));
    } else {
      // Arity is part of the contract: the component calls these positionally.
      out.push(`${key}:${typeof v}${typeof v === "function" ? `/${v.length}` : ""}`);
    }
  }
  return out;
}

const a = new Set(leaves(en));
const b = new Set(leaves(zh));
const missingInZh = [...a].filter((x) => !b.has(x));
const onlyInZh = [...b].filter((x) => !a.has(x));

console.log(`en leaves: ${a.size}   zh leaves: ${b.size}`);
if (missingInZh.length) console.log(`\nMISSING IN ZH (or type/arity/length differs):\n  ${missingInZh.join("\n  ")}`);
if (onlyInZh.length) console.log(`\nONLY IN ZH:\n  ${onlyInZh.join("\n  ")}`);

if (missingInZh.length || onlyInZh.length) {
  console.error("\ni18n parity FAILED");
  process.exit(1);
}
console.log("\ni18n parity OK");
