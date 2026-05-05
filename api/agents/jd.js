// HTTP handler for JD evaluation. Thin: parse body, delegate, respond.
/* eslint-env node */

import { evaluateJD } from "./_jd/evaluator.js";

const MAX_BODY_SIZE = 1_000_000;

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
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

  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    console.error("Error parsing body:", err);
    return send(res, 400, { error: "Invalid JSON body" });
  }

  const { jd, cvText } = body || {};
  if (!jd || !cvText) {
    return send(res, 400, { error: "jd and cvText are required" });
  }

  try {
    const score = await evaluateJD(jd, cvText);
    return send(res, 200, score);
  } catch (err) {
    console.error("JD assistant error:", err);
    if (err.message === "GEMINI_API_KEY is not set on the server") {
      return send(res, 500, { error: err.message });
    }
    return send(res, 500, { error: "JD analysis failed" });
  }
}
