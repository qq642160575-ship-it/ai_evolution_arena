import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import confetti from "canvas-confetti";
import { useTranslation } from "react-i18next";
import { submitStartSession, submitVote } from "../lib/api";
import { config } from "../config";

const BASE_URL = config.API_BASE_URL;

// ─── Shared styles ──────────────────────────────────────────────────────────
const PANEL_STYLE: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '16px',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden',
};

const PANEL_HEADER_STYLE: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    height: '48px',
    borderBottom: '1px solid var(--color-border)',
    background: 'rgba(255,255,255,0.02)',
    flexShrink: 0,
};

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            title={copied ? "已复制" : "复制"}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                transition: 'background 180ms ease-out, color 180ms ease-out',
                background: copied ? 'rgba(52,211,153,0.1)' : 'transparent',
                color: copied ? 'var(--color-accent-b)' : 'var(--color-text-muted)',
                flexShrink: 0,
            }}
            onMouseEnter={e => { if (!copied) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'; } }}
            onMouseLeave={e => { if (!copied) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; } }}
        >
            {copied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
            )}
            {copied ? "已复制" : "复制"}
        </button>
    );
}

// ─── Code Block with Copy Button ─────────────────────────────────────────────
function CodeBlock({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
    const getCode = (): string => {
        if (!children) return "";
        const child = React.Children.toArray(children)[0] as any;
        if (!child) return "";
        const inner = child.props?.children || child.children;
        if (typeof inner === "string") return inner;
        if (Array.isArray(inner)) return inner.join("");
        return "";
    };

    let lang = "";
    if (children) {
        const child = React.Children.toArray(children)[0] as any;
        const className = child?.props?.className || child.className;
        if (className) {
            const match = /language-(\w+)/.exec(className);
            if (match) lang = match[1];
        }
    }

    const [hovered, setHovered] = useState(false);
    return (
        <div
            style={{
                position: 'relative',
                background: '#1e1e24',
                borderRadius: '8px',
                margin: '16px 0',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                maxWidth: '100%',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#2d2d34',
                padding: '6px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
                    <span style={{ marginLeft: '8px', color: '#a0a0ab', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {lang || "Code"}
                    </span>
                </div>
                <div style={{ opacity: hovered ? 1 : 0, transition: 'opacity 180ms ease-out' }}>
                    <CopyButton text={getCode()} />
                </div>
            </div>
            <div style={{ overflowX: 'auto', maxWidth: '100%', padding: '16px' }}>
                <pre
                    {...props}
                    style={{
                        margin: 0,
                        fontSize: '13px',
                        fontFamily: 'var(--font-mono)',
                        color: '#d4d4d8',
                        lineHeight: 1.6,
                        background: 'transparent',
                        whiteSpace: 'pre',
                        ...props.style
                    }}
                >
                    {children}
                </pre>
            </div>
        </div>
    );
}

const markdownComponents = { pre: CodeBlock };

// ─── Math Preprocessor ────────────────────────────────────────────────────────
const preprocessMath = (text: string) => {
    if (!text) return text;
    let processed = text.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$');
    processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
    return processed;
};

// ─── Model dot indicator ──────────────────────────────────────────────────────
function ModelDot({ color }: { color: 'a' | 'b' }) {
    return (
        <span style={{
            display: 'inline-block',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: color === 'a' ? 'var(--color-accent)' : 'var(--color-accent-b)',
            flexShrink: 0,
            boxShadow: color === 'a' ? '0 0 6px rgba(129,140,248,0.5)' : '0 0 6px rgba(52,211,153,0.5)',
        }} />
    );
}

// ─── Loading shimmer ──────────────────────────────────────────────────────────
function ShimmerLoader() {
    return (
        <div style={{ padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[80, 60, 90, 50].map((w, i) => (
                <div key={i} className="skeleton" style={{ height: '14px', width: `${w}%`, animationDelay: `${i * 0.12}s` }} />
            ))}
        </div>
    );
}

// ─── FlipCard ────────────────────────────────────────────────────────────────
function FlipCard({ front, back, flipped, color }: {
    front: string; back: string; flipped: boolean; color: string;
}) {
    return (
        <div style={{ perspective: '1000px', width: '100%', height: '100%' }}>
            <div style={{
                transformStyle: 'preserve-3d',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                width: '100%',
                height: '100%',
            }}>
                <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{front}</span>
                </div>
                <div style={{
                    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: color === 'model-a' ? 'var(--color-accent-soft)' : 'var(--color-accent-b-soft)',
                }}>
                    <span style={{ fontSize: '13px', fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: color === 'model-a' ? 'var(--color-accent)' : 'var(--color-accent-b)' }}>
                        ✦ {back}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Reveal Overlay ───────────────────────────────────────────────────────────
function RevealOverlay({ revealData, voteSelection, onNewBattle, onLeaderboard }: {
    revealData: any; voteSelection: string | null;
    onNewBattle: () => void; onLeaderboard: () => void;
}) {
    const { t } = useTranslation();
    const [flipped, setFlipped] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setFlipped(true), 600);
        return () => clearTimeout(timer);
    }, []);

    const aWon = voteSelection === 'left' || voteSelection === 'both_good';
    const bWon = voteSelection === 'right' || voteSelection === 'both_good';
    const bothBad = voteSelection === 'both_bad';

    const cardStyle = (won: boolean): React.CSSProperties => ({
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        border: won
            ? (voteSelection === 'left' || aWon && voteSelection !== 'both_good' ? '1px solid rgba(129,140,248,0.3)' : '1px solid rgba(52,211,153,0.3)')
            : '1px solid var(--color-border)',
        overflow: 'hidden',
        minHeight: '160px',
        background: won ? (voteSelection === 'right' ? 'var(--color-accent-b-soft)' : 'var(--color-accent-soft)') : 'var(--color-surface)',
        transition: 'background 1s ease-out',
    });

    return (
        <div className="animate-fadeIn" style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'var(--color-overlay)',
            backdropFilter: 'var(--color-overlay-blur)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
            <div className="animate-slideUp" style={{ textAlign: 'center', marginBottom: '40px' }}>
                <p style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                    {bothBad ? '— run aborted —' : '— identity revealed —'}
                </p>
                <h2 style={{ fontSize: '30px', fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)', letterSpacing: '-0.02em', fontWeight: '500' }}>
                    {t('arena.thanks')}
                </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '640px', marginBottom: '40px' }} className="md:flex-row">
                <div className="flex flex-col md:flex-row gap-4 w-full">
                    {/* Model A */}
                    <div style={cardStyle(aWon)}>
                        <div style={{ height: '56px', position: 'relative', borderBottom: '1px solid var(--color-border)' }}>
                            <FlipCard front={t('arena.entity_a')} back={revealData?.A || t('arena.unknown')} flipped={flipped} color="model-a" />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '24px' }}>
                            <span style={{ fontSize: '24px' }}>{aWon ? '🏆' : bothBad ? '💀' : '—'}</span>
                            <p style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '600', color: aWon ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                                {aWon ? t('arena.winner') : t('arena.eliminated')}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>vs</span>
                    </div>

                    {/* Model B */}
                    <div style={cardStyle(bWon)}>
                        <div style={{ height: '56px', position: 'relative', borderBottom: '1px solid var(--color-border)' }}>
                            <FlipCard front={t('arena.entity_b')} back={revealData?.B || t('arena.unknown')} flipped={flipped} color="model-b" />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '24px' }}>
                            <span style={{ fontSize: '24px' }}>{bWon ? '🏆' : bothBad ? '💀' : '—'}</span>
                            <p style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '600', color: bWon ? 'var(--color-accent-b)' : 'var(--color-text-muted)' }}>
                                {bWon ? t('arena.winner') : t('arena.eliminated')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="animate-slideUp">
                <button
                    onClick={onLeaderboard}
                    style={{
                        padding: '12px 24px', borderRadius: '10px',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-surface)',
                        color: 'var(--color-text-secondary)',
                        fontSize: '11px', fontWeight: '500',
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        transition: 'background 180ms ease-out, color 180ms ease-out',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-3)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'; }}
                >
                    {t('arena.view_rankings')}
                </button>
                <button
                    onClick={onNewBattle}
                    style={{
                        padding: '12px 24px', borderRadius: '10px',
                        border: 'none',
                        background: 'var(--color-accent)',
                        color: '#fff',
                        fontSize: '11px', fontWeight: '600',
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        transition: 'opacity 180ms ease-out',
                        boxShadow: '0 2px 12px rgba(129,140,248,0.3)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                >
                    {t('arena.new_protocol')}
                </button>
            </div>
        </div>
    );
}

// ─── Markdown Panel ───────────────────────────────────────────────────────────
function ModelPanel({ label, content, color, scrollHeight }: {
    label: string; content: string; color: 'a' | 'b'; scrollHeight: string;
}) {
    return (
        <div style={PANEL_STYLE}>
            <div style={PANEL_HEADER_STYLE}>
                <ModelDot color={color} />
                <span style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                }}>
                    {label}
                </span>
                {content && <CopyButton text={content} />}
            </div>
            <div style={{ overflowY: 'auto', height: scrollHeight }}>
                {content ? (
                    <div style={{ padding: '20px 24px' }} className="markdown-body">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={markdownComponents}
                        >
                            {preprocessMath(content)}
                        </ReactMarkdown>
                    </div>
                ) : (
                    <ShimmerLoader />
                )}
            </div>
        </div>
    );
}

