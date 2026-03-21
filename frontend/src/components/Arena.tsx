import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import confetti from "canvas-confetti";
import { useTranslation } from "react-i18next";
import { submitStartSession, submitVote } from "../lib/api";

const BASE_URL = 'http://127.0.0.1:8000/api';

// ─── Isolated 3D Flip Card (NO parent overflow-hidden) ───────────────────────
function FlipCard({ front, back, flipped, color }: {
    front: string;
    back: string;
    flipped: boolean;
    color: string; // 'model-a' | 'model-b'
}) {
    return (
        <div style={{ perspective: '1000px' }} className="w-full h-full">
            <div
                style={{
                    transformStyle: 'preserve-3d',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                }}
            >
                {/* Front */}
                <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    className="absolute inset-0 flex items-center justify-center font-mono tracking-[0.2em] text-[10px] text-dark-400 uppercase bg-dark-900/50"
                >
                    {front}
                </div>
                {/* Back */}
                <div style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                }}
                    className={`absolute inset-0 flex items-center justify-center font-serif text-sm tracking-wide ${color === 'model-a' ? 'text-model-a bg-model-a/10' : 'text-model-b bg-model-b/10'}`}
                >
                    ✨ {back}
                </div>
            </div>
        </div>
    );
}

// ─── Battle-End Reveal Overlay ─────────────────────────────────────────────
function RevealOverlay({ revealData, voteSelection, onNewBattle, onLeaderboard }: {
    revealData: any;
    voteSelection: string | null;
    onNewBattle: () => void;
    onLeaderboard: () => void;
}) {
    const { t } = useTranslation();
    const [flipped, setFlipped] = useState(false);

    // Stagger the flip: start after mount
    useEffect(() => {
        const timer = setTimeout(() => setFlipped(true), 600);
        return () => clearTimeout(timer);
    }, []);

    const aWon = voteSelection === 'left' || voteSelection === 'both_good';
    const bWon = voteSelection === 'right' || voteSelection === 'both_good';
    const bothBad = voteSelection === 'both_bad';

    return (
        <div className="fixed inset-0 z-50 bg-dark-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fadeIn">
            {/* Title */}
            <div className="text-center mb-10 animate-slideUp">
                <p className="text-[10px] font-mono tracking-[0.3em] text-dark-400 uppercase mb-3">
                    {bothBad ? '— Protocol Terminated —' : '— Identity Revealed —'}
                </p>
                <h2 className="text-3xl md:text-4xl font-serif text-white tracking-tight">
                    {t('arena.thanks')}
                </h2>
            </div>

            {/* Flip Cards Row */}
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-3xl mb-10">
                {/* Model A Card */}
                <div className="flex-1 flex flex-col gap-0 min-h-[180px]">
                    {/* Flip card header — standalone, no overflow-hidden parent */}
                    <div className="h-14 rounded-t-2xl border border-dark-700 border-b-0 relative overflow-visible">
                        <FlipCard
                            front={t('arena.entity_a')}
                            back={revealData?.A || t('arena.unknown')}
                            flipped={flipped}
                            color="model-a"
                        />
                    </div>
                    {/* Card Body */}
                    <div className={`flex-1 rounded-b-2xl border border-dark-700 p-6 flex flex-col items-center justify-center gap-3 transition-colors duration-1000 ${aWon ? 'bg-model-a/5 border-model-a/30' : 'bg-dark-950'}`}>
                        {aWon ? (
                            <span className="text-2xl animate-popIn">🏆</span>
                        ) : bothBad ? (
                            <span className="text-2xl opacity-50">💀</span>
                        ) : (
                            <span className="text-xl opacity-40">✗</span>
                        )}
                        <p className={`text-[10px] font-mono tracking-[0.2em] uppercase font-bold ${aWon ? 'text-model-a' : 'text-dark-600'}`}>
                            {aWon ? t('arena.winner') : t('arena.eliminated')}
                        </p>
                    </div>
                </div>

                {/* VS separator */}
                <div className="flex items-center justify-center">
                    <div className="font-serif text-dark-600 text-sm italic tracking-widest opacity-50">vs</div>
                </div>

                {/* Model B Card */}
                <div className="flex-1 flex flex-col gap-0 min-h-[180px]">
                    <div className="h-14 rounded-t-2xl border border-dark-700 border-b-0 relative overflow-visible">
                        <FlipCard
                            front={t('arena.entity_b')}
                            back={revealData?.B || t('arena.unknown')}
                            flipped={flipped}
                            color="model-b"
                        />
                    </div>
                    <div className={`flex-1 rounded-b-2xl border border-dark-700 p-6 flex flex-col items-center justify-center gap-3 transition-colors duration-1000 ${bWon ? 'bg-model-b/5 border-model-b/30' : 'bg-dark-950'}`}>
                        {bWon ? (
                            <span className="text-2xl animate-popIn">🏆</span>
                        ) : bothBad ? (
                            <span className="text-2xl opacity-50">💀</span>
                        ) : (
                            <span className="text-xl opacity-40">✗</span>
                        )}
                        <p className={`text-[10px] font-mono tracking-[0.2em] uppercase font-bold ${bWon ? 'text-model-b' : 'text-dark-600'}`}>
                            {bWon ? t('arena.winner') : t('arena.eliminated')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 animate-slideUp">
                <button
                    onClick={onLeaderboard}
                    className="px-8 py-4 bg-dark-800 border border-dark-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-dark-700 transition-colors rounded-full"
                >
                    {t('arena.view_rankings')}
                </button>
                <button
                    onClick={onNewBattle}
                    className="px-8 py-4 bg-white text-dark-950 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-dark-100 transition-colors rounded-full shadow-xl"
                >
                    {t('arena.new_protocol')}
                </button>
            </div>
        </div>
    );
}


// ─── Main Arena Component ──────────────────────────────────────────────────
export default function Arena({ onNavigate, onMatchComplete }: {
    onNavigate: (view: 'arena' | 'leaderboard') => void,
    onMatchComplete: () => void
}) {
    const { t } = useTranslation();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [turn, setTurn] = useState<number>(1);
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAwaitingVote, setIsAwaitingVote] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [voteSelection, setVoteSelection] = useState<string | null>(null);

    const [responseA, setResponseA] = useState<string>("");
    const [responseB, setResponseB] = useState<string>("");

    // Reveal State
    const [revealData, setRevealData] = useState<any>(null);

    const triggerCelebration = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 70, zIndex: 9999 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
        const interval: any = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const startBattle = async () => {
        try {
            const data = await submitStartSession();
            setSessionId(data.session_id);
            setTurn(1);
            setHasStarted(true);
            resetArena();
            setRevealData(null);
            setVoteSelection(null);
        } catch (e) {
            alert("Failed to start battle: " + e);
        }
    };

    const resetArena = () => {
        setPrompt("");
        setResponseA("");
        setResponseB("");
        setIsGenerating(false);
        setIsAwaitingVote(false);
        setVoteSelection(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || !sessionId || isGenerating || isAwaitingVote) return;

        setIsGenerating(true);
        setResponseA("");
        setResponseB("");

        try {
            const response = await fetch(`${BASE_URL}/battle/chat/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                },
                body: JSON.stringify({ session_id: sessionId, prompt })
            });

            if (!response.body) throw new Error("No response body");
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                if (data.model === 'A' && data.chunk) setResponseA(prev => prev + data.chunk);
                                else if (data.model === 'B' && data.chunk) setResponseB(prev => prev + data.chunk);
                            } catch (err) { }
                        }
                    }
                }
            }
            setIsGenerating(false);
            setIsAwaitingVote(true);

        } catch (e) {
            alert("Error generating response: " + e);
            setIsGenerating(false);
        }
    };

    const handleVote = async (voteResult: string) => {
        if (!sessionId || !isAwaitingVote) return;
        setVoteSelection(voteResult);
        try {
            const resp = await submitVote(sessionId, voteResult, prompt, responseA, responseB);
            if (resp.is_completed) {
                setRevealData(resp.reveal);
                onMatchComplete();
                if (voteResult !== 'both_bad') {
                    setTimeout(() => triggerCelebration(), 800); // delay to let overlay mount
                }
            } else {
                setTurn(resp.current_turn + 1);
                resetArena();
            }
        } catch (e) {
            alert("Vote failed: " + e);
        }
    };

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [prompt]);

    // ── Pre-Game Landing ──────────────────────────────────────────────────
    if (!hasStarted) {
        return (
            <div className="flex flex-col justify-center items-center h-full w-full max-w-2xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tight mb-4 whitespace-pre-line">{t('arena.title')}</h2>
                    <p className="text-dark-400 font-sans text-sm md:text-base max-w-md mx-auto leading-relaxed mt-6 whitespace-pre-line">{t('arena.subtitle')}</p>
                </div>
                <button
                    onClick={startBattle}
                    className="group relative px-10 py-4 bg-white text-dark-950 font-sans font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase overflow-hidden rounded-full transition-all hover:scale-105 shadow-2xl"
                >
                    <span className="relative z-10 transition-colors group-hover:text-white">{t('arena.initiate')}</span>
                    <div className="absolute inset-0 bg-dark-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left ease-out duration-500 rounded-full"></div>
                </button>
            </div>
        );
    }

    const isRevealed = revealData !== null;

    return (
        <>
            {/* Full-Screen Reveal Overlay (mounted outside any overflow:hidden parent) */}
            {isRevealed && (
                <RevealOverlay
                    revealData={revealData}
                    voteSelection={voteSelection}
                    onNewBattle={startBattle}
                    onLeaderboard={() => onNavigate('leaderboard')}
                />
            )}

            {/* Main Arena Layout */}
            <div className="flex flex-col h-full w-full max-w-6xl mx-auto relative animate-fadeIn md:px-6">

                {/* Top Banner */}
                <div className="flex justify-between items-center py-5 border-b border-dark-800 mb-6 shrink-0 px-4 md:px-0">
                    <p className="text-[10px] uppercase tracking-widest text-dark-400 font-medium">{t('arena.cycle', { turn })}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-dark-400 hidden sm:block italic font-serif">{t('arena.rule')}</p>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar pb-40 px-4 md:px-0 scroll-smooth">

                    {/* User Prompt Bubble */}
                    {prompt && (isGenerating || isAwaitingVote) && (
                        <div className="w-full flex justify-end mb-10">
                            <div className="bg-dark-800 text-dark-100 px-6 py-4 rounded-2xl rounded-tr-sm max-w-[85%] text-sm font-sans border border-dark-700/50 leading-relaxed shadow-lg">
                                {prompt}
                            </div>
                        </div>
                    )}

                    {/* Response Cards */}
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">

                        {/* Mobile VS separator */}
                        <div className="md:hidden w-full flex justify-center py-2 opacity-30 font-serif italic text-xs tracking-widest text-dark-400">{t('arena.vs')}</div>

                        {/* Model A */}
                        <div className="flex-1 flex flex-col bg-dark-950/80 border border-dark-800 rounded-xl shadow-2xl min-h-[400px]">
                            <div className="shrink-0 h-12 border-b border-dark-800 bg-dark-900/50 rounded-t-xl flex items-center justify-center font-mono tracking-[0.2em] text-[10px] text-dark-400 uppercase">
                                {t('arena.entity_a')}
                            </div>
                            <div className="flex-1 p-6 md:p-8 font-serif text-dark-100 text-sm md:text-[15px] leading-[1.8]">
                                {responseA ? (
                                    <div className="markdown-body">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{responseA}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <span className="w-1.5 h-1.5 bg-dark-600 rounded-full animate-pulse"></span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Model B */}
                        <div className="flex-1 flex flex-col bg-dark-950/80 border border-dark-800 rounded-xl shadow-2xl min-h-[400px]">
                            <div className="shrink-0 h-12 border-b border-dark-800 bg-dark-900/50 rounded-t-xl flex items-center justify-center font-mono tracking-[0.2em] text-[10px] text-dark-400 uppercase">
                                {t('arena.entity_b')}
                            </div>
                            <div className="flex-1 p-6 md:p-8 font-serif text-dark-100 text-sm md:text-[15px] leading-[1.8]">
                                {responseB ? (
                                    <div className="markdown-body">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{responseB}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <span className="w-1.5 h-1.5 bg-dark-600 rounded-full animate-pulse"></span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Action Dock */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-dark-900 via-dark-900/90 to-transparent pt-16 pb-8 px-4 z-40 shrink-0">
                    <div className="max-w-4xl mx-auto">

                        {isAwaitingVote ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 animate-slideUp w-full">
                                <button onClick={() => handleVote("left")} className="py-4 bg-dark-950/80 border border-dark-800 text-model-a hover:bg-model-a/10 font-medium text-[10px] md:text-xs tracking-widest rounded-xl transition-all shadow-lg backdrop-blur-md uppercase">
                                    {t('arena.alpha_wins')}
                                </button>
                                <button onClick={() => handleVote("both_good")} className="py-4 bg-dark-950/80 border border-dark-800 text-white hover:bg-dark-800 font-medium text-[10px] md:text-xs tracking-widest rounded-xl transition-all shadow-lg backdrop-blur-md uppercase">
                                    {t('arena.mutual_tie')}
                                </button>
                                <button onClick={() => handleVote("both_bad")} className="py-4 bg-dark-950/80 border border-dark-800 text-dark-400 hover:bg-dark-800 font-medium text-[10px] md:text-xs tracking-widest rounded-xl transition-all shadow-lg backdrop-blur-md uppercase">
                                    {t('arena.both_fail')}
                                </button>
                                <button onClick={() => handleVote("right")} className="py-4 bg-dark-950/80 border border-dark-800 text-model-b hover:bg-model-b/10 font-medium text-[10px] md:text-xs tracking-widest rounded-xl transition-all shadow-lg backdrop-blur-md uppercase">
                                    {t('arena.beta_wins')}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="relative flex items-center bg-dark-950/80 backdrop-blur-md border border-dark-800 rounded-2xl shadow-2xl p-2 transition-all focus-within:border-dark-600 focus-within:ring-1 focus-within:ring-dark-600">
                                <textarea
                                    ref={textareaRef}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    disabled={isGenerating}
                                    placeholder={t('arena.placeholder')}
                                    className="flex-1 bg-transparent px-4 py-3 text-sm md:text-base text-white placeholder-dark-400 focus:outline-none resize-none font-sans min-h-[44px] max-h-[150px] disabled:opacity-50"
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e as unknown as React.FormEvent);
                                        }
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={isGenerating || !prompt.trim()}
                                    className="p-3 bg-white text-dark-950 rounded-xl disabled:opacity-20 disabled:cursor-not-allowed hover:bg-dark-100 transition-colors flex-shrink-0"
                                >
                                    {isGenerating ? (
                                        <span className="block w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        <svg className="w-5 h-5 translate-x-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="22" y1="2" x2="11" y2="13"></line>
                                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                        </svg>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
