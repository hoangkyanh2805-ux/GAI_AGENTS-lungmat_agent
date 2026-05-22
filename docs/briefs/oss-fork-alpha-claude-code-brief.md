# Claude Code Brief — Fork `ai-twitter-bot` thành `alpha-factory`

> **Cho session Claude Code CLI** (file tools + Bash + Read/Edit/Write).
> Brief độc lập — không cần context chat trước, đọc đủ là chạy được.
> **Generated:** 2026-05-22
> **Owner:** Founder (LungMat / Alpha Trading Lab)
> **Repo gốc cần đọc trước:** `PROJECT_STATUS.md` (đặc biệt §5 decision 2026-05-22)

---

## 0. Copy-paste mở session Claude Code

```text
Đọc các file sau theo thứ tự, KHÔNG bỏ qua:
1. PROJECT_STATUS.md §5 (decision 2026-05-22 — n8n production + GoClaw community)
2. docs/N8N_HYBRID_V2_BUILD_PLAN.md §0 (v2.1 — Kiến trúc 3 layer OSS Content Factory)
3. docs/ALPHA_OSS_CONTENT_FACTORY_CATALOG.md (catalog + scoring 16 repo)
4. docs/oss-forks/ai-twitter-bot-audit.md (deploy roadmap repo gốc)
5. docs/briefs/oss-fork-alpha-content-factory.md (Cowork brief generic)
6. docker-compose.factory.yml (Docker layout sẵn)
7. config/n8n/schemas/alpha-content-pack.schema.json (output schema MUST match)
8. workflows/alpha-m0.template.json (n8n consumer endpoint)

Sau đó thực thi từng phase trong file này (docs/briefs/oss-fork-alpha-claude-code-brief.md).

KHÔNG được:
- Commit secret (.env, API keys, NewsAPI, Anthropic, Zernio token)
- Sửa GoClaw skill (decision 2026-05-22 freeze)
- Bật AI Agent loop trong n8n canvas (issue #11138 đốt token)
- Push lên GitHub public với key
- Sửa workflows/alpha-m0.template.json (đó là consumer chuẩn — chỉ THÊM webhook trigger nếu cần)
```

---

## 1. Mục tiêu (1 câu)

Fork `ThePhoenix77/ai-twitter-bot` (Python) thành service `alpha-factory` chạy Docker, cron 08:00 VN, đầu vào RSS forex/gold, đầu ra HTTP POST `pack.json` đúng schema tới n8n webhook `/webhook/content-ready` — **không** post X trực tiếp.

---

## 2. Files Claude Code sẽ tạo/sửa

### Tạo mới

```
services/alpha-factory/                          ← repo fork sẽ nằm đây
  Dockerfile
  requirements.txt                                (override repo gốc nếu cần)
  .env.example                                    (không commit .env thật)
  src/
    main.py                                       (override main.py gốc)
    fetcher.py                                    (giữ + tinh chỉnh keywords)
    summarizer.py                                 (optional swap BART → LLM API)
    pack_builder.py                               (NEW — build pack.json)
    webhook_emitter.py                            (NEW — POST n8n)
    compliance.py                                 (NEW — validate output)
    config/
      brand_alpha.py                              (NEW — persona + keywords + few-shot)
  prompts/
    alpha-persona.md                              (NEW — distilled SKILL ~5K token)
  data/                                           (gitignore — runtime state)
  tests/
    test_pack_schema.py                           (NEW — validate output match schema)
    test_compliance.py                            (NEW)
    fixtures/
      sample_articles.json
docs/oss-forks/
  alpha-factory-deploy-log.md                     (NEW — log từng bước, blocker, output)
```

### Sửa

```
docker-compose.factory.yml                        (thêm context path nếu cần)
.gitignore                                        (thêm services/alpha-factory/.env, data/)
```

### Không sửa

```
workflows/alpha-m0.template.json                  (consumer chuẩn — KHÔNG đụng)
config/n8n/schemas/alpha-content-pack.schema.json (source of truth schema)
docs/goclaw-export/                               (GoClaw freeze)
PROJECT_STATUS.md                                 (Founder maintain)
```

