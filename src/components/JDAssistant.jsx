'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';

function useIsMobile(query = '(max-width: 640px)') {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mql = window.matchMedia(query);
        const onChange = (e) => setIsMobile(e.matches);

        if (mql.addEventListener) mql.addEventListener('change', onChange);
        else mql.addListener(onChange);

        setIsMobile(mql.matches);

        return () => {
            if (mql.removeEventListener) mql.removeEventListener('change', onChange);
            else mql.removeListener(onChange);
        };
    }, [query]);

    return isMobile;
}

function normalizeResult(data) {
    const score = data?.score || {};
    const overall =
        typeof score.overall === 'number'
            ? score.overall
            : typeof data.overallScore === 'number'
                ? data.overallScore
                : 0;

    const exact =
        typeof score.exact === 'number'
            ? score.exact
            : typeof data.exactMatchScore === 'number'
                ? data.exactMatchScore
                : 0;

    const related =
        typeof score.related === 'number'
            ? score.related
            : typeof data.relatedMatchScore === 'number'
                ? data.relatedMatchScore
                : 0;

    const gaps =
        typeof score.gaps === 'number'
            ? score.gaps
            : typeof data.gapScore === 'number'
                ? data.gapScore
                : 0;

    return {
        // 组件里一直用 result.score.xxx，这里统一转成该结构
        score: { overall, exact, related, gaps },

        // 命中 / 缺失关键词
        matched: data.matched ?? data.matchedKeywords ?? [],
        // related：如果后端直接给 related 就用它，否则用 strengths 填充成 {name, reason} 结构
        related:
            data.related ??
            (Array.isArray(data.strengths)
                ? data.strengths.map((s) =>
                    typeof s === 'string' ? { name: s, reason: '' } : s
                )
                : []),

        gaps: data.gaps ?? data.missingKeywords ?? [],
        summary: data.summary ?? '',
        replyTemplate: data.replyTemplate ?? '',
    };
}


export default function JDChatWidget() {
    const [open, setOpen] = useState(false);
    const [jd, setJd] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [showTeaser, setShowTeaser] = useState(true);
    const [cvText, setCvText] = useState('');

    const isMobile = useIsMobile();

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadCv = async () => {
            try {
                const res = await fetch('/cv/main.txt');
                if (!res.ok) return;
                const text = (await res.text()).trim();
                if (!cancelled && text) {
                    setCvText(text);
                }
            } catch (err) {
                console.error('Failed to load CV text:', err);
            }
        };

        loadCv();
        return () => {
            cancelled = true;
        };
    }, []);

    const submit = async () => {
        setError(null);
        setResult(null);

        if (!jd.trim() || loading) {
            setError('Please paste the job description first.');
            return;
        }
        if (!cvText.trim()) {
            setError('CV text is empty. Please check /public/cv/main.txt.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/agents/jd', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jd: jd.trim(),
                    cvText: cvText.trim(),
                }),
            });

            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || `Request failed: ${res.status}`);
            }
            const data = await res.json();

            const normalized = normalizeResult(data);
            setResult(normalized);
        } catch (e) {
            setError(e?.message || 'Analysis failed. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    /** ---------- Compact dark-glass panel ---------- */
    const Panel = (
        <div className="w-[min(380px,94vw)] bg-[#0e0e10]/95 text-white border border-white/10 rounded-2xl backdrop-blur-md">
            {/* Header */}
            <div className="px-4 pt-4 pb-2">
                <div className="text-[15px] font-semibold tracking-tight">JD Quick Check</div>
                <div className="mt-0.5 text-[11px] text-neutral-300">
                    Sydney • Available • 485 Graduate Visa (to <span className="font-medium text-white">4 Sep 2027</span>)
                </div>
            </div>

            {/* Notice (removed ready-to-send wording) */}
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
                    onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
                    }}
                />
                <div className="flex items-center justify-between">
                    <div className="text-[11px] text-neutral-400">
                        Tip: Include stack, experience, visa, and location (e.g. “Sydney”).
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setJd('')}
                            disabled={loading || jd.length === 0}
                            className="bg-transparent !text-white border-white/15
hover:bg-white/5 hover:!text-white active:scale-95
transition-all duration-150
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
disabled:!text-white"
                        >
                            Clear
                        </Button>
                        <Button
                            size="sm"
                            onClick={submit}
                            disabled={loading}
                            className="bg-white text-black hover:bg-white/90 active:scale-95
