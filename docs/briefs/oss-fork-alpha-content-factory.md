# Brief — OSS fork Alpha (LEGACY: ai-twitter-bot)

> **Superseded by:** [`oss-fork-alpha-content-factory-brief.md`](./oss-fork-alpha-content-factory-brief.md) (LangChain agent winner)  
> Giữ file này cho tham khảo ai-twitter-bot (#6).

> **Giao cho:** Claude Cowork · Codex · Claude Code  
> **Generated:** 2026-05-22

---

## Copy-paste mở session

```text
Đọc docs/briefs/oss-fork-alpha-content-factory.md và docs/oss-forks/ai-twitter-bot-audit.md.

Nhiệm vụ: fork ThePhoenix77/ai-twitter-bot cho brand Alpha — RSS XAUUSD → pack.json → POST n8n webhook content-ready. Không post X trực tiếp. n8n dùng alpha-m0.template (Writer OFF, webhook ON) → TG duyệt → Zernio.

Đọc: config/n8n/schemas/alpha-content-pack.schema.json, docs/goclaw-export/skills/alpha-content-writer/SKILL.md (persona only).

Done: 1 lần cron chạy factory → TG preview → OK đăng → Zernio Published.
```

---

## 1. Mục tiêu

| # | Deliverable |
|---|-------------|
| D1 | Docker service `alpha-factory` chạy 08:00 VN (hoặc manual) |
| D2 | HTTP POST `pack.json` hợp schema |
| D3 | n8n thin path pass (không LLM node) |
| D4 | Zernio cross_post X+Threads (giữ accountId P7) |

**Out of scope:** Postiz, TradingAgents, Raymond automation (chỉ note env pattern).

---

## 2. Kiến trúc

```text
ai-twitter-bot fork (Layer 1)
    → POST /webhook/content-ready
n8n alpha-m0 (Layer 2, NO Claude Writer)
    → Telegram @alpha79_bot
    → Wait OK đăng + mediaId
Zernio HTTP (Layer 3)
```

---

## 3. LÀM

1. Clone repo → branch `lungmat/alpha-factory`
2. `config/config.py` — keywords forex/gold
3. Replace `tweeter.tweet_daily()` → `emit_pack_webhook()`
4. `pack` fields: `brand`, `topic`, `telegram_brief`, `x_thread[]`, `threads_post`, `youtube_pack` (stub OK), `compliance`
5. Compliance rules từ SKILL: no signal, tweet ≤280, no URL in tweet
6. Optional: thay BART bằng Gemini Flash Lite / Haiku (1 API call)
7. n8n: duplicate trigger Webhook; disable Claude HTTP node
8. Test manual: `python main.py` → check n8n execution → TG

---

## 4. KHÔNG

- Không post qua tweety / X API trực tiếp
- Không bật Telegram Trigger loop (#11138) trên n8n
- Không dùng Sonnet cho daily batch (Haiku/Flash Lite đủ)
- Không commit `.env`, NewsAPI key, Zernio key

---

## 5. Persona / prompt

- SSOT giọng: SKILL Alpha (institutional XAUUSD, Tiếng Việt + EN terms)
- `TWEET_EXAMPLES`: lấy 3–5 tweet mẫu từ `@AlphaTrading79` (Founder cung cấp hoặc paste thủ công)
- `threads_post`: 1 đoạn ≤500, không copy full `x_thread`

---

## 6. Webhook contract

```json
{
  "brand": "alpha",
  "run_id": "alpha-2026-05-22-0800-a1b2",
  "pack": { "...": "alpha-content-pack schema" }
}
```

n8n Webhook path đề xuất: `/webhook/content-ready` (Founder đặt trên cloud).

---

## 7. Media M0

- Factory **không** upload ảnh
- Founder reply `OK đăng` + `mediaId` từ Zernio Media (như `alpha-m0.template`)

---

## 8. Báo cáo cuối

```markdown
## Alpha factory POC
- Branch: ...
- Webhook test: run_id ...
- Zernio post id: ...
- LLM: BART | Haiku | Flash Lite
- Blocker: ...
```

---

## 9. Links

- Audit: [`oss-forks/ai-twitter-bot-audit.md`](../oss-forks/ai-twitter-bot-audit.md)
- Catalog: [`ALPHA_OSS_CONTENT_FACTORY_CATALOG.md`](../ALPHA_OSS_CONTENT_FACTORY_CATALOG.md)
- n8n template: [`workflows/alpha-m0.template.json`](../../workflows/alpha-m0.template.json)
- Docker: [`docker-compose.factory.yml`](../../docker-compose.factory.yml)
