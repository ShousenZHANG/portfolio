/**
 * Locale resolution — one read, at module scope, never again.
 *
 * The site ships as two static HTML entries (/ and /zh) that load the same
 * bundle; the entry's <html lang> attribute is the single source of truth.
 * Reading it once here (instead of React context) is deliberate: the locale
 * cannot change within a page's lifetime — switching language navigates to
 * the other entry — so threading it through context would buy re-render
 * plumbing for a value that never changes.
 *
 * Reading <html lang> rather than location.pathname keeps this working under
 * any future routing shape (a rewrite, a preview URL, a saved-to-disk copy).
 */
export const locale = (typeof document !== "undefined" &&
    document.documentElement.lang.toLowerCase().startsWith("zh"))
    ? "zh"
    : "en";

export const isZh = locale === "zh";

/** Path of the "other" language's entry — used by the navbar switch. */
export const altHref = isZh ? "/" : "/zh";
