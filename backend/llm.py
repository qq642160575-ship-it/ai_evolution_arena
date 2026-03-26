import asyncio
from langchain_openai import ChatOpenAI
from langchain_community.chat_models import ChatTongyi
from langchain_core.messages import HumanMessage, AIMessage
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

# 使用 trust_env=False 的 AsyncClient，避免读取系统 socks 代理导致初始化失败
_async_client = httpx.AsyncClient(trust_env=False)

# Ensure you have OPENAI_API_KEY or DASHSCOPE_API_KEY in your .env or environment
# For this MVP, we define the pool of models available
AVAILABLE_MODELS = {
    "deepseek-v3": lambda: ChatOpenAI(
        model="deepseek-ai/DeepSeek-V3", 
        temperature=0.1, 
        max_tokens=4096,
        frequency_penalty=1.1,
        presence_penalty=1.1,
        base_url=os.getenv("SILICONFLOW_BASE_URL", "https://api.siliconflow.cn/v1"), 
        api_key=os.getenv("SILICONFLOW_API_KEY"),
        http_async_client=_async_client,
    ),
    "qwen2.5-72b": lambda: ChatOpenAI(
        model="Qwen/Qwen2.5-72B-Instruct", 
        temperature=0.1, 
        max_tokens=4096,
        frequency_penalty=1.1,
        presence_penalty=1.1,
        base_url=os.getenv("SILICONFLOW_BASE_URL", "https://api.siliconflow.cn/v1"), 
        api_key=os.getenv("SILICONFLOW_API_KEY"),
        http_async_client=_async_client,
    ),
}

_PROXY_KEYS = ["HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY",
               "http_proxy", "https_proxy", "all_proxy"]

def get_model(model_name: str):
    # 临时清除代理 env var，避免 openai SDK 在 Pydantic 校验时因 socks:// 报错
    saved = {k: os.environ.pop(k) for k in _PROXY_KEYS if k in os.environ}
    try:
        factory = AVAILABLE_MODELS.get(model_name) or next(iter(AVAILABLE_MODELS.values()))
        return factory()
    finally:
        os.environ.update(saved)  # 还原，不影响其他系统行为

async def astream_model_response(model_name: str, prompt: str, side: str, history: list = None):
    """
    Generator that yields tokens from the model.
    The side parameter is used to tag the output (e.g., 'A' or 'B').
    """
    model = get_model(model_name)
    from langchain_core.messages import SystemMessage
    
    # 强制系统提示词，确立人设
    system_reminder = "You are a helpful assistant. Remember to keep your identity strictly anonymous and output directly in Markdown. Never mention your model name or the company that developed you."
    messages = [SystemMessage(content=system_reminder)]
    
    # Reconstruct multi-turn memory
    if history:
        for turn in history:
            messages.append(HumanMessage(content=turn["human"]))
            messages.append(AIMessage(content=turn["ai"]))
            
    messages.append(HumanMessage(content=prompt))
    
    # 显式声明停用词，强制在此遇到这几个符号时切断输出（解决硅基流动模型未正确识别结束符的 bug）
    stop_sequences = ["<|im_end|>", "<|endoftext|>", "<|eot_id|>"]
    
    async for chunk in model.astream(messages, stop=stop_sequences):
        if chunk.content:
            yield {"model": side, "chunk": chunk.content}
