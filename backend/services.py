import asyncio
import random
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from fastapi import HTTPException

import models
import schemas
from llm import astream_model_response, AVAILABLE_MODELS

logger = logging.getLogger(__name__)

class BattleService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def start_battle(self) -> schemas.StartBattleResponse:
        model_keys = list(AVAILABLE_MODELS.keys())
        if len(model_keys) < 2:
            model_a = model_b = "gpt-3.5-turbo"
        else:
            model_a, model_b = random.sample(model_keys, 2)
        
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
                data = await queue.get()
                if isinstance(data, dict) and data.get("done"):
                    finished_tasks += 1
                else:
                    yield {"data": data}
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
        
        if new_turn >= 3:
            session.is_completed = True
            await self.db.commit()
            return schemas.VoteResponse(
                is_completed=True, 
                reveal={"A": session.model_a, "B": session.model_b},
                current_turn=new_turn
            )
        else:
            await self.db.commit()
            return schemas.VoteResponse(is_completed=False, current_turn=new_turn)

    async def get_leaderboard(self):
        stmt = (
            select(
                models.BattleSession.model_a,
                models.BattleSession.model_b,
                models.EvaluationRecord.vote_result,
                func.count(models.EvaluationRecord.id).label("count")
            )
            .select_from(models.EvaluationRecord)
            .join(models.BattleSession)
            .group_by(
                models.BattleSession.model_a,
                models.BattleSession.model_b,
                models.EvaluationRecord.vote_result
            )
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
