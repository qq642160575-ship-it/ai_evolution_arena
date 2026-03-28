"""
Weekly Model Pool — fetches available models from SiliconFlow,
filters to chat-capable models, and produces a deterministic weekly pool.
"""
import os
import random
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# ── Configuration ─────────────────────────────────────────────────────────────
SILICONFLOW_API_KEY = os.getenv("SILICONFLOW_API_KEY", "")
SILICONFLOW_MODELS_URL = "https://api.siliconflow.cn/v1/models"
POOL_SIZE = 12  # number of models in weekly pool

# Keywords that indicate a model is NOT a text-chat model
_EXCLUDE_KEYWORDS = {
    "embedding", "reranker", "rerank", "ocr", "tts", "asr",
    "captioner", "image", "kolors", "wan2", "cosyvoice",
    "sensevoice", "indextts", "telespeech", "bge-", "bce-",
    "omni",  # multimodal / audio combo
}

# Prefixes to strip before display
_STRIP_PREFIXES = ("Pro/", "LoRA/")

# ── Tier classification ───────────────────────────────────────────────────────
_REASONING_KEYWORDS = {"r1", "thinking", "qwq", "z1"}

# Models with these size hints are considered "fast" tier
_FAST_PATTERNS = {"7b", "8b", "9b", "4b", "3b", "13b", "14b", "flash", "mini", "air"}


def _classify_tier(model_id: str) -> str:
    """Classify a model into flagship / reasoning / fast."""
    lower = model_id.lower()
    # Reasoning models
    for kw in _REASONING_KEYWORDS:
        if kw in lower:
            return "reasoning"
    # Fast / small models
    for pat in _FAST_PATTERNS:
        if pat in lower:
            return "fast"
    return "flagship"


def _extract_provider(model_id: str) -> str:
    """Extract provider name from model id like 'Qwen/Qwen3-32B'."""
    # Strip Pro/ LoRA/ prefix first
    clean = model_id
    for prefix in _STRIP_PREFIXES:
        if clean.startswith(prefix):
            clean = clean[len(prefix):]
    parts = clean.split("/")
    if len(parts) >= 2:
        return parts[0]
    return "Unknown"


def _extract_display_name(model_id: str) -> str:
    """Extract short display name from model id."""
    clean = model_id
    for prefix in _STRIP_PREFIXES:
        if clean.startswith(prefix):
            clean = clean[len(prefix):]
    parts = clean.split("/")
    return parts[-1] if parts else clean


def _is_chat_model(model_id: str) -> bool:
    """Return True if the model is suitable for text chat battles."""
    lower = model_id.lower()
    # Exclude non-chat models
    for kw in _EXCLUDE_KEYWORDS:
        if kw in lower:
            return False
    # Exclude VL (vision-language) and Coder models to keep it fair text-only
    if "-vl-" in lower or "-vl " in lower or lower.endswith("-vl"):
        return False
    # Exclude LoRA fine-tunes
    if lower.startswith("lora/"):
        return False
    return True


# ── Cache ─────────────────────────────────────────────────────────────────────
_cache: dict = {
    "week_key": None,
    "all_chat_models": [],
    "pool": [],
    "fetched_at": None,
    "expires_at": None,
}


def _get_week_key() -> str:
    """Return a unique key for the current ISO week, e.g. '2026-W13'."""
    now = datetime.now(timezone(timedelta(hours=8)))  # CST
    iso = now.isocalendar()
    return f"{iso[0]}-W{iso[1]:02d}"


def _get_week_bounds() -> tuple[str, str, str]:
    """Return (week_label, start_date, end_date) for current week."""
    now = datetime.now(timezone(timedelta(hours=8)))
    # Monday of this week
    monday = now - timedelta(days=now.weekday())
    sunday = monday + timedelta(days=6)
    week_num = now.isocalendar()[1]
    week_label = f"{now.year} W{week_num} · {monday.month}/{monday.day}–{sunday.month}/{sunday.day}"
    expires = (sunday + timedelta(days=1)).strftime("%Y-%m-%dT00:00:00+08:00")
    return week_label, monday.strftime("%Y-%m-%d"), expires


async def fetch_siliconflow_models() -> list[dict]:
    """Fetch all models from SiliconFlow API."""
    try:
        async with httpx.AsyncClient(trust_env=False, timeout=15) as client:
            resp = await client.get(
                SILICONFLOW_MODELS_URL,
                headers={"Authorization": f"Bearer {SILICONFLOW_API_KEY}"},
            )
            resp.raise_for_status()
            data = resp.json()
            return data.get("data", [])
    except Exception as e:
        logger.error(f"Failed to fetch SiliconFlow models: {e}")
        return []


