// Speech-to-text for E.D. Accepts a base64 audio clip, returns text.
//
// The browser's Web Speech API was the previous engine: free, but it ships
// audio to the vendor's own servers, drops connections mid-sentence, and
// only really works in Chrome. Server-side transcription is browser-
// agnostic, far more accurate, and costs ~$0.003/min on the same key.
/* eslint-env node */

import OpenAI from "openai";
import { LLMError } from "./_jd/llm.js";
import { consume, clientKey } from "./_jd/rateLimit.js";

// ~60s of Opus/WebM audio; base64 inflates by ~4/3.
const MAX_BODY_SIZE = 4_000_000;
const MODEL = process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe";
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

/** Transcribe a clip. `client` injectable for tests. */
export async function transcribeClip(buffer, mimeType, client, language) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new LLMError("OPENAI_API_KEY is not set on the server", {
      status: 500,
      code: "missing_api_key",
    });
  }
  const oa = client || new OpenAI({ apiKey, timeout: 30_000, maxRetries: 1 });
  const ext = mimeType?.includes("mp4") ? "mp4" : mimeType?.includes("ogg") ? "ogg" : "webm";
  try {
    const res = await oa.audio.transcriptions.create({
      model: MODEL,
      file: await OpenAI.toFile(buffer, `clip.${ext}`, { type: mimeType || "audio/webm" }),
      // A language hint stops the model auto-detecting per clip — without it,
      // short Mandarin clips from the /zh page frequently mis-transcribe.
      ...(language ? { language } : {}),
    });
    return (res?.text || "").trim();
  } catch (err) {
    const status = err?.status;
    if (status === 429) {
      throw new LLMError("Transcription is busy — try again in a moment.", { status: 429, code: "rate_limited" });
    }
    if (status === 401 || status === 403) {
      throw new LLMError("AI service authentication failed.", { status: 500, code: "auth" });
    }
    throw new LLMError("Couldn't turn that clip into text. Try typing instead.", { status: 502, code: "transcribe_failed" });
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return send(res, 405, { error: "Only POST is allowed" });
  }

  // Shares the visitor's E.D. budget: one bucket for the whole feature.
  const limit = consume(`ask:${clientKey(req)}`);
  if (!limit.ok) {
    return send(res, 429, { error: "E.D. is at capacity. Try again shortly." }, {
      "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)),
    });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    logError("transcribe: body error:", err);
    return send(res, 413, { error: "Clip is too long — keep it under a minute." });
  }

  const { audio, mimeType, language: rawLanguage } = body || {};
  if (typeof audio !== "string" || !audio) {
    return send(res, 400, { error: "audio is required" });
  }
  // Allowlisted ISO 639-1 hints only — never pass client input through raw.
  const language = rawLanguage === "zh" || rawLanguage === "en" ? rawLanguage : undefined;

  try {
    const buffer = Buffer.from(audio, "base64");
    if (!buffer.length) return send(res, 400, { error: "audio is empty" });
    const text = await transcribeClip(buffer, mimeType, undefined, language);
    return send(res, 200, { text });
  } catch (err) {
    logError("transcribe error:", err);
    if (err && err.name === "LLMError") {
      const status = err.code === "missing_api_key" || err.code === "auth" ? 500 : err.status || 502;
      const clientMsg = err.code === "missing_api_key" || err.code === "auth"
        ? "Voice input isn't configured. Typing works fine."
        : err.message;
      return send(res, status, { error: clientMsg, code: err.code });
    }
    return send(res, 500, { error: "Transcription failed. Try typing instead." });
  }
}
