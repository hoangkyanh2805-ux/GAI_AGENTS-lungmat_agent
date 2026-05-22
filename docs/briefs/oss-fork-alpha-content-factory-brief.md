# Brief — LangChain social-media-agent fork (Alpha F0)

> **Giao cho:** Claude Cowork · Codex · Claude Code  
> **Đọc trước:** [`docs/oss-forks/langchain-social-agent-audit.md`](../oss-forks/langchain-social-agent-audit.md)  
> **Generated:** 2026-05-22

---

## Copy-paste mở session

```text
Winner Layer 1: langchain-ai/social-media-agent → oss-forks/social-media-agent-lungmat/

Đọc docs/briefs/oss-fork-alpha-content-factory-brief.md + docs/oss-forks/langchain-social-agent-audit.md.

F0 Alpha: clone repo, custom prompts (oss-forks/prompts/alpha-persona.md), Telegram thay Slack HITL, webhook POST pack.json → n8n (Writer OFF) → TG duyệt → Zernio. Không publish X/LinkedIn trực tiếp.

Done: 1 URL hoặc cron 08:00 VN → TG preview → OK đăng → Zernio Published.
```

---

## 1. Winner & stack

| Layer | Component |
|-------|-----------|
| **1** | `social-media-agent-lungmat` + optional `fin-thread-feeder` (F3) |
| **2** | `workflows/alpha-m0.template.json` — thin, no LLM |
| **3** | Zernio HTTP (giữ P7) |

---

## 2. F0 tasks (10–15h)

1. `git clone` vào `oss-forks/social-media-agent-lungmat/`
2. `.env` từ `oss-forks/.env.alpha.example`
3. Sửa `src/agents/generate-post/prompts/*` — inject alpha persona
4. Telegram adapter thay Slack notify / HITL channel
5. Node `webhook-out` → `POST $N8N_WEBHOOK_URL` body schema `alpha-content-pack`
6. Disable direct Twitter/LinkedIn post (Arcade off hoặc skip publish nodes)
7. Cron 08:00 `Asia/Ho_Chi_Minh` (host cron hoặc `scripts/crons`)
8. n8n: Webhook `content-ready`, disable Claude Writer
9. Test regression Zernio accountIds từ `config/n8n/brands.json`

---

## 3. Output schema

SSOT: `config/n8n/schemas/alpha-content-pack.schema.json`

Required: `brand`, `topic`, `telegram_brief`, `x_thread[]`, `threads_post`, `youtube_pack`, `compliance.status`

---

## 4. KHÔNG

- Không n8n AI Agent loop (#11138)
- Không Sonnet cho daily batch — **Haiku 4.5** default
- Không commit `.env`, API keys
- Không trading signal / entry SL TP trong content

---

## 5. Parallel validation

Chạy song song GoClaw Alpha (optional) 7 ngày — so sánh giọng + compliance trước khi cutover.

---

## 6. Báo cáo

```markdown
## F0 Alpha LC fork
- Commit/branch: ...
- TG preview: OK/FAIL
- Zernio post id: ...
- Model: haiku | sonnet
- Blocker: ...
```
