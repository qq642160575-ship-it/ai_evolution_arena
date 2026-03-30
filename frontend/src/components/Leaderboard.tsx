import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { fetchLeaderboard } from "../lib/api";

const MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };

const DOMAINS = [
    { value: '', label: '🏆 综合排行' },
    { value: 'coding', label: '💻 代码' },
    { value: 'logic', label: '🧠 逻辑' },
    { value: 'creative', label: '✍️ 创作' },
    { value: 'instruction', label: '🎯 指令' },
    { value: 'general', label: '💬 问答' }
];

export default function Leaderboard() {
    const { t } = useTranslation();
    const [data, setData] = useState<any[]>([]);
    const [category, setCategory] = useState<string>('');

    useEffect(() => {
        fetchLeaderboard(category).then(res => setData(res.leaderboard)).catch(console.error);
    }, [category]);

    return (
        <div style={{ width: '100%', maxWidth: '860px', margin: '0 auto' }} className="animate-fadeIn">
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '26px', fontFamily: 'var(--font-serif)', fontWeight: '500', color: 'var(--color-text-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
                    {t('leaderboard.title')}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    {t('leaderboard.subtitle')}
                </p>
            </div>

            {/* Category Tabs */}
            <div className="hide-scrollbar" style={{ display: 'flex', gap: '8px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '4px' }}>
                {DOMAINS.map(d => (
                    <button
                        key={d.value}
                        onClick={() => setCategory(d.value)}
                        style={{
                            padding: '6px 16px',
                            borderRadius: '999px',
                            fontSize: '13px',
                            fontWeight: '500',
                            whiteSpace: 'nowrap',
                            transition: 'all 200ms ease',
                            background: category === d.value ? 'var(--color-text-primary)' : 'transparent',
                            color: category === d.value ? 'var(--color-surface)' : 'var(--color-text-secondary)',
                            border: `1px solid ${category === d.value ? 'var(--color-text-primary)' : 'var(--color-border)'}`,
                            cursor: 'pointer'
                        }}
                    >
                        {d.label}
                    </button>
                ))}
            </div>

            {/* Column labels */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr 120px 80px 80px',
                gap: '0 16px',
                padding: '0 20px 10px',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                alignItems: 'center',
            }}>
                <span>#</span>
                <span>{t('leaderboard.identity')}</span>
                <span>{t('leaderboard.win_rate')}</span>
                <span style={{ textAlign: 'center' }}>{t('leaderboard.wins')}</span>
                <span style={{ textAlign: 'center' }}>{t('leaderboard.matches')}</span>
            </div>

            {/* Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.map((row, idx) => (
                    <LeaderboardRow key={row.model} row={row} idx={idx} />
                ))}
                {data.length === 0 && (
                    <div style={{
                        padding: '64px 24px',
                        textAlign: 'center',
                        fontSize: '13px',
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        color: 'var(--color-text-muted)',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '14px',
                    }}>
                        {t('leaderboard.no_data')}
                    </div>
                )}
            </div>

            {/* Footer */}
            <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', opacity: 0.5 }}>
                {t('leaderboard.footer')}
            </p>
        </div>
    );
}

function LeaderboardRow({ row, idx }: { row: any; idx: number }) {
    const [hovered, setHovered] = useState(false);
    const pct = (row.win_rate * 100).toFixed(1);
    const isTop = idx < 3;

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr 120px 80px 80px',
                gap: '0 16px',
                alignItems: 'center',
                padding: '14px 20px',
                borderRadius: '12px',
                border: `1px solid ${hovered ? 'var(--color-border-accent)' : 'var(--color-border)'}`,
                background: hovered ? 'var(--color-surface-2)' : 'var(--color-surface)',
                transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
                boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                transition: 'transform 200ms ease-out, box-shadow 200ms ease-out, background 200ms ease-out, border-color 200ms ease-out',
                cursor: 'default',
            }}
        >
            {/* Rank */}
            <span style={{ fontSize: isTop ? '16px' : '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                {isTop ? MEDAL[idx] : (idx + 1).toString().padStart(2, '0')}
            </span>

            {/* Model name */}
            <span style={{ fontSize: '14px', fontWeight: '500', color: hovered ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', transition: 'color 200ms ease-out', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.model}
            </span>

            {/* Win rate bar + number */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: '600', color: row.win_rate > 0.5 ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
                        {pct}%
                    </span>
                </div>
                <div style={{ height: '3px', background: 'var(--color-surface-3)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${row.win_rate * 100}%`,
                        borderRadius: '2px',
                        background: row.win_rate > 0.5 ? 'var(--color-accent)' : 'var(--color-text-muted)',
                        transition: 'width 600ms cubic-bezier(0.22, 1, 0.36, 1)',
                        opacity: hovered ? 1 : 0.6,
                    }} />
                </div>
            </div>

            {/* Wins */}
            <span style={{ textAlign: 'center', fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent-b)' }}>
                {row.wins}
            </span>

            {/* Total matches */}
            <span style={{ textAlign: 'center', fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                {row.total_matches}
            </span>
        </div>
    );
}
