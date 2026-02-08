// api/agents/jd.js
/* eslint-env node */

import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const MAX_BODY_SIZE = 1_000_000;

export function buildPrompt(jd, cvText) {
  return `
You are a job-matching assistant for the Australian software engineering market.

You will receive:
1) A Job Description (JD)
2) A candidate CV (plain text)

Your goals:
- Determine hard eligibility first (visa/work rights, experience, location)
- Evaluate match depth with evidence and detailed dimension scores
- Produce recruiter-friendly insights with concrete strengths, gaps, and actions

Critical grounding rules:
- Use ONLY information explicitly present in JD and CV text.
- Do NOT invent projects, tools, years, or certifications.
- If evidence is weak, lower confidenceScore and explain via riskFlags.

IMPORTANT visa/work rights rules:
- Candidate has 485 Graduate Visa with full work rights until 4 Sep 2027.
- If JD explicitly requires "Australian citizen", "citizenship", "PR only", or "must have Australian PR or citizenship",
  set eligibility.visa.status = "Issue" and note the reason.
- If JD only asks for full work rights in Australia (without citizen/PR hard requirement), visa status is "OK".
- If unclear, visa status is "Unknown".

You MUST return valid JSON only.
No markdown, no code fences, no prose outside JSON.
Response must start with "{" and end with "}".

Use EXACTLY this JSON structure:
{
  "overallScore": 0-100,
  "exactMatchScore": 0-100,
  "relatedMatchScore": 0-100,
  "gapScore": 0-100,
  "confidenceScore": 0-100,

  "dimensionScores": {
    "techStack": 0-100,
    "responsibilities": 0-100,
    "domainContext": 0-100,
    "seniority": 0-100,
    "tooling": 0-100
  },

  "fitLabel": "Strong match | Good match | Possible match | Not a fit",
  "fitHeadline": "One short recruiter-facing sentence (<= 90 chars)",
  "fitVerdict": "1-2 short sentences (<= 240 chars total)",

  "eligibility": {
    "visa": {
      "status": "OK | Issue | Unknown",
      "note": "<= 100 chars"
    },
    "experience": {
      "status": "OK | Issue | Unknown",
      "note": "<= 100 chars"
    },
    "location": {
      "status": "OK | Issue | Unknown",
      "note": "<= 100 chars"
    }
  },

  "evidencePairs": [
    {
      "type": "exact | related",
      "jdText": "short exact phrase from JD",
      "cvText": "short exact phrase from CV",
      "note": "why this increases/decreases confidence"
    }
  ],

  "matchedKeywords": ["exact skill/phrase overlap"],
  "related": [
    {
      "name": "JD X -> CV Y",
      "reason": "transferability explanation"
    }
  ],
  "missingKeywords": ["required JD skill not found in CV"],
  "riskFlags": ["clear hiring risks or unknowns"],

  "summary": "2-4 short sentences",
  "strengths": ["recruiter-facing strengths"],
  "gaps": ["main gaps"],
  "suggestions": ["specific actions to improve fit quickly"]
}

Scoring guidance:
- exactMatchScore: direct overlap for required skills/responsibilities
- relatedMatchScore: strong transferability to JD requirements
- gapScore: severity of missing must-haves (higher = more severe gaps)
- confidenceScore: confidence in this assessment based on evidence quality/coverage
- Keep scores internally consistent and evidence-backed.

JD:
---
${jd}

CV:
---
${cvText}
`;
}