---

## 3. Phases — Claude Code thực thi tuần tự

### Phase 1 — Setup (30 min)

**1.1.** Verify repo gốc + môi trường:

```bash
# Check Python version (cần 3.11+)
python --version

# Check Docker
docker --version
docker compose version

# Check git config (KHÔNG đụng nếu sai - báo founder)
git config --get user.name
```

**1.2.** Clone repo gốc vào `services/alpha-factory/_upstream/` (đọc reference) + tạo skeleton mới ở `services/alpha-factory/`:

```bash
mkdir -p services/alpha-factory/_upstream
git clone --depth 1 https://github.com/ThePhoenix77/ai-twitter-bot.git services/alpha-factory/_upstream
```

**1.3.** Đọc cấu trúc repo gốc:

```
Read services/alpha-factory/_upstream/main.py
Read services/alpha-factory/_upstream/config/config.py
Read services/alpha-factory/_upstream/requirements.txt
Glob services/alpha-factory/_upstream/**/*.py
```

**1.4.** Tạo `services/alpha-factory/.gitignore`:

```
.env
data/
__pycache__/
*.pyc
.venv/
_upstream/        # không commit upstream raw — đã có git submodule reference riêng
```

**Kiểm tra trước khi sang Phase 2:**
- [ ] Repo upstream clone thành công, có file `main.py` + `config/config.py`
- [ ] Python 3.11+ + Docker compose có sẵn
- [ ] `.gitignore` add đúng path

---

### Phase 2 — Skeleton + dependencies (1h)

**2.1.** Tạo `services/alpha-factory/requirements.txt`:

```
# Core
requests>=2.31
python-dotenv>=1.0
feedparser>=6.0          # RSS parsing (override NewsAPI optional)

# News input (giữ optional NewsAPI)
newsapi-python>=0.2.7

# LLM swap layer (chọn 1)
anthropic>=0.40          # Claude Haiku 4.5 daily
# google-generativeai>=0.8   # nếu chọn Gemini Flash Lite

# Test
pytest>=8.0
jsonschema>=4.20
```

**Không cài** `transformers`, `torch` (BART nặng 1GB+) — swap LLM sang HTTP API.

**2.2.** Tạo `services/alpha-factory/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    tzdata cron \
    && rm -rf /var/lib/apt/lists/*

ENV TZ=Asia/Ho_Chi_Minh

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY prompts/ ./prompts/

# Default: run once manual; cron schedule qua docker compose host hoặc ofelia sidecar
CMD ["python", "-m", "src.main"]
```

**2.3.** Tạo `services/alpha-factory/.env.example` (KHÔNG tạo `.env` thật):

```ini
# === Brand ===
BRAND_ID=alpha
BRAND_DISPLAY_NAME=Alpha Trading Lab
TIMEZONE=Asia/Ho_Chi_Minh

# === News input ===
NEWSAPI_KEY=                                # optional, NewsAPI free tier
RSS_FEEDS=https://www.forexlive.com/feed/,https://www.fxstreet.com/rss/news

# === LLM ===
LLM_PROVIDER=anthropic                      # anthropic | gemini | none(BART local fallback)
ANTHROPIC_API_KEY=                          # sk-ant-...
ANTHROPIC_MODEL=claude-haiku-4-5
# GEMINI_API_KEY=
# GEMINI_MODEL=gemini-flash-lite

# === n8n webhook ===
N8N_WEBHOOK_URL=https://nve125002892.app.n8n.cloud/webhook/content-ready
N8N_WEBHOOK_SECRET=                         # optional HMAC

# === Limits ===
ARTICLE_LIMIT=8                             # max articles fetch
TWEET_THREAD_MAX=5                          # x_thread length
DEDUP_TTL_DAYS=7
```

**2.4.** Tạo `src/__init__.py`, `src/config/__init__.py` empty.

