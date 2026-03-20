import asyncio
from langchain_openai import ChatOpenAI
from langchain_community.chat_models import ChatTongyi
from langchain_core.messages import HumanMessage, AIMessage
import os

# Ensure you have OPENAI_API_KEY or DASHSCOPE_API_KEY in your .env or environment
# For this MVP, we define the pool of models available
AVAILABLE_MODELS = {
    "gpt-4o": lambda: ChatOpenAI(model="gpt-4o", temperature=0.7),
    "gpt-3.5-turbo": lambda: ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7),
    # Add your specific models here, example for Tongyi:
    # "qwen-max": lambda: ChatTongyi(model="qwen-max", temperature=0.7)
}

def get_model(model_name: str):
    if model_name in AVAILABLE_MODELS:
        return AVAILABLE_MODELS[model_name]()
    return ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7) # fallback

async def astream_model_response(model_name: str, prompt: str, side: str, history: list = None):
    """
    Generator that yields tokens from the model.
    The side parameter is used to tag the output (e.g., 'A' or 'B').
    """
    model = get_model(model_name)
    messages = []
    
    # Reconstruct multi-turn memory
    if history:
        for turn in history:
            messages.append(HumanMessage(content=turn["human"]))
            messages.append(AIMessage(content=turn["ai"]))
            
    messages.append(HumanMessage(content=prompt))
    
    async for chunk in model.astream(messages):
        if chunk.content:
            yield {"model": side, "chunk": chunk.content}
