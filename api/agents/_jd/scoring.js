// Scoring — pure function. Takes RawJDLLMResult, returns JDScore.
// Knows weights, thresholds, eligibility caps. No I/O.
/* eslint-env node */

const WEIGHTS = {
  exact: 0.42,
  related: 0.18,
  keywordCoverage: 0.15,
  dimensionAvg: 0.25,
  gapPenalty: 0.20,
};

const FIT_THRESHOLDS = {
  strong: 82,
  good: 68,
  possible: 50,
};

const ELIGIBILITY_PENALTY = {
  visa: 35,
  experience: 25,
  location: 10,
};

const ELIGIBILITY_CAP = {
  hardFail: 35,
  locationIssue: 75,
};

// Which eligibility axes can HARD-FAIL a match, per locale. This is config,
// not scattered conditionals, because the axes genuinely differ by market:
// the mainland page has no visa dimension at all, and leaving the slot in
// place would default it to "Unknown" and quietly dock every Chinese result
// 10 confidence points forever.
const HARD_AXES = {
  en: ["visa", "experience"],
  zh: ["experience"],
};

// Axes that produce an "Unknown" confidence penalty, per locale — same reason.
const UNKNOWN_PENALTY_AXES = {
  en: ["visa", "experience", "location"],
  zh: ["experience", "location"],
};

const CONFIDENCE = {
  base: 45,
  coverageWeight: 30,
  evidenceCap: 15,
  evidencePerItem: 3,
  relatedCap: 8,
  relatedPerItem: 2,
  unknownVisaPenalty: 10,
  unknownExpPenalty: 8,
  unknownLocPenalty: 5,
  visaIssueCap: 40,
  expIssueCap: 45,
};

const LIMITS = {
  matchedKeywords: 20,
  missingKeywords: 20,
  related: 20,
  riskFlags: 10,
  strengths: 10,
  gaps: 10,
  suggestions: 10,
  evidencePairs: 10,
  evidenceTextLen: 180,
  evidenceNoteLen: 220,
};

export function clampScore(x) {
  if (typeof x !== "number" || Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(100, x));
}

function asArray(v) {
  return Array.isArray(v) ? v : [];
}

function toStatus(v) {
  return v ? String(v).trim().toLowerCase() : "unknown";
}

function axes(map, locale) {
  return map[locale] || map.en;
}

/** Statuses of the axes that can hard-fail, for this locale. */
function issuedHardAxes(data, locale) {
  const elig = data.eligibility || {};
  return axes(HARD_AXES, locale).filter((a) => toStatus(elig[a]?.status) === "issue");
}

export function normalizeDimensionScores(data) {
  const d = data?.dimensionScores || {};
  const exact = clampScore(data?.exactMatchScore ?? 0);
  const related = clampScore(data?.relatedMatchScore ?? 0);
  return {
    techStack: clampScore(d.techStack ?? exact),
    responsibilities: clampScore(
      d.responsibilities ?? Math.round((exact + related) / 2)
    ),
    domainContext: clampScore(d.domainContext ?? related),
    seniority: clampScore(
      d.seniority ?? Math.round(exact * 0.7 + related * 0.3)
    ),
    tooling: clampScore(d.tooling ?? related),
  };
}

export function deriveAtsScore(data, locale = "en") {
  const elig = data.eligibility || {};
  const hardIssues = issuedHardAxes(data, locale);
  const locStatus = toStatus(elig.location?.status);

  const matched = asArray(data.matchedKeywords).length;
  const missing = asArray(data.missingKeywords).length;
  const totalKeywords = matched + missing || 1;
  const keywordCoverage = (matched / totalKeywords) * 100;

  const exact = clampScore(data.exactMatchScore ?? keywordCoverage);
  const related = clampScore(data.relatedMatchScore ?? 0);
  const gap = clampScore(data.gapScore ?? 0);

  const dims = normalizeDimensionScores(data);
  const dimensionAvg =
    (dims.techStack +
      dims.responsibilities +
      dims.domainContext +
      dims.seniority +
      dims.tooling) /
    5;

  let score =
    WEIGHTS.exact * exact +
    WEIGHTS.related * related +
    WEIGHTS.keywordCoverage * keywordCoverage +
    WEIGHTS.dimensionAvg * dimensionAvg;

  score -= gap * WEIGHTS.gapPenalty;

  for (const axis of hardIssues) score -= ELIGIBILITY_PENALTY[axis];
  if (locStatus === "issue") score -= ELIGIBILITY_PENALTY.location;

  if (hardIssues.length > 0) {
    score = Math.min(score, ELIGIBILITY_CAP.hardFail);
  } else if (locStatus === "issue") {
    score = Math.min(score, ELIGIBILITY_CAP.locationIssue);
  }

  return Math.round(clampScore(score));
}

