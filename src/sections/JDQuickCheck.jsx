import TitleHeader from "../components/TitleHeader.jsx";
import { useJDAnalysis } from "../hooks/useJDAnalysis";
import { formatEligibilityText } from "../lib/jd-normalize";

const MAX_MATCHED = 5;
const MAX_GAPS = 4;
const MAX_ACTIONS = 3;
const MAX_RISKS = 3;

const JDQuickCheck = () => {
  const { jd, setJd, loading, result, error, submit } = useJDAnalysis();

  return (
    <section id="jd-check" className="section-padding">
      <div className="w-full h-full md:px-20 px-5">
        <TitleHeader
          title="JD Quick Check"
          sub="Get a recruiter-ready fit breakdown in seconds"
        />

        <div className="jd-card mt-12">
          <div className="jd-card-inner">
            <div className="jd-card-header">
              <p className="jd-label">Paste a Job Description</p>
              <p className="jd-note">
                Private by design - only your JD and the public CV are used.
              </p>
            </div>

            <div className="jd-input-wrap">
              <textarea
                className="jd-textarea"
                placeholder="Paste the JD here (stack, responsibilities, experience band, visa, location)..."
                rows="5"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                aria-label="Job description input"
              />
              <button className="jd-cta" type="button" onClick={submit}>
                {loading ? "Checking..." : "Check Fit"}
              </button>
            </div>

            {error && <p className="jd-error">{error}</p>}

            <div className="jd-result" aria-live="polite">
              <div className="jd-result-head">
                <span className="jd-badge">Overall Match</span>
                <span className="jd-score">
                  {result ? `${result.score.overall}%` : "-"}
                </span>
              </div>

              <p className="jd-result-line">
                {result
                  ? result.fitHeadline || "Detailed match generated from your JD and CV."
                  : "Add a JD to see detailed fit analysis."}
              </p>

              {result && (
                <>
                  <div className="jd-result-list">
                    <div className="jd-result-item">
                      <span className="jd-result-title">Exact</span>
                      <span className="jd-result-value">{result.score.exact}%</span>
                    </div>
                    <div className="jd-result-item">
                      <span className="jd-result-title">Related</span>
                      <span className="jd-result-value">{result.score.related}%</span>
                    </div>
                    <div className="jd-result-item">
                      <span className="jd-result-title">Gap Severity</span>
                      <span className="jd-result-value">{result.score.gaps}%</span>
                    </div>
                  </div>

                  <div className="jd-result-list">
                    <div className="jd-result-item">
                      <span className="jd-result-title">Confidence</span>
                      <span className="jd-result-value">{result.score.confidence}%</span>
                    </div>
                    <div className="jd-result-item">
                      <span className="jd-result-title">Eligibility</span>
                      <span className="jd-result-value">
                        {result.fitLabel || "-"}
                      </span>
                    </div>
                    <div className="jd-result-item">
                      <span className="jd-result-title">Visa</span>
                      <span className="jd-result-value">
                        {result?.eligibility?.visa?.status || "-"}
                      </span>
                    </div>
                  </div>

                  {result.dimensionScores && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <p className="text-sm text-white/70">Tech Stack: <span className="text-white">{result.dimensionScores.techStack}%</span></p>
                      <p className="text-sm text-white/70">Responsibilities: <span className="text-white">{result.dimensionScores.responsibilities}%</span></p>
                      <p className="text-sm text-white/70">Domain Context: <span className="text-white">{result.dimensionScores.domainContext}%</span></p>
                      <p className="text-sm text-white/70">Seniority: <span className="text-white">{result.dimensionScores.seniority}%</span></p>
                    </div>
                  )}

                  <div className="grid gap-2 mt-2">
                    <p className="text-sm text-white/70">
                      {formatEligibilityText(result?.eligibility?.experience, "Experience")}
                    </p>
                    <p className="text-sm text-white/70">
                      {formatEligibilityText(result?.eligibility?.location, "Location")}
                    </p>
                    {result.fitVerdict && (
                      <p className="text-sm text-cyan-200">{result.fitVerdict}</p>
                    )}
                  </div>

                  <div className="jd-result-list">
                    <div className="jd-result-item">
                      <span className="jd-result-title">Matched Keywords</span>
                      <span className="jd-result-value">
                        {result.matched
                          .slice(0, MAX_MATCHED)
                          .map((k) => (typeof k === "string" ? k : k?.name))
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </span>
                    </div>
                    <div className="jd-result-item">
                      <span className="jd-result-title">Gaps</span>
                      <span className="jd-result-value">
                        {result.gaps
                          .slice(0, MAX_GAPS)
                          .map((k) => (typeof k === "string" ? k : k?.name))
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </span>
                    </div>
                    <div className="jd-result-item">
                      <span className="jd-result-title">Top Actions</span>
                      <span className="jd-result-value">
                        {result.suggestions.slice(0, MAX_ACTIONS).join(" | ") || "-"}
                      </span>
                    </div>
                  </div>

                  {result.riskFlags.length > 0 && (
                    <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-amber-200">Risk Flags</p>
                      <ul className="mt-2 text-sm text-amber-100 list-disc list-inside">
                        {result.riskFlags.slice(0, MAX_RISKS).map((item, idx) => (
                          <li key={`${item}-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JDQuickCheck;
