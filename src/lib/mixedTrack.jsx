import { isZh } from "../i18n/index.js";

/**
 * Mixed-script tracking for /zh labels.
 *
 * The zh eyebrow is tracked out to 0.3em on purpose — square, separable hanzi
 * read that as a label treatment (see the .ed-eyebrow rule in the zh scope).
 * Latin does not: at 0.3em "AI Agent" falls apart into "A I  A g e n t", and
 * "NL2SQL" stops reading as one token. CSS cannot select by script, so this
 * splits a label into its Latin runs and wraps each in a .lat span, which the
 * zh scope sets back to Latin tracking. Han keeps the wide spacing; the Latin
 * words inside it stay words.
 *
 * A run starts and ends on a letter or digit and may carry the punctuation
 * that lives inside product names and dates (NL2SQL, E.D., 2025.07, C#/Python),
 * so a separator like " / " or " · " between two runs stays in the Han layer.
 *
 * English page: returns the string untouched — identical DOM, identical paint.
 */
const LATIN_RUN = /([A-Za-z0-9][A-Za-z0-9.+\-#/&' \u00a0–]*[A-Za-z0-9+.#])|([A-Za-z0-9])/g;

// A label may only wrap right AFTER a separator: every other space becomes
// no-break, so "RAG 与 NL2SQL 落地" stays one segment, and a wrapped line
// ends on "·" or "/" instead of opening the next line with one.
const NBSP = String.fromCharCode(0xa0);
const glueSeparators = (s) =>
    s
        .split(/ ([·/]) /)
        .map((part, i) => (i % 2 ? `${NBSP}${part} ` : part.split(" ").join(NBSP)))
        .join("");

export function mixedTrack(input) {
    if (!isZh || typeof input !== "string") return input;
    const text = glueSeparators(input);
    const out = [];
    let last = 0;
    // exec loop rather than matchAll / replaceAll: this path only runs on
    // /zh, whose audience arrives largely inside WeChat's WebView, and older
    // builds of it predate both (Chrome 73 / 85).
    const re = new RegExp(LATIN_RUN.source, "g");
    let m;
    while ((m = re.exec(text)) !== null) {
        if (m.index > last) out.push(text.slice(last, m.index));
        out.push(<span key={m.index} className="lat">{m[0]}</span>);
        last = m.index + m[0].length;
    }
    if (out.length === 0) return text;
    if (last < text.length) out.push(text.slice(last));
    // One wrapper, always: .ed-eyebrow is a flex row (its leading rule is a
    // ::before), so bare siblings would each become a flex item and wrap
    // independently — on a phone the hero label broke into a five-row grid.
    return <span>{out}</span>;
}
