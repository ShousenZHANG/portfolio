// HTTP handler for JD evaluation. Thin: rate-limit, parse body, delegate, respond.
/* eslint-env node */

import { evaluateJD } from "./_jd/evaluator.js";
import { consume, clientKey, RATE_LIMIT_CONFIG } from "./_jd/rateLimit.js";

const MAX_BODY_SIZE = 1_000_000;
const isProd = process.env.NODE_ENV === "production";

function logError(...args) {
  if (!isProd) console.error(...args);
}

function send(res, status, payload, headers = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      if (data.length + chunk.length > MAX_BODY_SIZE) {
        req.destroy();
        reject(new Error("Payload too large"));
        return;
      }
      data += chunk;
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return send(res, 405, { error: "Only POST is allowed" });
  }

  const limit = consume(clientKey(req));
  if (!limit.ok) {
    return send(
      res,
      429,
      {
        error: `Too many requests. Try again in ${Math.ceil(limit.retryAfterMs / 1000)}s.`,
      },
      {
        "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)),
        "X-RateLimit-Limit": String(RATE_LIMIT_CONFIG.MAX_REQUESTS),
        "X-RateLimit-Remaining": "0",
      }
    );
  }

  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    logError("Error parsing body:", err);
    return send(res, 400, { error: "Invalid JSON body" });
  }

  const { jd, cvText } = body || {};
  if (typeof jd !== "string" || typeof cvText !== "string" || !jd.trim() || !cvText.trim()) {
    return send(res, 400, { error: "jd and cvText are required" });
  }
  // Bound input length — protects Gemini token quota from abuse and caps
  // the prompt-injection surface. Hard limits, not silent truncation.
  const MAX_JD = 12_000;
  const MAX_CV = 24_000;
  if (jd.length > MAX_JD) {
    return send(res, 413, { error: `Job description is too long (max ${MAX_JD.toLocaleString()} characters).` });
  }
  if (cvText.length > MAX_CV) {
    return send(res, 413, { error: "CV text is too long." });
  }

  try {
    const score = await evaluateJD(jd.trim(), cvText.trim());
    return send(res, 200, score, {
      "X-RateLimit-Limit": String(RATE_LIMIT_CONFIG.MAX_REQUESTS),
      "X-RateLimit-Remaining": String(limit.remaining),
    });
  } catch (err) {
    logError("JD assistant error:", err);
    // LLMError carries a safe status + user-facing message; everything
    // else collapses to a generic 500 (never leak internals to the client).
    if (err && err.name === "LLMError") {
      const status = err.code === "missing_api_key" || err.code === "auth"
        ? 500
        : err.status || 502;
      const clientMsg = err.code === "missing_api_key" || err.code === "auth"
        ? "AI service is not configured. Please contact the site owner."
        : err.message;
      const headers = err.status === 429 ? { "Retry-After": "20" } : {};
      return send(res, status, { error: clientMsg, code: err.code }, headers);
    }
    return send(res, 500, { error: "JD analysis failed. Please try again." });
  }
}
