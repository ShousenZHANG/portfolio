// api/agents/jd.js
/* eslint-env node */

import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const MAX_BODY_SIZE = 1_000_000;

function buildPrompt(jd, cvText) {
    return `
You are a job-matching assistant for the Australian software engineering job market.

You will receive:
1) A Job Description (JD)
2) A candidate CV (plain text)

Your job:
- First, decide if the candidate is ELIGIBLE based on hard requirements:
  * visa / work rights
  * years of experience
  * location (Sydney / remote / other cities)
- Then, estimate how strong the match is based on tech stack and responsibilities.
- Answer in simple, recruiter-friendly English. Be concise.

You MUST respond with valid JSON ONLY.
NO markdown, NO backticks, NO explanation, NO code fences.
The output must START with "{" and END with "}" and use EXACTLY this structure:

{
  "overallScore": 0-100,
  "exactMatchScore": 0-100,
  "relatedMatchScore": 0-100,
  "gapScore": 0-100,

  "fitLabel": "Strong match | Good match | Possible match | Not a fit",
  "fitHeadline": "ONE short sentence (max 80 characters) as a verdict for recruiters.",
  "fitVerdict": "MAX 2 short sentences (total < 220 characters) with a quick explanation.",

  "eligibility": {
    "visa": {
      "status": "OK | Issue | Unknown",
      "note": "Max 90 characters. Example: 'OK – 485 Graduate Visa, full work rights to Sep 2027.'"
    },
    "experience": {
      "status": "OK | Issue | Unknown",
      "note": "Max 90 characters. Example: 'Issue – JD wants 5+ yrs, CV shows 3 yrs full-time.'"
    },
    "location": {
      "status": "OK | Issue | Unknown",
      "note": "Max 90 characters. Example: 'OK – JD is Sydney-based, candidate already in Sydney.'"
    }
  },

  "matchedKeywords": ["..."],
  "missingKeywords": ["..."],
  "summary": "2-4 short sentences in simple English (can be slightly longer).",
  "strengths": ["..."],
  "gaps": ["..."],
  "suggestions": ["..."]
}

JD:
---
${jd}

CV:
---
${cvText}
`;
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

        // 如果模型用了 ```json 代码块，先把外壳剥掉
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
            matchedKeywords: [],
            missingKeywords: [],
            summary: "",
            strengths: [],
            gaps: [],
            suggestions: [],
            replyTemplate: "",
            ...parsed,
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
