import { useEffect, useRef, useState } from "react";
import X from "lucide-react/dist/esm/icons/x";
import Send from "lucide-react/dist/esm/icons/send";
import Mic from "lucide-react/dist/esm/icons/mic";
import Volume2 from "lucide-react/dist/esm/icons/volume-2";
import VolumeX from "lucide-react/dist/esm/icons/volume-x";
import { prefersReducedMotion } from "../lib/motion.js";

/**
 * E.D. — Eddy's Digital Deputy. Full-screen command deck (lazy chunk).
 *
 * States: idle → listening (browser speech-to-text) → thinking (API) →
 * speaking (OpenAI TTS playback). Text is always the primary channel;
 * voice in (Web Speech API) and voice out (TTS) are enhancements that
 * degrade silently where unsupported.
 */

const ENDPOINT = "/api/agents/ask";
const MAX_QUESTION = 600;

// Cold-start chips — every one is a question Eddy WANTS recruiters to ask.
const CHIPS = [
    "What's Eddy's visa status?",
    "Why did he pivot to Copilot Studio?",
    "What has he actually shipped?",
    "How do I get in touch with him?",
];

const GLYPHS = "!<>-_\\/[]{}=+*^?#";

/** Decode-style type-out for E.D.'s replies (skipped under reduced motion). */
const TypeOut = ({ text, onDone }) => {
    const [shown, setShown] = useState(prefersReducedMotion() ? text : "");
    useEffect(() => {
        if (prefersReducedMotion()) { onDone?.(); return undefined; }
        let i = 0;
        let raf = 0;
        let last = 0;
        const tick = (now) => {
            if (now - last > 14) {
                last = now;
                i += 2;
                if (i >= text.length) { setShown(text); onDone?.(); return; }
                const scramble = GLYPHS[(i * 7) % GLYPHS.length];
                setShown(text.slice(0, i) + scramble);
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [text, onDone]);
    return <>{shown}</>;
};

const TRANSCRIBE_ENDPOINT = "/api/agents/transcribe";
const MAX_CLIP_MS = 60_000;

const canRecord = () =>
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia);

const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result).split(",")[1] || "");
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

const BAR_COUNT = 34;
const fmtClock = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/**
 * Live recording bars. Reads the frequency spectrum straight from the
 * analyser on its own rAF loop and writes bar heights imperatively —
 * animating 34 bars through React state would re-render the deck ~60x/s.
 */
const WaveBars = ({ analyser }) => {
    const hostRef = useRef(null);
    useEffect(() => {
        const host = hostRef.current;
        if (!host || !analyser) return undefined;
        const bars = Array.from(host.children);
        const data = new Uint8Array(analyser.frequencyBinCount);
        // Sample the low-mid band — that's where speech energy lives.
        const span = Math.floor(data.length * 0.6);
        let raf = 0;
        const tick = () => {
            analyser.getByteFrequencyData(data);
            for (let i = 0; i < bars.length; i++) {
                const v = data[Math.floor((i / bars.length) * span)] / 255;
                bars[i].style.transform = `scaleY(${Math.max(0.08, v * 1.35)})`;
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [analyser]);

    return (
        <div ref={hostRef} className="ed-wave" aria-hidden="true">
            {Array.from({ length: BAR_COUNT }, (_, i) => (
                <span key={i} className="ed-wave-bar" />
            ))}
        </div>
    );
};

/** Elapsed-time readout that ticks while a phase is in flight. */
const Elapsed = ({ since, step = 100 }) => {
    const [ms, setMs] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setMs(performance.now() - since), step);
        return () => clearInterval(id);
    }, [since, step]);
    return <>{(ms / 1000).toFixed(1)}s</>;
};

/** Everything the browser will hand a Tab to, inside the deck. */
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** Landmarks that sit BESIDE the deck in #root — inerting #root would inert the deck itself. */
const BACKGROUND_LANDMARKS = "main#main-content, header.navbar, footer, .skip-link";

