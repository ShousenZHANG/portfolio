<!-- Generated: 2026-04-03 | Files scanned: 2 | Token estimate: ~550 -->

# Backend

## API Routes

```
POST /api/agents/jd -> handler() in api/agents/jd.js
  Input:  { jd: string, cvText: string }
  Output: normalized scoring JSON (see schema below)
  Auth:   none (public endpoint)
  Model:  Google Gemini (GEMINI_MODEL env, default "gemini-2.5-flash-lite")
```

No other API routes exist. Contact form uses client-side EmailJS.

## Request Pipeline

```
handler(req, res)
  1. Method check (POST only, 405 otherwise)
  2. GEMINI_API_KEY env check (500 if missing)
  3. readBody(req) — streaming JSON parser, 1MB max
  4. Validate jd + cvText present (400 if missing)
  5. buildPrompt(jd, cvText) — structured prompt with JSON schema
  6. Gemini generateContent() call
  7. Strip markdown fences from response
  8. JSON.parse with fallback extraction (find first { to last })
  9. Normalize all fields:
     - clampScore(0-100) on all numeric scores
     - normalizeDimensionScores() with fallback calculations
     - normalizeEvidencePairs() — truncate, filter, cap at 10
     - Slice arrays to max lengths (keywords: 20, risks/strengths/gaps: 10)
  10. Recompute deterministic scores:
      - deriveAtsScore()        — weighted formula, eligibility penalties
      - deriveConfidenceScore() — coverage + evidence + eligibility
      - deriveFitLabel()        — threshold-based label from ATS score
      - patchFitTexts()         — override headline/verdict on hard failures
  11. Return JSON response
```

## Scoring Formula (deriveAtsScore)

```
score = 0.42 * exactMatch
      + 0.18 * relatedMatch
      + 0.15 * keywordCoverage
      + 0.25 * dimensionAvg
      - 0.20 * gapScore

Penalties:
  visa=issue    → -35, cap at 35
  exp=issue     → -25, cap at 35
  location=issue → -10, cap at 75
```

## Exported Functions (testable)

| Function | Purpose |
|----------|---------|
| `buildPrompt(jd, cvText)` | Constructs Gemini prompt |
| `clampScore(x)` | Clamp number to 0-100 |
| `normalizeDimensionScores(data)` | Fill missing dimensions with fallbacks |
| `deriveAtsScore(data)` | Weighted composite score |
| `deriveConfidenceScore(data)` | Evidence-based confidence |
| `deriveFitLabel(data, atsScore)` | Categorical label |
| `patchFitTexts(data, atsScore)` | Override headline/verdict |

## Tests

`test/api/jdPrompt.test.mjs` — Node built-in test runner (`node:test` + `node:assert/strict`)
- Verifies prompt includes required scoring fields
- Verifies confidence score caps on visa eligibility issues
