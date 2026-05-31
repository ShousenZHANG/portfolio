import { useState } from "react";
import TitleHeader from "../components/TitleHeader.jsx";

// Skill graph — nodes carry a category, viewBox coords (100 x 64), and
// the projects/experience that prove the skill. Edges link related work.
const CATS = {
    ai: { label: "AI / ML", color: "var(--sig)" },
    fe: { label: "Frontend", color: "var(--sig-2)" },
    be: { label: "Backend", color: "oklch(0.74 0.15 300)" },
    ops: { label: "Cloud / DevOps", color: "oklch(0.78 0.13 195)" },
};

const NODES = [
    // AI / ML (upper-left)
    { id: "llm", label: "LLM Agents", cat: "ai", x: 20, y: 14, r: 7, used: ["Joblit", "Corrs AI agents"] },
    { id: "rag", label: "RAG", cat: "ai", x: 10, y: 30, r: 5.5, used: ["Corrs ServiceNow agent"] },
    { id: "prompt", label: "Prompt Eng.", cat: "ai", x: 27, y: 30, r: 5.5, used: ["Joblit", "JD matcher"] },
    { id: "gemini", label: "Gemini / Claude", cat: "ai", x: 17, y: 45, r: 6, used: ["This site's JD matcher", "Joblit"] },

    // Frontend (upper-right)
    { id: "react", label: "React", cat: "fe", x: 75, y: 13, r: 7, used: ["This portfolio", "Joblit"] },
    { id: "ts", label: "TypeScript", cat: "fe", x: 87, y: 26, r: 6, used: ["Joblit"] },
    { id: "next", label: "Next.js", cat: "fe", x: 70, y: 30, r: 5.5, used: ["Joblit"] },
    { id: "tw", label: "Tailwind", cat: "fe", x: 84, y: 42, r: 5, used: ["This portfolio", "Joblit"] },

    // Backend (lower-left)
    { id: "node", label: "Node.js", cat: "be", x: 17, y: 60, r: 6.5, used: ["JD matcher API", "Joblit"] },
    { id: "python", label: "Python", cat: "be", x: 31, y: 50, r: 6, used: ["AI / ML work"] },
    { id: "java", label: "Java + Spring", cat: "be", x: 9, y: 49, r: 6, used: ["Competition Platform", "Newtouch"] },

    // Cloud / DevOps (lower-right)
    { id: "docker", label: "Docker", cat: "ops", x: 73, y: 58, r: 6, used: ["Competition Platform"] },
    { id: "cicd", label: "CI/CD", cat: "ops", x: 88, y: 54, r: 5.5, used: ["Competition Platform", "Joblit"] },
    { id: "pg", label: "PostgreSQL", cat: "ops", x: 67, y: 46, r: 5, used: ["Joblit"] },
    { id: "vercel", label: "Vercel", cat: "ops", x: 84, y: 64, r: 5, used: ["This portfolio", "Joblit"] },
];

const EDGES = [
    ["llm", "rag"], ["llm", "prompt"], ["llm", "gemini"], ["prompt", "gemini"],
    ["react", "ts"], ["react", "next"], ["ts", "next"], ["react", "tw"], ["next", "tw"],
    ["node", "python"], ["java", "node"], ["python", "llm"], ["node", "next"],
    ["docker", "cicd"], ["docker", "java"], ["pg", "node"], ["vercel", "next"], ["vercel", "cicd"],
    ["llm", "python"], ["gemini", "node"], ["ts", "vercel"],
];

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

