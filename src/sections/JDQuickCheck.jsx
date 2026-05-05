import TitleHeader from "../components/TitleHeader.jsx";
import { useJDAnalysis } from "../hooks/useJDAnalysis";
import Send from "lucide-react/dist/esm/icons/send";

const MAX_MATCHED = 5;
const MAX_GAPS = 4;
const MAX_ACTIONS = 3;
const MAX_RISKS = 3;

function formatEligibility(item, label) {
  if (!item || !item.status || item.status === "Unknown") return `${label}: -`;
  const note = item.note ? ` (${item.note})` : "";
  return `${label}: ${item.status}${note}`;
}

function MoreCount({ shown, total }) {
  if (total <= shown) return null;
  return (
    <span className="text-xs text-white/55 ml-1 self-center">
      +{total - shown} more
    </span>
  );
}

const JDQuickCheck = () => {
  const { jd, setJd, loading, result, error, submit } = useJDAnalysis();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <section id="jd-check" className="py-20 md:py-28 px-5 md:px-12 lg:px-20">
      <div className="max-w-[800px] mx-auto">
        <TitleHeader
          title="JD Quick Check"
          sub="AI-Powered Fit Analysis"
          anchor="jd-check"
        />

        <div className="mt-12 bg-[#0d0f15] border border-white/8 rounded-2xl p-6 md:p-8">
          {/* Header */}
          <div className="mb-5">
            <p className="text-sm text-white/75">
              Paste a job description to get an instant match analysis against my CV.
            </p>
          </div>

          {/* Input */}
          <div className="flex flex-col gap-4">
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-sky-400/50 focus:ring-1 focus:ring-sky-400/30 transition-all duration-300 resize-none"
              placeholder="Paste the JD here (stack, responsibilities, experience band, visa, location)..."
              rows="5"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Job description input"
              aria-describedby="jd-shortcut-hint"
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-black text-sm font-semibold hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} />
                {loading ? "Analysing..." : "Check Fit"}
              </button>
              <p id="jd-shortcut-hint" className="text-xs text-white/55">
                Press <kbd className="px-1.5 py-0.5 rounded border border-white/15 bg-white/5 text-white/75 font-mono text-[10px]">⌘</kbd>
                <span className="mx-0.5">/</span>
                <kbd className="px-1.5 py-0.5 rounded border border-white/15 bg-white/5 text-white/75 font-mono text-[10px]">Ctrl</kbd>
                <span className="ml-1">+ Enter to submit</span>
              </p>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm mt-3" role="alert">{error}</p>}

          {/* Result */}
          <div className="mt-6" aria-live="polite">
            {!result && !loading && (
              <p className="text-white/60 text-sm text-center py-6">
                Results will appear here after analysis.
              </p>
            )}

            {result && (
              <div className="space-y-5">
                {/* Overall score + fit label */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/8">
                  <div>
                    <p className="text-xs text-white/70 uppercase tracking-wider">Overall Match</p>
                    <p className="text-2xl font-bold text-white mt-1">{result.overallScore}%</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    result.fitLabel?.startsWith("Strong") ? "bg-emerald-400/15 text-emerald-300" :
                    result.fitLabel?.startsWith("Good") ? "bg-cyan-400/15 text-cyan-300" :
                    result.fitLabel?.startsWith("Possible") ? "bg-amber-400/15 text-amber-300" :
                    "bg-rose-400/15 text-rose-300"
                  }`}>
                    {result.fitLabel || "-"}
                  </span>
                </div>

                {/* Headline */}
                {result.fitHeadline && (
                  <p className="text-sm text-white/80">{result.fitHeadline}</p>
                )}

                {/* Score breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Exact", value: result.exactMatchScore },
                    { label: "Related", value: result.relatedMatchScore },
                    { label: "Gap", value: result.gapScore },
                    { label: "Confidence", value: result.confidenceScore },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 bg-white/3 rounded-lg border border-white/6">
                      <p className="text-[11px] text-white/65 uppercase tracking-wider">{label}</p>
                      <p className="text-lg font-semibold text-white/90 mt-1">{value}%</p>
                    </div>
                  ))}
                </div>

                {/* Dimension scores */}
                {result.dimensionScores && (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {[
                      { label: "Tech Stack", value: result.dimensionScores.techStack },
                      { label: "Responsibilities", value: result.dimensionScores.responsibilities },
                      { label: "Domain", value: result.dimensionScores.domainContext },
                      { label: "Seniority", value: result.dimensionScores.seniority },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center py-1.5 text-sm">
                        <span className="text-white/70">{label}</span>
                        <span className="text-white/90 font-medium">{value}%</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Eligibility */}
                <div className="space-y-1.5 text-sm">
                  <p className="text-white/75">{formatEligibility(result?.eligibility?.visa, "Visa")}</p>
                  <p className="text-white/75">{formatEligibility(result?.eligibility?.experience, "Experience")}</p>
                  <p className="text-white/75">{formatEligibility(result?.eligibility?.location, "Location")}</p>
                </div>

                {result.fitVerdict && (
                  <p className="text-sm text-sky-300/90 italic">{result.fitVerdict}</p>
                )}

                {/* Keywords */}
                <div className="space-y-3">
                  {result.matchedKeywords?.length > 0 && (
                    <div>
                      <p className="text-[11px] text-white/65 uppercase tracking-wider mb-2">Matched Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.matchedKeywords.slice(0, MAX_MATCHED).map((k) => {
                          const text = typeof k === "string" ? k : k?.name;
                          return text ? (
                            <span key={text} className="px-2 py-1 rounded text-xs bg-emerald-400/10 text-emerald-300/90 border border-emerald-400/20">
                              {text}
                            </span>
                          ) : null;
                        })}
                        <MoreCount shown={MAX_MATCHED} total={result.matchedKeywords.length} />
                      </div>
                    </div>
                  )}

                  {result.missingKeywords?.length > 0 && (
                    <div>
                      <p className="text-[11px] text-white/65 uppercase tracking-wider mb-2">Gaps</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.missingKeywords.slice(0, MAX_GAPS).map((k) => {
                          const text = typeof k === "string" ? k : k?.name;
                          return text ? (
                            <span key={text} className="px-2 py-1 rounded text-xs bg-rose-400/10 text-rose-300/90 border border-rose-400/20">
                              {text}
                            </span>
                          ) : null;
                        })}
                        <MoreCount shown={MAX_GAPS} total={result.missingKeywords.length} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                {result.suggestions?.length > 0 && (
                  <div>
                    <p className="text-[11px] text-white/65 uppercase tracking-wider mb-2">Suggested Actions</p>
                    <ul className="space-y-1.5">
                      {result.suggestions.slice(0, MAX_ACTIONS).map((s, i) => (
                        <li key={`s-${i}`} className="text-sm text-white/75 flex gap-2">
                          <span className="text-sky-400/70 mt-0.5 flex-shrink-0">
                            <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor"><circle cx="3" cy="3" r="3"/></svg>
                          </span>
                          {s}
                        </li>
                      ))}
                    </ul>
                    {result.suggestions.length > MAX_ACTIONS && (
                      <p className="text-xs text-white/55 mt-2">
                        +{result.suggestions.length - MAX_ACTIONS} more suggestions
                      </p>
                    )}
                  </div>
                )}

                {/* Risk flags */}
                {result.riskFlags?.length > 0 && (
                  <div className="p-3 rounded-lg border border-amber-400/15 bg-amber-400/5">
                    <p className="text-[11px] text-amber-300/85 uppercase tracking-wider mb-2">Risk Flags</p>
                    <ul className="space-y-1">
                      {result.riskFlags.slice(0, MAX_RISKS).map((item, idx) => (
                        <li key={`r-${idx}`} className="text-sm text-amber-200/85">{item}</li>
                      ))}
                    </ul>
                    {result.riskFlags.length > MAX_RISKS && (
                      <p className="text-xs text-amber-200/65 mt-2">
                        +{result.riskFlags.length - MAX_RISKS} more flags
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JDQuickCheck;
