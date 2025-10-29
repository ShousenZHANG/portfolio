from http.server import BaseHTTPRequestHandler
import json, os, re
from pathlib import Path

from connectonion import Agent
from PyPDF2 import PdfReader

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

    agent = Agent(
        name="jd_matcher",
        system_prompt=system_prompt,
        model=model
    )

    ask = f"""
Return STRICT JSON with this schema (no prose):

{{
  "score": {{"overall": 0-100, "exact": 0-100, "related": 0-100, "gaps": 0-100}},
  "matched": ["list of exact skills/keywords present in resume and JD"],
  "related": [{{"name": "transferable/related skill", "reason": "why it maps"}}],
  "gaps": ["missing but important skills/keywords from JD"],
  "summary": "2–4 lines concise summary for a recruiter (AU tone).",
  "replyTemplate": "1 short ready-to-send reply (~80-120 words) to the recruiter."
}}

Context:
- Location: Sydney • Available • 485 Graduate Visa (to 4 Sep 2027)
- Candidate Resume (text): ```{resume_text}```
- Job Description (JD): ```{jd}```
- Scoring rule: overall ≈ exact*0.6 + related*0.4 - gaps*0.2 (clip 0..100).
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

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("content-length", 0))
            raw = self.rfile.read(length) if length > 0 else b"{}"
            body = json.loads(raw.decode("utf-8") or "{}")
            jd = (body.get("jd") or "").strip()

            if not jd:
                self.send_response(400)
                self.send_header("content-type","application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(b'{"error":"Missing jd"}')
                return

            result = _run_agent(jd)

            res_bytes = json.dumps(result).encode("utf-8")
            self.send_response(200)
            self.send_header("content-type","application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(res_bytes)

        except json.JSONDecodeError:
            self.send_response(400)
            self.send_header("content-type","application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(b'{"error":"Invalid JSON"}')

        except Exception as e:
            self.send_response(500)
            self.send_header("content-type","application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