const SkillsConstellation = () => {
    const [active, setActive] = useState(null);   // hovered or focused id
    const [pinned, setPinned] = useState(null);    // clicked id (detail panel)

    const focus = active || pinned;
    const neighbors = focus
        ? new Set(EDGES.filter((e) => e.includes(focus)).flatMap((e) => e))
        : null;

    const isDim = (id) => neighbors && !neighbors.has(id);
    const edgeActive = (a, b) => focus && (a === focus || b === focus);

    const detail = pinned ? byId[pinned] : null;

    return (
        <section id="skills" className="ed-shell py-[var(--sp-section)]">
            <TitleHeader
                title="Skill Constellation"
                sub="04 / Stack"
                anchor="skills"
                align="left"
            />
            <p className="ed-lead mt-5 mb-8">
                The stack I build with, mapped by how it connects. Hover a node to
                trace its links — click one to see what I shipped with it.
            </p>

            <div className="ed-tile p-4 md:p-6">
                {/* Legend */}
                <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4 font-mono text-xs">
                    {Object.values(CATS).map((c) => (
                        <span key={c.label} className="inline-flex items-center gap-1.5" style={{ color: "var(--tx-2)" }}>
                            <span className="inline-block w-2 h-2 rounded-full" style={{ background: c.color }} />
                            {c.label}
                        </span>
                    ))}
                </div>

                <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4 items-stretch">
                    {/* Graph */}
                    <svg
                        viewBox="0 0 100 72"
                        className="w-full h-auto select-none"
                        role="img"
                        aria-label="Interactive skills graph"
                        onMouseLeave={() => setActive(null)}
                    >
                        {/* edges */}
                        {EDGES.map(([a, b]) => {
                            const na = byId[a];
                            const nb = byId[b];
                            const on = edgeActive(a, b);
                            return (
                                <line
                                    key={`${a}-${b}`}
                                    x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                                    stroke={on ? "var(--sig)" : "var(--hair-bright)"}
                                    strokeWidth={on ? 0.5 : 0.25}
                                    opacity={focus ? (on ? 0.9 : 0.12) : 0.4}
                                    style={{ transition: "opacity .25s, stroke .25s, stroke-width .25s" }}
                                />
                            );
                        })}
                        {/* nodes */}
                        {NODES.map((n) => {
                            const dim = isDim(n.id);
                            const isFocus = focus === n.id;
                            return (
                                <g
                                    key={n.id}
                                    className="nr-skill-node"
                                    transform={`translate(${n.x} ${n.y})`}
                                    opacity={dim ? 0.3 : 1}
                                    style={{ transition: "opacity .25s", cursor: "pointer" }}
                                    onMouseEnter={() => setActive(n.id)}
                                    onClick={() => setPinned(pinned === n.id ? null : n.id)}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`${n.label}, ${CATS[n.cat].label}`}
                                    onFocus={() => setActive(n.id)}
                                    onBlur={() => setActive(null)}
                                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPinned(pinned === n.id ? null : n.id); } }}
                                >
                                    <circle
                                        r={isFocus ? n.r * 0.62 : n.r * 0.5}
                                        fill={CATS[n.cat].color}
                                        opacity={0.16}
                                        style={{ transition: "r .25s" }}
                                    />
                                    <circle
                                        className="nr-skill-core"
                                        r={isFocus ? 2.1 : 1.6}
                                        fill={CATS[n.cat].color}
                                        style={{ transition: "r .25s" }}
                                    />
                                    <text
                                        y={n.r * 0.5 + 3.4}
                                        textAnchor="middle"
                                        fontSize="2.5"
                                        fill={isFocus ? "var(--tx-0)" : "var(--tx-1)"}
                                        style={{ fontWeight: isFocus ? 600 : 400, transition: "fill .25s" }}
                                    >
                                        {n.label}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    {/* Detail panel */}
                    <div
                        className="rounded-[var(--r-md)] p-5 flex flex-col"
                        style={{ background: "var(--ink-0)", border: "1px solid var(--hair)" }}
                    >
                        {detail ? (
                            <>
                                <span className="ed-eyebrow mb-3">{CATS[detail.cat].label}</span>
                                <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--tx-0)" }}>
                                    {detail.label}
                                </h3>
                                <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: "var(--tx-2)" }}>
                                    Shipped in
                                </p>
                                <ul className="space-y-2">
                                    {detail.used.map((u) => (
                                        <li key={u} className="flex gap-2 text-sm" style={{ color: "var(--tx-1)" }}>
                                            <span style={{ color: CATS[detail.cat].color }}>▸</span>
                                            {u}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <div className="flex flex-col items-start justify-center h-full min-h-[160px]">
                                <p className="ed-eyebrow mb-3">Interactive</p>
                                <p className="text-sm" style={{ color: "var(--tx-2)" }}>
                                    Click any node to see the projects and roles where I
                                    used that skill in production.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SkillsConstellation;
