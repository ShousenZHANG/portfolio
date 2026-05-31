import { useCallback, useEffect, useRef, useState } from "react";
import TitleHeader from "../components/TitleHeader.jsx";
import { prefersReducedMotion } from "../lib/motion.js";

const GAME_SECONDS = 20;
const NODE_LIFE = 1250;     // ms a neuron stays before it fades
const SPAWN_MS = 720;       // spawn cadence
const MAX_NODES = 4;        // concurrent neurons

const BEST_KEY = "neural-reflex-best";

let _id = 0;
const nextId = () => ++_id;

const NeuralReflex = () => {
    const areaRef = useRef(null);
    const spawnTimer = useRef(null);
    const tickTimer = useRef(null);
    const lifeTimers = useRef(new Map());

    const [playing, setPlaying] = useState(false);
    const [nodes, setNodes] = useState([]);
    const [bursts, setBursts] = useState([]);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(1);
    const [time, setTime] = useState(GAME_SECONDS);
    const [best, setBest] = useState(0);
    const reduced = prefersReducedMotion();

    useEffect(() => {
        const saved = Number(window.localStorage.getItem(BEST_KEY) || 0);
        if (saved) setBest(saved);
    }, []);

    const clearAll = useCallback(() => {
        clearInterval(spawnTimer.current);
        clearInterval(tickTimer.current);
        lifeTimers.current.forEach((t) => clearTimeout(t));
        lifeTimers.current.clear();
    }, []);

    const end = useCallback(() => {
        clearAll();
        setPlaying(false);
        setNodes([]);
        setScore((s) => {
            setBest((b) => {
                const nb = Math.max(b, s);
                window.localStorage.setItem(BEST_KEY, String(nb));
                return nb;
            });
            return s;
        });
    }, [clearAll]);

    const removeNode = useCallback((id, missed) => {
        const t = lifeTimers.current.get(id);
        if (t) { clearTimeout(t); lifeTimers.current.delete(id); }
        setNodes((ns) => ns.filter((n) => n.id !== id));
        if (missed) setCombo(1);
    }, []);

    const spawn = useCallback(() => {
        setNodes((ns) => {
            if (ns.length >= MAX_NODES) return ns;
            const id = nextId();
            const x = 8 + Math.round(Math.random() * 84);
            const y = 14 + Math.round(Math.random() * 72);
            const timer = setTimeout(() => removeNode(id, true), NODE_LIFE);
            lifeTimers.current.set(id, timer);
            return [...ns, { id, x, y }];
        });
    }, [removeNode]);

    const start = useCallback(() => {
        clearAll();
        setScore(0);
        setCombo(1);
        setTime(GAME_SECONDS);
        setNodes([]);
        setBursts([]);
        setPlaying(true);
        spawnTimer.current = setInterval(spawn, SPAWN_MS);
        tickTimer.current = setInterval(() => {
            setTime((t) => {
                if (t <= 1) { end(); return 0; }
                return t - 1;
            });
        }, 1000);
    }, [clearAll, spawn, end]);

    const hit = useCallback((node) => {
        removeNode(node.id, false);
        setCombo((c) => Math.min(c + 1, 9));
        setScore((s) => s + 10 * combo);
        const burstId = nextId();
        setBursts((b) => [...b, { id: burstId, x: node.x, y: node.y }]);
        setTimeout(() => setBursts((b) => b.filter((x) => x.id !== burstId)), 600);
    }, [combo, removeNode]);

    useEffect(() => clearAll, [clearAll]);

    return (
        <section id="playground" className="ed-shell py-[var(--sp-section)]">
            <TitleHeader
                title="Neural Reflex"
                sub="04 / Playground"
                anchor="playground"
                align="left"
            />

            <p className="ed-lead mt-5 mb-8">
                A 20-second reflex game. Fire the neurons before they fade — chain
                hits to build a combo multiplier. {reduced ? "" : "Best on desktop."}
            </p>

            <div className="ed-tile overflow-hidden">
                {/* HUD */}
                <div
                    className="flex items-center justify-between gap-4 px-5 py-3 font-mono text-sm"
                    style={{ borderBottom: "1px solid var(--hair)" }}
                >
                    <div className="flex items-center gap-5">
                        <span style={{ color: "var(--tx-2)" }}>
                            SCORE <span className="font-semibold" style={{ color: "var(--tx-0)" }}>{score}</span>
                        </span>
                        <span style={{ color: "var(--tx-2)" }}>
                            COMBO <span className="font-semibold" style={{ color: "var(--sig)" }}>x{combo}</span>
                        </span>
                        <span className="hidden sm:inline" style={{ color: "var(--tx-2)" }}>
                            BEST <span className="font-semibold" style={{ color: "var(--sig-2)" }}>{best}</span>
                        </span>
                    </div>
                    <span style={{ color: time <= 5 && playing ? "var(--sig)" : "var(--tx-2)" }}>
                        {String(time).padStart(2, "0")}s
                    </span>
                </div>

                {/* Play area */}
                <div
                    ref={areaRef}
                    className="nr-area relative w-full"
                    style={{ height: "min(58vh, 440px)" }}
                >
                    {nodes.map((n) => (
                        <button
                            key={n.id}
                            type="button"
                            onPointerDown={() => hit(n)}
                            aria-label="Fire neuron"
                            className="nr-node"
                            style={{ left: `${n.x}%`, top: `${n.y}%` }}
                        >
                            <span className="nr-node-core" />
                            <span className="nr-node-ring" />
                        </button>
                    ))}

                    {bursts.map((b) => (
                        <span
                            key={b.id}
                            className="nr-burst"
                            style={{ left: `${b.x}%`, top: `${b.y}%` }}
                            aria-hidden="true"
                        />
                    ))}

                    {/* Overlay: start / end */}
                    {!playing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6" style={{ background: "color-mix(in oklch, var(--ink-0) 55%, transparent)" }}>
                            {reduced ? (
                                <p className="ed-lead" style={{ maxWidth: "32ch" }}>
                                    Motion is reduced in your system settings, so the game is paused.
                                </p>
                            ) : (
                                <>
                                    <p className="text-lg md:text-xl font-semibold mb-1" style={{ color: "var(--tx-0)" }}>
                                        {score > 0 ? `Run over — ${score} pts` : "Ready?"}
                                    </p>
                                    <p className="text-sm mb-5" style={{ color: "var(--tx-2)" }}>
                                        {score > 0 && score >= best ? "New best!" : "Tap the glowing neurons fast."}
                                    </p>
                                    <button type="button" onClick={start} className="ed-btn" data-magnetic>
                                        {score > 0 ? "Play again" : "Start"}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default NeuralReflex;
