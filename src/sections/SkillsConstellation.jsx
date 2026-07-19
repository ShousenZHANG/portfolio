import { useRef, useState } from "react";
import TitleHeader from "../components/TitleHeader.jsx";

// Skill graph — nodes carry a category, viewBox coords (100 x 76), and
// the projects/experience that prove the skill. Edges link related work.
// Foregrounds the Microsoft 365 agent stack (Copilot Studio / Power
// Platform), with AI, integration, engineering, and cloud as support.
const CATS = {
    ms: { label: "Microsoft & Power Platform", color: "var(--sig)" },
    ai: { label: "AI & Agents", color: "oklch(0.74 0.16 320)" },
    data: { label: "Integration & Data", color: "var(--sig-2)" },
    eng: { label: "Software Engineering", color: "oklch(0.80 0.15 155)" },
    cloud: { label: "Cloud & DevOps", color: "oklch(0.78 0.12 240)" },
};

const NODES = [
    // Microsoft & Power Platform (top center — the signature cluster)
    { id: "copilot", label: "Copilot Studio", cat: "ms", x: 47, y: 10, r: 7.5, used: ["Stepping Stone House — SharePoint agent", "Corrs — Teams agent"] },
    { id: "pautomate", label: "Power Automate", cat: "ms", x: 32, y: 20, r: 6, used: ["SSH meeting-notes flow", "Corrs agent flows"] },
    { id: "dataverse", label: "Dataverse", cat: "ms", x: 55, y: 24, r: 6.5, used: ["Reusable agent Skills", "data modeling"] },
    { id: "powerapps", label: "Power Apps", cat: "ms", x: 41, y: 33, r: 5, used: ["Microsoft Power Platform"] },

    // AI & Agents (left)
    { id: "agents", label: "AI Agents", cat: "ai", x: 19, y: 30, r: 6.5, used: ["SSH + Corrs Copilot agents", "Joblit"] },
    { id: "rag", label: "RAG", cat: "ai", x: 9, y: 43, r: 5.5, used: ["Grounded retrieval at SSH + Corrs"] },
    { id: "mcp", label: "MCP", cat: "ai", x: 23, y: 46, r: 5.5, used: ["SSH — SharePoint grounding", "this site"] },
    { id: "workiq", label: "Work IQ", cat: "ai", x: 11, y: 56, r: 5, used: ["Microsoft 365 agent work"] },
    { id: "prompt", label: "Prompt Eng.", cat: "ai", x: 27, y: 59, r: 5.5, used: ["Joblit", "JD matcher"] },

    // Integration & Data (lower center-left)
    { id: "boomi", label: "Boomi", cat: "data", x: 41, y: 52, r: 6, used: ["Corrs production-log triage"] },
    { id: "servicenow", label: "ServiceNow", cat: "data", x: 45, y: 65, r: 5.5, used: ["Corrs enterprise systems"] },
    { id: "playwright", label: "Playwright", cat: "data", x: 57, y: 71, r: 5, used: ["SSH Markdown pipeline"] },
    { id: "sql", label: "SQL / REST", cat: "data", x: 30, y: 70, r: 5, used: ["Newtouch APIs", "Contest Platform"] },

    // Software Engineering (right)
    { id: "java", label: "Java + Spring", cat: "eng", x: 74, y: 13, r: 6.5, used: ["Newtouch", "Contest Platform"] },
    { id: "python", label: "Python", cat: "eng", x: 88, y: 23, r: 5.5, used: ["SSH Markdown pipeline (MarkItDown)"] },
    { id: "ts", label: "TypeScript", cat: "eng", x: 67, y: 29, r: 5.5, used: ["Joblit", "this portfolio"] },
    { id: "react", label: "React / Next", cat: "eng", x: 84, y: 37, r: 6, used: ["This portfolio", "Joblit"] },

    // Cloud & DevOps (lower right)
    { id: "azure", label: "Azure", cat: "cloud", x: 65, y: 49, r: 6, used: ["Microsoft 365 stack"] },
    { id: "aws", label: "AWS", cat: "cloud", x: 80, y: 51, r: 5, used: ["Contest Platform"] },
    { id: "docker", label: "Docker", cat: "cloud", x: 73, y: 63, r: 5.5, used: ["Contest Platform", "Newtouch"] },
    { id: "cicd", label: "CI/CD", cat: "cloud", x: 88, y: 61, r: 5.5, used: ["Contest Platform", "Joblit"] },
];

const EDGES = [
    // Microsoft cluster
    ["copilot", "pautomate"], ["copilot", "dataverse"], ["pautomate", "dataverse"],
    ["copilot", "powerapps"], ["dataverse", "powerapps"],
    // the agent story — Copilot Studio wired to AI + integration + cloud
    ["copilot", "agents"], ["copilot", "mcp"], ["copilot", "workiq"],
    ["dataverse", "rag"], ["pautomate", "boomi"], ["azure", "copilot"],
    // AI cluster
    ["agents", "rag"], ["agents", "mcp"], ["agents", "prompt"], ["rag", "mcp"], ["mcp", "workiq"],
    // Integration & data
    ["boomi", "servicenow"], ["servicenow", "sql"], ["servicenow", "mcp"], ["sql", "java"],
    ["playwright", "python"], ["playwright", "copilot"],
    // Engineering
    ["java", "ts"], ["ts", "react"], ["python", "java"], ["python", "agents"],
    // Cloud
    ["azure", "aws"], ["azure", "docker"], ["docker", "cicd"], ["aws", "docker"], ["docker", "java"], ["cicd", "react"],
];

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

