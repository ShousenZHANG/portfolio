# Portfolio

Personal portfolio site for Eddy Zhang. Single-tenant: the candidate is always Eddy. The non-trivial domain lives in the JD matching feature, which evaluates a pasted Job Description against Eddy's CV.

## Language

### JD matching

**JD**:
A Job Description — recruiter-pasted free text describing a role's requirements.
_Avoid_: posting, listing, role description.

**CV**:
The candidate's resume in plain text. Stored at `public/cv/main.txt` and fetched at runtime. Single source.
_Avoid_: resume, profile.

**Candidate Rules**:
Hard facts about Eddy that the evaluator must respect — visa cutoff, work-rights status, location. Hardcoded as a named constant; this is a single-tenant site, not a SaaS.
_Avoid_: candidate config, user preferences.

**JD Evaluation**:
The act of analyzing a **JD** against the **CV** and **Candidate Rules** to produce a **JD Score**.
_Avoid_: matching, analysis, screening.

**JD Evaluator**:
The module that performs **JD Evaluation**. Orchestrates **LLM Adapter** + **Scoring**.
_Avoid_: matcher, analyzer, agent.

**LLM Adapter**:
The module that calls Gemini, repairs malformed JSON, and returns a parsed `RawJDLLMResult`. Owns prompt construction.
_Avoid_: AI client, LLM service.

**Scoring**:
Pure-function module that takes a `RawJDLLMResult` and produces the final `JDScore`. Deterministic; no I/O. Knows the weights, thresholds, and eligibility caps.
_Avoid_: ranker, calculator.

**JD Score**:
The deterministic output of **JD Evaluation**. Flat shape: `overallScore`, `exactMatchScore`, `relatedMatchScore`, `gapScore`, `confidenceScore`, `dimensionScores`, `eligibility`, `fitLabel`, `fitHeadline`, `fitVerdict`, `evidencePairs`, `matchedKeywords`, `missingKeywords`, `related`, `riskFlags`, `summary`, `strengths`, `gaps`, `suggestions`.
_Avoid_: result, response, match score (too generic).

**Eligibility**:
Three hard-pass/fail flags inside a **JD Score** — `visa`, `experience`, `location`. Each carries `status` (`OK | Issue | Unknown`) plus a short note. An `Issue` on visa or experience caps `overallScore` at 35.
_Avoid_: gating, requirements check.

**Fit Label**:
A four-level recruiter-facing verdict derived from `overallScore` and **Eligibility** — `Strong match | Good match | Possible match | Not a fit`.
_Avoid_: rating, grade.

**Evidence Pair**:
A `(jdText, cvText, type, note)` quad showing where the **LLM Adapter** found exact or related overlap. The audit trail behind a **JD Score**.
_Avoid_: match, citation.

## Relationships

- A **JD Evaluation** consumes one **JD** + the **CV** + **Candidate Rules** and produces one **JD Score**
- A **JD Evaluator** composes one **LLM Adapter** call and one **Scoring** call
- A **JD Score** contains one **Eligibility** + one **Fit Label** + zero or more **Evidence Pair**s
- The **CV** is shared across all **JD Evaluation**s (single-tenant)
- **Candidate Rules** are referenced inside the prompt the **LLM Adapter** builds, and inside **Scoring** for eligibility caps

## Example dialogue

> **Dev:** "If the **LLM Adapter** returns malformed JSON, does **Scoring** have to handle that?"
> **Domain expert:** "No — the **LLM Adapter** owns repair. **Scoring** assumes a parsed `RawJDLLMResult`. If repair fails completely, the **LLM Adapter** raises; the handler returns 500."

> **Dev:** "Where do the weights `0.42 / 0.18 / 0.15 / 0.25` live?"
> **Domain expert:** "Inside **Scoring**, named constants. They're the deterministic part; we don't trust the LLM's `overallScore`."

> **Dev:** "Can a **JD Score** with `Eligibility.visa = Issue` ever return `Fit Label = Strong match`?"
> **Domain expert:** "No. **Scoring** caps `overallScore` at 35 when visa or experience is `Issue`, which forces `Fit Label = Not a fit`."

## Flagged ambiguities

- "match score" used in early versions to mean both `overallScore` and `exactMatchScore` — resolved: use the explicit field name. The umbrella term is **JD Score**, which is the whole object.
- "agent" appears in the file path `api/agents/jd.js` but the evaluator is not an autonomous agent — it's a deterministic orchestrator over one LLM call. Path kept for URL stability; concept is **JD Evaluator**.
