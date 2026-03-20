import { useState, useEffect } from "react";
import { fetchLeaderboard } from "../lib/api";

export default function Leaderboard() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        fetchLeaderboard().then(res => setData(res.leaderboard)).catch(console.error);
    }, []);

    return (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl p-8 animate-fade-in w-full max-w-4xl mx-auto mt-8">
            <h2 className="text-3xl font-black uppercase tracking-widest text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">🏆 Evolution Hub Leaderboard</h2>

            <div className="overflow-hidden rounded-xl border border-gray-800">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-800/50 uppercase text-xs font-bold tracking-widest text-gray-400">
                            <th className="p-4 border-b border-gray-800">Rank</th>
                            <th className="p-4 border-b border-gray-800">Model Name</th>
                            <th className="p-4 border-b border-gray-800 text-center">Win Rate</th>
                            <th className="p-4 border-b border-gray-800 text-center">Matches</th>
                            <th className="p-4 border-b border-gray-800 text-center">Wins</th>
                            <th className="p-4 border-b border-gray-800 text-center">Losses</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => (
                            <tr key={row.model} className="border-b border-gray-800 hover:bg-gray-800/20 transition-colors">
                                <td className="p-4 font-bold text-gray-400">#{idx + 1}</td>
                                <td className="p-4 font-bold text-white tracking-wide">{row.model}</td>
                                <td className="p-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${row.win_rate > 0.5 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {(row.win_rate * 100).toFixed(1)}%
                                    </span>
                                </td>
                                <td className="p-4 text-center text-gray-400 font-mono">{row.total_matches}</td>
                                <td className="p-4 text-center text-green-400 font-mono">{row.wins}</td>
                                <td className="p-4 text-center text-red-400 font-mono">{row.losses}</td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500 italic">No battle data available yet. Be the first to start an evolution battle!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 text-sm text-gray-500 text-center">
                * Rankings are based on simple win rate. Ties are excluded from the main win/loss ratio but counted in matches. Data is open to the community for research purposes.
            </div>
        </div>
    );
}
