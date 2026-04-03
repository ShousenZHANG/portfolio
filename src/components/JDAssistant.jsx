import { useEffect, useState } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { useJDAnalysis } from '../hooks/useJDAnalysis';
import { useIsMobile } from '../hooks/useIsMobile';
import JDResultPanel from './jd/JDResultPanel';

export default function JDAssistant() {
    const [open, setOpen] = useState(false);
    const [showTeaser, setShowTeaser] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);

    const analysis = useJDAnalysis();
    const isMobile = useIsMobile("(max-width: 640px)");

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setHasMounted(true), 600);
        return () => clearTimeout(timer);
    }, []);

    const Panel = <JDResultPanel {...analysis} />;

    const BubbleButton = (
        <button
            aria-label="Open JD Quick Check"
            className={`inline-flex items-center justify-center rounded-full h-12 w-12
 bg-white text-black border border-neutral-200
 shadow-[0_6px_24px_rgba(0,0,0,.25)] p-0 leading-none
 transition-all duration-300 ${open ? "scale-105" : "hover:scale-105"}`}
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="block" aria-hidden="true">
                <path d="M4 5h16v9a3 3 0 0 1-3 3H9l-5 4V5z" stroke="currentColor" strokeWidth="1.6" />
            </svg>
        </button>
    );

    return (
        <>
            <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3">
                {/* Teaser card */}
                {showTeaser && (
                    <div
                        className={`select-none max-w-[320px] rounded-2xl px-4 py-3 text-white
                       shadow-[0_6px_24px_rgba(0,0,0,.35)] border border-white/15
                       bg-white/10 backdrop-blur-md transition-all duration-500
                       ${hasMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
                        style={{ marginRight: 2 }}
                    >
                        <div className="text-[13px] font-semibold tracking-tight">Recruiter shortcut</div>
                        <div className="text-[12px] opacity-90 mt-0.5">
                            Paste a JD to instantly check fit. You&apos;ll get a score and proof points.
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setOpen(true)}
                                className="h-8 px-3 rounded-md bg-white text-black text-sm font-medium border border-transparent transition-all duration-150 hover:brightness-95 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                            >
                                Try now
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowTeaser(false)}
                                className="h-8 px-3 rounded-md bg-white text-black text-sm font-medium border border-white/20 transition-all duration-150 hover:brightness-95 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {/* Bubble + Popover (desktop) / Sheet (mobile) */}
                {!isMobile ? (
                    <Popover open={open} onOpenChange={setOpen}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <PopoverTrigger asChild>{BubbleButton}</PopoverTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="text-xs">JD Quick Check</TooltipContent>
                        </Tooltip>
                        <PopoverContent
                            align="end" side="top" sideOffset={10} alignOffset={0}
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
                                <SheetTrigger asChild>{BubbleButton}</SheetTrigger>
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
