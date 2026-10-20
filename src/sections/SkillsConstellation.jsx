import { useRef, useState } from "react";
import TitleHeader from "../components/TitleHeader.jsx";
import { useInView } from "../hooks/useInView.js";
import { dict } from "../i18n/index.js";
import { SKILL_GRAPH as GRAPH } from "../data/skillGraph.js";
import { mixedTrack } from "../lib/mixedTrack.jsx";

// Skill graph — nodes carry a category, viewBox coords (100 x 76), and
// the projects/experience that prove the skill. Edges link related work.
// Geometry lives in data/skillGraph.js, copy in dict.skills.

const CATS = Object.fromEntries(
    Object.entries(GRAPH.cats).map(([key, color]) => [key, { label: dict.skills.cats[key], color }])
);

const NODES = GRAPH.nodes.map((n) => ({ ...n, ...dict.skills.nodes[n.id] }));

const EDGES = GRAPH.edges;

const CAT_COUNTS = Object.fromEntries(
    Object.keys(CATS).map((key) => [key, NODES.filter((n) => n.cat === key).length])
);
const CAT_MAX = Math.max(...Object.values(CAT_COUNTS));

// Hubs for the resting panel: the four nodes with the most edges.
const HUBS = NODES
    .map((n) => ({ n, deg: EDGES.filter((e) => e.includes(n.id)).length }))
    .sort((a, b) => b.deg - a.deg)
    .slice(0, 4)
    .map(({ n }) => n);

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
    // 40+ node/orbit/edge animations idle here — park them while off-screen.
    const [graphRef, graphInView] = useInView();

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
                title={dict.skills.title}
                sub={dict.skills.sub}
                anchor="skills"
                align="left"
            />
            <p className="ed-lead mt-5 mb-8">
                {dict.skills.lead}
            </p>

            <div className="ed-tile p-4 md:p-6">
                {/* Legend — click a category to spotlight just that cluster */}
                <div className="hidden sm:flex flex-wrap gap-2 mb-4 font-mono text-xs">
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
                    {/* Phone: the graph's labels render at ~8px in a 390px column —
                        unreadable, and the nodes are too close to tap reliably. The
                        same nodes as grouped chips; tapping one opens the same
                        detail panel below. */}
                    <div className="sm:hidden flex flex-col gap-4">
                        {Object.entries(CATS).map(([key, c]) => (
                            <div key={key}>
                                <p className="skill-group-label">
                                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: c.color }} aria-hidden="true" />
                                    {c.label}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {NODES.filter((n) => n.cat === key).map((n) => (
                                        <button
                                            key={n.id}
                                            type="button"
                                            aria-pressed={pinned === n.id}
                                            onClick={() => setPinned(pinned === n.id ? null : n.id)}
                                            className={`skill-chip ${pinned === n.id ? "on" : ""}`}
                                            style={{ "--c": c.color }}
                                        >
                                            {n.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Graph */}
                    <svg
                        ref={graphRef}
                        viewBox="0 0 100 76"
                        className={`skill-graph hidden sm:block w-full h-auto select-none ${graphInView ? "in-view" : ""}`}
                        role="img"
                        aria-label={dict.skills.graphAria}
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
                                    aria-label={dict.skills.nodeAria(n.label, CATS[n.cat].label)}
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
                    {/* On a phone the resting panel is only a hint the chips above
                        already make obvious — it stays out until a chip is picked. */}
                    <div
                        className={`rounded-[var(--r-md)] p-5 flex-col overflow-hidden ${detail ? "flex" : "hidden sm:flex"}`}
                        style={{ background: "var(--ink-0)", border: "1px solid var(--hair)" }}
                    >
                        {detail ? (
                            <div key={pinned} className="skill-detail flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="ed-eyebrow" style={{ color: CATS[detail.cat].color }}>
                                        {mixedTrack(CATS[detail.cat].label)}
                                    </span>
                                    <span className="font-mono text-xs" style={{ color: "var(--tx-2)" }}>
                                        {dict.skills.linksCount(linkedIds.length)}
                                    </span>
                                </div>
                                <h3 className="skill-detail-line text-2xl font-bold mb-4" style={{ color: "var(--tx-0)" }}>
                                    {detail.label}
                                </h3>
                                <p className="skill-detail-line text-xs font-mono uppercase tracking-wider mb-3" style={{ color: "var(--tx-2)", "--i": 1 }}>
                                    {dict.skills.shippedIn}
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
                                            {dict.skills.linkedSkills}
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
                            <div className="flex flex-col flex-1 min-h-[160px]">
                                <p className="ed-eyebrow mb-3">{mixedTrack(dict.skills.interactive)}</p>
                                <p className="text-sm" style={{ color: "var(--tx-2)" }}>
                                    {dict.skills.hint}
                                </p>
                                {/* Until a node is picked the panel was an empty dark
                                    slab half the graph's size. It shows the graph's
                                    shape instead — nodes per cluster, as a bar, each a
                                    shortcut to the same spotlight the legend applies. */}
                                <ul className="skill-overview hidden sm:flex pt-6">
                                    {Object.entries(CATS).map(([key, c]) => {
                                        const count = CAT_COUNTS[key];
                                        return (
                                            <li key={key}>
                                                <button
                                                    type="button"
                                                    className={`skill-overview-row ${catFilter === key ? "on" : ""}`}
                                                    aria-pressed={catFilter === key}
                                                    onClick={() => { setCatFilter(catFilter === key ? null : key); setActive(null); }}
                                                >
                                                    <span className="skill-overview-name">{c.label}</span>
                                                    <span className="skill-overview-bar" aria-hidden="true">
                                                        <span style={{ transform: `scaleX(${count / CAT_MAX})`, background: c.color }} />
                                                    </span>
                                                    <span className="skill-overview-num">{count}</span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                                <div className="hidden sm:block pt-6">
                                    <p className="text-xs font-mono uppercase tracking-wider mb-2.5" style={{ color: "var(--tx-2)" }}>
                                        {dict.skills.mostLinked}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {HUBS.map((n) => (
                                            <button
                                                key={n.id}
                                                type="button"
                                                onClick={() => setPinned(n.id)}
                                                className="skill-hop"
                                                style={{
                                                    color: CATS[n.cat].color,
                                                    borderColor: `color-mix(in oklab, ${CATS[n.cat].color} 40%, transparent)`,
                                                }}
                                            >
                                                {n.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SkillsConstellation;
