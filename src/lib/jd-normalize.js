/**
 * Shared JD analysis result normalization.
 * Single source of truth consumed by both JDQuickCheck and JDAssistant.
 */

/**
 * Normalize the raw API response into a consistent shape.
 * All numeric scores are clamped to integers 0-100.
 */
export function normalizeResult(rawData) {
  const data = rawData ?? {};
  const score = data.score ?? {};

  const overall =
    typeof data.overallScore === "number"
      ? data.overallScore
      : typeof score.overall === "number"
        ? score.overall
        : 0;

  const exact =
    typeof data.exactMatchScore === "number"
      ? data.exactMatchScore
      : typeof score.exact === "number"
        ? score.exact
        : 0;

  const related =
    typeof data.relatedMatchScore === "number"
      ? data.relatedMatchScore
      : typeof score.related === "number"
        ? score.related
        : 0;

  const gaps =
    typeof data.gapScore === "number"
      ? data.gapScore
      : typeof score.gaps === "number"
        ? score.gaps
        : 0;

  const confidence =
    typeof data.confidenceScore === "number"
      ? data.confidenceScore
      : typeof score.confidence === "number"
        ? score.confidence
        : 0;

  const matched = data.matched ?? data.matchedKeywords ?? [];
  const relatedItems =
    data.related ??
    (Array.isArray(data.strengths)
      ? data.strengths.map((s) =>
          typeof s === "string" ? { name: s, reason: "" } : s
        )
      : []);
  const gapItems = data.gaps ?? data.missingKeywords ?? [];

  const eligibility = data.eligibility ?? {};

  return {
    score: {
      overall: Math.round(overall),
      exact: Math.round(exact),
      related: Math.round(related),
      gaps: Math.round(gaps),
      confidence: Math.round(confidence),
    },
    dimensionScores: data.dimensionScores ?? null,
    evidencePairs: Array.isArray(data.evidencePairs) ? data.evidencePairs : [],
    riskFlags: Array.isArray(data.riskFlags) ? data.riskFlags : [],
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    matched,
    related: relatedItems,
    gaps: gapItems,
    summary: data.summary ?? "",
    fitLabel: data.fitLabel ?? "",
    fitHeadline: data.fitHeadline ?? "",
    fitVerdict: data.fitVerdict ?? "",
    eligibility: {
      visa: eligibility.visa ?? null,
      experience: eligibility.experience ?? null,
      location: eligibility.location ?? null,
    },
  };
}

/**
 * Format an eligibility item into a plain-text string.
 * @returns {string} e.g. "Visa: OK (Full work rights)" or "-"
 */
export function formatEligibilityText(item, label) {
  if (!item || !item.status) return "-";
  const note = item.note ? ` (${item.note})` : "";
  return `${label}: ${item.status}${note}`;
}

/**
 * Resolve the display color and icon for an eligibility status.
 * @returns {{ icon: string, color: string }}
 */
export function eligibilityStyle(status) {
  const s = (status ?? "").toLowerCase();
  if (s === "ok") return { icon: "\u2714", color: "text-emerald-300" };
  if (s === "issue") return { icon: "\u26A0", color: "text-amber-300" };
  return { icon: "\u2022", color: "text-neutral-300" };
}
