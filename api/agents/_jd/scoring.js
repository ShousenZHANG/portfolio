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

export function deriveAtsScore(data) {
  const elig = data.eligibility || {};
  const visaStatus = toStatus(elig.visa?.status);
  const expStatus = toStatus(elig.experience?.status);
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

  if (visaStatus === "issue") score -= ELIGIBILITY_PENALTY.visa;
  if (expStatus === "issue") score -= ELIGIBILITY_PENALTY.experience;
  if (locStatus === "issue") score -= ELIGIBILITY_PENALTY.location;

  if (visaStatus === "issue" || expStatus === "issue") {
    score = Math.min(score, ELIGIBILITY_CAP.hardFail);
  } else if (locStatus === "issue") {
    score = Math.min(score, ELIGIBILITY_CAP.locationIssue);
  }

  return Math.round(clampScore(score));
}

export function deriveConfidenceScore(data) {
  const elig = data.eligibility || {};
  const visaStatus = toStatus(elig.visa?.status);
  const expStatus = toStatus(elig.experience?.status);
  const locStatus = toStatus(elig.location?.status);

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

  if (visaStatus === "unknown") confidence -= CONFIDENCE.unknownVisaPenalty;
  if (expStatus === "unknown") confidence -= CONFIDENCE.unknownExpPenalty;
  if (locStatus === "unknown") confidence -= CONFIDENCE.unknownLocPenalty;

  if (visaStatus === "issue") confidence = Math.min(confidence, CONFIDENCE.visaIssueCap);
  if (expStatus === "issue") confidence = Math.min(confidence, CONFIDENCE.expIssueCap);

  return Math.round(clampScore(confidence));
}

export function deriveFitLabel(data, atsScore) {
  const elig = data.eligibility || {};
  const visaStatus = toStatus(elig.visa?.status);
  const expStatus = toStatus(elig.experience?.status);

  if (visaStatus === "issue" || expStatus === "issue") return "Not a fit";
  if (atsScore >= FIT_THRESHOLDS.strong) return "Strong match";
  if (atsScore >= FIT_THRESHOLDS.good) return "Good match";
  if (atsScore >= FIT_THRESHOLDS.possible) return "Possible match";
  return "Not a fit";
}

export function patchFitTexts(data, atsScore) {
  const elig = data.eligibility || {};
  const visaStatus = toStatus(elig.visa?.status);
  const expStatus = toStatus(elig.experience?.status);

  let fitHeadline = data.fitHeadline || "";
  let fitVerdict = data.fitVerdict || "";

  if (visaStatus === "issue" || expStatus === "issue") {
    if (visaStatus === "issue" && expStatus === "issue") {
      fitHeadline = "Not a fit - visa and experience requirements are not met.";
    } else if (visaStatus === "issue") {
      fitHeadline = "Not a fit - visa/work-rights requirement is not met.";
    } else {
      fitHeadline = "Not a fit - experience requirement is not met.";
    }
    fitVerdict = "Hard eligibility requirements block progression for this JD.";
  } else if (!fitHeadline) {
    if (atsScore >= FIT_THRESHOLDS.strong) fitHeadline = "Strong match for this role.";
    else if (atsScore >= FIT_THRESHOLDS.good) fitHeadline = "Good match for this role.";
    else if (atsScore >= FIT_THRESHOLDS.possible) fitHeadline = "Possible match if requirements are flexible.";
    else fitHeadline = "Not a fit for this role right now.";
  }

  if (!fitVerdict) {
    fitVerdict =
      atsScore >= FIT_THRESHOLDS.good
        ? "Core requirements are mostly aligned with clear delivery evidence."
        : "There are material gaps that require targeted upskilling and stronger evidence.";
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

function defaultEligibility() {
  return {
    visa: { status: "Unknown", note: "" },
    experience: { status: "Unknown", note: "" },
    location: { status: "Unknown", note: "" },
  };
}

/**
 * Pure scoring: takes raw LLM result, produces flat JDScore.
 * Idempotent. No I/O. Safe to call with arbitrary input shape.
 */
export function scoreJD(rawLLM) {
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
    fitHeadline: typeof raw.fitHeadline === "string" ? raw.fitHeadline : "",
    fitVerdict: typeof raw.fitVerdict === "string" ? raw.fitVerdict : "",
    eligibility: { ...defaultEligibility(), ...(raw.eligibility || {}) },
  };

  safe.overallScore = deriveAtsScore(safe);
  safe.confidenceScore =
    typeof raw.confidenceScore === "number"
      ? clampScore(raw.confidenceScore)
      : deriveConfidenceScore(safe);

  safe.fitLabel = deriveFitLabel(safe, safe.overallScore);
  const patched = patchFitTexts(safe, safe.overallScore);
  safe.fitHeadline = patched.fitHeadline;
  safe.fitVerdict = patched.fitVerdict;

  return safe;
}
