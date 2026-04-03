import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { eligibilityStyle } from '../../lib/jd-normalize';

function formatEligibilityLine(label, item) {
    if (!item || !item.note) return null;
    const { icon, color } = eligibilityStyle(item.status);

    return (
        <p className="text-[11px] text-neutral-200" key={label}>
            <span className={`${color} mr-1`}>{icon}</span>
            <span className="font-medium text-neutral-100">{label}:</span>{' '}
            <span>{item.note}</span>
        </p>
    );
}

function fitLabelColor(label) {
    if (label?.startsWith('Strong')) return { text: 'text-emerald-200', dot: 'bg-emerald-300' };
    if (label?.startsWith('Good')) return { text: 'text-cyan-200', dot: 'bg-cyan-300' };
    if (label?.startsWith('Possible')) return { text: 'text-amber-200', dot: 'bg-amber-300' };
    if (label?.startsWith('Not')) return { text: 'text-rose-200', dot: 'bg-rose-300' };
    return { text: 'text-neutral-100', dot: 'bg-neutral-300' };
}

/**
 * Compact dark-glass result panel shared between JDAssistant surfaces.
 */
export default function JDResultPanel({ jd, setJd, loading, result, error, submit }) {
    const colors = result ? fitLabelColor(result.fitLabel) : null;

    return (
        <div className="w-[min(380px,94vw)] bg-[#0e0e10]/95 text-white border border-white/10 rounded-2xl backdrop-blur-md">
            {/* Header */}
            <div className="px-4 pt-4 pb-2">
                <div className="text-[15px] font-semibold tracking-tight">JD Quick Check</div>
                <div className="mt-0.5 text-[11px] text-neutral-300">
                    Sydney &bull; Available &bull; 485 Graduate Visa (to <span className="font-medium text-white">4 Sep 2027</span>)
                </div>
            </div>

            {/* Notice */}
            <div className="mx-4 rounded-md bg-cyan-500/10 text-cyan-200 text-[11.5px] px-3 py-2 border border-cyan-400/20">
                <span className="font-medium">For recruiters:&nbsp;</span>
                Paste the JD to get a match score and key proof points.
            </div>

            {/* Input */}
            <div className="px-4 py-3 space-y-2">
                <Textarea
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    placeholder="Paste the JD here (stack, responsibilities, experience band, visa, location)…"
                    className="h-28 resize-none bg-black/40 text-white placeholder:text-neutral-400 border-white/10 thin-scrollbar"
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="off"
                    enterKeyHint="send"
                    aria-label="Job description input"
                    onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
                    }}
                />
                <div className="flex items-center justify-between">
                    <div className="text-[11px] text-neutral-400">
                        Tip: Include stack, experience, visa, and location (e.g. &quot;Sydney&quot;).
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setJd('')}
                            disabled={loading || jd.length === 0}
                            className="bg-transparent !text-white border-white/15 hover:bg-white/5 hover:!text-white active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:!text-white"
                        >
                            Clear
                        </Button>
                        <Button
                            size="sm"
                            onClick={submit}
                            disabled={loading}
                            className="bg-white text-black hover:bg-white/90 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                        >
                            {loading ? 'Analysing…' : 'Check Fit'}
                        </Button>
                    </div>
                </div>
                {error && <div className="text-[11px] text-red-400" aria-live="polite">{error}</div>}
            </div>

            <Separator className="bg-white/10" />

            {/* Result */}
            <div className="max-h-[320px] min-h-[96px] overflow-auto px-4 py-4 thin-scrollbar bg-black/30 rounded-b-2xl" aria-live="polite">
                {!result && !loading && (
                    <div className="text-[13px] text-neutral-300">
                        No JD analysed yet. Paste a JD above and hit <span className="font-medium text-white">Check Fit</span>.
                    </div>
                )}

                {result && (
                    <div className="space-y-4">
                        {/* Verdict card */}
                        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] px-3.5 py-3.5">
                            <div className="flex items-center justify-between gap-3">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-400">Verdict</p>
                                    <p className="text-[14px] font-semibold leading-snug text-neutral-50">
                                        {result.fitHeadline || 'Overall fit for this role'}
                                    </p>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-tight shadow-[0_10px_30px_rgba(0,0,0,0.45)] border border-white/15 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-slate-950/80 backdrop-blur-md ${colors.text}`}>
                                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                                    <span>{result.fitLabel || 'Match level'}</span>
                                </span>
                            </div>
                            <div className="mt-2 space-y-1.5">
                                {formatEligibilityLine('Visa / Work rights', result.eligibility?.visa)}
                                {formatEligibilityLine('Experience', result.eligibility?.experience)}
                                {formatEligibilityLine('Location', result.eligibility?.location)}
                            </div>
                        </div>

                        {/* Score bar */}
                        <div className="flex items-center justify-between">
                            <div className="text-[15px] font-semibold tracking-tight text-neutral-50">Overall Match</div>
                            <Badge variant="secondary" className="text-[12px] px-2.5 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-black shadow-sm border-none">
                                {result.score.overall}%
                            </Badge>
                        </div>
                        <Progress value={result.score.overall} className="h-1.5 mt-2 bg-white/10 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-cyan-400 [&>div]:to-indigo-500" />
                        <div className="text-[11px] text-neutral-300">
                            Exact {result.score.exact}% &middot; Related {result.score.related}% &middot; Gap {result.score.gaps}% &middot; Confidence {result.score.confidence}%
                        </div>

                        {/* Dimension scores */}
                        {result.dimensionScores && (
                            <div className="grid grid-cols-2 gap-1 text-[10.5px] text-neutral-300">
                                <span>Tech: {result.dimensionScores.techStack}%</span>
                                <span>Resp: {result.dimensionScores.responsibilities}%</span>
                                <span>Domain: {result.dimensionScores.domainContext}%</span>
                                <span>Seniority: {result.dimensionScores.seniority}%</span>
                            </div>
                        )}

                        {/* Skills overlap */}
                        {(result.matched?.length || result.related?.length) && (
                            <div>
                                <div className="text-xs font-semibold mb-1 text-neutral-100">Skills overlap</div>
                                {!!result.matched?.length && (
                                    <>
                                        <div className="text-[11px] text-emerald-200 mb-1">Direct match</div>
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {result.matched.map((k) => (
                                                <span key={k} className="inline-flex items-center rounded-full border border-emerald-400/50 bg-emerald-500/15 px-2.5 py-1 text-[11px] text-emerald-50">{k}</span>
                                            ))}
                                        </div>
                                    </>
                                )}
                                {!!result.related?.length && (
                                    <>
                                        <div className="text-[11px] text-amber-200 mb-1">Similar / transferable</div>
                                        <ul className="list-disc list-inside text-[12px] space-y-1 text-neutral-200">
                                            {result.related.map((r) => (
                                                <li key={r.name}>
                                                    <span className="font-medium text-white">{r.name}</span>
                                                    {r.reason && <span> — {r.reason}</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Gaps */}
                        {!!result.gaps?.length && (
                            <div>
                                <div className="text-xs font-semibold mb-1 text-rose-200">Gaps (Upskilling Plan)</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {result.gaps.map((k) => (
                                        <Badge key={k} variant="secondary" className="text-[11px] font-medium bg-rose-500/15 text-rose-100 border-rose-400/30 hover:bg-rose-500/25 transition-colors">{k}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Risk flags */}
                        {!!result.riskFlags?.length && (
                            <div className="rounded-lg border border-amber-300/30 bg-amber-400/10 px-3 py-2">
                                <div className="text-[11px] font-semibold text-amber-200 mb-1">Risk flags</div>
                                <ul className="list-disc list-inside text-[11px] text-amber-100 space-y-1">
                                    {result.riskFlags.slice(0, 3).map((flag, i) => (
                                        <li key={`${flag}-${i}`}>{flag}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Separator className="bg-white/10" />
            <div className="px-4 py-2 text-[10.5px] text-neutral-400">
                This tool uses your provided JD and my public resume for a static match. No third-party sharing.
            </div>
        </div>
    );
}