**Kiểm tra:**
- [ ] `pip install -r requirements.txt` chạy clean trong .venv local
- [ ] `docker build -t lungmat/alpha-factory:test services/alpha-factory/` thành công
- [ ] `.env.example` không chứa giá trị thật

---

### Phase 3 — Content gen logic (3-4h)

**3.1.** `src/config/brand_alpha.py`:

```python
"""Brand Alpha — XAUUSD institutional voice"""

KEYWORDS = [
    "XAUUSD", "gold", "XAU/USD", "DXY",
    "Federal Reserve", "Fed rate", "CPI", "PCE",
    "FOMC", "Treasury yield", "commodities",
    "central bank gold", "Powell speech",
]

# Lọc tin loại bỏ (anti-spam)
EXCLUDE_KEYWORDS = [
    "lottery", "cryptocurrency scam", "telegram signal",
    "guaranteed profit", "100% win",
]

# Few-shot examples for LLM (Founder paste 3-5 tweet thực từ @AlphaTrading79)
TWEET_EXAMPLES = [
    # Founder fill — placeholder
    "🔻 XAUUSD H1: $4531 reclaim — phe mua đang cố gắng giữ vùng kháng cự key. SMC đọc structure: bullish nếu break $4540 với volume.",
    # Add 2-4 more
]

# Compliance — banned phrases (regex)
BANNED_PATTERNS = [
    r"\b(sure\s*win|bao\s*go|100%|guarantee)\b",
    r"\b(buy\s+now|sell\s+now)\s+at\s+\d+",       # explicit entry signal
    r"\b(lot\s*size|risk\s+\d+%)\b",              # don't recommend specific size
    r"\bTP\d?\s*[:=]\s*\d+.+SL\s*[:=]\s*\d+",     # full entry/SL/TP package
]

# Persona file
PERSONA_PATH = "prompts/alpha-persona.md"
```

**3.2.** `prompts/alpha-persona.md` — distill từ `docs/goclaw-export/skills/alpha-content-writer/SKILL.md`:

```markdown
# Alpha Content Writer — distilled persona (5K token target)

## Voice
- Tone: institutional analyst, Tiếng Việt + EN technical terms
- Audience: trader 1-3 năm kinh nghiệm, đọc XAUUSD/Forex
- Avoid: dramatic emojis, "moon"/"to the moon", influencer tone

## Framework cheat
- SMC (Smart Money Concepts): liquidity sweeps, order blocks, FVG, BOS/CHoCH
- Wyckoff: accumulation/distribution phases, Spring, UTAD
- Multi-TF: H4/H1 structure, M15 entry
- Sessions: London open 15:00 VN, NY 21:00 VN

## Output rules
- x_thread: ≤5 tweet, mỗi tweet ≤280 char, KHÔNG có URL trong text
- threads_post: 1 đoạn 200-500 char, KHÔNG copy x_thread
- telegram_brief: 800-1500 char, markdown OK, có thể link

## Compliance
- KHÔNG khuyến nghị lot size cụ thể
- KHÔNG hứa lợi nhuận
- KHÔNG cho entry/SL/TP đầy đủ (chỉ structure/zone analysis)
- Luôn có "educational reference only, manage risk"

## Hashtag pool
#XAUUSD #SMC #Forex #GoldTrading #AlphaTradingLab #TechnicalAnalysis
```

> Lưu ý: Claude Code đọc `docs/goclaw-export/skills/alpha-content-writer/SKILL.md` và distill 1 lần. Nếu file gốc quá dài, lấy 3 section quan trọng nhất: Voice, Framework, Compliance.

**3.3.** `src/summarizer.py` — LLM swap layer:

