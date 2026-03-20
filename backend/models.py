import uuid
from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.sql import func
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class BattleSession(Base):
    __tablename__ = "battle_sessions"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    model_a = Column(String, index=True)
    model_b = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_completed = Column(Boolean, default=False)
    current_state = Column(String, default="AWAITING_CHAT")
    
    history = Column(JSON, default=list)

class EvaluationRecord(Base):
    __tablename__ = "evaluation_records"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("battle_sessions.id"), index=True)
    turn_number = Column(Integer)  
    vote_result = Column(String) 
    prompt = Column(String)
    response_a = Column(String)
    response_b = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

