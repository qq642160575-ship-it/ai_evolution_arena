import { useState } from "react";
import Arena from "./components/Arena";
import Leaderboard from "./components/Leaderboard";

export default function App() {
  const [view, setView] = useState<'arena' | 'leaderboard'>('arena');
  const [revealData, setRevealData] = useState<any>(null);

  const handleReveal = (data: any) => {
    setRevealData(data);
  };

  const handleRestart = () => {
    setRevealData(null);
    setView('arena');
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4">
      <header className="w-full max-w-6xl py-6 px-8 flex justify-between items-center bg-gray-900 border border-gray-800 rounded-3xl mb-8 shadow-2xl">
        <h1 className="text-2xl font-black tracking-widest uppercase bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent cursor-pointer" onClick={handleRestart}>
          AI Evolution Arena
        </h1>
        <nav className="flex space-x-2">
          <button
            onClick={() => { setView('arena'); setRevealData(null); }}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${view === 'arena' && !revealData ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            Arena
          </button>
          <button
            onClick={() => setView('leaderboard')}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${view === 'leaderboard' ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            Evolution Hub
          </button>
        </nav>
      </header>

      <main className="w-full max-w-6xl flex-1 flex flex-col relative pb-8">
        {view === 'arena' && !revealData && (
          <Arena onReveal={handleReveal} />
        )}

        {view === 'arena' && revealData && (
          <div className="flex flex-col items-center justify-center space-y-8 mt-16 animate-fade-in">
            <div className="text-center">
              <h2 className="text-4xl font-black mb-4 uppercase tracking-widest text-white">The Truth Revealed</h2>
              <p className="text-gray-400 text-lg">Here are the real identities of the models from your battle.</p>
            </div>

            <div className="flex gap-8">
              <div className="bg-blue-900/40 border-2 border-blue-500 rounded-3xl p-8 w-80 text-center shadow-[0_0_30px_rgba(59,130,246,0.5)] transform hover:scale-105 transition-all">
                <div className="text-xl font-black uppercase text-blue-400 mb-2">Model A was</div>
                <div className="text-3xl font-bold text-white">{revealData.A}</div>
              </div>
              <div className="bg-purple-900/40 border-2 border-purple-500 rounded-3xl p-8 w-80 text-center shadow-[0_0_30px_rgba(168,85,247,0.5)] transform hover:scale-105 transition-all">
                <div className="text-xl font-black uppercase text-purple-400 mb-2">Model B was</div>
                <div className="text-3xl font-bold text-white">{revealData.B}</div>
              </div>
            </div>

            <div className="flex space-x-6 mt-12">
              <button onClick={handleRestart} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-2xl text-xl font-black tracking-widest transition-all shadow-2xl shadow-blue-500/30">
                🔄 Start New Battle
              </button>
              <button onClick={() => setView('leaderboard')} className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl text-xl font-bold text-gray-300 transition-all border border-gray-700">
                📊 View Leaderboard
              </button>
            </div>
          </div>
        )}

        {view === 'leaderboard' && (
          <Leaderboard />
        )}
      </main>
    </div>
  );
}
