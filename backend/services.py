import asyncio
import json
import random
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from fastapi import HTTPException

import models
import schemas
from llm import astream_model_response, classify_intent
from database import SessionLocal
from model_pool import get_cached_models

logger = logging.getLogger(__name__)

class BattleService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def start_battle(self) -> schemas.StartBattleResponse:
        models_in_pool = get_cached_models()
        if len(models_in_pool) < 2:
            raise HTTPException(status_code=503, detail="Model pool not ready, please try again later")
            
        # Group models by tier to ensure fair fights and similar TTFT speed
        by_tier = {}
        for m in models_in_pool:
            by_tier.setdefault(m["tier"], []).append(m["id"])
            
        # Filter out tiers with less than 2 models available
        valid_tiers = [t for t, ids in by_tier.items() if len(ids) >= 2]
        
        if not valid_tiers:
            # Fallback (rare): if no single tier has at least 2 models, pick any 2
            all_ids = [m["id"] for m in models_in_pool]
            model_a, model_b = random.sample(all_ids, 2)
        else:
            chosen_tier = random.choice(valid_tiers)
            model_a, model_b = random.sample(by_tier[chosen_tier], 2)
        
        left_model, right_model = (model_a, model_b) if random.random() > 0.5 else (model_b, model_a)
        
        session = models.BattleSession(
            model_a=left_model, 
            model_b=right_model,
            current_state="AWAITING_CHAT"
        )
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        
        return schemas.StartBattleResponse(session_id=session.id, current_turn=0)

    async def prepare_chat(self, session_id: str):
        result = await self.db.execute(
            select(models.BattleSession)
            .where(models.BattleSession.id == session_id)
            .with_for_update()
        )
        session = result.scalar_one_or_none()
        
        if not session:
            raise HTTPException(status_code=404, detail="Invalid session")
        if session.is_completed:
            raise HTTPException(status_code=400, detail="Session is already completed")
            
        return session

    async def generate_chat_stream(self, session, prompt: str):
        queue = asyncio.Queue()
        session_history = session.history or {"A": [], "B": []}
        
        is_first_turn = not bool(session_history.get("A", [])) if isinstance(session_history, dict) else True
        if is_first_turn:
            async def run_classifier(sess_id, user_prompt):
                try:
                    category = await classify_intent(user_prompt)
                    async with SessionLocal() as db_session:
                        result = await db_session.execute(
                            select(models.BattleSession).where(models.BattleSession.id == sess_id)
                        )
                        s = result.scalar_one_or_none()
                        if s:
                            s.domain_category = category
                            await db_session.commit()
                except Exception as e:
                    logger.error(f"Intent classifier task error: {e}")
            
            asyncio.create_task(run_classifier(session.id, prompt))
        
        async def run_stream(side, model_name):
            try:
                hist = session_history.get(side, []) if isinstance(session_history, dict) else []
                async for chunk in astream_model_response(model_name, prompt, side, hist):
                    await queue.put(chunk)
            except Exception as e:
                logger.error(f"Generate Error for model {model_name}: {e}")
                await queue.put({"model": side, "chunk": "[目前网络抖动或模型响应异常，请尝试刷新重试。]"})
            finally:
                await queue.put({"model": side, "done": True})

        task_a = asyncio.create_task(run_stream("A", session.model_a))
        task_b = asyncio.create_task(run_stream("B", session.model_b))
        
        try:
            finished_tasks = 0
            while finished_tasks < 2:
                try:
                    data = await asyncio.wait_for(queue.get(), timeout=120)
                except asyncio.TimeoutError:
                    logger.warning(f"Queue get timeout for session {session.id}, forcing close")
                    break
                if isinstance(data, dict) and data.get("done"):
                    finished_tasks += 1
                    # 把 done 信号透传给前端，让前端知道哪个模型已完成
                    yield {"data": json.dumps({"model": data["model"], "done": True}, ensure_ascii=False)}
                else:
                    yield {"data": json.dumps(data, ensure_ascii=False)}
        except asyncio.CancelledError:
            logger.info(f"SSE connection cancelled for session {session.id}")
            task_a.cancel()
            task_b.cancel()
            raise

    async def vote_round(self, request: schemas.VoteRequest) -> schemas.VoteResponse:
        result = await self.db.execute(
            select(models.BattleSession)
            .where(models.BattleSession.id == request.session_id)
            .with_for_update()
        )
        session = result.scalar_one_or_none()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
            
        counts_result = await self.db.execute(
            select(func.count(models.EvaluationRecord.id))
            .where(models.EvaluationRecord.session_id == request.session_id)
        )
        current_turn = counts_result.scalar() or 0
        
        if current_turn >= 3 or session.is_completed:
            return schemas.VoteResponse(is_completed=True, reveal={"A": session.model_a, "B": session.model_b})
            
        eval_record = models.EvaluationRecord(
            session_id=session.id,
            turn_number=current_turn + 1,
            vote_result=request.vote_result,
            prompt=request.prompt,
            response_a=request.response_a,
            response_b=request.response_b
        )
        self.db.add(eval_record)
        
        # update history
        history = session.history or {"A": [], "B": []}
        if isinstance(history, list): 
            history = {"A": [], "B": []}
            
        new_hist = dict(history)
        new_hist.setdefault("A", []).append({"human": request.prompt, "ai": request.response_a})
        new_hist.setdefault("B", []).append({"human": request.prompt, "ai": request.response_b})
        session.history = new_hist
        
        new_turn = current_turn + 1
        
        # 在 commit 之前，先把需要用到的字段存到本地变量
        # commit 后 SQLAlchemy 会把 session 的属性标记为 expired，再访问会触发懒加载报错
        model_a_name = session.model_a
        model_b_name = session.model_b
        
        if new_turn >= 3:
            session.is_completed = True
            await self.db.commit()
            return schemas.VoteResponse(
                is_completed=True, 
                reveal={"A": model_a_name, "B": model_b_name},
                current_turn=new_turn
            )
        else:
            await self.db.commit()
            return schemas.VoteResponse(is_completed=False, current_turn=new_turn)

    async def get_leaderboard(self, category: str = None):
        stmt = (
            select(
                models.BattleSession.model_a,
                models.BattleSession.model_b,
                models.EvaluationRecord.vote_result,
                func.count(models.EvaluationRecord.id).label("count")
            )
            .select_from(models.EvaluationRecord)
            .join(models.BattleSession)
        )
        
        if category:
            stmt = stmt.where(models.BattleSession.domain_category == category)
            
        stmt = stmt.group_by(
            models.BattleSession.model_a,
            models.BattleSession.model_b,
            models.EvaluationRecord.vote_result
        )
        
        result = await self.db.execute(stmt)
        records = result.all()
        
        stats = {}
        for r in records:
            ma, mb, vote, count = r
            if ma not in stats: stats[ma] = {"wins": 0, "losses": 0, "ties": 0}
            if mb not in stats: stats[mb] = {"wins": 0, "losses": 0, "ties": 0}
            
            if vote == "left":
                stats[ma]["wins"] += count
                stats[mb]["losses"] += count
            elif vote == "right":
                stats[mb]["wins"] += count
                stats[ma]["losses"] += count
            elif vote in ["both_good", "both_bad"]:
                stats[ma]["ties"] += count
                stats[mb]["ties"] += count
                
        leaderboard = []
        for model, s in stats.items():
            total = s["wins"] + s["losses"] + s["ties"]
            win_rate = s["wins"] / total if total > 0 else 0
            leaderboard.append({"model": model, "win_rate": win_rate, "total_matches": total, **s})
            
        leaderboard.sort(key=lambda x: x["win_rate"], reverse=True)
        return {"leaderboard": leaderboard}
