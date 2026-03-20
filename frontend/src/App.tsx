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
    <div className="min-h-screen flex flex-col items-center p-4 bg-grid font-sans selection:bg-cyber-pink selection:text-white">
      <header className="w-full max-w-6xl py-6 px-8 flex justify-between items-center glass-panel rounded-2xl mb-8 relative border-t-2 border-t-cyber-blue border-b-2 border-b-cyber-pink overflow-hidden">
        <div className="absolute inset-0 bg-neon-gradient opacity-5"></div>
        <h1 className="relative z-10 text-3xl font-display font-black tracking-widest uppercase bg-neon-gradient bg-clip-text text-transparent cursor-pointer hover:drop-shadow-[0_0_15px_rgba(0,240,255,0.8)] transition-all duration-300" onClick={handleRestart}>
          <span className="animate-flicker inline-block">AI</span> EVOLUTION ARENA
        </h1>
        <nav className="relative z-10 flex space-x-4">
          <button
            onClick={() => { setView('arena'); setRevealData(null); }}
            className={`px-6 py-2 rounded-lg font-mono font-bold tracking-widest uppercase transition-all duration-300 ${view === 'arena' && !revealData ? 'bg-cyber-blue text-cyber-dark shadow-cyber-blue scale-105' : 'text-cyber-blue border border-cyber-blue/30 hover:bg-cyber-blue/10 hover:border-cyber-blue hover:shadow-[0_0_10px_#00f0ff]'}`}
          >
            Terminal
          </button>
          <button
            onClick={() => setView('leaderboard')}
            className={`px-6 py-2 rounded-lg font-mono font-bold tracking-widest uppercase transition-all duration-300 ${view === 'leaderboard' ? 'bg-cyber-pink text-white shadow-cyber-pink scale-105' : 'text-cyber-pink border border-cyber-pink/30 hover:bg-cyber-pink/10 hover:border-cyber-pink hover:shadow-[0_0_10px_#ff003c]'}`}
          >
            Nexus
          </button>
        </nav>
      </header>

      <main className="w-full max-w-6xl flex-1 flex flex-col relative pb-8">
        {view === 'arena' && !revealData && (
          <Arena onReveal={handleReveal} />
        )}

        {view === 'arena' && revealData && (
          <div className="flex flex-col items-center justify-center space-y-12 mt-12 animate-slide-up w-full">
            <div className="text-center relative">
              <div className="absolute -inset-4 bg-cyber-pink/20 blur-2xl rounded-full z-0 animate-glow-pulse"></div>
              <h2 className="relative z-10 text-5xl font-display font-black mb-4 uppercase tracking-widest text-shadow-neon text-white">SYSTEM <span className="text-cyber-pink">COMPROMISED</span></h2>
              <p className="relative z-10 text-cyber-blue font-mono text-lg uppercase tracking-widest">Identities Decrypted Successfully.</p>
            </div>

            <div className="flex gap-12 relative w-full justify-center">
              <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gray-800 -z-10"></div>

              <div className="bg-cyber-dark glass-panel border-l-4 border-l-cyber-blue rounded-r-2xl rounded-bl-sm p-10 w-96 text-center transform hover:scale-105 transition-all duration-500 shadow-cyber-blue group relative overflow-hidden">
                <div className="absolute inset-0 bg-cyber-blue/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-sm font-mono tracking-[0.3em] uppercase text-cyber-blue/70 mb-4 border-b border-cyber-blue/20 pb-2">ENTITY ALPHA</div>
                <div className="text-3xl font-display font-bold text-white tracking-wide group-hover:text-shadow-neon group-hover:text-cyber-blue transition-all">{revealData.A}</div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-cyber-blue opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-cyber-blue opacity-50"></div>
              </div>

              <div className="text-4xl font-display font-black text-gray-700 self-center opacity-50">VS</div>

              <div className="bg-cyber-dark glass-panel border-r-4 border-r-cyber-pink rounded-l-2xl rounded-br-sm p-10 w-96 text-center transform hover:scale-105 transition-all duration-500 shadow-cyber-pink group relative overflow-hidden">
                <div className="absolute inset-0 bg-cyber-pink/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-sm font-mono tracking-[0.3em] uppercase text-cyber-pink/70 mb-4 border-b border-cyber-pink/20 pb-2">ENTITY BETA</div>
                <div className="text-3xl font-display font-bold text-white tracking-wide group-hover:text-shadow-neon group-hover:text-cyber-pink transition-all">{revealData.B}</div>
                <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-cyber-pink opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-cyber-pink opacity-50"></div>
              </div>
            </div>

            <div className="flex space-x-8 mt-16 pt-8 border-t border-gray-800/50 relative">
              <div className="absolute -top-px left-1/2 -ml-16 w-32 h-px bg-neon-gradient"></div>

              <button onClick={handleRestart} className="relative group px-10 py-4 bg-cyber-dark border border-cyber-blue text-cyber-blue hover:bg-cyber-blue hover:text-cyber-dark text-lg font-mono font-bold tracking-widest uppercase transition-all duration-300 overflow-hidden">
                <span className="relative z-10">[ REBOOT SEQUENCE ]</span>
                <div className="absolute inset-0 bg-cyber-blue transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </button>

              <button onClick={() => setView('leaderboard')} className="relative group px-10 py-4 bg-cyber-dark border border-cyber-pink text-cyber-pink hover:bg-cyber-pink hover:text-white text-lg font-mono font-bold tracking-widest uppercase transition-all duration-300">
                <span className="relative z-10">&lt; / ACCESS NEXUS &gt;</span>
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
