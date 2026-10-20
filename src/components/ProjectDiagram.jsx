import { useEffect, useRef } from "react";
import Repeat from "lucide-react/dist/esm/icons/repeat";
import { useInView } from "../hooks/useInView.js";
import { mixedTrack } from "../lib/mixedTrack.jsx";

/**
 * A project drawn as its execution path — for systems with no public UI to
 * screenshot. The steps are a real ordered list (screen readers get the
 * pipeline as text, not a picture of one), threaded on a rail that a single
 * signal travels down; each stage lights as the signal reaches it.
 *
 * Motion is CSS-only and compositor-only: the signal is a transform on a
 * clipped rail, the stage glow is opacity on a pseudo-element, and both share
 * one period (--pd-dur), so they cannot drift apart. Steps are as tall as
 * their content, so node centres are NOT evenly spaced along the rail; each
 * step's position along it is measured (--pd-at, 0..1) and becomes that
 * node's flash delay, which is what makes the flash land exactly when the
 * signal arrives. Re-measured on resize (wrapping changes the spacing).
 * Everything pauses while off-screen (in-view gate) and is absent under
 * reduced motion (see the .pd rules in index.css).
 *
 * Step shape (all copy, from the dictionary):
 *   { t: title, d?: detail line, chips?: [labels], loop?: retry label, end?: bool }
 */
const ProjectDiagram = ({ diagram }) => {
    const [ref, inView] = useInView("0px 0px");
    const trackRef = useRef(null);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return undefined;
        const measure = () => {
            const nodes = [...track.querySelectorAll(".pd-node")];
            if (nodes.length < 2) return;
            const top = track.getBoundingClientRect().top;
            const centres = nodes.map((nd) => {
                const r = nd.getBoundingClientRect();
                return r.top - top + r.height / 2;
            });
            const first = centres[0];
            const span = centres[centres.length - 1] - first || 1;
            track.style.setProperty("--pd-rail-top", `${first}px`);
            track.style.setProperty("--pd-rail-h", `${span}px`);
            nodes.forEach((nd, i) => {
                nd.parentElement.style.setProperty("--pd-at", ((centres[i] - first) / span).toFixed(4));
            });
        };
        // Measure once unconditionally — without ResizeObserver the rail
        // would otherwise keep its 0px fallback and the signal would vanish.
        measure();
        if (typeof ResizeObserver === "undefined") return undefined;
        const ro = new ResizeObserver(measure);
        // The track alone is not enough: on desktop it is flex:1 inside a
        // column stretched by the copy beside it, so a step growing (a web
        // font swapping in, a chip row wrapping) can leave the track's own
        // box unchanged. The list's box always moves with its steps.
        ro.observe(track);
        const list = track.querySelector(".pd-steps");
        if (list) ro.observe(list);
        return () => ro.disconnect();
    }, []);

    return (
        <figure ref={ref} className={`pd ${inView ? "in-view" : ""}`}>
            <figcaption className="pd-head">
                <span className="pd-live" aria-hidden="true" />
                <span className="ed-eyebrow">{mixedTrack(diagram.label)}</span>
            </figcaption>

            <div ref={trackRef} className="pd-track">
                {/* A sibling of the list, not a child: an <ol> may only
                    contain <li>. */}
                <span className="pd-rail" aria-hidden="true">
                    <span className="pd-signal" />
                </span>
                <ol className="pd-steps">
                    {diagram.steps.map((step, i) => (
                        <li
                            key={step.t}
                            className={`pd-step ${step.end ? "pd-step--end" : ""}`}
                            style={{ "--pd-at": i / (diagram.steps.length - 1) }}
                        >
                            <span className="pd-node" aria-hidden="true">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="pd-body">
                                <span className="pd-what">
                                    <span className="pd-title">{step.t}</span>
                                    {step.chips?.length > 0 && (
                                        <span className="pd-chips">
                                            {step.chips.map((c) => (
                                                <span key={c} className="pd-chip">{c}</span>
                                            ))}
                                        </span>
                                    )}
                                    {step.loop && (
                                        <span className="pd-loop">
                                            <Repeat className="w-3.5 h-3.5" aria-hidden="true" />
                                            {step.loop}
                                        </span>
                                    )}
                                </span>
                                {step.d && <span className="pd-detail">{step.d}</span>}
                            </span>
                        </li>
                    ))}
                </ol>
            </div>
        </figure>
    );
};

export default ProjectDiagram;
