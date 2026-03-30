import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchStats } from '../lib/api';

export default function StatsWidget() {
    const { t } = useTranslation();
    const [stats, setStats] = useState({ online_users: 0, total_battles: 0 });

    useEffect(() => {
        const getStats = async () => {
            try {
                const data = await fetchStats();
                setStats(data);
            } catch (e) {
                console.warn('Failed to fetch stats', e);
            }
        };
        getStats();
        const interval = setInterval(getStats, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    if (!stats.total_battles) return null;

    return (
        <div className="animate-slideUp" style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 50,
            backdropFilter: 'blur(10px)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent-b)', boxShadow: '0 0 8px var(--color-accent-b-soft)' }} />
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('stats.online_users')} <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{stats.online_users}</span>
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 8, height: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '10px', color: 'var(--color-accent)' }}>⚔</span>
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('stats.total_battles')} <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{stats.total_battles}</span>
                </span>
            </div>
        </div>
    );
}
