// JD Evaluator — orchestrates LLM call + deterministic scoring.
/* eslint-env node */

import { callOpenAIJD } from "./llm.js";
import { scoreJD } from "./scoring.js";

/**
 * Evaluate a JD against a CV. Returns a flat JDScore.
 * Throws if the LLM is misconfigured or returns unrecoverable garbage.
 */
export async function evaluateJD(jd, cvText) {
  const rawLLM = await callOpenAIJD(jd, cvText);
  return scoreJD(rawLLM);
}
