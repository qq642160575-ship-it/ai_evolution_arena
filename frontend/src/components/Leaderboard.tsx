import { useState, useEffect } from "react";
import { fetchLeaderboard } from "../lib/api";

export default function Leaderboard() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        fetchLeaderboard().then(res => setData(res.leaderboard)).catch(console.error);
    }, []);

    return (
        <div className="glass-panel rounded-2xl p-8 animate-slide-up w-full max-w-4xl mx-auto mt-8 border-t-4 border-cyber-pink shadow-cyber-pink relative overflow-hidden group">
            <div className="absolute inset-0 bg-cyber-pink/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex items-center justify-center mb-10 relative">
                <div className="absolute w-full h-px bg-cyber-pink/20"></div>
                <h2 className="relative z-10 px-6 text-3xl font-display font-black uppercase tracking-widest text-center bg-cyber-dark text-white text-shadow-neon border-l-4 border-r-4 border-cyber-pink">NEXUS RANKINGS</h2>
            </div>

            <div className="overflow-hidden rounded-lg border border-cyber-blue/30 shadow-[0_0_15px_rgba(0,240,255,0.1)] relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-blue to-cyber-pink"></div>
                <table className="w-full text-left border-collapse font-mono">
                    <thead>
                        <tr className="bg-cyber-blue/10 uppercase text-xs font-bold tracking-[0.2em] text-cyber-blue border-b-2 border-cyber-blue/50">
                            <th className="p-4 pl-6">Rank</th>
                            <th className="p-4">Entity Name</th>
                            <th className="p-4 text-center">Efficacy</th>
                            <th className="p-4 text-center">Cycles</th>
                            <th className="p-4 text-center">Victories</th>
                            <th className="p-4 text-center">Defeats</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => (
                            <tr key={row.model} className="border-b border-cyber-blue/10 hover:bg-cyber-blue/5 transition-colors group">
                                <td className="p-4 pl-6 font-bold text-cyber-pink group-hover:text-shadow-neon transition-all">0{idx + 1}</td>
                                <td className="p-4 font-bold text-gray-200 tracking-wide">{row.model}</td>
                                <td className="p-4 text-center">
                                    <span className={`px-3 py-1 text-sm font-bold border ${row.win_rate > 0.5 ? 'border-cyber-blue text-cyber-blue shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'border-gray-600 text-gray-500'}`}>
                                        {(row.win_rate * 100).toFixed(1)}%
                                    </span>
                                </td>
                                <td className="p-4 text-center text-gray-400 font-mono group-hover:text-white transition-colors">{row.total_matches}</td>
                                <td className="p-4 text-center text-cyber-blue font-mono group-hover:text-shadow-neon transition-all">{row.wins}</td>
                                <td className="p-4 text-center text-cyber-pink font-mono group-hover:text-shadow-neon transition-all">{row.losses}</td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-cyber-blue/50 tracking-[0.2em] uppercase font-mono">
                                    <div className="animate-pulse">Awaiting data injection... Start sequence required.</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 text-xs font-mono tracking-widest text-gray-500 text-center uppercase">
                <span className="text-cyber-pink">&gt; </span>Rankings compute simple efficacy. Collisions ignored in W/L metric. Data open-source for deep analysis.
            </div>
        </div>
    );
}
