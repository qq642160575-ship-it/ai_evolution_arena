import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { fetchLeaderboard } from "../lib/api";

export default function Leaderboard() {
    const { t } = useTranslation();
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        fetchLeaderboard().then(res => setData(res.leaderboard)).catch(console.error);
    }, []);

    return (
        <div className="w-full max-w-5xl mx-auto relative animate-fadeIn py-8">
            <div className="mb-14">
                <h2 className="text-4xl text-white font-serif tracking-tight mb-2">{t('leaderboard.title')}</h2>
                <div className="w-12 h-[2px] bg-dark-700 rounded-full mb-4"></div>
                <p className="text-dark-400 font-sans text-sm">{t('leaderboard.subtitle')}</p>
            </div>

            <div className="bg-dark-950 border border-dark-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-dark-900/50 border-b border-dark-800 text-[10px] uppercase tracking-[0.2em] font-medium text-dark-400">
                                <th className="p-6 pl-8 w-24">{t('leaderboard.rank')}</th>
                                <th className="p-6">{t('leaderboard.identity')}</th>
                                <th className="p-6 text-center">{t('leaderboard.win_rate')}</th>
                                <th className="p-6 text-center">{t('leaderboard.matches')}</th>
                                <th className="p-6 text-center text-model-a/70">{t('leaderboard.wins')}</th>
                                <th className="p-6 text-center text-model-b/70">{t('leaderboard.losses')}</th>
                            </tr>
                        </thead>
                        <tbody className="font-sans text-sm">
                            {data.map((row, idx) => (
                                <tr key={row.model} className="border-b border-dark-800/50 hover:bg-dark-800/20 transition-colors group">
                                    <td className="p-6 pl-8 font-mono text-dark-400">
                                        {(idx + 1).toString().padStart(2, '0')}
                                    </td>
                                    <td className="p-6 font-medium text-dark-100 group-hover:text-white transition-colors">{row.model}</td>
                                    <td className="p-6 text-center">
                                        <span className={`px-4 py-1.5 text-xs font-bold rounded-full border ${row.win_rate > 0.5 ? 'border-dark-700 bg-dark-800 text-white' : 'border-dark-800 bg-transparent text-dark-400'}`}>
                                            {(row.win_rate * 100).toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="p-6 text-center text-dark-400">{row.total_matches}</td>
                                    <td className="p-6 text-center text-model-a">{row.wins}</td>
                                    <td className="p-6 text-center text-model-b">{row.losses}</td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-16 text-center text-dark-400 text-sm italic font-serif opacity-50">
                                        {t('leaderboard.no_data')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-10 text-xs font-mono tracking-widest text-dark-400 text-center uppercase opacity-50">
                {t('leaderboard.footer')}
            </div>
        </div>
    );
}
