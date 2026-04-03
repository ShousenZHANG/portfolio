import { useState, useEffect } from "react";
import { postJSON } from "../lib/api-client";
import { normalizeResult } from "../lib/jd-normalize";

const MAX_JD_LENGTH = 10_000;

/**
 * Shared hook for the JD matching feature.
 * Handles CV loading, API submission, and result normalization.
 * Used by both JDQuickCheck (inline section) and JDAssistant (floating overlay).
 */
export function useJDAnalysis() {
  const [jd, setJd] = useState("");
  const [cvText, setCvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Load CV text once on mount
  useEffect(() => {
    let cancelled = false;

    async function loadCv() {
      try {
        const res = await fetch("/cv/main.txt");
        if (!res.ok) return;
        const text = (await res.text()).trim();
        if (!cancelled && text) setCvText(text);
      } catch {
        // CV load failure is non-fatal — submit will validate
      }
    }

    loadCv();
    return () => { cancelled = true; };
  }, []);

  const submit = async () => {
    setError(null);
    setResult(null);

    if (!jd.trim() || loading) {
      setError("Please paste the job description first.");
      return;
    }
    if (jd.trim().length > MAX_JD_LENGTH) {
      setError(`JD text is too long (max ${MAX_JD_LENGTH.toLocaleString()} characters).`);
      return;
    }
    if (!cvText.trim()) {
      setError("CV text is empty. Please check /public/cv/main.txt.");
      return;
    }

    setLoading(true);
    try {
      const data = await postJSON("/api/agents/jd", {
        jd: jd.trim(),
        cvText: cvText.trim(),
      });
      setResult(normalizeResult(data));
    } catch (err) {
      setError(err?.message || "Analysis failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return { jd, setJd, cvText, loading, result, error, submit };
}