```python
import os
from typing import List, Dict
import anthropic

def summarize_with_claude(articles: List[Dict], persona_md: str, examples: List[str]) -> Dict:
    """
    Input: list of articles {title, url, excerpt}
    Output: dict {x_thread: [...], threads_post: "...", telegram_brief: "..."}
    """
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    
    system = f"""You are Alpha Content Writer for XAUUSD trading.
{persona_md}

Few-shot examples (match this voice):
{chr(10).join(examples)}

Output JSON only:
{{
  "x_thread": ["tweet1", "tweet2", ...],
  "threads_post": "single paragraph...",
  "telegram_brief": "markdown brief..."
}}
"""
    user = f"Today's articles:\n" + "\n\n".join([
        f"- {a['title']}\n  {a.get('excerpt', '')[:300]}"
        for a in articles
    ]) + "\n\nGenerate daily XAUUSD brief."
    
    msg = client.messages.create(
        model=os.environ.get("ANTHROPIC_MODEL", "claude-haiku-4-5"),
        max_tokens=2000,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    
    # Parse JSON từ msg.content[0].text
    import json
    text = msg.content[0].text.strip()
    if text.startswith("```json"):
        text = text.split("```json")[1].split("```")[0].strip()
    elif text.startswith("```"):
        text = text.split("```")[1].split("```")[0].strip()
    return json.loads(text)

def summarize(articles, persona_md, examples):
    provider = os.environ.get("LLM_PROVIDER", "anthropic")
    if provider == "anthropic":
        return summarize_with_claude(articles, persona_md, examples)
    elif provider == "gemini":
        # TODO: implement Gemini variant if needed
        raise NotImplementedError("Gemini provider not yet wired")
    else:
        raise ValueError(f"Unknown LLM_PROVIDER: {provider}")
```

**3.4.** `src/compliance.py`:

```python
import re
from typing import List, Dict, Tuple

def validate(content: Dict, banned_patterns: List[str]) -> Tuple[bool, List[str]]:
    """
    Return (passed, list_of_violations).
    """
    violations = []
    
    # 1. Banned patterns
    all_text = " ".join([
        " ".join(content.get("x_thread", [])),
        content.get("threads_post", ""),
        content.get("telegram_brief", ""),
    ])
    for pattern in banned_patterns:
        if re.search(pattern, all_text, re.IGNORECASE):
            violations.append(f"banned_pattern: {pattern}")
    
    # 2. Length check
    for i, tweet in enumerate(content.get("x_thread", [])):
        if len(tweet) > 280:
            violations.append(f"x_thread[{i}]_too_long: {len(tweet)} chars")
    
    threads = content.get("threads_post", "")
    if len(threads) > 500:
        violations.append(f"threads_post_too_long: {len(threads)} chars")
    
    # 3. URL in x_thread
    for i, tweet in enumerate(content.get("x_thread", [])):
        if re.search(r"https?://", tweet):
            violations.append(f"x_thread[{i}]_has_url")
    
    return (len(violations) == 0, violations)
```

**3.5.** `src/pack_builder.py`:

```python
import os
import hashlib
from datetime import datetime
import zoneinfo
from typing import Dict, List

def build_pack(content: Dict, articles: List[Dict], compliance_status: str, run_id: str) -> Dict:
    """Build pack.json matching config/n8n/schemas/alpha-content-pack.schema.json"""
    
    return {
        "brand": os.environ["BRAND_ID"],
        "run_id": run_id,
        "generated_at": datetime.now(zoneinfo.ZoneInfo("Asia/Ho_Chi_Minh")).isoformat(),
        "topic": "XAUUSD daily brief",
        "pack": {
            "telegram_brief": content["telegram_brief"],
            "x_thread": content["x_thread"],
            "threads_post": content["threads_post"],
            "youtube_pack": {                                    # stub for M0
                "title": "",
                "description": "",
                "tags": [],
            },
            "compliance": {
                "status": compliance_status,
                "checked_at": datetime.now(zoneinfo.ZoneInfo("Asia/Ho_Chi_Minh")).isoformat(),
            },
            "sources": [
                {"title": a["title"], "url": a["url"]} for a in articles
            ],
        },
    }

