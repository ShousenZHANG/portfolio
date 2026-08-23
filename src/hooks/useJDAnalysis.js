import { useState, useEffect, useRef } from "react";
import { dict, isZh } from "../i18n/index.js";

const MAX_JD_LENGTH = 12_000; // matches the server cap (api/agents/jd.js)
// The matcher grounds on the CV in the reader's own language: scoring a
// Chinese JD against the English CV loses every term that only exists in
// one of them.
const CV_URL = isZh ? "/cv/main.zh.txt" : "/cv/main.txt";
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
      setError(dict.jd.errors.empty);
      return;
    }
    if (jd.trim().length > MAX_JD_LENGTH) {
      setError(dict.jd.errors.tooLong(MAX_JD_LENGTH));
      return;
    }
    if (!cvText.trim()) {
      setError(dict.jd.errors.cvMissing);
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
        throw new Error(message || dict.jd.errors.requestFailed(res.status));
      }
      setResult(await res.json());
    } catch (err) {
      if (err?.name === "AbortError") return; // superseded/unmounted — ignore
      setError(err?.message || dict.jd.errors.failed);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  };

  return { jd, setJd, cvText, loading, result, error, submit };
}
