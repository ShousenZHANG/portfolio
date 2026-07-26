// HTTP handler for E.D. (ask-me-anything). Thin: rate-limit, validate,
// delegate to the assistant, respond. Mirrors agents/jd.js.
/* eslint-env node */

import { callAsk, synthesize, LIMITS } from "./_ask/assistant.js";
import { consume, clientKey, RATE_LIMIT_CONFIG } from "./_jd/rateLimit.js";

const MAX_BODY_SIZE = 64_000;
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

  // Separate bucket from the JD matcher so one feature can't starve the
  // other for the same visitor.
  const limit = consume(`ask:${clientKey(req)}`);
  if (!limit.ok) {
    return send(
      res,
      429,
      { error: `E.D. is at capacity. Try again in ${Math.ceil(limit.retryAfterMs / 1000)}s.` },
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
    logError("ask: body parse error:", err);
    return send(res, 400, { error: "Invalid JSON body" });
  }

  const { question, history, voice } = body || {};
  if (typeof question !== "string" || !question.trim()) {
    return send(res, 400, { error: "question is required" });
  }
  if (question.length > LIMITS.question) {
    return send(res, 413, { error: `Question is too long (max ${LIMITS.question} characters).` });
  }

  try {
    const answer = await callAsk(question.trim(), history);
    // Voice is best-effort: a TTS failure must never sink the answer.
    const audio = voice === true ? await synthesize(answer) : null;
    return send(res, 200, { answer, audio }, {
      "X-RateLimit-Limit": String(RATE_LIMIT_CONFIG.MAX_REQUESTS),
      "X-RateLimit-Remaining": String(limit.remaining),
    });
  } catch (err) {
    logError("ask error:", err);
    if (err && err.name === "LLMError") {
      const status = err.code === "missing_api_key" || err.code === "auth"
        ? 500
        : err.status || 502;
      const clientMsg = err.code === "missing_api_key" || err.code === "auth"
        ? "E.D.'s core is offline. Reach Eddy directly: eddy.zhang24@gmail.com"
        : err.message;
      const headers = err.status === 429 ? { "Retry-After": "20" } : {};
      return send(res, status, { error: clientMsg, code: err.code }, headers);
    }
    return send(res, 500, { error: "E.D. hit a fault. Please try again." });
  }
}
