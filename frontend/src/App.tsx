import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Arena from "./components/Arena";
import Leaderboard from "./components/Leaderboard";

export default function App() {
  const [view, setView] = useState<'arena' | 'leaderboard'>('arena');
  const { t, i18n } = useTranslation();
  
  // Gamification & Onboarding Stats
  const [matchCount, setMatchCount] = useState<number>(0);
  const [showMission, setShowMission] = useState<boolean>(false);

  useEffect(() => {
    const savedCount = localStorage.getItem('judged_matches');
    if (savedCount) setMatchCount(parseInt(savedCount));
    
    const hasSeenMission = localStorage.getItem('has_seen_mission');
    if (!hasSeenMission) {
      setShowMission(true);
    }
  }, []);

  const handleUpdateStats = () => {
    const nextCount = matchCount + 1;
    setMatchCount(nextCount);
    localStorage.setItem('judged_matches', nextCount.toString());
  };

  const closeMission = () => {
    setShowMission(false);
    localStorage.setItem('has_seen_mission', 'true');
  };

  const getRank = (count: number) => {
    if (count >= 10) return t('stats.ranks.sage');
    if (count >= 3) return t('stats.ranks.sentinel');
    return t('stats.ranks.novice');
  };

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');
  };

  return (
    <div className="flex h-screen bg-dark-900 text-dark-100 font-sans selection:bg-model-a/30 selection:text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] bg-dark-950 border-r border-dark-800 flex-col justify-between hidden md:flex shrink-0 z-10">
        <div className="p-8">
          <h1 className="text-xl font-serif text-white tracking-widest font-light mb-12 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="opacity-80">AI</span>
              <span className="font-bold">ARENA</span>
              <span className="text-sm">⚖️</span>
            </div>
            <button 
              onClick={toggleLang}
              className="text-[10px] font-mono px-2 py-1 border border-dark-800 rounded bg-dark-900 text-dark-400 hover:text-white transition-colors"
            >
              {i18n.language === 'en' ? 'EN' : '中'}
            </button>
          </h1>
          
          <div className="space-y-1">
            <p className="text-[10px] text-dark-400 font-mono tracking-widest uppercase mb-4 px-3">{t('app.protocol')}</p>
            <button
              onClick={() => setView('arena')}
              className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-all flex items-center gap-3 ${view === 'arena' ? 'bg-dark-800 text-white font-medium shadow-sm' : 'text-dark-400 hover:bg-dark-900/50 hover:text-dark-100'}`}
            >
              <span className="text-lg opacity-70">⚔️</span>
              {t('app.arena')}
            </button>
            <button
              onClick={() => setView('leaderboard')}
              className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-all flex items-center gap-3 ${view === 'leaderboard' ? 'bg-dark-800 text-white font-medium shadow-sm' : 'text-dark-400 hover:bg-dark-900/50 hover:text-dark-100'}`}
            >
              <span className="text-lg opacity-70">📊</span>
              {t('app.leaderboard')}
            </button>
          </div>
        </div>
        
        <div className="p-8 border-t border-dark-800 bg-dark-950/50 space-y-6">
           <div className="space-y-4">
              <p className="text-[10px] text-dark-400 font-mono tracking-widest uppercase px-3">{t('stats.title')}</p>
              <div className="bg-dark-900 border border-dark-800 rounded-lg p-4 space-y-3">
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-dark-400">{t('stats.rounds')}</span>
                    <span className="text-white font-mono">{matchCount}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-dark-400">{t('stats.rank')}</span>
                    <span className="text-model-a font-medium">{getRank(matchCount)}</span>
                 </div>
              </div>
           </div>

           <p className="text-xs text-dark-400 leading-relaxed font-serif italic px-3">
             {t('app.slogan')}
           </p>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative bg-dark-900 h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-dark-800 bg-dark-950 z-20">
          <div className="flex items-center gap-2 relative">
            <h1 className="text-lg font-serif tracking-widest text-white">AI ARENA ⚖️</h1>
            <button onClick={toggleLang} className="absolute -top-1 -right-8 text-[9px] font-mono px-1.5 py-0.5 border border-dark-800 rounded bg-dark-900 text-dark-400">
              {i18n.language === 'en' ? 'EN' : '中'}
            </button>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setView('arena')} className={`text-[10px] uppercase tracking-widest font-medium ${view==='arena'?'text-white border-b border-white':'text-dark-400'}`}>{t('app.arena_m')}</button>
            <button onClick={() => setView('leaderboard')} className={`text-[10px] uppercase tracking-widest font-medium ${view==='leaderboard'?'text-white border-b border-white':'text-dark-400'}`}>{t('app.nexus_m')}</button>
          </div>
        </header>

        {view === 'arena' && <Arena onNavigate={setView} onMatchComplete={handleUpdateStats} />}
        {view === 'leaderboard' && (
          <div className="overflow-y-auto h-full p-4 md:p-12 w-full">
            <Leaderboard />
          </div>
        )}
      </main>

      {/* Mission Overlay */}
      {showMission && (
        <div className="fixed inset-0 bg-dark-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-fadeIn">
           <div className="max-w-lg w-full bg-dark-900 border border-dark-800 p-10 md:p-14 rounded-3xl shadow-2xl space-y-8 text-center">
              <div className="w-12 h-12 bg-white rounded-full mx-auto flex items-center justify-center text-dark-950 text-xl">⚖️</div>
              <div className="space-y-4">
                <h3 className="text-2xl font-serif text-white tracking-widest uppercase">{t('onboarding.title')}</h3>
                <p className="text-dark-400 leading-relaxed font-sans text-sm md:text-base">
                  {t('onboarding.body')}
                </p>
              </div>
              <button 
                onClick={closeMission}
                className="w-full py-4 bg-white text-dark-950 font-bold text-[10px] uppercase tracking-[0.2em] rounded-full hover:bg-dark-100 transition-all active:scale-95"
              >
                {t('onboarding.action')}
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
