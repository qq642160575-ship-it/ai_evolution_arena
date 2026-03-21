import asyncio
from langchain_openai import ChatOpenAI
from langchain_community.chat_models import ChatTongyi
from langchain_core.messages import HumanMessage, AIMessage
import os
from dotenv import load_dotenv

load_dotenv()

# Ensure you have OPENAI_API_KEY or DASHSCOPE_API_KEY in your .env or environment
# For this MVP, we define the pool of models available
AVAILABLE_MODELS = {
    "siliconflow-deepseek-v3": lambda: ChatOpenAI(
        model="deepseek-ai/DeepSeek-V3", 
        temperature=0.1, 
        max_tokens=4096,
        frequency_penalty=1.1,
        presence_penalty=1.1,
        base_url=os.getenv("SILICONFLOW_BASE_URL", "https://api.siliconflow.cn/v1"), 
        api_key=os.getenv("SILICONFLOW_API_KEY")
    ),
    "siliconflow-qwen2.5-72b": lambda: ChatOpenAI(
        model="Qwen/Qwen2.5-72B-Instruct", 
        temperature=0.1, 
        max_tokens=4096,
        frequency_penalty=1.1,
        presence_penalty=1.1,
        base_url=os.getenv("SILICONFLOW_BASE_URL", "https://api.siliconflow.cn/v1"), 
        api_key=os.getenv("SILICONFLOW_API_KEY")
    ),
    # "gpt-4o": lambda: ChatOpenAI(model="gpt-4o", temperature=0.7),
    # "gpt-3.5-turbo": lambda: ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7),
    # Add your specific models here, example for Tongyi:
    # "qwen-max": lambda: ChatTongyi(model="qwen-max", temperature=0.7)
}

def get_model(model_name: str):
    if model_name in AVAILABLE_MODELS:
        return AVAILABLE_MODELS[model_name]()
    return AVAILABLE_MODELS["siliconflow-deepseek-v3"]() # fallback

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
    
    # 彻底解决“复读机”问题的硬核逻辑：连续重复检测
    consecutive_repeat_count = 0
    last_char = None
    MAX_CONSECUTIVE_REPEAT = 10  # 允许连续重复的最大次数（如 10 个感叹号）
    
    async for chunk in model.astream(messages, stop=stop_sequences):
        if chunk.content:
            text = chunk.content
            
            # 更严密的逐字符检测逻辑
            for char in text:
                if char == last_char and char in ["!", "！", "?", "？", ".", "。", " ", "\n"]:
                    consecutive_repeat_count += 1
                else:
                    consecutive_repeat_count = 0
                    last_char = char
                
                # 达到阈值，强制截断并跳出
                if consecutive_repeat_count >= MAX_CONSECUTIVE_REPEAT:
                    print(f"检测到模型 {model_name} ({side}) 进入复读模式，后端执行硬性截断。")
                    break
            
            if consecutive_repeat_count >= MAX_CONSECUTIVE_REPEAT:
                break
                
            yield {"model": side, "chunk": text}