export function clampScore(x) {
  if (typeof x !== "number" || Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(100, x));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function toStatus(value) {
  if (!value) return "unknown";
  return String(value).trim().toLowerCase();
}

export function normalizeDimensionScores(data) {
  const d = data?.dimensionScores || {};
  const fallbackExact = clampScore(data?.exactMatchScore ?? 0);
  const fallbackRelated = clampScore(data?.relatedMatchScore ?? 0);

  return {
    techStack: clampScore(d.techStack ?? fallbackExact),
    responsibilities: clampScore(d.responsibilities ?? Math.round((fallbackExact + fallbackRelated) / 2)),
    domainContext: clampScore(d.domainContext ?? fallbackRelated),
    seniority: clampScore(d.seniority ?? Math.round((fallbackExact * 0.7) + (fallbackRelated * 0.3))),
    tooling: clampScore(d.tooling ?? fallbackRelated),
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
  const dimensionAvg = (
    dims.techStack +
    dims.responsibilities +
    dims.domainContext +
    dims.seniority +
    dims.tooling
  ) / 5;

  let score =
    0.42 * exact +
    0.18 * related +
    0.15 * keywordCoverage +
    0.25 * dimensionAvg;

  score -= gap * 0.20;

  if (visaStatus === "issue") score -= 35;
  if (expStatus === "issue") score -= 25;
  if (locStatus === "issue") score -= 10;

  if (visaStatus === "issue" || expStatus === "issue") {
    score = Math.min(score, 35);
  } else if (locStatus === "issue") {
    score = Math.min(score, 75);
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

  let confidence = 45;
  confidence += coverage * 30;
  confidence += Math.min(15, evidenceCount * 3);
  confidence += Math.min(8, relatedCount * 2);

  if (visaStatus === "unknown") confidence -= 10;
  if (expStatus === "unknown") confidence -= 8;
  if (locStatus === "unknown") confidence -= 5;

  if (visaStatus === "issue") confidence = Math.min(confidence, 40);
  if (expStatus === "issue") confidence = Math.min(confidence, 45);

  return Math.round(clampScore(confidence));
}

export function deriveFitLabel(data, atsScore) {
  const elig = data.eligibility || {};
  const visaStatus = toStatus(elig.visa?.status);
  const expStatus = toStatus(elig.experience?.status);

  if (visaStatus === "issue" || expStatus === "issue") {
    return "Not a fit";
  }

  if (atsScore >= 82) return "Strong match";
  if (atsScore >= 68) return "Good match";
  if (atsScore >= 50) return "Possible match";
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
    if (atsScore >= 82) fitHeadline = "Strong match for this role.";
    else if (atsScore >= 68) fitHeadline = "Good match for this role.";
    else if (atsScore >= 50) fitHeadline = "Possible match if requirements are flexible.";
    else fitHeadline = "Not a fit for this role right now.";
  }

  if (!fitVerdict) {
    fitVerdict =
      atsScore >= 68
        ? "Core requirements are mostly aligned with clear delivery evidence."
        : "There are material gaps that require targeted upskilling and stronger evidence.";
  }

  return { fitHeadline, fitVerdict };
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > MAX_BODY_SIZE) {
        if (req.destroy) req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function normalizeEvidencePairs(value) {
  return asArray(value)
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      type: item.type === "exact" ? "exact" : "related",
      jdText: String(item.jdText || "").slice(0, 180),
      cvText: String(item.cvText || "").slice(0, 180),
      note: String(item.note || "").slice(0, 220),
    }))
    .filter((item) => item.jdText || item.cvText)
    .slice(0, 10);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Only POST is allowed" }));
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "GEMINI_API_KEY is not set on the server" }));
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    console.error("Error parsing body:", err);
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Invalid JSON body" }));
    return;
  }

  const { jd, cvText } = body || {};
  if (!jd || !cvText) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "jd and cvText are required" }));
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = buildPrompt(jd, cvText);
    const result = await model.generateContent(prompt);

    let text = (result.response.text() || "{}").trim();

    if (text.startsWith("```")) {
      const firstNewline = text.indexOf("\n");
      const lastFence = text.lastIndexOf("```");
      if (firstNewline !== -1 && lastFence !== -1 && lastFence > firstNewline) {
        text = text.slice(firstNewline + 1, lastFence).trim();
      }
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      console.error("JSON parse error, raw model output:", text);

      const first = text.indexOf("{");
      const last = text.lastIndexOf("}");
      let candidate = "{}";
      if (first !== -1 && last !== -1 && last > first) {
        candidate = text.slice(first, last + 1);
      }

      try {
        parsed = JSON.parse(candidate);
      } catch (err2) {
        console.error("Second JSON parse failed:", err2);
        parsed = {};
      }
    }

    const safe = {
      overallScore: 0,
      exactMatchScore: 0,
      relatedMatchScore: 0,
      gapScore: 0,
      confidenceScore: 0,
      dimensionScores: {
        techStack: 0,
        responsibilities: 0,
        domainContext: 0,
        seniority: 0,
        tooling: 0,
      },
      matchedKeywords: [],
      missingKeywords: [],
      evidencePairs: [],
      riskFlags: [],
      summary: "",
      strengths: [],
      gaps: [],
      suggestions: [],
      related: [],
      ...parsed,
    };

    safe.exactMatchScore = clampScore(safe.exactMatchScore);
    safe.relatedMatchScore = clampScore(safe.relatedMatchScore);
    safe.gapScore = clampScore(safe.gapScore);
    safe.dimensionScores = normalizeDimensionScores(safe);
    safe.evidencePairs = normalizeEvidencePairs(safe.evidencePairs);
    safe.matchedKeywords = asArray(safe.matchedKeywords).slice(0, 20);
    safe.missingKeywords = asArray(safe.missingKeywords).slice(0, 20);
    safe.related = asArray(safe.related).slice(0, 20);
    safe.riskFlags = asArray(safe.riskFlags).slice(0, 10);
    safe.strengths = asArray(safe.strengths).slice(0, 10);
    safe.gaps = asArray(safe.gaps).slice(0, 10);
    safe.suggestions = asArray(safe.suggestions).slice(0, 10);

    safe.overallScore = deriveAtsScore(safe);
    safe.confidenceScore =
      typeof parsed.confidenceScore === "number"
        ? clampScore(parsed.confidenceScore)
        : deriveConfidenceScore(safe);

    safe.fitLabel = deriveFitLabel(safe, safe.overallScore);
    const patched = patchFitTexts(safe, safe.overallScore);
    safe.fitHeadline = patched.fitHeadline;
    safe.fitVerdict = patched.fitVerdict;

    safe.score = {
      overall: safe.overallScore,
      exact: safe.exactMatchScore,
      related: safe.relatedMatchScore,
      gaps: safe.gapScore,
      confidence: safe.confidenceScore,
    };

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(safe));
  } catch (err) {
    console.error("JD assistant error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "JD analysis failed" }));
  }
}
