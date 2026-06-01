import { useState, useEffect, useRef } from "react";

const MAX_JD_LENGTH = 12_000; // matches the server cap (api/agents/jd.js)
const CV_URL = "/cv/main.txt";
const ENDPOINT = "/api/agents/jd";

/**
 * Stateful hook for the JD matching feature.
 * Loads the CV once, validates input, posts to /api/agents/jd, exposes the flat JDScore.
 * Aborts any in-flight request on unmount or rapid resubmit.
 */
export function useJDAnalysis() {
  const [jd, setJd] = useState("");
  const [cvText, setCvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch(CV_URL)
      .then((res) => (res.ok ? res.text() : ""))
      .then((text) => {
        const trimmed = text.trim();
        if (!cancelled && trimmed) setCvText(trimmed);
      })
      .catch(() => { /* CV load failure is non-fatal — submit will validate */ });
    // Abort any pending analysis request when the component unmounts.
    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
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

    // Cancel a prior in-flight request before starting a new one.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd: jd.trim(), cvText: cvText.trim() }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const raw = await res.text();
        let message = raw;
        try {
          const parsed = JSON.parse(raw);
          message = parsed?.error || raw;
        } catch {
          // body wasn't JSON — keep raw text
        }
        throw new Error(message || `Request failed: ${res.status}`);
      }
      setResult(await res.json());
    } catch (err) {
      if (err?.name === "AbortError") return; // superseded/unmounted — ignore
      setError(err?.message || "Analysis failed. Please try again later.");
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  };

  return { jd, setJd, cvText, loading, result, error, submit };
}
