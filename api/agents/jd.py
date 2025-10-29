# api/agents/jd.py
import os, json, re
from pathlib import Path
from fastapi import FastAPI, Request
from connectonion import Agent
from PyPDF2 import PdfReader

app = FastAPI()
_RESUME_TEXT = None

def _extract_text_from_pdf(pdf_path: Path) -> str:
    try:
        reader = PdfReader(str(pdf_path))
        pages = [p.extract_text() or "" for p in reader.pages]
        return "\n".join(pages)
    except Exception:
        return ""

def _load_resume_text() -> str:
    global _RESUME_TEXT
    if _RESUME_TEXT is not None:
        return _RESUME_TEXT
    pdf_path = Path.cwd() / "public" / "files" / "Eddy_Zhang_CV.pdf"
    text = _extract_text_from_pdf(pdf_path) if pdf_path.exists() else ""
    _RESUME_TEXT = (text[:40000]).strip()
    return _RESUME_TEXT

def _force_json(s: str) -> dict:
    m = re.search(r"\{.*\}", s, flags=re.S)
    raw = m.group(0) if m else s
    return json.loads(raw)

def _run_agent(jd: str) -> dict:
    resume_text = _load_resume_text()
    model = os.getenv("OPENAI_MODEL") or None
    system_prompt = (
        "You are a precise ATS-style matcher for the AU job market. "
        "Compare the candidate's resume with the given Job Description. "
        "Be concise, specific, and return STRICT JSON only."
    )

    agent = Agent(name="jd_matcher", system_prompt=system_prompt, model=model)

    ask = f"""
Return STRICT JSON with this schema (no prose):

{{
  "score": {{"overall": 0-100, "exact": 0-100, "related": 0-100, "gaps": 0-100}},
  "matched": ["list of exact skills/keywords present in resume and JD"],
  "related": [{{"name": "transferable/related skill", "reason": "why it maps"}}],
  "gaps": ["missing or weak items"],
  "summary": "2-3 concise lines summarizing fit",
  "replyTemplate": "a short polite reply the candidate could send"
}}

Rules:
- Base on this resume (truncated): {resume_text[:3000]}
- JD: {jd[:5000]}
- Keep numbers 0-100 integers.
- Be honest on gaps; avoid overclaiming.
- IMPORTANT: Output STRICT JSON only.
"""
    llm_out = agent.input(ask)
    data = _force_json(llm_out)

    def _num(x):
        try:
            n = float(x)
            return max(0, min(100, round(n)))
        except Exception:
            return 0

    data.setdefault("score", {})
    data["score"] = {
        "overall": _num(data["score"].get("overall")),
        "exact": _num(data["score"].get("exact")),
        "related": _num(data["score"].get("related")),
        "gaps": _num(data["score"].get("gaps")),
    }
    data.setdefault("matched", [])
    data.setdefault("related", [])
    data.setdefault("gaps", [])
    data.setdefault("summary", "")
    data.setdefault("replyTemplate", "")
    return data

@app.post("/")
async def match_jd(request: Request):
    body = await request.json()
    jd = (body.get("jd") or "").strip()
    if not jd:
        return {"error": "jd is required"}
    return _run_agent(jd)