def make_run_id() -> str:
    now = datetime.now(zoneinfo.ZoneInfo("Asia/Ho_Chi_Minh"))
    date_str = now.strftime("%Y-%m-%d-%H%M")
    nonce = hashlib.md5(now.isoformat().encode()).hexdigest()[:4]
    return f"{os.environ['BRAND_ID']}-{date_str}-{nonce}"
```

**3.6.** `src/webhook_emitter.py`:

```python
import os
import requests
import logging

logger = logging.getLogger(__name__)

def emit_pack(pack_envelope: dict) -> dict:
    """POST pack to n8n webhook. Return response dict."""
    url = os.environ["N8N_WEBHOOK_URL"]
    secret = os.environ.get("N8N_WEBHOOK_SECRET")
    
    headers = {"Content-Type": "application/json"}
    if secret:
        # Optional HMAC if n8n verify signature
        import hmac, hashlib, json
        body_bytes = json.dumps(pack_envelope, ensure_ascii=False).encode()
        sig = hmac.new(secret.encode(), body_bytes, hashlib.sha256).hexdigest()
        headers["X-Lungmat-Signature"] = sig
    
    try:
        resp = requests.post(url, json=pack_envelope, headers=headers, timeout=30)
        resp.raise_for_status()
        logger.info(f"Webhook delivered: run_id={pack_envelope['run_id']} status={resp.status_code}")
        return {"ok": True, "status": resp.status_code, "body": resp.text[:500]}
    except requests.RequestException as e:
        logger.error(f"Webhook failed: {e}")
        return {"ok": False, "error": str(e)}
```

**3.7.** `src/main.py` — orchestrator:

```python
import os
import sys
import logging
from dotenv import load_dotenv

from src import fetcher, summarizer, compliance, pack_builder, webhook_emitter
from src.config import brand_alpha as brand

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def main():
    load_dotenv()
    
    # 1. Fetch articles từ RSS + NewsAPI
    articles = fetcher.fetch_articles(
        keywords=brand.KEYWORDS,
        exclude=brand.EXCLUDE_KEYWORDS,
        limit=int(os.environ.get("ARTICLE_LIMIT", 8)),
    )
    if not articles:
        logger.warning("No articles fetched — exit")
        sys.exit(0)
    logger.info(f"Fetched {len(articles)} articles")
    
    # 2. Load persona prompt
    with open(brand.PERSONA_PATH) as f:
        persona_md = f.read()
    
    # 3. Summarize via LLM
    content = summarizer.summarize(articles, persona_md, brand.TWEET_EXAMPLES)
    logger.info(f"LLM generated: x_thread={len(content['x_thread'])} threads={len(content['threads_post'])}")
    
    # 4. Compliance check
    passed, violations = compliance.validate(content, brand.BANNED_PATTERNS)
    if not passed:
        logger.warning(f"Compliance FAIL: {violations}")
        # Don't emit — log only (or emit with status=fail for n8n review tier 2)
        # For POC: emit with compliance status
    
    # 5. Build pack
    run_id = pack_builder.make_run_id()
    envelope = pack_builder.build_pack(
        content=content,
        articles=articles,
        compliance_status="pass" if passed else f"fail:{','.join(violations)}",
        run_id=run_id,
    )
    
    # 6. Emit webhook
    result = webhook_emitter.emit_pack(envelope)
    if not result["ok"]:
        logger.error(f"Emit failed: {result}")
        sys.exit(1)
    
    logger.info(f"Done: run_id={run_id} status={result['status']}")

if __name__ == "__main__":
    main()
```

**3.8.** `src/fetcher.py` — implement RSS + NewsAPI:

(Reuse từ `_upstream/fetcher.py`, chỉ:
- Đổi keyword source về `brand_alpha.KEYWORDS`
- Add `feedparser` cho RSS_FEEDS env var
- Add dedup check `data/seen_urls.json` TTL 7 ngày
- Return list of dict `{title, url, excerpt, published_at, source}`)

Claude Code đọc upstream fetcher trước, refactor cho Alpha.

**Kiểm tra Phase 3:**
- [ ] `python -m src.main` chạy local (dùng .env có ANTHROPIC_API_KEY thật) → in log "Done"
- [ ] Log không thấy traceback
- [ ] `data/seen_urls.json` được tạo và update

---

### Phase 4 — Test + schema validate (1.5h)

**4.1.** `tests/test_pack_schema.py`:

```python
import json
import jsonschema
import pytest
from src import pack_builder, compliance
from src.config import brand_alpha as brand

