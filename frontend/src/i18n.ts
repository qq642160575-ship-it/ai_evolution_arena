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
        "title": "The Nexus Arena",
        "subtitle": "Two elite models. One secret protocol. Your judgment decides the evolution.",
        "initiate": "Initiate Combat",
        "placeholder": "Send a prompt to both entities...",
        "cycle": "Cycle {{turn}}",
        "rule": "3 rounds of dialogue before reveal",
        "alpha_wins": "👈 Alpha Wins",
        "beta_wins": "Beta Wins 👉",
        "mutual_tie": "🤝 Mutual Tie",
        "both_fail": "👎 Both Fail",
        "thanks": "Judgment Recorded",
        "winner": "System Dominant",
        "eliminated": "Protocol Terminated",
        "unknown": "Classified",
        "entity_a": "Entity Alpha",
        "entity_b": "Entity Beta",
        "new_protocol": "New Protocol",
        "view_rankings": "Nexus Rankings",
        "reminder": "Note: Focus on content quality. Ignore differences in formatting or length."
      },
      "stats": {
        "title": "Protocol Stats",
        "rounds": "Rounds Judged",
        "rank": "Sage Level",
        "ranks": {
          "novice": "Novice",
          "sentinel": "Sentinel",
          "sage": "Sage"
        }
      },
      "theme": {
        "light": "Light Mode",
        "dark": "Dark Mode"
      },
      "onboarding": {
        "title": "THE MISSION",
        "body": "Your intuition is the filter. By judging these anonymous entities, you are directly pruning the logic branches of the next generation of intelligence. Neutral. Precise. Necessary.",
        "action": "Proceed"
      },
      "welcome": {
        "step_label": {
          "intro": "About",
          "rules": "Gameplay",
          "pool": "Model Pool"
        },
        "intro": {
          "title": "Welcome to AI Arena",
          "body": "AI Arena is a blind evaluation platform where you judge AI models without knowing their identity. Your votes shape the weekly leaderboard and reveal which models truly excel.",
          "feat_blind_title": "100% Blind Testing",
          "feat_blind_desc": "All models are anonymised. Judge only by the quality of responses — no brand bias.",
          "feat_rank_title": "Community Leaderboard",
          "feat_rank_desc": "Your votes are aggregated in real-time into a global win-rate ranking.",
          "feat_pool_title": "Weekly Rotating Pool",
          "feat_pool_desc": "A curated selection of the best available models updates every Monday."
        },
        "rules": {
          "title": "How to Play",
          "body": "Each match pitches two anonymous models against each other across 3 dialogue rounds. Here is what you need to know:",
          "r1_title": "Ask anything",
          "r1_desc": "Enter a question or prompt. Both models will respond simultaneously and independently.",
          "r2_title": "Three rounds, one session",
          "r2_desc": "You can send up to 3 turns of dialogue in a session to probe the models more deeply.",
          "r3_title": "Vote on substance, not style",
          "r3_desc": "Ignore markdown formatting. Judge accuracy, reasoning, and helpfulness.",
          "r4_title": "Your vote shapes evolution",
          "r4_desc": "After all rounds, cast your verdict. Results feed directly into the global leaderboard."
        },
        "pool": {
          "title": "This Week's Model Pool",
          "body": "Each week a curated set of models enters the arena. Any two of these may be matched together — you will never know which until after you vote.",
          "note": "The pool refreshes every Monday. Models are selected based on recency, diversity, and community interest."
        },
        "action": {
          "next": "Next →",
          "enter": "Enter the Arena"
        }
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
        "title": "枢纽竞技场",
        "subtitle": "两个顶尖模型，一个加密协议。你的判断决定 AI 的进化。",
        "initiate": "启动对战协议",
        "placeholder": "向两个实体发送指令...",
        "cycle": "第 {{turn}} 周期",
        "rule": "三回合对话后揭晓身份",
        "alpha_wins": "👈 Alpha 胜出",
        "beta_wins": "Beta 胜出 👉",
        "mutual_tie": "🤝 平局",
        "both_fail": "👎 都不行",
        "thanks": "判断已记录",
        "winner": "系统占优",
        "eliminated": "协议中止",
        "unknown": "绝密",
        "entity_a": "实体 Alpha",
        "entity_b": "实体 Beta",
        "new_protocol": "开启新协议",
        "view_rankings": "查看枢纽排名",
        "reminder": "提醒：请忽略格式、排版、长短差异，专注于回答的内容质量。"
      },
      "stats": {
        "title": "协议统计",
        "rounds": "已审阅回合",
        "rank": "先知等级",
        "ranks": {
          "novice": "初学者",
          "sentinel": "守护者",
          "sage": "智者"
        }
      },
      "theme": {
        "light": "浅色模式",
        "dark": "深色模式"
      },
      "onboarding": {
        "title": "核心使命",
        "body": "你的直觉是唯一的过滤器。通过剥离这些匿名实体的外壳，你正在直接修正下一代人工智能的逻辑分支。中立、精准、至关重要。",
        "action": "进入竞技场"
      },
      "welcome": {
        "step_label": {
          "intro": "网站简介",
          "rules": "玩法规则",
          "pool": "本周模型池"
        },
        "intro": {
          "title": "欢迎来到 AI 进化竞技场",
          "body": "AI Arena 是一个盲测评估平台，你将在不知道模型身份的情况下对 AI 进行打分。你的投票将实时汇入全服天梯榜，揭示哪些模型真正出类拔萃。",
          "feat_blind_title": "100% 盲测机制",
          "feat_blind_desc": "所有模型均匿名出战，只凭答案质量判断，杜绝品牌偏见。",
          "feat_rank_title": "社区实时排行榜",
          "feat_rank_desc": "你的投票实时汇总成全球胜率排名，反映真实的模型能力。",
          "feat_pool_title": "每周轮换模型池",
          "feat_pool_desc": "精选当前最强模型，每周一更新，保持竞技场的新鲜感。"
        },
        "rules": {
          "title": "如何参与",
          "body": "每局对战由两个匿名模型展开，共进行 3 轮对话。以下是你需要了解的内容：",
          "r1_title": "随意提问",
          "r1_desc": "输入任何问题或提示词，两个模型将同步、独立地作出回应。",
          "r2_title": "三轮对话，一次会话",
          "r2_desc": "每局最多可进行 3 轮对话，帮助你更深入地考察两个模型。",
          "r3_title": "评价内容，忽略排版",
          "r3_desc": "请忽略 Markdown 格式，专注于回答的准确性、逻辑性与实用性。",
          "r4_title": "你的投票推动进化",
          "r4_desc": "所有轮次结束后，投出你的决定性一票，结果直接计入全服天梯榜。"
        },
        "pool": {
          "title": "本周模型池",
          "body": "每周精选一批模型进入竞技场。任意两个模型都可能被匹配对决——直到你投票结束后才会揭晓身份。",
          "note": "模型池每周一刷新，根据模型的新鲜度、多样性与社区关注度综合筛选。"
        },
        "action": {
          "next": "下一步 →",
          "enter": "进入竞技场"
        }
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
