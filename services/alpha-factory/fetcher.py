"""RSS + optional NewsAPI headlines for XAUUSD context."""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any

import feedparser
import requests

RSS_FEEDS = [
    ("FXStreet Gold", "https://www.fxstreet.com/rss/news/gold"),
    ("Investing Gold", "https://www.investing.com/rss/news_285.rss"),
    ("Yahoo Finance Gold", "https://finance.yahoo.com/rss/headline?s=GC=F"),
]

KEYWORDS = (
    "xauusd",
    "gold",
    "fed",
    "dxy",
    "dollar",
    "liquidity",
    "cpi",
    "nfp",
    "fomc",
    "treasury",
    "yield",
)


def _matches(text: str) -> bool:
    t = text.lower()
    return any(k in t for k in KEYWORDS)


def fetch_headlines(max_items: int = 8) -> list[dict[str, str]]:
    seen: set[str] = set()
    out: list[dict[str, str]] = []

    for source, url in RSS_FEEDS:
        try:
            parsed = feedparser.parse(url)
        except Exception:
            continue
        for entry in parsed.entries[:15]:
            title = (entry.get("title") or "").strip()
            summary = (entry.get("summary") or entry.get("description") or "").strip()
            link = (entry.get("link") or "").strip()
            blob = f"{title} {summary}"
            if not title or not _matches(blob):
                continue
            key = link or title
            if key in seen:
                continue
            seen.add(key)
            out.append(
                {
                    "source": source,
                    "title": title,
                    "summary": summary[:500],
                    "url": link,
                }
            )
            if len(out) >= max_items:
                return out

    api_key = os.getenv("NEWS_API_KEY", "").strip()
    if api_key and len(out) < max_items:
        try:
            r = requests.get(
                "https://newsapi.org/v2/everything",
                params={
                    "q": "XAUUSD OR gold Fed DXY",
                    "language": "en",
                    "sortBy": "publishedAt",
                    "pageSize": 5,
                    "apiKey": api_key,
                },
                timeout=20,
            )
            r.raise_for_status()
            for art in r.json().get("articles", []):
                title = (art.get("title") or "").strip()
                if not title or title in seen:
                    continue
                seen.add(title)
                out.append(
                    {
                        "source": "NewsAPI",
                        "title": title,
                        "summary": (art.get("description") or "")[:500],
                        "url": art.get("url") or "",
                    }
                )
                if len(out) >= max_items:
                    break
        except Exception:
            pass

    return out


def build_research_block(headlines: list[dict[str, str]]) -> str:
    if not headlines:
        return "Không lấy được headline RSS. Viết insight evergreen XAUUSD/macro. data_status: unconfirmed."
    lines = [f"- [{h['source']}] {h['title']}" for h in headlines[:6]]
    if headlines[0].get("url"):
        lines.append(f"Link chính: {headlines[0]['url']}")
    return "\n".join(lines)
