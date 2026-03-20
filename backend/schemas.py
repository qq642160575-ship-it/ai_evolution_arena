from pydantic import BaseModel
from typing import Optional, Dict

class StartBattleResponse(BaseModel):
    session_id: str
    current_turn: int

class ChatRequest(BaseModel):
    session_id: str
    prompt: str

class VoteRequest(BaseModel):
    session_id: str
    vote_result: str  # "left", "right", "both_good", "both_bad"
    prompt: str
    response_a: str
    response_b: str

class VoteResponse(BaseModel):
    is_completed: bool
    reveal: Optional[Dict[str, str]] = None
    current_turn: Optional[int] = None
