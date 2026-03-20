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
            <div className="flex justify-center items-center h-full">
                <button onClick={startBattle} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-2xl text-2xl font-black tracking-widest transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/30">
                    ⚔️ ENTER THE ARENA
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in pt-4">
            <div className="text-center bg-gray-900/50 backdrop-blur border border-gray-800 p-3 rounded-xl text-sm font-semibold text-gray-400">
                <span className="text-white font-bold mr-2">Round {turn} / 3</span>|
                <span className="ml-2 italic opacity-80">⚖️ Please ignore speed and formatting. Vote purely on logic, accuracy, and usefulness.</span>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-6 min-h-[400px]">
                {/* Model A */}
                <div className="bg-gray-900 rounded-2xl border border-gray-800 flex flex-col shadow-xl overflow-hidden relative group">
                    <div className="bg-gradient-to-r from-blue-900/40 to-transparent p-4 border-b border-gray-800">
                        <h2 className="text-lg font-bold text-blue-400 uppercase tracking-widest">Model A</h2>
                    </div>
                    <div className="flex-1 overflow-auto p-6 whitespace-pre-wrap text-gray-300 font-mono text-base leading-relaxed" ref={textARef}>
                        Waiting for your prompt...
                    </div>
                    {isAwaitingVote && (
                        <button onClick={() => handleVote("left")} className="absolute bottom-4 left-4 right-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold uppercase tracking-wider transition-all transform hover:translate-y-[-2px] shadow-lg shadow-blue-900/50">
                            👈 Choose Model A
                        </button>
                    )}
                </div>

                {/* Model B */}
                <div className="bg-gray-900 rounded-2xl border border-gray-800 flex flex-col shadow-xl overflow-hidden relative group">
                    <div className="bg-gradient-to-l from-purple-900/40 to-transparent p-4 border-b border-gray-800 text-right">
                        <h2 className="text-lg font-bold text-purple-400 uppercase tracking-widest">Model B</h2>
                    </div>
                    <div className="flex-1 overflow-auto p-6 whitespace-pre-wrap text-gray-300 font-mono text-base leading-relaxed" ref={textBRef}>
                        Waiting for your prompt...
                    </div>
                    {isAwaitingVote && (
                        <button onClick={() => handleVote("right")} className="absolute bottom-4 left-4 right-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold uppercase tracking-wider transition-all transform hover:translate-y-[-2px] shadow-lg shadow-purple-900/50">
                            Choose Model B 👉
                        </button>
                    )}
                </div>
            </div>

            <div className={`flex justify-center flex-col items-center space-y-4 transition-opacity duration-500 ${isAwaitingVote ? 'opacity-100' : 'opacity-0 pointer-events-none hidden'}`}>
                <div className="text-gray-500 text-sm font-bold uppercase tracking-widest">Or choose a tie:</div>
                <div className="flex justify-center space-x-6">
                    <button onClick={() => handleVote("both_good")} className="px-8 py-3 bg-gray-800 hover:bg-green-600 focus:bg-green-600 text-gray-300 hover:text-white rounded-xl font-bold transition-all border border-gray-700 hover:border-transparent cursor-pointer">
                        🤝 Both Outstanding
                    </button>
                    <button onClick={() => handleVote("both_bad")} className="px-8 py-3 bg-gray-800 hover:bg-red-600 focus:bg-red-600 text-gray-300 hover:text-white rounded-xl font-bold transition-all border border-gray-700 hover:border-transparent cursor-pointer">
                        👎 Both Terrible
                    </button>
                </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="relative mt-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isGenerating || isAwaitingVote}
                    placeholder="Enter your prompt here to challenge the models..."
                    className="w-full bg-gray-900 border-2 border-gray-800 rounded-2xl pl-6 pr-32 py-5 text-lg focus:outline-none focus:border-blue-500/50 disabled:opacity-40 text-white placeholder-gray-600 transition-all shadow-inner"
                />
                <button
                    type="submit"
                    disabled={isGenerating || isAwaitingVote || !prompt.trim()}
                    className="absolute right-3 top-3 bottom-3 bg-white text-black hover:bg-gray-200 px-8 font-black uppercase tracking-widest rounded-xl disabled:opacity-30 disabled:hover:bg-white transition-all shadow-md"
                >
                    {isGenerating ? "..." : "Send"}
                </button>
            </form>
        </div>
    );
}
