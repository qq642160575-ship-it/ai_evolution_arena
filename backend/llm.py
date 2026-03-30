import asyncio
from langchain_openai import ChatOpenAI
from langchain_community.chat_models import ChatTongyi
from langchain_core.messages import HumanMessage, AIMessage
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

# Dynamic model builder — works with any SiliconFlow model ID
_PROXY_KEYS = ["HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY",
               "http_proxy", "https_proxy", "all_proxy"]


def build_model(model_id: str, **kwargs) -> ChatOpenAI:
    """Create a ChatOpenAI instance for any SiliconFlow model ID."""
    params = dict(
        model=model_id,
        temperature=0.1,
        max_tokens=4096,
        frequency_penalty=1.1,
        presence_penalty=1.1,
        base_url=os.getenv("SILICONFLOW_BASE_URL", "https://api.siliconflow.cn/v1"),
        api_key=os.getenv("SILICONFLOW_API_KEY"),
    )
    params.update(kwargs)
    return ChatOpenAI(**params)


def get_model(model_name: str, **kwargs):
    """Get a ChatOpenAI instance, temporarily clearing proxy env vars."""
    saved = {k: os.environ.pop(k) for k in _PROXY_KEYS if k in os.environ}
    try:
        return build_model(model_name, **kwargs)
    finally:
        os.environ.update(saved)

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

async def classify_intent(prompt: str) -> str:
    """Classify the user prompt into one of 5 domain categories."""
    model = get_model("Qwen/Qwen2.5-7B-Instruct", temperature=0.0, max_tokens=5, frequency_penalty=0.0, presence_penalty=0.0)
    from langchain_core.messages import SystemMessage, HumanMessage
    
    system_prompt = """你是一个极其高效的意图分类路由。请将用户的输入严格分类到以下 5 个枚举值之一：coding, logic, creative, instruction, general。

规则：
1. 只允许输出这 5 个英文单词中的一个。
2. 绝对不能输出任何解释、标点符号、换行符或多余字符。
3. 如果无法判断，默认输出 general。"""
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=prompt)
    ]
    
    try:
        # Use asyncio.wait_for to enforce a 10-second timeout
        response = await asyncio.wait_for(model.ainvoke(messages), timeout=10.0)
        content = response.content.strip().lower()
        print(f"Intent classification result: {content}")
        
        valid_categories = {"coding", "logic", "creative", "instruction", "general"}
        if content in valid_categories:
            return content
        else:
            return "general"
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Intent classification failed: {e}")
        return "general"
