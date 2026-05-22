# Audit — ThePhoenix77/ai-twitter-bot (rank #6 — legacy)

> **Repo:** https://github.com/ThePhoenix77/ai-twitter-bot  
> **License:** MIT  
> **Ngày:** 2026-05-22  
> **Status:** **Không còn POC chính** — thay bằng [`langchain-social-agent-audit.md`](./langchain-social-agent-audit.md)  
> **Mục tiêu (nếu dùng):** RSS → pack.json → n8n (fallback đơn giản)

---

## 1. Tóm tắt repo gốc

| Hạng mục | Chi tiết |
|----------|----------|
| Ngôn ngữ | Python 3.11 |
| LLM | Hugging Face **BART** summarization (local), không Claude/Gemini API |
| News | **NewsAPI** + keywords trong `config/config.py` |
| Publish | **tweety** → post X trực tiếp |
| Schedule | **GitHub Actions** cron (`tweet.yml`) |
| Persistence | `data/daily_tweets.txt`, `data/tweets.txt` dedup |

```text
main.py → fetcher → summarizer (BART) → storage → tweeter.tweet_daily()
```

---

## 2. Ma trật Alpha (8 tiêu chí)

| Tiêu chí | Gốc | Sau fork Alpha |
|----------|-----|----------------|
| Generate | ✅ RSS summary | ✅ + đổi prompt/persona; optional swap BART → Claude Haiku API |
| Human approval | ❌ | ✅ bỏ `tweet_daily`, POST webhook |
| X | ✅ direct API | ❌ publish (Zernio) |
| Threads | ❌ | ✅ qua `threads_post` trong pack + Zernio |
| Media | ❌ | n8n manual `mediaId` |
| n8n JSON | N/A | Consumer `alpha-m0` webhook |
| XAUUSD prompt | Keywords only | `.env` + `config.py` + optional `prompts/alpha.md` |
| Zernio publish | ❌ | n8n Layer 3 |

---

## 3. Dependencies (`requirements.txt`)

- `newsapi-python`, `tweety-ns` (hoặc tương đương), `transformers`, `torch` — **BART nặng** (~1GB+ first run).
- **Khuyến nghị fork:** thay BART bằng **HTTP Anthropic/Gemini** để đồng bộ giọng SKILL Alpha và giảm RAM VPS.

---

## 4. Deploy steps (POC)

### 4.1 Clone & env

```bash
git clone https://github.com/ThePhoenix77/ai-twitter-bot.git lungmat-alpha-factory
cd lungmat-alpha-factory
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

`.env` (không commit):

```ini
NEWS_API_KEY=
# Bỏ X tokens nếu không post trực tiếp:
# X_API_KEY= ...
N8N_WEBHOOK_URL=https://<n8n-host>/webhook/content-ready
BRAND_ID=alpha
```

### 4.2 Custom `config/config.py`

- Keywords: `XAUUSD`, `gold`, `Federal Reserve`, `DXY`, `forex`, `commodities`
- `TWEET_COUNT` → map thành `x_thread` length (1–7)
- `ARTICLE_LIMIT` giữ 5–10

### 4.3 Thay `main.py` output

Thay `tweeter.tweet_daily()` bằng:

```python
# Pseudo
pack = build_alpha_pack(summaries, topic="XAUUSD daily brief")
requests.post(os.environ["N8N_WEBHOOK_URL"], json={
  "brand": "alpha",
  "run_id": f"alpha-{date}-{slug}",
  "pack": pack,
})
```

Schema: [`config/n8n/schemas/alpha-content-pack.schema.json`](../../config/n8n/schemas/alpha-content-pack.schema.json)

### 4.4 Schedule

- **Không** dùng GitHub Actions cho prod LungMat (secret trên GH).
- Dùng **cron host** hoặc `docker-compose.factory.yml` service `alpha-factory` + `ofelia` / host cron `0 8 * * *` TZ Asia/Ho_Chi_Minh.

### 4.5 n8n

Import [`workflows/alpha-m0.template.json`](../../workflows/alpha-m0.template.json):

- Thêm **Webhook** trigger `content-ready`
- **Disable** node `Claude Writer`
- Map `$json.body.pack` → compliance → Telegram → Zernio

---

## 5. Rủi ro

| Rủi ro | Mitigation |
|--------|------------|
| BART giọng không institutional | Swap LLM API + few-shot từ SKILL |
| NewsAPI free tier limit | Thêm RSS fetcher (FXStreet, Investing.com) |
| Output không `threads_post` | Layer 2: Claude Haiku 1 call chỉ sinh `threads_post` từ `x_thread[0]` |
| Compliance trading | Code validate trong factory + n8n |

---

## 6. Effort estimate

| Task | Giờ |
|------|-----|
| Fork + RSS keywords XAUUSD | 1h |
| Webhook + pack schema | 2h |
| Disable direct tweet + test n8n | 1h |
| Optional LLM swap | 2h |
| Raymond clone (config only) | 1h |
| **Tổng POC Alpha** | **4–6h** |

---

## 7. Raymond / brand 2

Cùng image Docker, khác env:

- `BRAND_ID=raymond`
- Keywords: `gold trading`, `XAU`, `Raymond` persona file
- Webhook cùng URL, n8n branch theo `brand`

---

## 8. Không làm trong fork này

- Threads native publish (Zernio only)
- Multi-image Zernio upload (M0 manual)
- TradingAgents depth (repo #5 — task riêng)

---

## 9. Checklist Done

- [ ] `pack.json` compliance PASS
- [ ] n8n webhook 200 + TG preview
- [ ] Founder `OK đăng` + Zernio Published (regression P7)
- [ ] Không gọi NewsAPI > quota

---

## 10. Tham chiếu

- Brief Cowork: [`briefs/oss-fork-alpha-content-factory.md`](../briefs/oss-fork-alpha-content-factory.md)
- Catalog: [`ALPHA_OSS_CONTENT_FACTORY_CATALOG.md`](../ALPHA_OSS_CONTENT_FACTORY_CATALOG.md)