def test_pack_matches_schema():
    with open("../../../config/n8n/schemas/alpha-content-pack.schema.json") as f:
        schema = json.load(f)
    
    fake_content = {
        "x_thread": ["Sample tweet 1 #XAUUSD", "Sample tweet 2"],
        "threads_post": "Sample threads post content.",
        "telegram_brief": "# Sample brief\n\nContent here.",
    }
    fake_articles = [{"title": "Test", "url": "https://example.com"}]
    envelope = pack_builder.build_pack(
        fake_content, fake_articles, "pass", "alpha-test-run"
    )
    
    jsonschema.validate(envelope, schema)

def test_compliance_blocks_lot_size():
    content = {
        "x_thread": ["Buy at 4500 lot size 0.5 risk 2%"],
        "threads_post": "",
        "telegram_brief": "",
    }
    passed, violations = compliance.validate(content, brand.BANNED_PATTERNS)
    assert not passed
    assert any("banned_pattern" in v for v in violations)

def test_compliance_blocks_long_tweet():
    content = {
        "x_thread": ["x" * 281],
        "threads_post": "",
        "telegram_brief": "",
    }
    passed, violations = compliance.validate(content, brand.BANNED_PATTERNS)
    assert not passed
    assert any("too_long" in v for v in violations)
```

**4.2.** `tests/test_compliance.py` — thêm cases edge.

**4.3.** Chạy test:

```bash
cd services/alpha-factory
pytest tests/ -v
```

Pass tất cả → Phase 4 done.

**Kiểm tra:**
- [ ] `pytest` xanh
- [ ] Schema validate pack thật từ main.py output (mock LLM nếu không có API key)

---

### Phase 5 — Docker + n8n end-to-end (1h)

**5.1.** Build Docker:

```bash
docker compose -f docker-compose.factory.yml --profile alpha build
```

**5.2.** Tạo `.env` thật (KHÔNG commit):

```bash
cp services/alpha-factory/.env.example services/alpha-factory/.env
# Edit .env với Anthropic API key + n8n webhook URL thực
```

**5.3.** Run manual:

```bash
docker compose -f docker-compose.factory.yml --profile alpha run --rm alpha-factory python -m src.main
```

**5.4.** Verify n8n nhận webhook:
- Đăng nhập n8n cloud
- Mở workflow alpha-m0 execution log
- Confirm last execution có body khớp schema

**5.5.** Verify Telegram preview:
- Founder/admin TG nhận message preview với x_thread + threads_post
- Inline button "OK đăng" + "Reject"

**5.6.** Test approval flow:
- Founder bấm "OK đăng"
- Confirm Zernio publish X + Threads thành công (post ID return)

**Kiểm tra:**
- [ ] Docker container start không exit
- [ ] Webhook n8n executed
- [ ] TG preview hiện đầy đủ
- [ ] OK đăng → Zernio published

---

### Phase 6 — Cron + log (30 min)

**6.1.** Host cron (Linux VPS):

```bash
# /etc/cron.d/alpha-factory
0 8 * * * lungmat cd /home/lungmat/project && docker compose -f docker-compose.factory.yml --profile alpha run --rm alpha-factory python -m src.main >> /var/log/alpha-factory.log 2>&1
```

Hoặc nếu n8n cloud + Founder không có VPS: thêm n8n cron trigger → HTTP call vào `alpha-factory` exposed endpoint (less ideal, cần expose port).

**6.2.** Logging local + ship to Google Sheet (optional M1):
- `data/runs.jsonl` append từng run
- Sau M0 pass: thêm n8n workflow đọc `runs.jsonl` → Sheet (out of scope M0).

**Kiểm tra:**
- [ ] Cron triggered (kiểm `/var/log/alpha-factory.log` sau 08:00 hôm sau)
- [ ] 3 ngày liên tiếp run success

---

### Phase 7 — Báo cáo & handoff (30 min)

**7.1.** Tạo `docs/oss-forks/alpha-factory-deploy-log.md`:

```markdown
# Alpha Factory — Deploy Log