def _deduplicate_models(models: list[dict]) -> list[dict]:
    """
    Deduplicate models: if both 'Pro/X' and 'X' exist, keep Pro/X only
    (Pro versions are generally faster / higher quota).
    Also collapse identical display names.
    """
    seen_display: dict[str, dict] = {}
    for m in models:
        display = _extract_display_name(m["id"])
        existing = seen_display.get(display)
        if existing is None:
            seen_display[display] = m
        else:
            # Prefer Pro/ version
            if m["id"].startswith("Pro/") and not existing["id"].startswith("Pro/"):
                seen_display[display] = m
    return list(seen_display.values())


async def get_weekly_pool(force_refresh: bool = False) -> dict:
    """
    Return this week's model pool. Uses in-memory cache with weekly expiry.
    Returns: {
        week_label: str,
        models: [{id, display_name, provider, tier}],
        all_count: int,
        expires_at: str,
    }
    """
    global _cache
    week_key = _get_week_key()

    if not force_refresh and _cache["week_key"] == week_key and _cache["pool"]:
        week_label, _, expires = _get_week_bounds()
        return {
            "week_key": week_key,
            "week_label": week_label,
            "models": _cache["pool"],
            "all_count": len(_cache["all_chat_models"]),
            "expires_at": expires,
        }

    # Fetch fresh model list
    raw_models = await fetch_siliconflow_models()
    if not raw_models:
        # If fetch fails and we have old cache, return that
        if _cache["pool"]:
            logger.warning("Using stale model pool cache due to fetch failure")
            week_label, _, expires = _get_week_bounds()
            return {
                "week_key": _cache["week_key"],
                "week_label": week_label,
                "models": _cache["pool"],
                "all_count": len(_cache["all_chat_models"]),
                "expires_at": expires,
            }
        return {"week_key": week_key, "week_label": "", "models": [], "all_count": 0, "expires_at": ""}

    # Filter to chat models only
    chat_models = [m for m in raw_models if _is_chat_model(m["id"])]
    chat_models = _deduplicate_models(chat_models)

    # Sort for deterministic ordering before sampling
    chat_models.sort(key=lambda m: m["id"])

    # Build rich model info
    all_models = []
    for m in chat_models:
        model_id = m["id"]
        all_models.append({
            "id": model_id,
            "display_name": _extract_display_name(model_id),
            "provider": _extract_provider(model_id),
            "tier": _classify_tier(model_id),
        })

    # Deterministic weekly selection using week number as seed
    rng = random.Random(week_key)
    pool_size = min(POOL_SIZE, len(all_models))

    # Stratified sampling: ensure at least some from each tier if available
    by_tier: dict[str, list] = {"flagship": [], "reasoning": [], "fast": []}
    for m in all_models:
        by_tier.setdefault(m["tier"], []).append(m)

    selected: list[dict] = []
    # Allocate: ~50% flagship, ~25% reasoning, ~25% fast
    quotas = {"flagship": max(1, pool_size // 2), "reasoning": max(1, pool_size // 4), "fast": max(1, pool_size // 4)}

    for tier, quota in quotas.items():
        available = by_tier.get(tier, [])
        pick = min(quota, len(available))
        selected.extend(rng.sample(available, pick))

    # Fill remaining from all models not yet selected
    selected_ids = {m["id"] for m in selected}
    remaining = [m for m in all_models if m["id"] not in selected_ids]
    fill = pool_size - len(selected)
    if fill > 0 and remaining:
        selected.extend(rng.sample(remaining, min(fill, len(remaining))))

    # Sort final pool: flagship first, then reasoning, then fast
    tier_order = {"flagship": 0, "reasoning": 1, "fast": 2}
    selected.sort(key=lambda m: (tier_order.get(m["tier"], 9), m["display_name"]))

    # Update cache
    week_label, _, expires = _get_week_bounds()
    _cache = {
        "week_key": week_key,
        "all_chat_models": all_models,
        "pool": selected,
        "fetched_at": datetime.now(timezone(timedelta(hours=8))).isoformat(),
        "expires_at": expires,
    }

    logger.info(f"Model pool refreshed for {week_key}: {len(selected)} models from {len(all_models)} chat models")

    return {
        "week_key": week_key,
        "week_label": week_label,
        "models": selected,
        "all_count": len(all_models),
        "expires_at": expires,
    }


def get_cached_model_ids() -> list[str]:
    """Return model IDs from the cached weekly pool (for battle matchmaking)."""
    if _cache["pool"]:
        return [m["id"] for m in _cache["pool"]]
    return []

def get_cached_models() -> list[dict]:
    """Return full model dictionaries from the cached weekly pool (for tier-based matchmaking)."""
    if _cache["pool"]:
        return _cache["pool"]
    return []