// Curved edge paths — a slight perpendicular bow (alternating side) turns
// the wire diagram into an organic constellation. Precomputed once.
const EDGE_PATHS = EDGES.map(([a, b], i) => {
    const na = byId[a];
    const nb = byId[b];
    const dx = nb.x - na.x;
    const dy = nb.y - na.y;
    const len = Math.hypot(dx, dy) || 1;
    const bow = len * 0.10 * (i % 2 === 0 ? 1 : -1);
    const cx = (na.x + nb.x) / 2 + (-dy / len) * bow;
    const cy = (na.y + nb.y) / 2 + (dx / len) * bow;
    return { a, b, d: `M ${na.x} ${na.y} Q ${cx} ${cy} ${nb.x} ${nb.y}` };
});

const SkillsConstellation = () => {
    const [active, setActive] = useState(null);   // hovered or focused id
    const [pinned, setPinned] = useState(null);    // clicked id (detail panel)
    const [catFilter, setCatFilter] = useState(null); // legend category filter

    const focus = active || pinned;
    const neighbors = focus
        ? new Set(EDGES.filter((e) => e.includes(focus)).flatMap((e) => e))
        : null;

    const isDim = (id) =>
        (neighbors && !neighbors.has(id)) ||
        (catFilter && byId[id].cat !== catFilter);
    const edgeActive = (a, b) => focus && (a === focus || b === focus);

    const detail = pinned ? byId[pinned] : null;
    const linkedIds = pinned
        ? EDGES.filter((e) => e.includes(pinned)).map(([a, b]) => (a === pinned ? b : a))
        : [];

    // Roving tabindex — one tab stop for the whole graph, arrows move between
    // nodes, Enter/Space pins. Beats a flat 20-stop tab sequence with no way
    // to explore the edges that are the feature's whole point.
    const [rovingIndex, setRovingIndex] = useState(0);
    const nodeRefs = useRef([]);

    const onNodeKey = (e, i) => {
        const n = NODES.length;
        let next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = n - 1;
        else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setPinned((p) => (p === NODES[i].id ? null : NODES[i].id));
            return;
        } else return;
        e.preventDefault();
        setRovingIndex(next);
        setActive(NODES[next].id);
        nodeRefs.current[next]?.focus();
    };

    return (
        <section id="skills" className="ed-shell py-[var(--sp-section)]">
            <TitleHeader
                title="Skill Constellation"
                sub="04 / Stack"
                anchor="skills"
                align="left"
            />
            <p className="ed-lead mt-5 mb-8">
                The Microsoft 365 agent stack I build with — Copilot Studio, Power
                Platform, and the AI around them — mapped by how it connects. Tap or
                hover a node to trace its links; select one to see what I shipped
                with it.
            </p>

            <div className="ed-tile p-4 md:p-6">
                {/* Legend — click a category to spotlight just that cluster */}
                <div className="flex flex-wrap gap-2 mb-4 font-mono text-xs">
                    {Object.entries(CATS).map(([key, c]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => { setCatFilter(catFilter === key ? null : key); setPinned(null); setActive(null); }}
                            aria-pressed={catFilter === key}
                            className={`skill-legend inline-flex items-center gap-1.5 ${catFilter === key ? "on" : ""}`}
                        >
                            <span className="inline-block w-2 h-2 rounded-full" style={{ background: c.color }} />
                            {c.label}
                        </button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4 items-stretch">
                    {/* Graph */}
                    <svg
                        viewBox="0 0 100 76"
                        className="w-full h-auto select-none"
                        role="img"
                        aria-label="Interactive skills graph"
                        onMouseLeave={() => setActive(null)}
                    >
                        {/* edges — curved, with energy flow when active */}
                        {EDGE_PATHS.map(({ a, b, d }) => {
                            const on = edgeActive(a, b);
                            const catDim = catFilter && (byId[a].cat !== catFilter || byId[b].cat !== catFilter);
                            return (
                                <path
                                    key={`${a}-${b}`}
                                    d={d}
                                    fill="none"
                                    className={`skill-edge ${on ? "on" : ""}`}
                                    stroke={on ? "var(--sig)" : "var(--hair-bright)"}
                                    strokeWidth={on ? 0.5 : 0.25}
                                    opacity={catDim ? 0.05 : focus ? (on ? 0.9 : 0.1) : 0.4}
                                />
                            );
                        })}
                        {/* nodes */}
                        {NODES.map((n, i) => {
                            const dim = isDim(n.id);
                            const isFocus = focus === n.id;
                            const isPinned = pinned === n.id;
                            return (
                                <g
                                    key={n.id}
                                    ref={(el) => { nodeRefs.current[i] = el; }}
                                    className="nr-skill-node"
                                    transform={`translate(${n.x} ${n.y})`}
                                    opacity={dim ? 0.28 : 1}
                                    style={{ transition: "opacity .25s" }}
                                    onMouseEnter={() => setActive(n.id)}
                                    onClick={() => setPinned(isPinned ? null : n.id)}
                                    tabIndex={i === rovingIndex ? 0 : -1}
                                    role="button"
                                    aria-pressed={isPinned}
                                    aria-label={`${n.label}, ${CATS[n.cat].label}`}
                                    onFocus={() => { setActive(n.id); setRovingIndex(i); }}
                                    onBlur={() => setActive(null)}
                                    onKeyDown={(e) => onNodeKey(e, i)}
                                >
                                    {/* invisible hit area — lifts the touch target to ~44px on mobile */}
                                    <circle r="6.5" fill="transparent" />
                                    {/* ambient float — the constellation breathes */}
                                    <g
                                        className="skill-float"
                                        style={{ animationDuration: `${5 + (i % 4)}s`, animationDelay: `${-((i * 0.9) % 4)}s` }}
                                    >
                                        {/* select burst — re-mounts per pin via key, plays once */}
                                        {isPinned && (
                                            <circle key={`burst-${n.id}`} className="skill-burst" r="2" fill="none" stroke={CATS[n.cat].color} strokeWidth="0.6" />
                                        )}
                                        {/* orbit ring — a slow dashed satellite around the pinned node */}
                                        {isPinned && (
                                            <circle
                                                className="skill-orbit"
                                                r={n.r * 0.62 + 1.4}
                                                fill="none"
                                                stroke={CATS[n.cat].color}
                                                strokeWidth="0.22"
                                                strokeDasharray="1.1 1.6"
                                                opacity="0.85"
                                            />
                                        )}
                                        <circle
                                            r={isFocus ? n.r * 0.62 : n.r * 0.5}
                                            fill={CATS[n.cat].color}
                                            opacity={isPinned ? 0.26 : 0.16}
                                            style={{ transition: "r .25s, opacity .25s" }}
                                        />
                                        <circle
                                            className="nr-skill-core"
                                            r={isFocus ? 2.2 : 1.6}
                                            fill={CATS[n.cat].color}
                                            stroke={isPinned ? "var(--tx-0)" : "transparent"}
                                            strokeWidth="0.5"
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
                                </g>
                            );
                        })}
                    </svg>

                    {/* Detail panel */}
                    <div
                        className="rounded-[var(--r-md)] p-5 flex flex-col overflow-hidden"
                        style={{ background: "var(--ink-0)", border: "1px solid var(--hair)" }}
                    >
                        {detail ? (
                            <div key={pinned} className="skill-detail flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="ed-eyebrow" style={{ color: CATS[detail.cat].color }}>
                                        {CATS[detail.cat].label}
                                    </span>
                                    <span className="font-mono text-xs" style={{ color: "var(--tx-2)" }}>
                                        {linkedIds.length} links
                                    </span>
                                </div>
                                <h3 className="skill-detail-line text-2xl font-bold mb-4" style={{ color: "var(--tx-0)" }}>
                                    {detail.label}
                                </h3>
                                <p className="skill-detail-line text-xs font-mono uppercase tracking-wider mb-3" style={{ color: "var(--tx-2)", "--i": 1 }}>
                                    Shipped in
                                </p>
                                <ul className="space-y-2.5">
                                    {detail.used.map((u, idx) => (
                                        <li
                                            key={u}
                                            className="skill-detail-line flex gap-2.5 text-sm items-start"
                                            style={{ color: "var(--tx-1)", "--i": idx + 2 }}
                                        >
                                            <span className="mt-0.5" style={{ color: CATS[detail.cat].color }}>▸</span>
                                            {u}
                                        </li>
                                    ))}
                                </ul>

                                {/* Linked skills — hop through the graph without touching it */}
                                {linkedIds.length > 0 && (
                                    <>
                                        <p className="skill-detail-line text-xs font-mono uppercase tracking-wider mt-5 mb-2.5" style={{ color: "var(--tx-2)", "--i": detail.used.length + 2 }}>
                                            Linked skills
                                        </p>
                                        <div className="skill-detail-line flex flex-wrap gap-1.5" style={{ "--i": detail.used.length + 3 }}>
                                            {linkedIds.map((cid) => {
                                                const cn = byId[cid];
                                                return (
                                                    <button
                                                        key={cid}
                                                        type="button"
                                                        onClick={() => setPinned(cid)}
                                                        className="skill-hop"
                                                        style={{
                                                            color: CATS[cn.cat].color,
                                                            borderColor: `color-mix(in oklab, ${CATS[cn.cat].color} 40%, transparent)`,
                                                        }}
                                                    >
                                                        {cn.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
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