// ─── Main Arena ───────────────────────────────────────────────────────────────
export default function Arena({ onNavigate, onMatchComplete }: {
    onNavigate: (view: 'arena' | 'leaderboard') => void;
    onMatchComplete: () => void;
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
    const [conversationHistory, setConversationHistory] = useState<Array<{
        turnNumber: number; prompt: string; responseA: string; responseB: string;
    }>>([]);
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
            setConversationHistory([]);
            setRevealData(null);
            setVoteSelection(null);
        } catch (e) {
            alert("Failed to start battle: " + e);
        }
    };

    const resetArena = () => {
        setPrompt(""); setResponseA(""); setResponseB("");
        setIsGenerating(false); setIsAwaitingVote(false); setVoteSelection(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || !sessionId || isGenerating || isAwaitingVote) return;
        setIsGenerating(true);
        setResponseA(""); setResponseB("");
        try {
            const response = await fetch(`${BASE_URL}/battle/chat/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
                body: JSON.stringify({ session_id: sessionId, prompt })
            });
            if (!response.body) throw new Error("No response body");
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let doneA = false, doneB = false;
            while (true) {
                const { value, done: readerDone } = await reader.read();
                if (readerDone) break;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    let bothDone = false;
                    for (const line of chunk.split('\n')) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                if (data.done) {
                                    if (data.model === 'A') doneA = true;
                                    else if (data.model === 'B') doneB = true;
                                    if (doneA && doneB) { bothDone = true; break; }
                                    continue;
                                }
                                if (data.model === 'A' && data.chunk) setResponseA(prev => prev + data.chunk);
                                else if (data.model === 'B' && data.chunk) setResponseB(prev => prev + data.chunk);
                            } catch { }
                        }
                    }
                    if (bothDone) break;
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
                if (voteResult !== 'both_bad') setTimeout(() => triggerCelebration(), 800);
            } else {
                setConversationHistory(prev => [...prev, { turnNumber: turn, prompt, responseA, responseB }]);
                setTurn(resp.current_turn + 1);
                resetArena();
            }
        } catch (e) {
            alert("Vote failed: " + e);
        }
    };

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [prompt]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [responseA, responseB, conversationHistory.length]);

    // ── Pre-Game Landing ──────────────────────────────────────────────────
    if (!hasStarted) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '0 32px' }}>
                <div style={{ textAlign: 'center', maxWidth: '480px' }} className="animate-fadeIn">
                    {/* Badge */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', border: '1px solid var(--color-border)', marginBottom: '32px', fontSize: '11px', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block' }} />
                        Protocol ready
                    </div>
                    <h2 style={{ fontSize: '36px', fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)', letterSpacing: '-0.025em', fontWeight: '500', marginBottom: '16px', lineHeight: 1.2 }}>
                        {t('arena.title')}
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '40px' }}>
                        {t('arena.subtitle')}
                    </p>
                    <button
                        onClick={startBattle}
                        style={{
                            padding: '13px 32px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'var(--color-accent)',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: '600',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-sans)',
                            boxShadow: '0 2px 20px rgba(129,140,248,0.35)',
                            transition: 'transform 180ms ease-out, box-shadow 180ms ease-out',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(129,140,248,0.45)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 20px rgba(129,140,248,0.35)'; }}
                    >
                        {t('arena.initiate')}
                    </button>
                </div>
            </div>
        );
    }

    const isRevealed = revealData !== null;

    return (
        <>
            {isRevealed && (
                <RevealOverlay
                    revealData={revealData}
                    voteSelection={voteSelection}
                    onNewBattle={startBattle}
                    onLeaderboard={() => onNavigate('leaderboard')}
                />
            )}

            <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', maxWidth: '1140px', margin: '0 auto', padding: '0 24px', position: 'relative' }}>
                {/* Top Banner */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: '1px solid var(--color-border)', marginBottom: '20px', flexShrink: 0 }}>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                        {t('arena.cycle', { turn })}
                    </span>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-text-muted)', display: 'none' }} className="sm:inline">
                        {t('arena.rule')}
                    </span>
                </div>

                {/* Scroll Area */}
                <div ref={scrollRef} className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingBottom: '160px' }}>

                    {/* ── History Turns ─────────────────────────── */}
                    {conversationHistory.map((histTurn, idx) => (
                        <div key={idx} style={{ marginBottom: '32px', opacity: 0.55 }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', padding: '3px 10px', borderRadius: '100px' }}>
                                    {t('arena.cycle', { turn: histTurn.turnNumber })}
                                </span>
                            </div>
                            {/* Prompt */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                                <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '14px', borderTopRightRadius: '4px', padding: '10px 16px', maxWidth: '80%', fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
                                    {histTurn.prompt}
                                </div>
                            </div>
                            {/* History panels — always side by side */}
                            <div style={{ display: 'flex', gap: '12px', flexDirection: 'row', minWidth: 0 }}>
                                <ModelPanel label={t('arena.entity_a')} content={histTurn.responseA} color="a" scrollHeight="36vh" />
                                <ModelPanel label={t('arena.entity_b')} content={histTurn.responseB} color="b" scrollHeight="36vh" />
                            </div>
                        </div>
                    ))}

                    {/* ── Current Turn ──────────────────────────── */}
                    {(isGenerating || isAwaitingVote) && (
                        <div style={{ marginBottom: '24px' }}>
                            {conversationHistory.length > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', padding: '3px 10px', borderRadius: '100px' }}>
                                        {t('arena.cycle', { turn })}
                                    </span>
                                </div>
                            )}
                            {/* Prompt bubble */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                                <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '14px', borderTopRightRadius: '4px', padding: '12px 18px', maxWidth: '82%', fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: 1.65, boxShadow: 'var(--shadow-sm)' }}>
                                    {prompt}
                                </div>
                            </div>
                            {/* Current panels — always side by side */}
                            <div style={{ display: 'flex', gap: '16px', flexDirection: 'row', minWidth: 0 }}>
                                <ModelPanel label={t('arena.entity_a')} content={responseA} color="a" scrollHeight="58vh" />
                                <ModelPanel label={t('arena.entity_b')} content={responseB} color="b" scrollHeight="58vh" />
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Sticky Dock ───────────────────────────────── */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(to top, var(--color-base) 60%, transparent)', paddingTop: '64px', paddingBottom: '28px', paddingLeft: '24px', paddingRight: '24px', zIndex: 40 }}>
                    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                        {isAwaitingVote ? (
                            <div className="animate-slideUp" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <p style={{
                                    fontSize: '12px',
                                    color: 'var(--color-text-secondary)',
                                    textAlign: 'center',
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    opacity: 0.9,
                                    margin: 0
                                }}>
                                    {t('arena.reminder')}
                                </p>
                                {/* Vote button connected pill group */}
                                <div className="vote-group">
                                    <button className="vote-btn accent-a" onClick={() => handleVote("left")}>{t('arena.alpha_wins')}</button>
                                    <button className="vote-btn" onClick={() => handleVote("both_good")} style={{ borderRight: '1px solid var(--color-border)' }}>{t('arena.mutual_tie')}</button>
                                    <button className="vote-btn" onClick={() => handleVote("both_bad")} style={{ borderRight: '1px solid var(--color-border)' }}>{t('arena.both_fail')}</button>
                                    <button className="vote-btn accent-b" onClick={() => handleVote("right")}>{t('arena.beta_wins')}</button>
                                </div>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: 'var(--color-surface)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '14px',
                                    boxShadow: 'var(--shadow-lg)',
                                    padding: '6px 6px 6px 16px',
                                    transition: 'border-color 200ms ease-out, box-shadow 200ms ease-out',
                                }}
                                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.35)'; e.currentTarget.style.boxShadow = '0 2px 24px rgba(0,0,0,0.3), 0 0 0 3px rgba(129,140,248,0.07)'; }}
                                onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = '0 2px 24px rgba(0,0,0,0.3)'; }}
                            >
                                <textarea
                                    ref={textareaRef}
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                    disabled={isGenerating}
                                    placeholder={t('arena.placeholder')}
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        resize: 'none',
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '14px',
                                        color: 'var(--color-text-primary)',
                                        lineHeight: 1.6,
                                        minHeight: '40px',
                                        maxHeight: '150px',
                                        paddingTop: '8px',
                                        paddingBottom: '8px',
                                    }}
                                    rows={1}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e as unknown as React.FormEvent);
                                        }
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={isGenerating || !prompt.trim()}
                                    style={{
                                        width: '38px', height: '38px',
                                        borderRadius: '9px',
                                        border: 'none',
                                        background: 'var(--color-accent)',
                                        color: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer',
                                        flexShrink: 0,
                                        transition: 'opacity 180ms ease-out',
                                        opacity: (isGenerating || !prompt.trim()) ? 0.25 : 1,
                                    }}
                                >
                                    {isGenerating ? (
                                        <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'block', animation: 'spin 0.7s linear infinite' }} />
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
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
