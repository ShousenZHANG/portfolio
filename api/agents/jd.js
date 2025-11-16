// api/agents/jd.js
/* eslint-env node */

import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const MAX_BODY_SIZE = 1_000_000;

function buildPrompt(jd, cvText) {
    return `
You are a job-matching assistant for the Australian software engineering market.

You will receive:
1) A Job Description (JD)
2) A candidate CV (plain text)

Your task:
- Compare the JD and the CV.
- Focus on: required tech stack, domain experience, seniority, soft skills, location/visa if mentioned.
- Evaluate how well this CV matches the JD.
- Be realistic but encouraging.

You MUST respond with **valid JSON only**, no extra text, in EXACTLY this structure:

{
  "overallScore": 0-100,
  "exactMatchScore": 0-100,
  "relatedMatchScore": 0-100,
  "gapScore": 0-100,
  "matchedKeywords": ["..."],
  "missingKeywords": ["..."],
  "summary": "2-4 sentence summary, simple English.",
  "strengths": ["..."],
  "gaps": ["..."],
  "suggestions": ["..."],
  "replyTemplate": "Short, polite email / cover letter style reply the candidate could send for this JD."
}

JSON only, so that it can be parsed by JSON.parse in JavaScript.

JD:
---
${jd}

CV:
---
${cvText}
`;
}

// 读取 Node 原生 req body，限制最大体积
async function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (chunk) => {
            data += chunk;
            if (data.length > MAX_BODY_SIZE) {
                // 防止超大请求
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
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Only POST is allowed" }));
        return;
    }

    if (!process.env.GEMINI_API_KEY) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "GEMINI_API_KEY is not set on the server" }));
        return;
    }

    let body;
    try {
        body = await readBody(req);
    } catch (err) {
        console.error("Error parsing body:", err);
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
    }

    const { jd, cvText } = body || {};
    if (!jd || !cvText) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "jd and cvText are required" }));
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const prompt = buildPrompt(jd, cvText);
        const result = await model.generateContent(prompt);
        const text = result.response.text() || "{}";

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (err) {
            console.error("JSON parse error:", err);
            const idx = text.indexOf("{");
            const candidate = idx >= 0 ? text.slice(idx) : "{}";
            try {
                parsed = JSON.parse(candidate);
            } catch {
                parsed = { raw: text };
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
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(safe));
    } catch (err) {
        console.error("JD assistant error:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "JD analysis failed" }));
    }
}