// Hard-eligibility caps on confidence. Applied to BOTH the derived value and
// any LLM-supplied confidenceScore, so a hallucinated / prompt-injected "95"
// on a visa-Issue JD can never survive — the "don't trust the LLM" invariant.
export function applyConfidenceCaps(data, confidence, locale = "en") {
  const caps = { visa: CONFIDENCE.visaIssueCap, experience: CONFIDENCE.expIssueCap };
  let c = confidence;
  for (const axis of issuedHardAxes(data, locale)) c = Math.min(c, caps[axis]);
  return Math.round(clampScore(c));
}

export function deriveConfidenceScore(data, locale = "en") {
  const elig = data.eligibility || {};

  const matched = asArray(data.matchedKeywords).length;
  const missing = asArray(data.missingKeywords).length;
  const evidenceCount = asArray(data.evidencePairs).length;
  const relatedCount = asArray(data.related).length;

  const totalKeywords = matched + missing || 1;
  const coverage = matched / totalKeywords;

  let confidence = CONFIDENCE.base;
  confidence += coverage * CONFIDENCE.coverageWeight;
  confidence += Math.min(CONFIDENCE.evidenceCap, evidenceCount * CONFIDENCE.evidencePerItem);
  confidence += Math.min(CONFIDENCE.relatedCap, relatedCount * CONFIDENCE.relatedPerItem);

  const unknownPenalty = {
    visa: CONFIDENCE.unknownVisaPenalty,
    experience: CONFIDENCE.unknownExpPenalty,
    location: CONFIDENCE.unknownLocPenalty,
  };
  for (const axis of axes(UNKNOWN_PENALTY_AXES, locale)) {
    if (toStatus(elig[axis]?.status) === "unknown") confidence -= unknownPenalty[axis];
  }

  return applyConfidenceCaps(data, confidence, locale);
}

/**
 * The locale-free verdict key. The frontend colours the gauge from THIS, not
 * from fitLabel: prefix-matching a display string ("Strong…") silently turned
 * every result red the moment the label was not English.
 */
export function deriveFitKey(data, atsScore, locale = "en") {
  if (issuedHardAxes(data, locale).length > 0) return "none";
  if (atsScore >= FIT_THRESHOLDS.strong) return "strong";
  if (atsScore >= FIT_THRESHOLDS.good) return "good";
  if (atsScore >= FIT_THRESHOLDS.possible) return "possible";
  return "none";
}

const FIT_LABELS = {
  en: { strong: "Strong match", good: "Good match", possible: "Possible match", none: "Not a fit" },
  zh: { strong: "高度匹配", good: "较为匹配", possible: "可以一谈", none: "不匹配" },
};

export function deriveFitLabel(data, atsScore, locale = "en") {
  const labels = FIT_LABELS[locale] || FIT_LABELS.en;
  return labels[deriveFitKey(data, atsScore, locale)];
}

// Canned verdicts, per locale. The zh set has no visa arm — that axis does
// not exist on the mainland page — and its character budgets are roughly half
// the English ones, because a Chinese sentence carrying the same content is
// about half as long and the UI slot is the same width.
const FIT_TEXTS = {
  en: {
    hardFail: {
      "visa+experience": "Not a fit - visa and experience requirements are not met.",
      visa: "Not a fit - visa/work-rights requirement is not met.",
      experience: "Not a fit - experience requirement is not met.",
    },
    hardFailVerdict: "Hard eligibility requirements block progression for this JD.",
    byScore: {
      strong: "Strong match for this role.",
      good: "Good match for this role.",
      possible: "Possible match if requirements are flexible.",
      none: "Not a fit for this role right now.",
    },
    verdictGood: "Core requirements are mostly aligned with clear delivery evidence.",
    verdictWeak: "There are material gaps that require targeted upskilling and stronger evidence.",
  },
  zh: {
    hardFail: {
      experience: "硬性年限要求未达到。",
    },
    hardFailVerdict: "该岗位存在硬性门槛未满足,不建议投递。",
    byScore: {
      strong: "与该岗位高度匹配。",
      good: "与该岗位较为匹配。",
      possible: "若要求可放宽,可以一谈。",
      none: "目前与该岗位不匹配。",
    },
    verdictGood: "核心要求基本对得上,且有可查证的交付记录。",
    verdictWeak: "存在实质差距,需要针对性补齐并拿出更硬的证据。",
  },
};