## Run history
| Date | Run ID | Articles | LLM | Webhook | TG approval | Zernio post ID | Note |
|------|--------|----------|-----|---------|-------------|----------------|------|
| 2026-05-23 | alpha-2026-05-23-0800-abcd | 8 | Haiku | 200 | OK | 6b1234... | First run |

## Blockers
- (none)

## Cost actual (tuần 1)
- Anthropic Haiku: $X
- NewsAPI: free tier OK / hit limit
- VPS: $4.50

## Next iteration
- [ ] Swap Gemini Flash Lite test ($0.50/tháng vs Haiku $5)
- [ ] Add few-shot tweet examples từ Founder
- [ ] Raymond clone (env-only, ~1h)
```

**7.2.** Update `PROJECT_STATUS.md` §2 row "Pilot Alpha media": status `M0 OSS Factory POC running` + link tới `docs/oss-forks/alpha-factory-deploy-log.md`.

**7.3.** Commit (KHÔNG commit `.env`, `data/`, `_upstream/`):

```bash
git add services/alpha-factory/Dockerfile \
        services/alpha-factory/requirements.txt \
        services/alpha-factory/.env.example \
        services/alpha-factory/src/ \
        services/alpha-factory/prompts/ \
        services/alpha-factory/tests/ \
        services/alpha-factory/.gitignore \
        docs/oss-forks/alpha-factory-deploy-log.md \
        .gitignore

git commit -m "feat(alpha-factory): OSS fork ai-twitter-bot → n8n webhook pipeline

- Replace BART summarizer with Claude Haiku 4.5 API
- Add compliance validator (banned patterns, length, URL)
- Build pack.json matching alpha-content-pack schema
- POST to n8n webhook /webhook/content-ready (no direct X)
- Tests for schema + compliance
- Docker via docker-compose.factory.yml --profile alpha

