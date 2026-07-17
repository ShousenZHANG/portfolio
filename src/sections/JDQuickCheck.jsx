import { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";
import TitleHeader from "../components/TitleHeader.jsx";
import { useJDAnalysis } from "../hooks/useJDAnalysis";
import Send from "lucide-react/dist/esm/icons/send";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";

const MAX_MATCHED = 6;
const MAX_GAPS = 5;
const MAX_ACTIONS = 3;
const MAX_RISKS = 3;
const MAX_JD_CHARS = 12000;

const SAMPLES = [
  {
    label: "Senior React Engineer",
    jd: "Senior React Engineer — Sydney (hybrid). 5+ years with React and TypeScript, building component libraries and design systems. Strong with Node.js REST APIs and AWS. You will mentor junior engineers and own frontend architecture. Full working rights in Australia required.",
  },
  {
    label: "ML / AI Engineer",
    jd: "Machine Learning Engineer. Ship production AI features: LLM agents, RAG pipelines, prompt engineering, vector databases. Python and cloud-native services. Experience with OpenAI / Anthropic APIs. Remote within Australia.",
  },
  {
    label: "Full-Stack (PR required)",
    jd: "Full-Stack Developer — Next.js, PostgreSQL, Docker, CI/CD on Vercel. Own features end to end. Must be an Australian citizen or hold permanent residency.",
  },
];

const LOADING_STEPS = ["Parsing the JD", "Matching against my CV", "Scoring the fit"];

function detectIsMac() {
  if (typeof navigator === "undefined") return false;
  const p = navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || "";
  return /mac|iphone|ipad|ipod/i.test(p);
}

const FIT_COLOR = (label = "") =>
  label.startsWith("Strong") ? "var(--ok)" :
  label.startsWith("Good") ? "var(--sig-2)" :
  label.startsWith("Possible") ? "var(--warn)" :
  "var(--danger)";

const STATUS_COLOR = (s) =>
  s === "OK" ? "var(--ok)" :
  s === "Issue" ? "var(--danger)" :
  "var(--tx-2)";

// ── Animated circular score gauge ──
function ScoreGauge({ score, label }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  const color = FIT_COLOR(label);
  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--hair)" strokeWidth="9" />
        <circle
          cx="70" cy="70" r={R} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - Math.max(0, Math.min(100, score)) / 100)}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)", filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold" style={{ color: "var(--tx-0)" }}>
          <CountUp end={score} duration={1.1} />
        </span>
        <span className="text-[11px] font-mono" style={{ color: "var(--tx-2)" }}>/ 100</span>
      </div>
    </div>
  );
}

// ── Animated dimension bar ──
function DimBar({ label, value }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 60);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span style={{ color: "var(--tx-1)" }}>{label}</span>
        <span className="font-mono" style={{ color: "var(--tx-2)" }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--hair)" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${w}%`, background: "linear-gradient(90deg, var(--sig), var(--sig-2))", transition: "width 1s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </div>
    </div>
  );
}

function Chip({ children, tone = "neutral" }) {
  const styles = {
    match: { background: "var(--sig-glow)", color: "var(--sig)", border: "1px solid var(--sig-line)" },
    gap: { background: "color-mix(in oklab, var(--danger) 12%, transparent)", color: "var(--danger-tx)", border: "1px solid color-mix(in oklab, var(--danger) 30%, transparent)" },
    neutral: { background: "var(--ink-2)", color: "var(--tx-1)", border: "1px solid var(--hair)" },
  }[tone];
  return <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={styles}>{children}</span>;
}

function MoreCount({ shown, total }) {
  if (total <= shown) return null;
  return <span className="text-xs self-center" style={{ color: "var(--tx-2)" }}>+{total - shown} more</span>;
}

