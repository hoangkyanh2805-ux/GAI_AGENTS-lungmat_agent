# Audit — langchain-ai/social-media-agent (Winner Layer 1)

> **Repo:** https://github.com/langchain-ai/social-media-agent  
> **License:** MIT  
> **Ngày:** 2026-05-22  
> **Re-rank:** **#1 / 16** — content factory chính LungMat  
> **Clone target:** [`oss-forks/social-media-agent-lungmat/`](../../oss-forks/social-media-agent-lungmat/)

---

## Executive summary

| Metric | Giá trị |
|--------|---------|
| **Score Alpha** | **~88/100** (sau custom Threads + TG + pack.json) |
| **Production-ready** | Có — LangChain official, ~2.6k ⭐, active |
| **Trading fit** | Cao **sau** custom persona + URL feed forex |
| **Blocker gốc** | Chỉ X+LinkedIn publish; HITL = Slack/Inbox — **không Threads** |

**Winner vì:** LangGraph multi-step (validate → relevance → generate) + Claude + FireCrawl URL + HITL + cron — gần nhất pipeline Alpha, hơn ai-twitter-bot (BART, no approval).

---

## 1. Repo profile

| Hạng mục | Chi tiết |
|----------|----------|
| Stack | TypeScript, Yarn, **LangGraph** CLI |
| LLM | **Anthropic** (Claude) — align SKILL Alpha |
| Input | URL (blog, GitHub, YouTube); Slack link ingest |
| Scrape | **FireCrawl** |
| Auth publish | **Arcade** hoặc Twitter/LinkedIn OAuth |
| Approval | **Human-in-the-loop** + [Agent Inbox](https://dev.agentinbox.ai/) |
| Schedule | `scripts/crons/` + LangGraph Platform |
| Basic mode | Thiếu GitHub/Twitter parse, Slack, **images** |

---

## 2. Ma trật 8 tiêu chí (Alpha)

| Tiêu chí | Gốc | Sau fork LungMat |
|----------|-----|------------------|
| Generate | ✅ multi-node | ✅ + `prompts/alpha-persona` |
| Human approval | ✅ HITL / Inbox | ✅ **Telegram** adapter (thay Slack) |
| X | ✅ | Draft trong pack → Zernio |
| Threads | ❌ | ✅ `threads_post` trong pack → Zernio |
| Media | △ Supabase (advanced) | M0: n8n manual `mediaId` |
| n8n JSON | N/A | Webhook consumer |
| XAUUSD | LangChain marketing default | `BUSINESS_CONTEXT`, `TWEET_EXAMPLES` |
| Zernio | Arcade/Twitter API | **webhook-out** node |

---

## 3. Code map (customize hooks)

> Paths theo README upstream — verify sau `git clone`.

| Mục đích | Path (upstream) |
|----------|-----------------|
| Persona / rules | `src/agents/generate-post/prompts/index.ts` |
| Few-shot tweets | `src/agents/generate-post/prompts/examples.ts` |
| Marketing report prompt | `src/agents/generate-post/nodes/generate-report/prompts.ts` |
| Graph entry | `generate_post` (LangGraph) |
| Slack ingest / notify | Slack app + `scripts/crons/create-cron.ts` |
| Env quickstart | `.env.quickstart.example` |
| Env full | `.env.full.example` |
| Run local | `yarn langgraph:in_mem:up` → port **54367** |
| CLI generate | `yarn generate_post` |

### 3.1 Fork tasks (F0)

| # | Task | Effort |
|---|------|--------|
| 1 | Clone → `oss-forks/social-media-agent-lungmat/` | 15m |
| 2 | Replace Slack notifications → **Telegram Bot API** (`TELEGRAM_BOT_TOKEN`, `N8N_TELEGRAM_ADMIN_CHAT_ID`) | 3h |
| 3 | Optional: giữ Agent Inbox **hoặc** chỉ TG | 1h |
| 4 | Add `webhook-out` node: POST `pack.json` thay publish Twitter | 2h |
| 5 | Map output → `alpha-content-pack.schema.json` (`x_thread`, `threads_post`, `compliance`) | 2h |
| 6 | Inject [`oss-forks/prompts/alpha-persona.md`](../../oss-forks/prompts/alpha-persona.md) | 1h |
| 7 | `BRAND_ID=alpha`, cron 08:00 VN | 1h |
| 8 | Parallel run 7 ngày vs GoClaw (optional) | — |
| **Tổng F0** | | **10–15h** |

---

## 4. So với 4 nguồn template (re-rank)

| # | Nguồn | Stars | Verdict |
|---|-------|-------|---------|
| 1 | **langchain social-media-agent** | ★★★★★ | **Winner Layer 1** |
| 2 | n8n #3066 LePage | ★★★★ | Reference only — strip AI, steal approval pattern |
| 3 | n8n #2950 | ★★ | **SKIP** |
| 4 | Gist omergocmen | ★★ | **SKIP** |

---

## 5. So với ai-twitter-bot (hạ hạng #6)

| | LC agent | ai-twitter-bot |
|--|----------|----------------|
| Approval | HITL built-in | None |
| LLM | Claude | BART local |
| Pipeline | LangGraph nodes | linear script |
| URL ingest | FireCrawl | NewsAPI keywords only |
| Ecosystem | LangChain | standalone Python |

---

## 6. Deploy

### 6.1 Local (dev)

```bash
cd oss-forks/social-media-agent-lungmat
yarn install
cp ../.env.alpha.example .env
# fill ANTHROPIC_API_KEY, FIRECRAWL_API_KEY, TELEGRAM_*, N8N_WEBHOOK_URL
yarn langgraph:in_mem:up
yarn generate_post
```

### 6.2 Docker (prod)

- Dùng [`docker-compose.factory.yml`](../../docker-compose.factory.yml) service `social-media-agent-alpha`
- LangGraph in-memory **không** cho prod — cân nhắc LangGraph Platform hoặc custom Dockerfile từ repo

### 6.3 Env (Alpha)

See [`oss-forks/.env.alpha.example`](../../oss-forks/.env.alpha.example).

---

## 7. Rủi ro

| Rủi ro | Mitigation |
|--------|------------|
| Không Threads native | `threads_post` + Zernio Layer 3 |
| LinkedIn output thừa | Bỏ LinkedIn publish; giữ field optional |
| FireCrawl cost | 500 free credits; fin-thread feeder sau |
| Arcade vs Zernio | Disable Arcade publish; webhook only |
| TypeScript complexity | Audit này + Cowork brief |

---

## 8. Phase roadmap

| Phase | Nội dung |
|-------|----------|
| **F0** | Alpha POC — fork lungmat |
| **F1** | raymond + linhcau copies (env + persona) |
| **F2** | TradingAgents → VIP10X premium webhook |
| **F3** | fin-thread / Horizon → URL queue |

---

## 9. Links

- Brief Cowork: [`briefs/oss-fork-alpha-content-factory-brief.md`](../briefs/oss-fork-alpha-content-factory-brief.md)
- Catalog + ranking 16: [`ALPHA_OSS_CONTENT_FACTORY_CATALOG.md`](../ALPHA_OSS_CONTENT_FACTORY_CATALOG.md)
- Layer 2: [`workflows/alpha-m0.template.json`](../../workflows/alpha-m0.template.json)