transition-all duration-150
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                        >
                            {loading ? 'Analysing…' : 'Check Fit'}
                        </Button>
                    </div>
                </div>
                {error && <div className="text-[11px] text-red-400" aria-live="polite">{error}</div>}
            </div>

            <Separator className="bg-white/10" />

            {/* Result */}
            <div
                className="max-h-[320px] min-h-[96px] overflow-auto px-4 py-4 thin-scrollbar
             bg-black/30 rounded-b-2xl"
                aria-live="polite"
            >
                {!result && !loading && (
                    <div className="text-[13px] text-neutral-300">
                        No JD analysed yet. Paste a JD above and hit <span
                        className="font-medium text-white">Check Fit</span>.
                    </div>
                )}

                {result && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-[15px] font-semibold tracking-tight text-neutral-50">
                                Overall Match
                            </div>
                            <Badge
                                variant="secondary"
                                className="text-[12px] px-2.5 py-1 rounded-full
               bg-gradient-to-r from-cyan-400 to-indigo-500
               text-black shadow-sm border-none"
                            >
                                {Math.round(result.score.overall)}%
                            </Badge>
                        </div>

                        <Progress
                            value={result.score.overall}
                            className="h-1.5 mt-2 bg-white/10 rounded-full
             [&>div]:bg-gradient-to-r [&>div]:from-cyan-400 [&>div]:to-indigo-500"
                        />

                        <div className="grid grid-cols-3 gap-2 mt-2 text-[11px] text-neutral-200">
                            <div>Exact: {Math.round(result.score.exact)}%</div>
                            <div>Related: {Math.round(result.score.related)}%</div>
                            <div>Gap: {Math.round(result.score.gaps)}%</div>
                        </div>

                        {!!result.matched?.length && (
                            <div>
                                <div className="text-xs font-semibold mb-1 text-cyan-200">Direct Hits</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {result.matched.map((k) => (
                                        <Badge
                                            key={k}
                                            variant="outline"
                                            className="text-[11px] font-medium
                   bg-white/5 text-neutral-50 border-white/20
                   hover:bg-white/10 transition-colors"
                                        >
                                            {k}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!!result.related?.length && (
                            <div>
                                <div className="text-xs font-semibold mb-1 text-neutral-100">
                                    Related / Transferable
                                </div>
                                <ul className="list-disc list-inside text-[12px] space-y-1 text-neutral-200">
                                    {result.related.map((r, i) => (
                                        <li key={i}>
                                            <span className="font-medium text-white">{r.name}</span> — {r.reason}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {!!result.gaps?.length && (
                            <div>
                                <div className="text-xs font-semibold mb-1 text-rose-200">
                                    Gaps (Upskilling Plan)
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                {result.gaps.map((k) => (
                                    <Badge
                                        key={k}
                                        variant="secondary"
                                        className="text-[11px] font-medium
             bg-rose-500/15 text-rose-100 border-rose-400/30
             hover:bg-rose-500/25 transition-colors"
                                    >
                                        {k}
                                    </Badge>
                                ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="text-xs font-semibold mb-1 text-neutral-100">Summary</div>
                            <div className="text-[13px] leading-relaxed whitespace-pre-wrap text-neutral-50">
                                {result.summary}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Separator className="bg-white/10"/>
            <div className="px-4 py-2 text-[10.5px] text-neutral-400">
                This tool uses your provided JD and my public resume for a static match. No third-party sharing.
            </div>
        </div>
    );

    const dismissTeaser = () => {
        setShowTeaser(false);
    };

    return (
        <>
            {/* Bottom-right cluster */}
            <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3">
                {/* Persistent teaser card (hideable) */}
                {showTeaser && (
                    <div
                        className="select-none max-w-[320px] rounded-2xl px-4 py-3 text-white
                       shadow-[0_6px_24px_rgba(0,0,0,.35)] border border-white/15
                       bg-white/10 backdrop-blur-md transition-none hover:brightness-100"
                        style={{ marginRight: 2 }} // nudge closer to the edge
                    >
                        <div className="text-[13px] font-semibold tracking-tight">Recruiter shortcut</div>
                        <div className="text-[12px] opacity-90 mt-0.5">
                            Paste a JD to instantly check fit. You’ll get a score and proof points.
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setOpen(true)}
                                className="h-8 px-3 rounded-md bg-white text-black text-sm font-medium
border border-transparent transition-all duration-150
hover:brightness-95 active:scale-95
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                            >
                                Try now
                            </button>
                            <button
                                type="button"
                                onClick={dismissTeaser}
                                className="h-8 px-3 rounded-md bg-white text-black text-sm font-medium
border border-white/20 transition-all duration-150
hover:brightness-95 active:scale-95
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {/* Chat bubble (original white circle) + popover/sheet */}
                {!isMobile ? (
                    <Popover open={open} onOpenChange={setOpen}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <PopoverTrigger asChild>
                                    <button
                                        aria-label="Open JD Quick Check"
                                        className="inline-flex items-center justify-center rounded-full h-12 w-12
             bg-white text-black border border-neutral-200
             shadow-[0_6px_24px_rgba(0,0,0,.25)] p-0 leading-none"
                                        style={{ marginRight: 0 }}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="block" aria-hidden="true">
                                            <path d="M4 5h16v9a3 3 0 0 1-3 3H9l-5 4V5z" stroke="currentColor" strokeWidth="1.6" />
                                        </svg>
                                    </button>
                                </PopoverTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="text-xs">JD Quick Check</TooltipContent>
                        </Tooltip>

                        <PopoverContent
                            align="end"
                            side="top"
                            sideOffset={10}
                            alignOffset={0}
                            collisionPadding={6}
                            className="p-0 mr-0 translate-x-0 border-0 bg-transparent w-[min(380px,94vw)] pointer-events-auto"
                        >
                            {Panel}
                        </PopoverContent>
                    </Popover>
                ) : (
                    <Sheet open={open} onOpenChange={setOpen}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <SheetTrigger asChild>
                                    <button
                                        aria-label="Open JD Quick Check"
                                        className="inline-flex items-center justify-center rounded-full h-12 w-12
             bg-white text-black border border-neutral-200
             shadow-[0_6px_24px_rgba(0,0,0,.25)] p-0 leading-none"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="block" aria-hidden="true">
                                            <path d="M4 5h16v9a3 3 0 0 1-3 3H9l-5 4V5z" stroke="currentColor" strokeWidth="1.6" />
                                        </svg>
                                    </button>
                                </SheetTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="text-xs">JD Quick Check</TooltipContent>
                        </Tooltip>

                        <SheetContent side="bottom" className="p-0 h-auto max-h-[85vh] rounded-t-2xl bg-transparent">
                            <div className="max-w-[94vw] mx-auto">{Panel}</div>
                        </SheetContent>
                    </Sheet>
                )}
            </div>
        </>
    );
}