const JDQuickCheck = () => {
  const { jd, setJd, loading, result, error, submit } = useJDAnalysis();
  const [isMac, setIsMac] = useState(false);
  const [step, setStep] = useState(0);
  const stepTimer = useRef(null);

  useEffect(() => { setIsMac(detectIsMac()); }, []);

  // Cycle the "thinking" steps while loading
  useEffect(() => {
    if (!loading) { setStep(0); clearInterval(stepTimer.current); return undefined; }
    setStep(0);
    stepTimer.current = setInterval(() => setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 900);
    return () => clearInterval(stepTimer.current);
  }, [loading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); }
  };

  const over = MAX_JD_CHARS - jd.length;

  return (
    <section id="jd-check" className="ed-shell pt-20 md:pt-24 pb-[var(--sp-section)]">
      <div className="max-w-[860px] mx-auto">
        <TitleHeader title="Match a JD against my CV" sub="01 / Live AI Demo" anchor="jd-check" align="left" />

        <p className="ed-lead mt-5 mb-8">
          Paste any job description — my own AI engine scores how well I fit, in
          real time. Same RAG + LLM stack I ship in production.
        </p>

        <div className="ed-tile p-5 md:p-7" style={{ background: "var(--ink-1)" }}>
          {/* Sample chips — selected state derives from the textarea content */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-mono mr-1" style={{ color: "var(--tx-2)" }}>Try:</span>
            {SAMPLES.map((s) => {
              const isSelected = jd === s.jd;
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setJd(s.jd)}
                  aria-pressed={isSelected}
                  className={`jd-chip px-3 py-1.5 rounded-full text-xs font-medium ${isSelected ? "selected" : ""}`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Input */}
          <textarea
            className="w-full rounded-[var(--r-sm)] px-4 py-3 text-sm resize-none transition-all duration-300 focus:outline-none"
            style={{ background: "var(--ink-0)", border: "1px solid var(--hair)", color: "var(--tx-0)", minHeight: 130 }}
            placeholder="Paste the JD here — stack, responsibilities, experience band, visa, location…"
            rows="5"
            maxLength={MAX_JD_CHARS}
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Job description input"
            aria-describedby="jd-shortcut-hint"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
            <div className="flex items-center gap-3">
              <button type="button" onClick={submit} disabled={loading} className="ed-btn disabled:opacity-50 disabled:cursor-not-allowed" data-magnetic>
                {loading ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
                {loading ? "Analysing…" : "Check Fit"}
              </button>
              <p id="jd-shortcut-hint" className="text-xs hidden sm:block" style={{ color: "var(--tx-2)" }}>
                <kbd className="px-1.5 py-0.5 rounded font-mono text-[10px]" style={{ border: "1px solid var(--hair-bright)", color: "var(--tx-1)" }}>{isMac ? "⌘" : "Ctrl"}</kbd>
                <span className="mx-1">+</span>
                <kbd className="px-1.5 py-0.5 rounded font-mono text-[10px]" style={{ border: "1px solid var(--hair-bright)", color: "var(--tx-1)" }}>Enter</kbd>
              </p>
            </div>
            <span className="text-xs font-mono" style={{ color: over < 0 ? "var(--danger)" : "var(--tx-2)" }}>
              {jd.length.toLocaleString()} / {MAX_JD_CHARS.toLocaleString()}
            </span>
          </div>

          {error && (
            <p className="text-sm mt-3" role="alert" style={{ color: "var(--danger-tx)" }}>{error}</p>
          )}

          {/* ── States ── */}
          <div className="mt-6" aria-busy={loading}>
            {/* Concise SR announcement — avoids dumping the whole result tree
                into a live region. Detailed panels below are not live. */}
            <p className="sr-only" role="status" aria-live="polite">
              {result && !loading
                ? `${result.fitLabel}. Score ${result.overallScore} out of 100.${result.fitHeadline ? " " + result.fitHeadline : ""}`
                : ""}
            </p>
            {loading && (
              <div className="rounded-[var(--r-md)] p-6" style={{ border: "1px solid var(--hair)" }}>
                <ul className="space-y-3">
                  {LOADING_STEPS.map((s, i) => (
                    <li key={s} className="flex items-center gap-3 text-sm transition-opacity duration-300"
                        style={{ opacity: i <= step ? 1 : 0.35, color: i <= step ? "var(--tx-0)" : "var(--tx-2)" }}>
                      <span className="w-4 h-4 flex items-center justify-center">
                        {i < step
                          ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--sig)" strokeWidth="2"><path d="M2 7.5l3.5 3.5L12 3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          : <span className="w-2 h-2 rounded-full" style={{ background: "var(--sig)", animation: i === step ? "ed-ping 1.2s var(--ease-soft) infinite" : "none" }} />}
                      </span>
                      {s}{i === step ? "…" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!result && !loading && (
              <div className="rounded-[var(--r-md)] p-8 text-center" style={{ border: "1px dashed var(--hair-bright)" }}>
                <p className="text-sm" style={{ color: "var(--tx-2)" }}>
                  {jd.trim()
                    ? <>JD loaded — hit <span style={{ color: "var(--tx-1)" }}>Check Fit</span> to score it. Results render here in a few seconds.</>
                    : <>Pick a sample above or paste a real JD, then hit <span style={{ color: "var(--tx-1)" }}>Check Fit</span>. Results render here in a few seconds.</>}
                </p>
              </div>
            )}

            {result && !loading && (
              <div className="jd-result space-y-7">
                {/* Hero: gauge + verdict */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ScoreGauge score={result.overallScore} label={result.fitLabel} />
                  <div className="flex-1 text-center sm:text-left">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2"
                          style={{ background: `color-mix(in oklch, ${FIT_COLOR(result.fitLabel)} 18%, transparent)`, color: FIT_COLOR(result.fitLabel) }}>
                      {result.fitLabel || "-"}
                    </span>
                    {result.fitHeadline && <p className="text-lg font-semibold leading-snug" style={{ color: "var(--tx-0)" }}>{result.fitHeadline}</p>}
                    {result.fitVerdict && <p className="text-sm mt-1.5" style={{ color: "var(--tx-1)" }}>{result.fitVerdict}</p>}
                  </div>
                </div>

                {/* Sub-scores */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Exact", value: result.exactMatchScore },
                    { label: "Related", value: result.relatedMatchScore },
                    { label: "Gap", value: result.gapScore },
                    { label: "Confidence", value: result.confidenceScore },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-[var(--r-sm)] p-3" style={{ background: "var(--ink-0)", border: "1px solid var(--hair)" }}>
                      <p className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "var(--tx-2)" }}>{label}</p>
                      <p className="text-xl font-semibold mt-1" style={{ color: "var(--tx-0)" }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Dimension bars */}
                {result.dimensionScores && (
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                    <DimBar label="Tech Stack" value={result.dimensionScores.techStack} />
                    <DimBar label="Responsibilities" value={result.dimensionScores.responsibilities} />
                    <DimBar label="Domain" value={result.dimensionScores.domainContext} />
                    <DimBar label="Seniority" value={result.dimensionScores.seniority} />
                  </div>
                )}

                {/* Eligibility chips */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { k: "Visa", v: result?.eligibility?.visa },
                    { k: "Experience", v: result?.eligibility?.experience },
                    { k: "Location", v: result?.eligibility?.location },
                  ].map(({ k, v }) => (
                    <span key={k} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--r-sm)] text-xs"
                          style={{ background: "var(--ink-0)", border: "1px solid var(--hair)" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLOR(v?.status) }} />
                      <span style={{ color: "var(--tx-2)" }}>{k}</span>
                      <span className="font-medium" style={{ color: "var(--tx-0)" }}>{v?.status || "Unknown"}</span>
                    </span>
                  ))}
                </div>

                {/* Keywords */}
                <div className="grid sm:grid-cols-2 gap-5">
                  {result.matchedKeywords?.length > 0 && (
                    <div>
                      <p className="text-[11px] font-mono uppercase tracking-wider mb-2.5" style={{ color: "var(--tx-2)" }}>Matched</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.matchedKeywords.slice(0, MAX_MATCHED).map((k) => {
                          const t = typeof k === "string" ? k : k?.name;
                          return t ? <Chip key={t} tone="match">{t}</Chip> : null;
                        })}
                        <MoreCount shown={MAX_MATCHED} total={result.matchedKeywords.length} />
                      </div>
                    </div>
                  )}
                  {result.missingKeywords?.length > 0 && (
                    <div>
                      <p className="text-[11px] font-mono uppercase tracking-wider mb-2.5" style={{ color: "var(--tx-2)" }}>Gaps</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.missingKeywords.slice(0, MAX_GAPS).map((k) => {
                          const t = typeof k === "string" ? k : k?.name;
                          return t ? <Chip key={t} tone="gap">{t}</Chip> : null;
                        })}
                        <MoreCount shown={MAX_GAPS} total={result.missingKeywords.length} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                {result.suggestions?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider mb-2.5" style={{ color: "var(--tx-2)" }}>Suggested actions</p>
                    <ul className="space-y-2">
                      {result.suggestions.slice(0, MAX_ACTIONS).map((s, i) => (
                        <li key={`s-${i}`} className="text-sm flex gap-2.5" style={{ color: "var(--tx-1)" }}>
                          <span style={{ color: "var(--sig)" }}>▸</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Risk flags */}
                {result.riskFlags?.length > 0 && (
                  <div className="rounded-[var(--r-sm)] p-4" style={{ border: "1px solid color-mix(in oklab, var(--warn) 28%, transparent)", background: "color-mix(in oklab, var(--warn) 8%, transparent)" }}>
                    <p className="text-[11px] font-mono uppercase tracking-wider mb-2" style={{ color: "var(--warn)" }}>Risk flags</p>
                    <ul className="space-y-1">
                      {result.riskFlags.slice(0, MAX_RISKS).map((item, idx) => (
                        <li key={`r-${idx}`} className="text-sm" style={{ color: "var(--tx-1)" }}>{item}</li>
                      ))}
                    </ul>
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
