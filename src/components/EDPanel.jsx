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

const getRecognition = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const rec = new SR();
    rec.lang = navigator.language?.startsWith("zh") ? "zh-CN" : "en-AU";
    // Continuous: the default mode stops at the first ~1s pause, which
    // cut people off mid-sentence. Interim results stream the transcript
    // into the input so the visitor sees E.D. hearing them.
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    return rec;
};

const EDPanel = ({ onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [status, setStatus] = useState("idle"); // idle|listening|thinking|speaking
    const [voiceOn, setVoiceOn] = useState(true);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);
    const scrollRef = useRef(null);
    const audioRef = useRef(null);
    const recRef = useRef(null);
    const abortRef = useRef(null);
    const canListen = typeof window !== "undefined" &&
        Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

    useEffect(() => {
        inputRef.current?.focus();
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            audioRef.current?.pause();
            listeningRef.current = false; // stop the keep-alive before aborting
            recRef.current?.abort?.();
            abortRef.current?.abort();
        };
    }, [onClose]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
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
            setMessages((m) => [...m, { role: "assistant", content: data.answer, fresh: true }]);
            if (voiceOn && data.audio) speak(data.audio);
            else setStatus("idle");
        } catch (err) {
            if (err?.name === "AbortError") return;
            setError(err?.message || "E.D.'s core is unreachable. Reach Eddy directly: eddy.zhang24@gmail.com");
            setStatus("idle");
        }
    };

    const listeningRef = useRef(false);

    const stopListening = () => {
        listeningRef.current = false;
        recRef.current?.stop();
        setStatus("idle");
        // Submit whatever was transcribed.
        const text = inputRef.current?.value?.trim();
        if (text) send(text);
    };

    const listen = () => {
        if (status === "listening") { stopListening(); return; }
        const rec = getRecognition();
        if (!rec) return;
        recRef.current = rec;
        listeningRef.current = true;
        setStatus("listening");
        setError(null);
        rec.onresult = (e) => {
            // Stitch finals + current interim into the input, live.
            let text = "";
            for (let i = 0; i < e.results.length; i++) {
                text += e.results[i][0]?.transcript || "";
            }
            setInput(text);
        };
        rec.onerror = (e) => {
            listeningRef.current = false;
            setStatus("idle");
            // A silent failure here looked like a dead button — say why.
            if (e?.error !== "no-speech" && e?.error !== "aborted") {
                setError(
                    e?.error === "not-allowed" || e?.error === "service-not-allowed"
                        ? "Microphone access is blocked — check the address-bar permission, or just type."
                        : "Voice input hit a snag — typing works just as well."
                );
            }
        };
        rec.onend = () => {
            // Chrome hard-stops recognition (~60s or on silence). If the
            // visitor is still in listening mode, quietly restart — the
            // mic should stay open until THEY end it.
            if (listeningRef.current) {
                try { rec.start(); } catch { listeningRef.current = false; setStatus("idle"); }
            }
        };
        try { rec.start(); } catch { listeningRef.current = false; setStatus("idle"); }
    };

    return (
        <div className="ed-panel" role="dialog" aria-modal="true" aria-label="E.D. — Eddy's AI assistant">
            <div className="ed-panel-inner">
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
                <div className={`ed-core ed-core--${status}`} aria-hidden="true">
                    <span className="ed-core-ring r1" />
                    <span className="ed-core-ring r2" />
                    <span className="ed-core-heart" />
                </div>
                <p className="ed-status font-mono" aria-live="polite">
                    {status === "listening" && "LISTENING…"}
                    {status === "thinking" && "PROCESSING…"}
                    {status === "speaking" && "RESPONDING…"}
                    {status === "idle" && (messages.length === 0 ? "ASK ME ABOUT EDDY" : " ")}
                </p>

                <div ref={scrollRef} className="ed-msgs" aria-live="polite">
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
                    {status === "thinking" && <div className="ed-msg assistant ed-msg-thinking">▊</div>}
                    {error && <p className="ed-msg assistant" role="alert" style={{ color: "var(--danger-tx)" }}>{error}</p>}
                </div>

                <form
                    className="ed-input-row"
                    onSubmit={(e) => {
                        e.preventDefault();
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
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        maxLength={MAX_QUESTION}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={status === "listening"
                            ? "Listening — tap the mic again to send…"
                            : "Ask about Eddy — experience, visa, projects…"}
                        aria-label="Ask E.D. a question"
                    />
                    <button type="submit" className="ed-icon-btn send" disabled={status === "thinking"} aria-label="Send">
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EDPanel;
