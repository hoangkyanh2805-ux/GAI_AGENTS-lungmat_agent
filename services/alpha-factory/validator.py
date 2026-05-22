"""Alpha trading content compliance — mirror n8n Map Intake rules."""

from __future__ import annotations

import re
from typing import Any

BANNED = [
    re.compile(r"vào long", re.I),
    re.compile(r"vào short", re.I),
    re.compile(r"\bentry\b", re.I),
    re.compile(r"\bSL\b"),
    re.compile(r"\bTP\b"),
    re.compile(r"chắc ăn", re.I),
    re.compile(r"guaranteed", re.I),
]
URL_IN_TWEET = re.compile(r"https?://", re.I)


def validate_pack(pack: dict[str, Any]) -> dict[str, Any]:
    failed: list[int] = []
    brief = str(pack.get("telegram_brief") or "")
    tweets = pack.get("x_thread") or []
    if not isinstance(tweets, list):
        tweets = [str(tweets)] if tweets else []
    threads = str(pack.get("threads_post") or "")

    texts = [brief, *map(str, tweets), threads]
    if any(r.search(t) for r in BANNED for t in texts):
        failed.append(1)

    for t in tweets:
        if len(t) > 280:
            failed.append(4)
        if URL_IN_TWEET.search(t):
            failed.append(4)

    if len(threads) > 500:
        failed.append(4)

    pack["compliance"] = {
        "status": "PASS" if not failed else "FAIL",
        "failed_rules": sorted(set(failed)),
    }
    return pack
