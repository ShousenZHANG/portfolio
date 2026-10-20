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
 * English page: only the separator gluing applies; no spans.
 */
const LATIN_RUN = /([A-Za-z0-9][A-Za-z0-9.+\-#/&' \u00a0\u2060–]*[A-Za-z0-9+.#])|([A-Za-z0-9])/g;

// A label may only wrap right AFTER a separator: every other space becomes
// no-break, so "RAG 与 NL2SQL 落地" stays one segment, and a wrapped line
// ends on "·" or "/" instead of opening the next line with one.
const NBSP = String.fromCharCode(0xa0);
// An en dash is a break-AFTER character in the line-breaking rules, so even
// with no-break spaces around it "Aug 2022 –" could end a line and leave
// "Apr 2023" on the next. A word joiner after it removes that opportunity.
const WJ = String.fromCharCode(0x2060);
const glueSeparators = (s) =>
    s
        .split(/ ([·/]) /)
        .map((part, i) => (i % 2 ? `${NBSP}${part} ` : part.split(" ").join(NBSP).split("–").join(`–${WJ}`)))
        .join("");

// Latin runs → .lat spans (zh only). Returns an array of nodes or a string.
function trackRuns(text, keyBase) {
    if (!isZh) return text;
    const out = [];
    let last = 0;
    // exec loop rather than matchAll / replaceAll: this path only runs on
    // /zh, whose audience arrives largely inside WeChat's WebView, and older
    // builds of it predate both (Chrome 73 / 85).
    const re = new RegExp(LATIN_RUN.source, "g");
    let m;
    while ((m = re.exec(text)) !== null) {
        if (m.index > last) out.push(text.slice(last, m.index));
        out.push(<span key={`${keyBase}-${m.index}`} className="lat">{m[0]}</span>);
        last = m.index + m[0].length;
    }
    if (out.length === 0) return text;
    if (last < text.length) out.push(text.slice(last));
    return out;
}

/**
 * A label split on " · " renders as .seg / .sep elements: on a wide screen
 * they read as one line, and below sm the zh/en CSS stacks the segments and
 * drops the dots, so a phone never shows a line ending in a stranded "·".
 * One wrapper always: .ed-eyebrow is a flex row (its leading rule is a
 * ::before), so bare siblings would each become a flex item and wrap
 * independently.
 */
export function mixedTrack(input) {
    if (typeof input !== "string") return input;
    const parts = glueSeparators(input).split(`${NBSP}·${" "}`);
    if (parts.length === 1) {
        const runs = trackRuns(parts[0], "r");
        return typeof runs === "string" ? runs : <span>{runs}</span>;
    }
    return (
        <span className="mt-segs">
            {parts.map((part, i) => (
                <span key={part} className="seg">
                    {i > 0 && <span className="sep" aria-hidden="true">{" · "}</span>}
                    {trackRuns(part, `s${i}`)}
                </span>
            ))}
        </span>
    );
}
