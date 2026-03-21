import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
  en: {
    translation: {
      "app": {
        "title": "AI ARENA",
        "protocol": "Protocol",
        "arena": "Blind Test Arena",
        "leaderboard": "Global Nexus",
        "slogan": "\"Neutral. Objective. Evolution through blind elimination.\"",
        "arena_m": "Arena",
        "nexus_m": "Nexus"
      },
      "arena": {
        "title": "Evaluate raw intelligence, unbranded.",
        "subtitle": "Two anonymous models. Three cycles. One blind vote. You determine the evolution trajectory.",
        "initiate": "Initiate Protocol",
        "cycle": "Cycle {{turn}} / 3",
        "rule": "\"Disregard format. Value accuracy and logic.\"",
        "entity_a": "Entity Alpha",
        "entity_b": "Entity Beta",
        "unknown": "Unknown",
        "view_rankings": "View Rankings",
        "new_protocol": "Initiate New Protocol",
        "alpha_wins": "👈 Alpha Wins",
        "mutual_tie": "🤝 Mutual Tie",
        "both_fail": "👎 Both Fail",
        "beta_wins": "Beta Wins 👉",
        "placeholder": "Pose your inquiry...",
        "vs": "vs",
        "winner": "🏆 WINNER",
        "eliminated": "❌ ELIMINATED",
        "thanks": "Contribution noted. Nexus synchronized."
      },
      "stats": {
        "title": "Contribution",
        "rounds": "Matches Judged",
        "rank": "Rank",
        "ranks": {
          "novice": "Novice",
          "sentinel": "Sentinel",
          "sage": "Sage"
        }
      },
      "onboarding": {
        "title": "THE MISSION",
        "body": "Your intuition is the filter. By judging these anonymous entities, you are directly pruning the logic branches of the next generation of intelligence. Neutral. Precise. Necessary.",
        "action": "Proceed"
      },
      "leaderboard": {
        "title": "Nexus Rankings",
        "subtitle": "Empirical efficacy based on double-blind human evaluation.",
        "rank": "Rank",
        "identity": "Model Identity",
        "win_rate": "Win Rate",
        "matches": "Matches",
        "wins": "Wins",
        "losses": "Losses",
        "no_data": "No empirical data collected yet.",
        "footer": "Data is organically crowdsourced. Ties are omitted from win rate."
      }
    }
  },
  zh: {
    translation: {
      "app": {
        "title": "AI 进化竞技场",
        "protocol": "评测协议",
        "arena": "盲测竞技场",
        "leaderboard": "全服排行榜",
        "slogan": "“中立。客观。通过盲选进化。”",
        "arena_m": "竞技场",
        "nexus_m": "排行榜"
      },
      "arena": {
        "title": "摒弃外包装，评估绝对智力。",
        "subtitle": "两个匿名模型，三轮对话，一次盲投。由你决定进化的方向。",
        "initiate": "启动协议",
        "cycle": "第 {{turn}} 轮 / 共 3 轮",
        "rule": "“请忽略排版格式，仅评估内容的准确性与逻辑。”",
        "entity_a": "实体 Alpha",
        "entity_b": "实体 Beta",
        "unknown": "未知",
        "view_rankings": "查看排行榜",
        "new_protocol": "启动新一局",
        "alpha_wins": "👈 Alpha 胜出",
        "mutual_tie": "🤝 平局 (都很棒)",
        "both_fail": "👎 都不行",
        "beta_wins": "Beta 胜出 👉",
        "placeholder": "输入你的测试问题...",
        "vs": "对局",
        "winner": "🏆 优胜者",
        "eliminated": "❌ 已被淘汰",
        "thanks": "贡献已记录。全服天梯同步完成。"
      },
      "stats": {
        "title": "贡献统计",
        "rounds": "已评测场次",
        "rank": "当前荣誉",
        "ranks": {
          "novice": "初级观察员",
          "sentinel": "真理哨兵",
          "sage": "进化贤者"
        }
      },
      "onboarding": {
        "title": "核心使命",
        "body": "你的直觉是唯一的过滤器。通过剥离这些匿名实体的外壳，你正在直接修正下一代人工智能的逻辑分支。中立、精准、至关重要。",
        "action": "进入竞技场"
      },
      "leaderboard": {
        "title": "全服天梯榜",
        "subtitle": "基于人类双盲测试得出的真实效能数据。",
        "rank": "排名",
        "identity": "模型身份",
        "win_rate": "胜率",
        "matches": "总场次",
        "wins": "胜场",
        "losses": "败场",
        "no_data": "暂无有效的评测数据。",
        "footer": "数据来源于社区众包。平局不计入胜率计算。"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
