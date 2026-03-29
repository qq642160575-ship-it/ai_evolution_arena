# AI Evolution Arena (AI 进化竞技场)

## 项目背景 (Background)

在深入学习 AI Agent（智能体）评估的过程中，作者研究了市面上大量的 AI 辅助评估（LLM-as-a-Judge）方案和各种复杂的评估指标（如 RAGAS、TruLens 等）。在这个过程中，作者深刻体会到当前大模型评估的几个痛点：

1. **指标抽象，难以直观感受**：很多学术化、工程化的指标在面对真实的用户体验时往往显得干瘪，无法反映模型在真实对话中的“灵性”和“人情味”。
2. **评测成本高昂且受黑盒限制**：使用 GPT-4 等强模型作为裁判时，不仅成本高，且容易产生自我偏好（Self-Enhancement Bias）或位置偏见（Position Bias）。
3. **人类偏好数据（RLHF）获取困难**：最真实、最有效的评测依然来自真实用户的“用脚投票”，但市面上缺乏一个轻量、有趣且能让普通用户低门槛参与进来的开源盲测项目。

基于以上痛点，作者决定开发 **AI Evolution Arena**。这是一个以用户直觉和真实体验为核心的大模型盲测对决平台。通过类似 Chatbot Arena 的盲测机制，我们不仅能真正验证模型在各类实战对话场景下的表现，还能通过众包机制收集最宝贵的高质量人类反馈数据集。

## 项目简介

一个轻量、现代化、趣味性强的 AI 大模型盲测与评测平台。用户通过与两个匿名 AI 模型进行多轮对话，在未知的状态下对比回答质量，投票评选，最后揭晓参与答题的模型真实身份（开盲盒）。

## 核心功能

- **盲测对战 (Blind Test)**: 随机抽取两款匿名 AI 模型，进行 3 轮匿名对话评测。
- **强制评价与真实偏好**: 每轮对话后必须选择更优的回答（左侧更好 / 两者双优 / 两者双差 / 右侧更好），沉淀真实人类偏好。
- **揭晓盲盒 (Reveal)**: 在第 3 轮完成评价后，揭开两款模型的真实身份，带来拆盲盒的惊喜感。
- **排行榜 (Leaderboard)**: 聚合用户的投票结果，查看各模型的真实胜率和综合排名。
- **流畅的交互体验**: 两个模型同时进行 SSE 流式输出，支持 Markdown 实时渲染和打字机效果。

## 技术栈

### 前端 (Frontend)
- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS v4
- **核心组件**: i18next（国际化预留）、react-markdown（Markdown 渲染）

### 后端 (Backend)
- **框架**: FastAPI
- **数据库**: SQLite（生产环境可无缝扩展至 PostgreSQL） + 异步 SQLAlchemy ORM
- **大模型编排**: LangChain
- **流式传输**: SSE-Starlette (Server-Sent Events)

## 模块结构

```text
ai_evolution_arena/
├── backend/          # Python 后端项目
│   ├── main.py       # FastAPI 应用主入口
│   ├── models.py     # 数据库表结构
│   ├── schemas.py    # Pydantic 数据模式
│   ├── services.py   # 核心业务逻辑
│   ├── llm.py        # LangChain LLM 接入实现
│   └── database.py   # 数据库配置管理
├── frontend/         # React 前端项目
│   ├── src/
│   │   ├── components/  # React UI 组件
│   │   ├── App.tsx      # 主应用入口
│   │   └── config.ts    # 配置文件
│   └── package.json
└── doc/              # 项目相关文档
```

## API 核心接口参考

| HTTP 方法 | 路径路径 | 业务说明 |
|------|------|------|
| POST | `/api/battle/start/` | 随机匹配模型，开始新一轮对战会话 |
| POST | `/api/battle/chat/` | 发送对话 Prompt（返回 SSE 流式响应） |
| POST | `/api/battle/vote/` | 提交回合投票偏好评价 |
| GET | `/api/report/leaderboard/` | 获取大模型胜率与排位数据 |

## 快速开始

### 1. 后端服务启动

```bash
cd backend
pip install -r requirements.txt
```

在 `backend` 目录下创建 `.env` 文件并配置大模型密钥：
```ini
OPENAI_API_KEY=your_openai_key
TONGYI_API_KEY=your_tongyi_key
# 按需配置其他你接入的 LLM API Key
```

启动后端服务：
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*(FastAPI 自动生成的接口文档地址: `http://localhost:8000/docs`)*

### 2. 前端服务启动

```bash
cd frontend
npm install
npm run dev
```

前端默认运行在 `http://localhost:5173`。浏览器访问即可开始体验。

## 设计理念

1. **盲测优先**: 排除先入为主的“品牌光环”和排版格式干扰，让测试者真正专注于“回答质量”本身。
2. **免登录即用**: 消除使用门槛，提升用户参与意愿。
3. **数据驱动闭环**: 旨在收集高价值的、开源的、具备真实业务场景参考价值的偏好数据。

## 未来扩展方向

- 🤖 **自动评估引入**: 结合 LLM-as-a-Judge，添加 AI 裁判视角打分，对比「人类偏好」与「AI 偏好」。
- 🌐 **更多模型支持**: 持续扩展国内外更多优秀的闭源及开源模型 API。
- 🔄 **工作流集成**: 接入 LangGraph，探索和评测更复杂的多 Agent 协作工作流。
- 🛡️ **健全的数据机制**: 增加防作弊机制、用户信誉度评估以及脏数据清洗能力。
- 🌍 **多语言化**: 适配更多母语用户（前端已预留 i18n 配置）。

## 许可证

待定