export function patchFitTexts(data, atsScore, locale = "en") {
  const t = FIT_TEXTS[locale] || FIT_TEXTS.en;
  const hardIssues = issuedHardAxes(data, locale);

  let fitHeadline = data.fitHeadline || "";
  let fitVerdict = data.fitVerdict || "";

  if (hardIssues.length > 0) {
    // Key on the joined axis list so a multi-axis failure names both.
    const key = hardIssues.join("+");
    fitHeadline = t.hardFail[key] || t.hardFail[hardIssues[0]] || t.byScore.none;
    fitVerdict = t.hardFailVerdict;
  } else if (!fitHeadline) {
    fitHeadline = t.byScore[deriveFitKey(data, atsScore, locale)];
  }

  if (!fitVerdict) {
    fitVerdict = atsScore >= FIT_THRESHOLDS.good ? t.verdictGood : t.verdictWeak;
  }

  return { fitHeadline, fitVerdict };
}

function normalizeEvidencePairs(value) {
  return asArray(value)
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      type: item.type === "exact" ? "exact" : "related",
      jdText: String(item.jdText || "").slice(0, LIMITS.evidenceTextLen),
      cvText: String(item.cvText || "").slice(0, LIMITS.evidenceTextLen),
      note: String(item.note || "").slice(0, LIMITS.evidenceNoteLen),
    }))
    .filter((item) => item.jdText || item.cvText)
    .slice(0, LIMITS.evidencePairs);
}

function defaultEligibility(locale = "en") {
  // zh omits visa entirely rather than defaulting it to Unknown: an axis that
  // is always Unknown is an axis that always costs confidence.
  const base = {
    experience: { status: "Unknown", note: "" },
    location: { status: "Unknown", note: "" },
  };
  return locale === "zh" ? base : { visa: { status: "Unknown", note: "" }, ...base };
}

/**
 * Pure scoring: takes raw LLM result, produces flat JDScore.
 * Idempotent. No I/O. Safe to call with arbitrary input shape.
 */
export function scoreJD(rawLLM, locale = "en") {
  const raw = rawLLM && typeof rawLLM === "object" ? rawLLM : {};

  const safe = {
    overallScore: 0,
    exactMatchScore: clampScore(raw.exactMatchScore),
    relatedMatchScore: clampScore(raw.relatedMatchScore),
    gapScore: clampScore(raw.gapScore),
    confidenceScore: 0,
    dimensionScores: normalizeDimensionScores(raw),
    matchedKeywords: asArray(raw.matchedKeywords).slice(0, LIMITS.matchedKeywords),
    missingKeywords: asArray(raw.missingKeywords).slice(0, LIMITS.missingKeywords),
    related: asArray(raw.related).slice(0, LIMITS.related),
    riskFlags: asArray(raw.riskFlags).slice(0, LIMITS.riskFlags),
    strengths: asArray(raw.strengths).slice(0, LIMITS.strengths),
    gaps: asArray(raw.gaps).slice(0, LIMITS.gaps),
    suggestions: asArray(raw.suggestions).slice(0, LIMITS.suggestions),
    evidencePairs: normalizeEvidencePairs(raw.evidencePairs),
    summary: typeof raw.summary === "string" ? raw.summary : "",
    fitLabel: "",
    fitKey: "none",
    fitHeadline: typeof raw.fitHeadline === "string" ? raw.fitHeadline : "",
    fitVerdict: typeof raw.fitVerdict === "string" ? raw.fitVerdict : "",
    eligibility: { ...defaultEligibility(locale), ...(raw.eligibility || {}) },
  };

  safe.overallScore = deriveAtsScore(safe, locale);
  // An LLM-supplied confidenceScore is still subject to the eligibility caps —
  // never trusted verbatim past a visa/experience Issue.
  safe.confidenceScore =
    typeof raw.confidenceScore === "number"
      ? applyConfidenceCaps(safe, clampScore(raw.confidenceScore), locale)
      : deriveConfidenceScore(safe, locale);

  safe.fitKey = deriveFitKey(safe, safe.overallScore, locale);
  safe.fitLabel = deriveFitLabel(safe, safe.overallScore, locale);
  const patched = patchFitTexts(safe, safe.overallScore, locale);
  safe.fitHeadline = patched.fitHeadline;
  safe.fitVerdict = patched.fitVerdict;

  return safe;
}
