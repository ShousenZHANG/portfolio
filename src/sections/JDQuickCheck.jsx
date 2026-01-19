import { useState, useEffect } from "react";
import TitleHeader from "../components/TitleHeader.jsx";

const MAX_MATCHED = 3;
const MAX_GAPS = 2;

function normalizeResult(data) {
  const score = data?.score || {};
  const overall =
    typeof data.overallScore === "number"
      ? data.overallScore
      : typeof score.overall === "number"
        ? score.overall
        : 0;

  const matched = data.matched ?? data.matchedKeywords ?? [];
  const related =
    data.related ??
    (Array.isArray(data.strengths)
      ? data.strengths.map((s) =>
          typeof s === "string" ? { name: s, reason: "" } : s
        )
      : []);
  const gaps = data.gaps ?? data.missingKeywords ?? [];

  return {
    overallScore: Math.round(overall),
    matched,
    related,
    gaps,
    eligibility: data.eligibility || {},
  };
}

const JDQuickCheck = () => {
  const [jd, setJd] = useState("");
  const [cvText, setCvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadCv = async () => {
      try {
        const res = await fetch("/cv/main.txt");
        if (!res.ok) return;
        const text = (await res.text()).trim();
        if (!cancelled && text) setCvText(text);
      } catch (err) {
        console.error("Failed to load CV text:", err);
      }
    };

    loadCv();
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async () => {
    setError("");
    setResult(null);

    if (!jd.trim() || loading) {
      setError("Please paste the job description first.");
      return;
    }
    if (!cvText.trim()) {
      setError("CV text is empty. Please check /public/cv/main.txt.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/agents/jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd: jd.trim(), cvText: cvText.trim() }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Request failed: ${res.status}`);
      }
      const data = await res.json();
      setResult(normalizeResult(data));
    } catch (err) {
      setError(err?.message || "Analysis failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <section id="jd-check" className="section-padding">
      <div className="w-full h-full md:px-20 px-5">
        <TitleHeader
          title="JD Quick Check"
          sub="⚡ Get a recruiter-ready fit summary in under 10 seconds"
        />
        <div className="jd-card mt-12">
          <div className="jd-card-inner">
            <div className="jd-card-header">
              <p className="jd-label">Paste a Job Description</p>
              <p className="jd-note">
                Private by design — only your JD and the public CV are used.
              </p>
            </div>
            <div className="jd-input-wrap">
              <textarea
                className="jd-textarea"
                placeholder="Paste the JD here (stack, responsibilities, experience band, visa, location)…"
                rows="5"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
              <button className="jd-cta" type="button" onClick={submit}>
                {loading ? "Checking..." : "Check Fit"}
              </button>
            </div>
            {error && <p className="jd-error">{error}</p>}
            <div className="jd-result">
              <div className="jd-result-head">
                <span className="jd-badge">Overall Match</span>
                <span className="jd-score">
                  {result ? `${result.overallScore}%` : "—"}
                </span>
              </div>
              <p className="jd-result-line">
                {result
                  ? "Summary based on your JD and public CV."
                  : "Add a JD to see your match summary."}
              </p>
              <div className="jd-result-list">
                <div className="jd-result-item">
                  <span className="jd-result-title">Matched</span>
                  <span className="jd-result-value">
                    {result
                      ? result.matched
                          .slice(0, MAX_MATCHED)
                          .map((k) => (typeof k === "string" ? k : k?.name))
                          .filter(Boolean)
                          .join(", ") || "—"
                      : "—"}
                  </span>
                </div>
                <div className="jd-result-item">
                  <span className="jd-result-title">Gaps</span>
                  <span className="jd-result-value">
                    {result
                      ? result.gaps
                          .slice(0, MAX_GAPS)
                          .map((k) => (typeof k === "string" ? k : k?.name))
                          .filter(Boolean)
                          .join(", ") || "—"
                      : "—"}
                  </span>
                </div>
                <div className="jd-result-item">
                  <span className="jd-result-title">Eligibility</span>
                  <span className="jd-result-value">
                    {result?.eligibility?.visa?.status
                      ? `Visa: ${result.eligibility.visa.status}`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JDQuickCheck;
