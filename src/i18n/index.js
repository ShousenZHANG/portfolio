/**
 * The locale dictionary — resolved once at module scope (see locale.js for
 * why this is not React context). Both dictionaries ship in the bundle; the
 * Chinese one costs a few gzipped KB, which is cheaper than the async seam a
 * split chunk would cut through every component.
 *
 * Shape contract: en.js and zh.js export structurally identical objects,
 * grouped by section (nav / hero / jd / logos / experience / showcase /
 * skills / contact / footer / ed / misc). A key present in one and missing
 * in the other is a bug — the build carries no fallback-merge on purpose,
 * so a hole surfaces as a visible `undefined` instead of silently showing
 * the wrong language.
 */
import { isZh } from "./locale.js";
import { en } from "./en.js";
import { zh } from "./zh.js";

export const dict = isZh ? zh : en;
export { locale, isZh, altHref } from "./locale.js";
