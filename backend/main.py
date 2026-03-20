from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

import models
import schemas
from database import get_db, engine
from services import BattleService

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)
    yield

app = FastAPI(title="AI Evolution Arena API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    service = BattleService(db)
    return await service.get_leaderboard()
