from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from sse_starlette.sse import EventSourceResponse
import time

import models
import schemas
from database import get_db, engine
from services import BattleService
from model_pool import get_weekly_pool

# Disable proxy settings globally to prevent connection blocking
import os
for k in ["HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "all_proxy"]:
    os.environ.pop(k, None)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)
    # Preheat model pool cache on startup
    try:
        pool = await get_weekly_pool()
        logger.info(f"Model pool preheated: {len(pool.get('models', []))} models for {pool.get('week_key')}")
    except Exception as e:
        logger.error(f"Failed to preheat model pool: {e}")
    yield

app = FastAPI(title="AI Evolution Arena API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

active_clients = {}

@app.middleware("http")
async def track_active_users(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    active_clients[client_ip] = time.time()
    response = await call_next(request)
    return response

@app.get("/")
async def root():
    return {"message": "Welcome to AI Evolution Arena API"}

@app.post("/api/battle/start/", response_model=schemas.StartBattleResponse)
async def start_battle(db: AsyncSession = Depends(get_db)):
    service = BattleService(db)
    return await service.start_battle()

@app.post("/api/battle/chat/")
async def chat_stream(request: schemas.ChatRequest, req: Request, db: AsyncSession = Depends(get_db)):
    service = BattleService(db)
    session = await service.prepare_chat(request.session_id)
    return EventSourceResponse(service.generate_chat_stream(session, request.prompt))

@app.post("/api/battle/vote/", response_model=schemas.VoteResponse)
async def vote_round(request: schemas.VoteRequest, db: AsyncSession = Depends(get_db)):
    service = BattleService(db)
    return await service.vote_round(request)

@app.get("/api/report/leaderboard/")
async def get_leaderboard(category: str = None, db: AsyncSession = Depends(get_db)):
    service = BattleService(db)
    return await service.get_leaderboard(category)

@app.get("/api/stats/")
async def get_stats(db: AsyncSession = Depends(get_db)):
    # 5 minutes cutoff
    cutoff = time.time() - 300
    online = len([v for v in active_clients.values() if v > cutoff])
    
    result = await db.execute(select(func.count(models.BattleSession.id)))
    total_battles = result.scalar() or 0
    
    import random
    # Mock at least 2-5 online users to make it look alive for MVP
    online_display = max(online, random.randint(2, 5))
    
    return {"online_users": online_display, "total_battles": total_battles}

@app.get("/api/model-pool/")
async def get_model_pool():
    """Return the current week's model pool."""
    return await get_weekly_pool()