const EDPanel = ({ onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [status, setStatus] = useState("idle"); // idle|listening|thinking|speaking
    const [voiceOn, setVoiceOn] = useState(true);
    const [error, setError] = useState(null);
    const [analyser, setAnalyser] = useState(null); // drives the wave bars
    const [recMs, setRecMs] = useState(0);          // recording stopwatch
    const [phase, setPhase] = useState(null);       // {label, since} while working
    const inputRef = useRef(null);
    const scrollRef = useRef(null);
    const audioRef = useRef(null);
    const recRef = useRef(null);
    const abortRef = useRef(null);
    const levelRafRef = useRef(0);
    const clipTimerRef = useRef(null);
    const clockRef = useRef(null);
    const coreRef = useRef(null);
    const innerRef = useRef(null);
    const canListen = canRecord();

    /**
     * Modal hygiene, for the lifetime of the mount. Deliberately dependency-free:
     * a parent re-render must never tear this down and leave the page inert or
     * the scroll locked.
     *
     * Scroll lock: lenis.stop() only governs wheel events Lenis actually sees,
     * and it never sees touch at all (syncTouch is off), so mobile still drags
     * the page behind the deck. Freezing the root element is the only lock that
     * covers both. (html carries scrollbar-gutter: stable so this can't shift
     * the layout by the scrollbar width.)
     *
     * Inerting: aria-modal alone doesn't stop Tab or a screen reader from
     * walking into the page behind the deck.
     */
    useEffect(() => {
        const opener = document.activeElement; // stash BEFORE the input autofocuses
        const root = document.documentElement;
        const prevOverflow = root.style.overflow; // may already be set — restore exactly
        root.style.overflow = "hidden";

        const supportsInert = "inert" in HTMLElement.prototype;
        const background = Array.from(document.querySelectorAll(BACKGROUND_LANDMARKS)).map((el) => ({
            el,
            prevAriaHidden: el.getAttribute("aria-hidden"),
        }));
        background.forEach(({ el }) => {
            if (supportsInert) el.inert = true;
            else el.setAttribute("aria-hidden", "true");
        });

        return () => {
            root.style.overflow = prevOverflow;
            background.forEach(({ el, prevAriaHidden }) => {
                if (supportsInert) el.inert = false;
                else if (prevAriaHidden === null) el.removeAttribute("aria-hidden");
                else el.setAttribute("aria-hidden", prevAriaHidden);
            });
            // Un-inert first, then hand focus back to whatever opened the deck
            // (the orb) — otherwise it lands on <body> and Tab restarts the page.
            if (opener instanceof HTMLElement && opener.isConnected) {
                opener.focus({ preventScroll: true });
            }
        };
    }, []);

    // Tab trap. Wraps at both ends of the deck's own focusables; the inert
    // background above handles everything outside it.
    const onTrapKeyDown = (e) => {
        if (e.key !== "Tab") return;
        const host = innerRef.current;
        if (!host) return;
        const items = Array.from(host.querySelectorAll(FOCUSABLE)).filter(
            (el) =>
                !el.disabled &&
                el.tabIndex >= 0 &&
                (el.offsetWidth || el.offsetHeight || el.getClientRects().length)
        );
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    };

    useEffect(() => {
        inputRef.current?.focus();
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            audioRef.current?.pause();
            cancelAnimationFrame(levelRafRef.current);
            clearTimeout(clipTimerRef.current);
            clearInterval(clockRef.current);
            const rec = recRef.current;
            if (rec && rec.state !== "inactive") {
                rec.onstop = null; // don't transcribe into an unmounted panel
                rec.stop();
                rec.stream?.getTracks?.().forEach((t) => t.stop());
            }
            abortRef.current?.abort();
            // Hand the wheel back to the page (Lenis resumes on this).
            window.dispatchEvent(new CustomEvent("ed-close"));
        };
    }, [onClose]);

    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
    }, [messages, status]);

    const speak = (b64) => {
        if (!b64) { setStatus("idle"); return; }
        try {
            const audio = new Audio(`data:audio/mp3;base64,${b64}`);
            audioRef.current = audio;
            setStatus("speaking");
            audio.onended = () => setStatus("idle");
            audio.onerror = () => setStatus("idle");
            audio.play().catch(() => setStatus("idle"));
        } catch {
            setStatus("idle");
        }
    };

    const send = async (raw) => {
        const question = (raw ?? input).trim();
        if (!question || status === "thinking") return;
        setError(null);
        setInput("");
        const history = messages.slice(-8);
        setMessages((m) => [...m, { role: "user", content: question }]);
        setStatus("thinking");
        setPhase({ label: "thinking", since: performance.now() });
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        try {
            const res = await fetch(ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, history, voice: voiceOn }),
                signal: controller.signal,
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || `E.D. hit a fault (${res.status}).`);
            setPhase(null);
            setMessages((m) => [...m, { role: "assistant", content: data.answer, fresh: true }]);
            if (voiceOn && data.audio) speak(data.audio);
            else setStatus("idle");
        } catch (err) {
            if (err?.name === "AbortError") return;
            setPhase(null);
            setError(err?.message || "E.D.'s core is unreachable. Reach Eddy directly: eddy.zhang24@gmail.com");
            setStatus("idle");
        }
    };

    /**
     * Voice capture: record with MediaRecorder, transcribe server-side.
     * The mic stays open until the visitor ends it — no vendor VAD cutting
     * people off mid-sentence — and a live analyser drives the core's
     * ripple from the real signal.
     */
    const stopListening = () => {
        const rec = recRef.current;
        if (rec && rec.state !== "inactive") rec.stop();
    };

    const listen = async () => {
        if (status === "listening") { stopListening(); return; }
        if (!canRecord()) return;
        setError(null);
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
            setError("Microphone access is blocked — check the address-bar permission, or just type.");
            return;
        }

        // Real amplitude drives the core; the same analyser feeds the bars.
        let audioCtx;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const node = audioCtx.createAnalyser();
            node.fftSize = 256;
            node.smoothingTimeConstant = 0.7;
            audioCtx.createMediaStreamSource(stream).connect(node);
            setAnalyser(node);
            const buf = new Uint8Array(node.frequencyBinCount);
            const meter = () => {
                if (!recRef.current || recRef.current.state === "inactive") return;
                node.getByteTimeDomainData(buf);
                let peak = 0;
                for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i] - 128));
                // Written straight to the DOM: routing 60 frames/s of amplitude
                // through React state re-renders the whole deck — the message
                // list, the form, all 34 wave bars — once per frame.
                coreRef.current?.style.setProperty("--level", (Math.min(1, peak / 60)).toFixed(2));
                levelRafRef.current = requestAnimationFrame(meter);
            };
            levelRafRef.current = requestAnimationFrame(meter);
        } catch { /* metering is decoration — never block recording */ }

        const chunks = [];
        const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
            ? "audio/webm;codecs=opus"
            : MediaRecorder.isTypeSupported("audio/mp4")
                ? "audio/mp4"
                : "";
        const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
        recRef.current = rec;
        rec.ondataavailable = (e) => { if (e.data?.size) chunks.push(e.data); };
        rec.onstop = async () => {
            cancelAnimationFrame(levelRafRef.current);
            clearInterval(clockRef.current);
            clearTimeout(clipTimerRef.current);
            coreRef.current?.style.setProperty("--level", "0");
            setAnalyser(null);
            setRecMs(0);
            stream.getTracks().forEach((t) => t.stop());
            audioCtx?.close?.();
            recRef.current = null;
            const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
            if (blob.size < 1200) { setStatus("idle"); return; } // basically silence
            setStatus("thinking");
            setPhase({ label: "transcribing", since: performance.now() });
            try {
                const audio = await blobToBase64(blob);
                const res = await fetch(TRANSCRIBE_ENDPOINT, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ audio, mimeType: rec.mimeType }),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data?.error || "Transcription failed.");
                const text = (data.text || "").trim();
                if (text) send(text);
                else { setStatus("idle"); setPhase(null); setError("Didn't catch that — try again, or type it."); }
            } catch (err) {
                setStatus("idle");
                setPhase(null);
                setError(err?.message || "Voice input hit a snag — typing works just as well.");
            }
        };
        rec.start();
        setStatus("listening");
        const startedAt = performance.now();
        setRecMs(0);
        clockRef.current = setInterval(() => setRecMs(performance.now() - startedAt), 200);
        // Hard stop so a forgotten mic can't record (or bill) forever.
        clipTimerRef.current = setTimeout(stopListening, MAX_CLIP_MS);
    };

    return (
        // data-lenis-prevent deliberately does NOT live here. Lenis' wheel
        // handler returns on prevent() BEFORE its isStopped → preventDefault
        // branch, so putting it on this full-screen root let every wheel event
        // fall through to native scroll and slid the page behind the deck —
        // lenis.stop() was being defeated by our own attribute. It belongs on
        // the one element that genuinely owns a scrollbar: .ed-msgs.
        <div className="ed-panel" role="dialog" aria-modal="true" aria-label="E.D. — Eddy's AI assistant">
            <div className="ed-panel-inner" ref={innerRef} onKeyDown={onTrapKeyDown}>
                <header className="flex items-center justify-between mb-6">
                    <p className="ed-eyebrow">E.D. · Eddy&rsquo;s Digital Deputy</p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="ed-icon-btn"
                            onClick={() => setVoiceOn((v) => !v)}
                            aria-pressed={voiceOn}
                            aria-label={voiceOn ? "Voice replies on" : "Voice replies off"}
                        >
                            {voiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </button>
                        <button type="button" className="ed-icon-btn" onClick={onClose} aria-label="Close E.D.">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                {/* The core — breathes at idle, ripples when listening,
                    spins while thinking, pulses while speaking */}
                <div
                    ref={coreRef}
                    className={`ed-core ed-core--${status}`}
                    aria-hidden="true"
                    style={{ "--level": 0 }}
                >
                    <span className="ed-core-ring r1" />
                    <span className="ed-core-ring r2" />
                    <span className="ed-core-heart" />
                </div>
                <p className="ed-status font-mono" aria-live="polite">
                    {status === "listening" && "LISTENING — TAP MIC TO SEND"}
                    {status === "thinking" && "PROCESSING…"}
                    {status === "speaking" && "RESPONDING…"}
                    {status === "idle" && (messages.length === 0 ? "ASK ME ABOUT EDDY" : " ")}
                </p>

                <div ref={scrollRef} className="ed-msgs" aria-live="polite" data-lenis-prevent>
                    {messages.length === 0 && (
                        <div className="flex flex-wrap gap-2 justify-center">
                            {CHIPS.map((c) => (
                                <button key={c} type="button" className="jd-chip px-3 py-1.5 rounded-full text-xs font-medium" onClick={() => send(c)}>
                                    {c}
                                </button>
                            ))}
                        </div>
                    )}
                    {messages.map((m, i) => (
                        <div key={`${m.role}-${i}`} className={`ed-msg ${m.role}`}>
                            {m.role === "assistant" && m.fresh && i === messages.length - 1
                                ? <TypeOut text={m.content} />
                                : m.content}
                        </div>
                    ))}
                    {status === "thinking" && phase && (
                        <div className="ed-msg assistant ed-msg-thinking">
                            <span className="ed-think-dot" aria-hidden="true" />
                            {phase.label}
                            <span className="ed-think-clock"><Elapsed since={phase.since} /></span>
                        </div>
                    )}
                    {error && <p className="ed-msg assistant" role="alert" style={{ color: "var(--danger-tx)" }}>{error}</p>}
                </div>

                <form
                    className="ed-input-row"
                    onSubmit={(e) => {
                        e.preventDefault();
                        // Enter while recording ends the clip (which then
                        // transcribes and sends itself).
                        if (status === "listening") stopListening();
                        else send();
                    }}
                >
                    {canListen && (
                        <button
                            type="button"
                            className={`ed-icon-btn ${status === "listening" ? "listening" : ""}`}
                            onClick={listen}
                            aria-label={status === "listening" ? "Stop listening" : "Ask by voice"}
                        >
                            <Mic className="w-4 h-4" />
                        </button>
                    )}
                    {status === "listening" ? (
                        <div className="ed-recording" role="status" aria-label="Recording">
                            <WaveBars analyser={analyser} />
                            <span className={`ed-rec-clock ${recMs > MAX_CLIP_MS - 10_000 ? "warn" : ""}`}>
                                {fmtClock(recMs)}
                            </span>
                        </div>
                    ) : (
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            maxLength={MAX_QUESTION}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about Eddy — experience, visa, projects…"
                            aria-label="Ask E.D. a question"
                        />
                    )}
                    <button
                        type="submit"
                        className="ed-icon-btn send"
                        disabled={status === "thinking"}
                        aria-label={status === "listening" ? "Stop recording and send" : "Send"}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EDPanel;
