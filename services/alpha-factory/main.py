#!/usr/bin/env python3
"""Alpha content factory — RSS → Haiku pack → n8n webhook."""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests
from dotenv import load_dotenv

from fetcher import build_research_block, fetch_headlines
from packer import generate_pack

load_dotenv(Path(__file__).parent / ".env")


def _run_id() -> str:
    now = datetime.now(timezone.utc)
    d = now.strftime("%Y-%m-%d")
    t = now.strftime("%H%M")
    import random
    import string

    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=4))
    return f"alpha-{d}-{t}-{suffix}"


def main() -> int:
    parser = argparse.ArgumentParser(description="Alpha content factory")
    parser.add_argument("--dry-run", action="store_true", help="Print pack only, no webhook")
    parser.add_argument("--topic", default=os.getenv("TOPIC", "XAUUSD daily brief"))
    args = parser.parse_args()

    print("Fetching headlines...")
    headlines = fetch_headlines()
    research = build_research_block(headlines)
    print(f"Headlines: {len(headlines)}")

    print("Generating pack (Claude Haiku)...")
    pack = generate_pack(args.topic, research)
    run_id = _run_id()
    pack["run_id"] = run_id

    body = {"brand": os.getenv("BRAND_ID", "alpha"), "run_id": run_id, "pack": pack}

    out_dir = Path(__file__).resolve().parents[1].parent / "output" / "alpha"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / f"{run_id}.pack.json"
    out_file.write_text(json.dumps(body, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Saved: {out_file}")

    print(json.dumps(pack, ensure_ascii=False, indent=2)[:2000])
    print(f"\nCompliance: {pack.get('compliance', {}).get('status')}")

    if pack.get("compliance", {}).get("status") != "PASS":
        print("FAIL compliance — fix before POST", file=sys.stderr)
        return 1

    if args.dry_run:
        print("\n--dry-run: skip webhook")
        return 0

    url = os.getenv("N8N_WEBHOOK_URL", "").strip()
    if not url:
        print("N8N_WEBHOOK_URL missing", file=sys.stderr)
        return 1

    print(f"POST {url}")
    r = requests.post(url, json=body, timeout=60)
    print(f"Webhook status: {r.status_code}")
    print(r.text[:500])
    return 0 if r.status_code < 400 else 1


if __name__ == "__main__":
    raise SystemExit(main())
