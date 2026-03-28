import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ModelPoolItem } from "../lib/api";

// ── Tier styles ───────────────────────────────────────────────────────────────
const tierStyle: Record<string, { dot: string; label: string; labelZh: string; bg: string }> = {
    flagship: { dot: "#818CF8", label: "Flagship", labelZh: "旗舰", bg: "rgba(129,140,248,0.10)" },
    fast: { dot: "#34D399", label: "Fast", labelZh: "快速", bg: "rgba(52,211,153,0.08)" },
    reasoning: { dot: "#F59E0B", label: "Reasoning", labelZh: "推理", bg: "rgba(245,158,11,0.10)" },
};

const tierOrder: Array<"flagship" | "reasoning" | "fast"> = ["flagship", "reasoning", "fast"];

// ── Step definitions ──────────────────────────────────────────────────────────
type Step = "intro" | "rules" | "pool";
const STEPS: Step[] = ["intro", "rules", "pool"];

interface Props {
    onClose: () => void;
    models: ModelPoolItem[];
    weekLabel: string;
}

export default function WelcomeModal({ onClose, models, weekLabel }: Props) {
    const { t, i18n } = useTranslation();
    const [step, setStep] = useState<Step>("intro");

    const stepIndex = STEPS.indexOf(step);
    const isLast = stepIndex === STEPS.length - 1;
    const isZh = i18n.language === "zh";

    const next = () => { if (isLast) onClose(); else setStep(STEPS[stepIndex + 1]); };
    const back = () => { if (stepIndex > 0) setStep(STEPS[stepIndex - 1]); };

    // Group models by tier
    const byTier: Record<string, ModelPoolItem[]> = {};
    models.forEach((m) => {
        if (!byTier[m.tier]) byTier[m.tier] = [];
        byTier[m.tier].push(m);
    });

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn"
            style={{ background: "var(--color-overlay)", backdropFilter: "var(--color-overlay-blur)" }}
        >
            <div
                className="w-full animate-slideUp"
                style={{
                    maxWidth: "560px",
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "24px",
                    boxShadow: "var(--shadow-modal)",
                    overflow: "hidden",
                }}
            >
                {/* ── Header ── */}
                <div
                    style={{
                        padding: "28px 32px 24px",
                        borderBottom: "1px solid var(--color-border-soft)",
                        background: "linear-gradient(135deg, rgba(129,140,248,0.06) 0%, transparent 60%)",
                    }}
                >
                    {/* Progress pills */}
                    <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
                        {STEPS.map((s, i) => (
                            <div
                                key={s}
                                style={{
                                    height: "3px", flex: 1, borderRadius: "2px",
                                    background: i <= stepIndex ? "var(--color-accent)" : "var(--color-border)",
                                    transition: "background 300ms ease",
                                }}
                            />
                        ))}
                    </div>
                    {/* Icon + Title */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div
                            style={{
                                width: "40px", height: "40px", borderRadius: "12px",
                                background: "var(--color-accent-soft)", border: "1px solid rgba(129,140,248,0.2)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "20px", flexShrink: 0,
                            }}
                        >
                            {step === "intro" ? "⚡" : step === "rules" ? "📋" : "🗂️"}
                        </div>
                        <div>
                            <p style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                                {t(`welcome.step_label.${step}`)}
                            </p>
                            <h2 style={{ fontSize: "18px", fontFamily: "var(--font-serif)", color: "var(--color-text-primary)", fontWeight: "500", letterSpacing: "-0.015em", lineHeight: 1.2 }}>
                                {t(`welcome.${step}.title`)}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* ── Body ── */}
                <div style={{ padding: "24px 32px", maxHeight: "360px", overflowY: "auto" }}>
                    {/* ── INTRO ── */}
                    {step === "intro" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.75 }}>
                                {t("welcome.intro.body")}
                            </p>
                            {([
                                { icon: "🎭", key: "feat_blind" },
                                { icon: "🏆", key: "feat_rank" },
                                { icon: "🔄", key: "feat_pool" },
                            ] as const).map(({ icon, key }) => (
                                <div key={key} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 16px", borderRadius: "12px", background: "var(--color-surface-2)", border: "1px solid var(--color-border-soft)" }}>
                                    <span style={{ fontSize: "18px", flexShrink: 0, marginTop: "1px" }}>{icon}</span>
                                    <div>
                                        <p style={{ fontSize: "12.5px", fontWeight: "500", color: "var(--color-text-primary)", marginBottom: "3px" }}>
                                            {t(`welcome.intro.${key}_title`)}
                                        </p>
                                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                                            {t(`welcome.intro.${key}_desc`)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── RULES ── */}
                    {step === "rules" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.75, marginBottom: "4px" }}>
                                {t("welcome.rules.body")}
                            </p>
                            {([
                                { num: "01", key: "r1" }, { num: "02", key: "r2" },
                                { num: "03", key: "r3" }, { num: "04", key: "r4" },
                            ] as const).map(({ num, key }) => (
                                <div key={key} style={{ display: "flex", gap: "14px", padding: "14px 16px", borderRadius: "12px", background: "var(--color-surface-2)", border: "1px solid var(--color-border-soft)" }}>
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-accent)", opacity: 0.6, flexShrink: 0, paddingTop: "1px" }}>{num}</span>
                                    <div>
                                        <p style={{ fontSize: "12.5px", fontWeight: "500", color: "var(--color-text-primary)", marginBottom: "3px" }}>
                                            {t(`welcome.rules.${key}_title`)}
                                        </p>
                                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                                            {t(`welcome.rules.${key}_desc`)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {/* Voting options */}
                            <div style={{ marginTop: "4px", padding: "14px 16px", borderRadius: "12px", background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.15)" }}>
                                <p style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--color-accent)", marginBottom: "10px", letterSpacing: "0.08em" }}>
                                    {isZh ? "投票选项" : "VOTING OPTIONS"}
                                </p>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                    {[
                                        { label: isZh ? "👈 Alpha 胜出" : "👈 Alpha Wins", color: "var(--color-accent)" },
                                        { label: isZh ? "Beta 胜出 👉" : "Beta Wins 👉", color: "#34D399" },
                                        { label: isZh ? "🤝 平局" : "🤝 Tie", color: "var(--color-text-muted)" },
                                        { label: isZh ? "👎 都不行" : "👎 Both Fail", color: "var(--color-text-muted)" },
                                    ].map(({ label, color }) => (
                                        <div key={label} style={{ fontSize: "11.5px", padding: "7px 10px", borderRadius: "8px", background: "var(--color-surface-3)", color, fontWeight: "500", textAlign: "center" }}>
                                            {label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── POOL ── */}
                    {step === "pool" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {/* Week label */}
                            {weekLabel && (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", borderRadius: "10px", background: "var(--color-surface-2)", border: "1px solid var(--color-border-soft)", alignSelf: "flex-start" }}>
                                    <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>🗓</span>
                                    <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>{weekLabel}</span>
                                    <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "6px", background: "rgba(129,140,248,0.12)", color: "var(--color-accent)", fontWeight: "500", marginLeft: "4px" }}>
                                        {isZh ? "本周模型池" : "ACTIVE POOL"}
                                    </span>
                                </div>
                            )}

                            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                                {t("welcome.pool.body")}
                            </p>

                            {/* Legend */}
                            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                {tierOrder.map((tier) => (
                                    <div key={tier} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: tierStyle[tier].dot, flexShrink: 0 }} />
                                        <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                                            {isZh ? tierStyle[tier].labelZh : tierStyle[tier].label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Model list by tier */}
                            {tierOrder.map((tier) => {
                                const items = byTier[tier];
                                if (!items?.length) return null;
                                const ts = tierStyle[tier];
                                return (
                                    <div key={tier}>
                                        <p style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: ts.dot, fontFamily: "var(--font-mono)", opacity: 0.7, marginBottom: "8px" }}>
                                            {isZh ? `${ts.labelZh}模型` : `${ts.label} Models`}
                                        </p>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "6px" }}>
                                            {items.map((m) => (
                                                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "10px", background: ts.bg, border: `1px solid ${ts.dot}22` }}>
                                                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: ts.dot, flexShrink: 0 }} />
                                                    <div>
                                                        <p style={{ fontSize: "12px", fontWeight: "500", color: "var(--color-text-primary)", lineHeight: 1.2, fontFamily: "var(--font-mono)" }}>
                                                            {m.display_name}
                                                        </p>
                                                        <p style={{ fontSize: "10px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                                                            {m.provider}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            <p style={{ fontSize: "11px", fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--color-text-muted)", lineHeight: 1.6, borderTop: "1px solid var(--color-border-soft)", paddingTop: "12px", marginTop: "4px" }}>
                                {t("welcome.pool.note")}
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div style={{ padding: "20px 32px 28px", borderTop: "1px solid var(--color-border-soft)", display: "flex", alignItems: "center", gap: "10px" }}>
                    {stepIndex > 0 && (
                        <button
                            onClick={back}
                            style={{ padding: "11px 20px", borderRadius: "10px", border: "1px solid var(--color-border)", background: "transparent", color: "var(--color-text-muted)", fontSize: "12px", fontWeight: "500", cursor: "pointer", fontFamily: "var(--font-sans)", transition: "color 180ms ease, border-color 180ms ease" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)"; }}
                        >
                            {isZh ? "← 返回" : "← Back"}
                        </button>
                    )}
                    <button
                        onClick={next}
                        style={{ flex: 1, padding: "13px", borderRadius: "10px", border: "none", background: isLast ? "var(--color-accent)" : "linear-gradient(135deg, var(--color-accent) 0%, #6366f1 100%)", color: "#fff", fontSize: "12px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", transition: "opacity 180ms ease-out, transform 120ms ease", fontFamily: "var(--font-sans)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                    >
                        {isLast ? t("welcome.action.enter") : t("welcome.action.next")}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Exported mini-component for sidebar ──────────────────────────────────────
export function ModelPoolPanel({ models, weekLabel, collapsed, onToggle }: {
    models: ModelPoolItem[];
    weekLabel: string;
    collapsed: boolean;
    onToggle: () => void;
}) {
    const { i18n } = useTranslation();
    const isZh = i18n.language === "zh";

    return (
        <div style={{ borderTop: "1px solid var(--color-border-soft)" }}>
            {/* Toggle header */}
            <button
                onClick={onToggle}
                style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    width: "100%", padding: "12px 24px",
                    background: "transparent", border: "none", cursor: "pointer",
                    color: "var(--color-text-muted)", fontFamily: "var(--font-mono)",
                    fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
                    transition: "color 180ms ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)"; }}
            >
                <span>{isZh ? "本周模型池" : "Model Pool"}</span>
                <span style={{ fontSize: "10px", transform: collapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 200ms ease" }}>
                    ▼
                </span>
            </button>

            {/* Collapsible content */}
            <div style={{
                maxHeight: collapsed ? "0px" : "400px",
                overflow: "hidden",
                transition: "max-height 300ms ease-in-out",
            }}>
                <div style={{ padding: "0 16px 16px" }}>
                    {!models.length ? (
                        <div style={{ fontSize: "10px", padding: "0 8px", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                            {isZh ? "正在加载本周模型..." : "Synchronizing nexus..."}
                        </div>
                    ) : (
                        <>
                            {/* Week badge */}
                            {weekLabel && (
                                <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)", marginBottom: "10px", padding: "0 8px" }}>
                                    🗓 {weekLabel}
                                </div>
                            )}
                            {/* Model chips */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                                {models.map((m) => {
                                    const ts = tierStyle[m.tier] || tierStyle.flagship;
                                    return (
                                        <div
                                            key={m.id}
                                            style={{
                                                display: "flex", alignItems: "center", gap: "8px",
                                                padding: "6px 10px", borderRadius: "8px",
                                                background: ts.bg,
                                            }}
                                        >
                                            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: ts.dot, flexShrink: 0 }} />
                                            <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--color-text-primary)", fontWeight: "500" }}>
                                                {m.display_name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
