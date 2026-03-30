import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Arena from "./components/Arena";
import Leaderboard from "./components/Leaderboard";
import WelcomeModal, { ModelPoolPanel } from "./components/WelcomeModal";
import { fetchModelPool } from "./lib/api";
import type { ModelPoolItem } from "./lib/api";
import StatsWidget from "./components/StatsWidget";

export default function App() {
  const [view, setView] = useState<'arena' | 'leaderboard'>('arena');
  const { t, i18n } = useTranslation();
  const [matchCount, setMatchCount] = useState<number>(0);
  const [showMission, setShowMission] = useState<boolean>(false);
  const [poolModels, setPoolModels] = useState<ModelPoolItem[]>([]);
  const [poolWeekLabel, setPoolWeekLabel] = useState<string>('');
  const [poolCollapsed, setPoolCollapsed] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedCount = localStorage.getItem('judged_matches');
    if (savedCount) setMatchCount(parseInt(savedCount));
    const hasSeenMission = localStorage.getItem('has_seen_mission');
    if (!hasSeenMission) setShowMission(true);

    // Fetch model pool from backend
    fetchModelPool()
      .then((data) => {
        setPoolModels(data.models || []);
        setPoolWeekLabel(data.week_label || '');
      })
      .catch((e) => console.warn('Failed to fetch model pool:', e));
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
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-base)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)' }}>

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col shrink-0 z-10"
        style={{
          width: '220px',
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* Logo area */}
        <div className="px-6 pt-8 pb-6" style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Geometric mark */}
              <div className="relative w-6 h-6 flex-shrink-0">
                <div className="absolute inset-0 rounded-md" style={{ background: 'var(--color-accent)', opacity: 0.15 }} />
                <div className="absolute inset-[3px] rounded-sm" style={{ background: 'var(--color-accent)' }} />
              </div>
              <h1 className="font-semibold tracking-tight" style={{ fontSize: '14px', color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
                Apex
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLang}
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  padding: '3px 7px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  transition: 'color 180ms ease-out, border-color 180ms ease-out',
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--color-text-primary)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--color-text-muted)'; }}
              >
                {i18n.language === 'en' ? 'EN' : '中'}
              </button>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={t('theme.' + (theme === 'dark' ? 'light' : 'dark'))}
                style={{
                  fontSize: '10px',
                  padding: '3px 7px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                }}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pt-4 space-y-0.5">
          <p style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', padding: '0 10px 8px' }}>
            {t('app.protocol')}
          </p>
          {([
            { id: 'arena', icon: '⚔', label: t('app.arena') },
            { id: 'leaderboard', icon: '≡', label: t('app.leaderboard') },
            { id: 'intro', icon: '✨', label: i18n.language === 'zh' ? '网站介绍' : 'About' },
          ] as const).map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'intro') setShowMission(true);
                else setView(item.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13.5px',
                fontWeight: view === item.id ? '500' : '400',
                fontFamily: 'var(--font-sans)',
                textAlign: 'left',
                transition: 'background 180ms ease-out, color 180ms ease-out',
                background: view === item.id ? 'var(--color-accent-soft)' : 'transparent',
                color: view === item.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              }}
              onMouseEnter={e => {
                if (view !== item.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
              }}
              onMouseLeave={e => {
                if (view !== item.id) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '12px', opacity: 0.7, width: '16px', textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Stats */}
        <div className="px-6 py-6" style={{ borderTop: '1px solid var(--color-border-soft)' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>
            {t('stats.title')}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{t('stats.rounds')}</span>
            <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{matchCount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{t('stats.rank')}</span>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-accent)' }}>{getRank(matchCount)}</span>
          </div>
          <p style={{ marginTop: '16px', fontSize: '11px', fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            {t('app.slogan')}
          </p>
        </div>

        {/* Model Pool (collapsible) */}
        <ModelPoolPanel
          models={poolModels}
          weekLabel={poolWeekLabel}
          collapsed={poolCollapsed}
          onToggle={() => setPoolCollapsed(!poolCollapsed)}
        />
      </aside>

      {/* ── Main Content ─────────────────────────────── */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden" style={{ background: 'var(--color-base)' }}>
        {/* Mobile Header */}
        <header
          className="md:hidden flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
        >
          <div className="flex items-center gap-2">
            <div className="relative w-5 h-5 flex-shrink-0">
              <div className="absolute inset-0 rounded" style={{ background: 'var(--color-accent)', opacity: 0.15 }} />
              <div className="absolute inset-[2px] rounded-sm" style={{ background: 'var(--color-accent)' }} />
            </div>
            <h1 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>Apex</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('arena')}
              style={{ fontSize: '11px', fontWeight: '500', letterSpacing: '0.06em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', color: view === 'arena' ? 'var(--color-accent)' : 'var(--color-text-muted)', paddingBottom: view === 'arena' ? '2px' : '0', borderBottom: view === 'arena' ? '1px solid var(--color-accent)' : 'none' }}
            >{t('app.arena_m')}</button>
            <button
              onClick={() => setView('leaderboard')}
              style={{ fontSize: '11px', fontWeight: '500', letterSpacing: '0.06em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', color: view === 'leaderboard' ? 'var(--color-accent)' : 'var(--color-text-muted)', paddingBottom: view === 'leaderboard' ? '2px' : '0', borderBottom: view === 'leaderboard' ? '1px solid var(--color-accent)' : 'none' }}
            >{t('app.nexus_m')}</button>
            <button onClick={toggleLang} style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: '5px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
              {i18n.language === 'en' ? 'EN' : '中'}
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '5px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer' }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {view === 'arena' && <Arena onNavigate={setView} onMatchComplete={handleUpdateStats} theme={theme} />}
        {view === 'leaderboard' && (
          <div className="overflow-y-auto h-full px-6 py-10 md:px-12 md:py-12 w-full">
            <Leaderboard />
          </div>
        )}
      </main>

      {/* ── Welcome Overlay ───────────────────────────── */}
      {showMission && (
        <WelcomeModal
          onClose={closeMission}
          models={poolModels}
          weekLabel={poolWeekLabel}
        />
      )}
      {/* Live Stats Widget */}
      <StatsWidget />
    </div>
  );
}
