// E.D. assistant — message assembly, LLM call, and TTS synthesis.
// Same adapter discipline as _jd/llm.js: injectable client for tests,
// typed LLMError so the handler maps failures to safe client responses.
/* eslint-env node */

import OpenAI from "openai";
import { LLMError } from "../_jd/llm.js";
import { PERSONA } from "./persona.js";

// E.D. runs a smarter default than the JD matcher: personality + style
// adherence live or die on instruction-following, and gpt-4.1-mini is a
// clear step up from 4o-mini there while a reply still costs ~$0.001.
// Override with OPENAI_ASK_MODEL without touching the matcher's model.
const MODEL_NAME =
  process.env.OPENAI_ASK_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini";
const TTS_MODEL = "tts-1";
const TTS_VOICE = "onyx";

export const LIMITS = {
  question: 600,     // chars per question
  historyTurns: 8,   // most recent turns kept
  historyChars: 600, // chars per stored turn
  answerTokens: 320,
  ttsChars: 800,     // synthesis cap — keeps cost bounded
};

/**
 * Clamp + shape the client-supplied history into safe chat messages.
 * Arbitrary input tolerated: non-arrays, junk roles and oversized
 * content are dropped/truncated rather than trusted.
 */
export function buildMessages(question, history) {
  const turns = (Array.isArray(history) ? history : [])
    .filter(
      (t) =>
        t &&
        (t.role === "user" || t.role === "assistant") &&
        typeof t.content === "string" &&
        t.content.trim()
    )
    .slice(-LIMITS.historyTurns)
    .map((t) => ({
      role: t.role,
      content: t.content.slice(0, LIMITS.historyChars),
    }));

  return [
    { role: "system", content: PERSONA },
    ...turns,
    {
      role: "user",
      content: String(question).slice(0, LIMITS.question),
    },
  ];
}

/** Ask E.D. — returns the answer text. `client` injectable for tests. */
export async function callAsk(question, history, client) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new LLMError("OPENAI_API_KEY is not set on the server", {
      status: 500,
      code: "missing_api_key",
    });
  }
  const oa = client || new OpenAI({ apiKey, timeout: 15_000, maxRetries: 2 });

  let completion;
  try {
    completion = await oa.chat.completions.create({
      model: MODEL_NAME,
      temperature: 0.7, // room for personality; facts stay pinned by the persona
      max_tokens: LIMITS.answerTokens,
      messages: buildMessages(question, history),
    });
  } catch (err) {
    const status = err?.status;
    if (status === 429) {
      throw new LLMError("E.D. is at capacity — try again in a moment.", { status: 429, code: "rate_limited" });
    }
    if (err?.name === "APIConnectionTimeoutError" || /timeout/i.test(err?.message || "")) {
      throw new LLMError("E.D. took too long to think. Please try again.", { status: 504, code: "timeout" });
    }
    if (typeof status === "number" && status >= 500) {
      throw new LLMError("E.D.'s core is temporarily unreachable.", { status: 503, code: "upstream_unavailable" });
    }
    if (status === 401 || status === 403) {
      throw new LLMError("AI service authentication failed.", { status: 500, code: "auth" });
    }
    throw new LLMError("Could not reach E.D.'s core. Please try again.", { status: 502, code: "connection" });
  }

  const answer = completion.choices?.[0]?.message?.content?.trim();
  if (!answer) {
    throw new LLMError("E.D. returned an empty response. Please try again.", { status: 502, code: "bad_response" });
  }
  return answer;
}

/**
 * Give the answer a voice — OpenAI TTS on the SAME api key. Returns a
 * base64 mp3, or null on failure (voice is an enhancement, never a
 * blocker: the text answer already succeeded).
 */
export async function synthesize(text, client) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const oa = client || new OpenAI({ apiKey, timeout: 20_000, maxRetries: 1 });
  try {
    const res = await oa.audio.speech.create({
      model: TTS_MODEL,
      voice: TTS_VOICE,
      input: text.slice(0, LIMITS.ttsChars),
      response_format: "mp3",
    });
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.toString("base64");
  } catch {
    return null;
  }
}