Refs: docs/briefs/oss-fork-alpha-claude-code-brief.md
"
```

KHÔNG `git push` — để Founder review trước.

**Kiểm tra:**
- [ ] deploy-log.md có entry runs
- [ ] PROJECT_STATUS.md updated 1 row
- [ ] Commit clean, không secret

---

## 4. Definition of Done (M0 Alpha factory)

Tất cả phải pass:

1. [ ] `docker compose -f docker-compose.factory.yml --profile alpha run --rm alpha-factory python -m src.main` chạy không error.
2. [ ] Webhook n8n receive 200 OK với pack.json validate đúng schema.
3. [ ] Telegram bot @alpha79_bot gửi preview text + inline keyboard.
4. [ ] Founder bấm OK đăng → Zernio cross_post X + Threads thành công (post_id trả về).
5. [ ] `pytest tests/` xanh.
6. [ ] 3 ngày liên tiếp cron 08:00 VN không escalation.
7. [ ] Cost thực ≤ $1/ngày (Haiku + NewsAPI + VPS amortize).
8. [ ] `docs/oss-forks/alpha-factory-deploy-log.md` có ≥ 3 run entries.

---

## 5. Out of scope (Claude Code KHÔNG được làm)

- ❌ Sửa workflow n8n cloud (Founder maintain trên UI)
- ❌ Sửa GoClaw skill / agent (decision 2026-05-22 freeze)
- ❌ Setup Postiz / Mixpost (option B, sau M0)
- ❌ Setup Raymond / VIP10X factory (chỉ document pattern env trong deploy-log)
- ❌ Image upload pipeline (M0 manual mediaId qua n8n)
- ❌ Threads native publish (Zernio xử lý)
- ❌ Telegram trigger loop (issue #11138 — sẽ đốt token)
- ❌ Commit `.env`, NewsAPI key, Anthropic key, Zernio key
- ❌ Push lên GitHub remote (Founder review local trước)
- ❌ Đụng `workflows/alpha-m0.template.json` (consumer chuẩn)

---

## 6. Khi gặp blocker

Claude Code dừng + log vào deploy-log.md, KHÔNG tự quyết định scope. Các blocker phổ biến:

| Blocker | Hành động |
|---------|-----------|
| NewsAPI free tier hit limit | Switch sang RSS feedparser only, note vào log |
| Anthropic API rate limit | Giảm `ARTICLE_LIMIT` xuống 5, retry với exponential backoff |
| Schema validate fail | KHÔNG sửa schema — debug pack output, sửa builder |
| n8n webhook 404 | Confirm Founder activate workflow + check URL trong `.env` |
| Zernio publish fail | Log `OK đăng` nhưng publish miss — KHÔNG retry tay, báo Founder check Zernio dashboard |
| Compliance fail thường xuyên | Log violations vào deploy-log, KHÔNG nới rule — Founder điều chỉnh persona |
| TG inline button không hoạt động | Check workflow `alpha-m0.template.json` import đúng + bot token + admin chat_id |

---

## 7. Tham chiếu nhanh (mở khi cần)

| Cần gì | File |
|--------|------|
| Decision why & architecture | `PROJECT_STATUS.md` §5 (decision 2026-05-22) + `docs/N8N_HYBRID_V2_BUILD_PLAN.md` §0 |
| Schema bắt buộc | `config/n8n/schemas/alpha-content-pack.schema.json` |
| n8n consumer chuẩn | `workflows/alpha-m0.template.json` |
| Persona Alpha gốc | `docs/goclaw-export/skills/alpha-content-writer/SKILL.md` |
| Docker layout | `docker-compose.factory.yml` |
| Repo upstream reference | `services/alpha-factory/_upstream/` (sau clone) |
| Audit repo gốc | `docs/oss-forks/ai-twitter-bot-audit.md` |
| Catalog 16 OSS | `docs/ALPHA_OSS_CONTENT_FACTORY_CATALOG.md` |
| Brief Cowork generic | `docs/briefs/oss-fork-alpha-content-factory.md` |

---

## 8. Estimate tổng

| Phase | Effort | Cumulative |
|-------|---------|-----------|
| 1. Setup | 30 min | 0.5h |
| 2. Skeleton + deps | 1h | 1.5h |
| 3. Content gen logic | 3-4h | 5.5h |
| 4. Test + schema | 1.5h | 7h |
| 5. Docker + E2E | 1h | 8h |
| 6. Cron + log | 30 min | 8.5h |
| 7. Báo cáo & commit | 30 min | **9h** |

**Tổng POC Alpha M0: 8-10h Claude Code session** (1 ngày làm việc).

---

## 9. Lệnh chạy gọn cuối cùng (cheatsheet)

```bash
# Build
docker compose -f docker-compose.factory.yml --profile alpha build

# Manual test
docker compose -f docker-compose.factory.yml --profile alpha run --rm alpha-factory python -m src.main

# Test
docker compose -f docker-compose.factory.yml --profile alpha run --rm alpha-factory pytest tests/ -v

# Log tail
tail -f /var/log/alpha-factory.log

# Stop/cleanup
docker compose -f docker-compose.factory.yml --profile alpha down
```

---

## 10. Sau khi Done — handoff Founder

Claude Code báo cáo Founder qua:
1. Commit local (KHÔNG push).
2. `docs/oss-forks/alpha-factory-deploy-log.md` cập nhật.
3. 1 message summary trong session: ID commit + DoD checklist tick + blocker (nếu có).

Founder sau đó:
1. Review commit + smoke test.
2. Decide push hay không.
3. Decide clone Raymond không (qua brief tương lai).

**Session Claude Code kết thúc khi:** Founder confirm DoD pass HOẶC blocker không tự fix được.
