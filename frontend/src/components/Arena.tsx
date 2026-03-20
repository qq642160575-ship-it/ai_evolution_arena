import React, { useState, useRef } from "react";
import { submitStartSession, submitVote } from "../lib/api";

const BASE_URL = 'http://127.0.0.1:8000/api';

export default function Arena({ onReveal }: { onReveal: (data: any) => void }) {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [turn, setTurn] = useState<number>(1);
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAwaitingVote, setIsAwaitingVote] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    const textARef = useRef<HTMLDivElement>(null);
    const textBRef = useRef<HTMLDivElement>(null);
    const responseARef = useRef<string>("");
    const responseBRef = useRef<string>("");

    const startBattle = async () => {
        try {
            const data = await submitStartSession();
            setSessionId(data.session_id);
            setTurn(1);
            setHasStarted(true);
            resetArena();
        } catch (e) {
            alert("Failed to start battle: " + e);
        }
    };

    const resetArena = () => {
        setPrompt("");
        responseARef.current = "";
        responseBRef.current = "";
        if (textARef.current) textARef.current.textContent = "Waiting for your prompt...";
        if (textBRef.current) textBRef.current.textContent = "Waiting for your prompt...";
        setIsGenerating(false);
        setIsAwaitingVote(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || !sessionId || isGenerating || isAwaitingVote) return;

        setIsGenerating(true);
        responseARef.current = "";
        responseBRef.current = "";
        if (textARef.current) textARef.current.textContent = "";
        if (textBRef.current) textBRef.current.textContent = "";

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
                                if (data.model === 'A') {
                                    if (data.chunk) {
                                        responseARef.current += data.chunk;
                                        if (textARef.current) textARef.current.textContent = responseARef.current;
                                    }
                                } else if (data.model === 'B') {
                                    if (data.chunk) {
                                        responseBRef.current += data.chunk;
                                        if (textBRef.current) textBRef.current.textContent = responseBRef.current;
                                    }
                                }
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
        try {
            const resp = await submitVote(sessionId, voteResult, prompt, responseARef.current, responseBRef.current);
            if (resp.is_completed) {
                onReveal(resp.reveal);
            } else {
                setTurn(resp.current_turn + 1);
                resetArena();
            }
        } catch (e) {
            alert("Vote failed: " + e);
        }
    };

    if (!hasStarted) {
        return (
            <div className="flex justify-center items-center h-full mt-20">
                <button onClick={startBattle} className="relative group px-12 py-6 bg-cyber-dark border-2 border-cyber-pink text-cyber-pink hover:bg-cyber-pink hover:text-white text-3xl font-display font-black tracking-widest uppercase transition-all duration-300 overflow-hidden shadow-cyber-pink">
                    <span className="relative z-10 animate-pulse">INITIATE SEQUENCE</span>
                    <div className="absolute inset-0 bg-neon-gradient transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left opacity-80"></div>
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in pt-4">
            <div className="text-center glass-panel p-3 rounded-lg text-sm font-mono tracking-widest text-cyber-blue flex justify-center items-center space-x-4 border-l-4 border-l-cyber-pink">
                <span className="text-white font-bold bg-cyber-pink px-2 py-1 text-xs">CYCLE {turn} / 3</span>
                <span className="opacity-80 uppercase">Ignore speed/format. Evaluate logic, accuracy & utility.</span>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-8 min-h-[400px]">
                {/* Model A */}
                <div className="glass-panel rounded-xl flex flex-col shadow-cyber-blue overflow-hidden relative group border-t-4 border-t-cyber-blue">
                    <div className="bg-cyber-blue/10 p-3 border-b border-cyber-blue/30 flex justify-between items-center">
                        <h2 className="text-sm font-mono font-bold text-cyber-blue uppercase tracking-[0.3em]">Entity Alpha</h2>
                        <div className="w-2 h-2 rounded-full bg-cyber-blue animate-pulse"></div>
                    </div>
                    <div className="flex-1 overflow-auto p-6 whitespace-pre-wrap text-gray-300 font-mono text-sm leading-relaxed" ref={textARef}>
                        Waiting for prompt...
                    </div>
                    {isAwaitingVote && (
                        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-cyber-dark to-transparent">
                            <button onClick={() => handleVote("left")} className="w-full py-4 bg-cyber-dark border border-cyber-blue text-cyber-blue hover:bg-cyber-blue hover:text-cyber-dark font-mono font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_#00f0ff] animate-pulse">
                                &lt; SELECT ALPHA &gt;
                            </button>
                        </div>
                    )}
                </div>

                {/* Model B */}
                <div className="glass-panel rounded-xl flex flex-col shadow-cyber-pink overflow-hidden relative group border-t-4 border-t-cyber-pink">
                    <div className="bg-cyber-pink/10 p-3 border-b border-cyber-pink/30 flex justify-between items-center">
                        <div className="w-2 h-2 rounded-full bg-cyber-pink animate-pulse"></div>
                        <h2 className="text-sm font-mono font-bold text-cyber-pink uppercase tracking-[0.3em]">Entity Beta</h2>
                    </div>
                    <div className="flex-1 overflow-auto p-6 whitespace-pre-wrap text-gray-300 font-mono text-sm leading-relaxed" ref={textBRef}>
                        Waiting for prompt...
                    </div>
                    {isAwaitingVote && (
                        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-cyber-dark to-transparent">
                            <button onClick={() => handleVote("right")} className="w-full py-4 bg-cyber-dark border border-cyber-pink text-cyber-pink hover:bg-cyber-pink hover:text-white font-mono font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_#ff003c] animate-pulse">
                                &lt; SELECT BETA &gt;
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className={`flex justify-center flex-col items-center space-y-4 transition-opacity duration-500 ${isAwaitingVote ? 'opacity-100' : 'opacity-0 pointer-events-none hidden'}`}>
                <div className="text-cyber-yellow text-xs font-mono font-bold uppercase tracking-[0.3em]">Analyze Outliers:</div>
                <div className="flex justify-center space-x-8">
                    <button onClick={() => handleVote("both_good")} className="px-10 py-3 bg-cyber-dark text-cyber-yellow border border-cyber-yellow hover:bg-cyber-yellow hover:text-cyber-dark font-mono font-bold transform transition-all shadow-[0_0_10px_#fcee0a]">
                        COLLISION (BOTH EXCEL)
                    </button>
                    <button onClick={() => handleVote("both_bad")} className="px-10 py-3 bg-cyber-dark text-gray-500 border border-gray-500 hover:bg-gray-500 hover:text-white font-mono font-bold transform transition-all">
                        VOID (BOTH FAIL)
                    </button>
                </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="relative mt-4">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isGenerating || isAwaitingVote}
                    placeholder="ENTER QUERY DIRECTIVE..."
                    className="w-full bg-cyber-dark/80 backdrop-blur-md border-b-2 border-l-2 border-r-0 border-t-0 border-cyber-blue pl-6 pr-32 py-5 text-lg focus:outline-none focus:border-cyber-pink disabled:opacity-40 text-cyber-blue font-mono placeholder-cyber-blue/30 transition-all shadow-inner uppercase tracking-wide"
                />
                <button
                    type="submit"
                    disabled={isGenerating || isAwaitingVote || !prompt.trim()}
                    className="absolute right-0 top-0 bottom-0 bg-cyber-blue/20 text-cyber-blue hover:bg-cyber-blue hover:text-cyber-dark border-b-2 border-cyber-blue px-10 font-mono font-bold tracking-widest uppercase disabled:opacity-30 transition-all"
                >
                    {isGenerating ? "PROCESSING" : "EXECUTE"}
                </button>
            </form>
        </div>
    );
}
