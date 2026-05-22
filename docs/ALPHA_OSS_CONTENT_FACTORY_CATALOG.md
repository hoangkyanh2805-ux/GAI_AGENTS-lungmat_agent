# Catalog — OSS content factory (re-rank 2026-05-22)

> **Winner Layer 1:** [langchain-ai/social-media-agent](https://github.com/langchain-ai/social-media-agent)  
> **Winner Layer 2:** `workflows/alpha-m0.template.json` (n8n thin)  
> **Winner Layer 3 M0:** Zernio HTTP (P7 Done)

---

## 1. Kết luận (1 đoạn)

Sau khi thêm **4 nguồn template** (LC agent, n8n #3066/#2950, gist), **langchain-ai/social-media-agent** vượt **ai-twitter-bot** và mọi n8n full-AI template: có **LangGraph multi-step**, **Claude**, **FireCrawl URL**, **HITL approval**, **cron**, MIT. Gap duy nhất: **Threads + Zernio** — xử lý ở fork (`pack.json` webhook) + Layer 2/3, không đổi winner.

**Fork đầu tiên:** `oss-forks/social-media-agent-lungmat/` — brief [`oss-fork-alpha-content-factory-brief.md`](./briefs/oss-fork-alpha-content-factory-brief.md).

---

## 2. Token cost (không phải driver chính)

| Stack | Model | ~$/tháng (10 brand × 1/ngày) |
|-------|-------|------------------------------|
| n8n AI + Sonnet | Sonnet | ~$54 |
| n8n AI + Flash Lite | Flash Lite | ~$1.50 |
| **LC factory + Haiku** | Haiku | **~$4–8** |
| LC + Sonnet (VIP only) | Sonnet | +$3–5 |

**Đốt token thật:** n8n **#11138** (mỗi tin TG = LLM lại). OSS + cron = **1 call/bài**.

**Lý do chọn LC:** niche pipeline + scale brand + chất lượng multi-step, không chỉ tiết kiệm $1–30/tháng.

---

## 3. Final ranking — 16 nguồn

### Tier S — fork core

| Rank | Nguồn | Score | Vai trò | Effort |
|------|-------|-------|---------|--------|
| **1** | **langchain-ai/social-media-agent** | ★★★★★ ~88 | **Content factory chính** | 10–15h F0 |
| **2** | TauricResearch/TradingAgents | ★★★★ | VIP10X premium analysis | 15–20h F2 |
| **3** | samgozman/fin-thread | ★★★★ | News feeder → URL queue | 4–6h F3 |
| **4** | gitroomhq/postiz-app | ★★★★ | Publisher self-host (opt B) | 6–8h |
| **5** | Thysrael/Horizon | ★★★★ | Multi-source radar + MCP | 6–8h F3 |

### Tier A — support / Layer 2

| Rank | Nguồn | Score | Vai trò |
|------|-------|-------|---------|
| 6 | ThePhoenix77/ai-twitter-bot | ★★★ | RSS bot đơn giản (đã hạ từ #1) |
| 7 | `alpha-m0.template.json` | ★★★★★ ~78 | n8n orchestration |
| 8 | zernio-dev/latewiz | ★★★ | Zernio UI self-host |
| 9 | n8n #3066 LePage | ★★★★ | Reference approval/fan-out |
| 10 | inovector/mixpost | ★★★ | Publisher alt |

### Tier B — skip / reject

| Rank | Nguồn | Score | Verdict |
|------|-------|-------|---------|
| 11 | langchain (template audit only) | — | → #1 |
| 12 | n8n #2950 Amjid | ★★ | **SKIP** paid marketing |
| 13 | gist omergocmen | ★★ | **SKIP** auto-post demo |
| 14 | brightbean-studio | ★★ | **SKIP** no X |
| 15 | marketmenow | ★★ | **SKIP** no Threads |
| 16 | TheQuantPy/quantpy-twitter-bot | ★★ | 1 brand edu only |

---

## 4. Bốn nguồn template (chi tiết)

| # | Nguồn | Trading? | Production? | Verdict |
|---|-------|----------|-------------|---------|
| 1 | [LC social-media-agent](https://github.com/langchain-ai/social-media-agent) | Cao sau custom | **Có** 2.6k⭐ MIT | **Winner L1** |
| 2 | [n8n #3066](https://n8n.io/workflows/3066-automate-multi-platform-social-media-content-creation-with-ai/) | Trung | Trung — manual+cron wrap | **Reference only** |
| 3 | [n8n #2950](https://n8n.io/workflows/2950-ai-powered-social-media-content-generator-and-publisher) | Thấp | Trung $5 | **SKIP** |
| 4 | [Gist omergocmen](https://gist.github.com/omergocmen/1774ba77afabba25ba9d0cfecec96753) | Thấp | Thấp `active:false` | **SKIP** |

Audit chi tiết: [`ALPHA_TEMPLATE_SOURCES_AUDIT.md`](./ALPHA_TEMPLATE_SOURCES_AUDIT.md) · LC: [`oss-forks/langchain-social-agent-audit.md`](./oss-forks/langchain-social-agent-audit.md).

---

## 5. Kiến trúc 3 layer (refined)

```text
┌─ INPUT FEEDER (F3) ─────────────────────────────────────────────┐
│  fin-thread / Horizon — RSS ForexFactory, FXStreet, Reuters…     │
│  → push URL vào queue → LC agent per brand                       │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─ CORE FACTORY (F0–F1) ──────────────────────────────────────────┐
│  social-media-agent-lungmat (LangGraph + Claude + FireCrawl)      │
│  validate → relevance → generate → HITL (Telegram)                 │
│  → POST webhook { pack.json }                                    │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─ PREMIUM (F2) ─ TradingAgents fork → VIP10X 21:00 VN ───────────┘

                             ▼
┌─ Layer 2 — n8n THIN ──────────────────────────────────────────────┐
│  Webhook · Drive media · compliance Code · TG Wait · Sheet         │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─ Layer 3 — Zernio (M0) / Postiz (M2 opt) / LateWiz UI ───────────┘
```

---

## 6. Cost projection (10 brand)

| Component | $/tháng |
|-----------|---------|
| VPS CX22 (3–5 Docker + n8n) | $10–15 |
| Claude Haiku (3 brand daily) | $4–8 |
| Claude Sonnet (VIP ~30/mo) | $3–5 |
| FireCrawl | $0–20 |
| Zernio Pro | $39–99 |
| GoClaw (Linh Cẩu + Coach only) | $12–20 |
| **Tổng** | **~$68–173** (~$7–17/brand) |

So với n8n-native Sonnet: tiết kiệm ~$20–40/th + content quality cao hơn (multi-step).

---

## 7. Quyết định Founder

| Câu hỏi | Trả lời |
|---------|---------|
| Fork đầu tiên? | **langchain-ai/social-media-agent** |
| POC brand? | **Alpha** |
| Giữ n8n? | Có — thin only |
| Giữ Zernio? | Có M0/M1 |
| GoClaw? | Linh Cẩu + Lửng Mật only |
| LLM daily? | **Haiku 4.5**; Sonnet VIP10X |

---

## 8. Roadmap phases

| Phase | Tuần | Nội dung |
|-------|------|----------|
| **F0** | 1–2 | LC fork Alpha + n8n webhook + Zernio |
| **F1** | 3 | Clone raymond + linhcau |
| **F2** | 4–5 | TradingAgents VIP10X |
| **F3** | 6 | fin-thread / Horizon feeder |

---

## 9. Folder dự án

```
oss-forks/
  README.md
  social-media-agent-lungmat/   ← clone LC repo here
  fin-thread-feeder/
  prompts/alpha-persona.md
  .env.alpha.example
docs/oss-forks/
  langchain-social-agent-audit.md
  ai-twitter-bot-audit.md         ← legacy #6
docker-compose.factory.yml
```

---

## 10. Tài liệu

| File | |
|------|--|
| [`oss-forks/README.md`](../oss-forks/README.md) | Index clone |
| [`briefs/oss-fork-alpha-content-factory-brief.md`](./briefs/oss-fork-alpha-content-factory-brief.md) | Cowork F0 |
| [`N8N_HYBRID_V2_BUILD_PLAN.md`](./N8N_HYBRID_V2_BUILD_PLAN.md) | §0 v2.1 |
