"""One-shot Claude Haiku → alpha content pack JSON."""

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any

from anthropic import Anthropic

from validator import validate_pack

PROMPT_PATH = Path(__file__).parent / "prompts" / "alpha_writer.md"


def _load_system_prompt() -> str:
    if PROMPT_PATH.exists():
        return PROMPT_PATH.read_text(encoding="utf-8")
    return (
        "Bạn là Alpha Content Writer. Trả ĐÚNG MỘT JSON object, không markdown. "
        "brand=alpha. Fields: telegram_brief, x_thread (array ≤280), threads_post (≤500), "
        "youtube_pack, compliance, data_status."
    )


def _extract_json(text: str) -> dict[str, Any]:
    fenced = re.search(r"```(?:json)?\s*([\s\S]*?)```", text, re.I)
    candidate = (fenced.group(1) if fenced else text).strip()
    start = candidate.find("{")
    end = candidate.rfind("}")
    if start < 0 or end <= start:
        raise ValueError("No JSON object in model response")
    return json.loads(candidate[start : end + 1])


def generate_pack(topic: str, research: str) -> dict[str, Any]:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY missing in .env")

    model = os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")
    client = Anthropic(api_key=api_key)

    user = f"""Topic: {topic}

Headlines / context:
{research}

Sinh full Alpha content pack JSON theo system prompt. compliance.status phải PASS nếu tuân rules."""

    msg = client.messages.create(
        model=model,
        max_tokens=8192,
        system=_load_system_prompt(),
        messages=[{"role": "user", "content": user}],
    )

    text = ""
    for block in msg.content:
        if hasattr(block, "text"):
            text += block.text

    pack = _extract_json(text)
    pack["brand"] = "alpha"
    pack["topic"] = topic
    if not isinstance(pack.get("x_thread"), list):
        if isinstance(pack.get("x_thread"), str):
            pack["x_thread"] = [t for t in pack["x_thread"].split("\n") if t.strip()]
        else:
            pack["x_thread"] = []

    return validate_pack(pack)
