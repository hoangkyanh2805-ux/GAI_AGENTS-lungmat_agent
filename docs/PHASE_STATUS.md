Phase 1-4 DONE:
- Local runtime works
- Typecheck clean
- E2E passed (39/39)
- GitHub pushed
- Google Drive sync enabled

Phase 4B — Telegram Real Publish: VERIFIED
- End-to-end flow: /research → /write_thread → /approval approve → /publish_telegram
- Real Telegram message delivered (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID configured)
- Approval workflow enforced (human must approve before publish)

Phase 5A — Real Apify Research Ingestion: DONE
- ApifyClient uses real Apify (apify/google-search-scraper) when APIFY_API_TOKEN is set
- Fallback to mock when APIFY_API_TOKEN absent, MOCK_LLM=1, or Apify request fails
- normalizeApifyItems() handles paginated (organicResults[]) and flat actor output formats
- FileLogger logs which mode is active (real/mock) + article count + doc_id
- ResearchAgent reply shows _(mock)_ tag when running in mock mode
- E2E: 39/39 passing

Phase 5B — Market data (Yahoo) + ops alignment: IN PROGRESS / MOSTLY DONE
- `YAHOO_SYMBOL_MAP`: XAUUSD, forex, BTC/ETH, SPY/AAPL/MSFT/NVDA → `scrapeYahooMarketData()`
- `DailyReportAgent` defaults aligned with cron (gold topic + XAUUSD)
- Unified publish: `src/publish/telegramPublish.ts` — `/approve_publish`, `/publish_telegram`, `POST /approval/:id/approve?publish=true`
- SOP updated: ADMIN_TELEGRAM_CHAT_ID, /debug_env hasAdminChatId, publish flows, market_summary, cron
- `docs/architecture.md` — single source of truth for AI/dev

Phase 6 — Docker + CI (in repo):
- `Dockerfile`, `docker-compose.yml`, `.dockerignore`
- `.github/workflows/ci.yml` — typecheck + e2e mock + docker build
- `docs/DEPLOY.md` — VPS deploy guide
- npm scripts `*:ci` for Linux/CI (no `runtime.js`)
- E2E: `POST /approval/:id/approve` with `publish: true`

Phase 5 — Persona Linh Cẩu: DONE
- `src/llm/persona.ts`, `withPersona` on MarketSummaryAgent
- `/start` skill (SupportAgent)

Phase 6 — Macro-aware market summary: CODE DONE (verify 6 sections in Telegram)
- `EconomicCalendarClient`, `ApifyClient.scrapeForexIntraday`
- MarketSummaryAgent: macro bundle + 6-section forced prompt

**Strategic pivot → XAUUSD Media OS:** 3 flagship brands (Alpha, Raymond, VIP 10X).
- Constitution: [XAUUSD_MEDIA_OS.md](./XAUUSD_MEDIA_OS.md)
- TG = bot/kênh per brand · X/Threads = **Typefully** per brand
- Plan: [PHASE_7_PLAN.md](./PHASE_7_PLAN.md)

AI work history: [ai-worklog/INDEX.md](./ai-worklog/INDEX.md)

Phase 7B — Multi-approve (TG / X / Threads): DONE
- `src/content/contentApprovals.ts`, `telegramCallback.ts`, callbacks `approve:tg|x|th:<id>`
- Admin DM 4 nút sau `/content`

Phase 7C — Typefully handoff: DONE
- `src/integrations/TypefullyClient.ts`, [SOP_TYPEFULLY_HANDOFF.md](./SOP_TYPEFULLY_HANDOFF.md)
- Approve X/Threads → copy Typefully (optional `TYPEFULLY_API_KEY`)

Phase 8 — Knowledge & Memory Expansion: PLAN READY (2026-05-17)
- Scope chốt theo [ROADMAP.md](./ROADMAP.md): vector DB + semantic retrieval + entity tracking + context stitching
- Plan chi tiết: [PHASE_8_PLAN.md](./PHASE_8_PLAN.md) — 3 sub-phases (8A vector foundation, 8B content archive, 8C entity + stitching)
- Pivot kỹ thuật: Voyage AI embeddings + Supabase pgvector, thay `RAGStore` keyword-count hiện tại
- Tiền điều kiện: Phase 7D + Track B `/coach` đóng
- VPS/multi-LLM/signal engine reconcile → Phase 9 Autonomous Ops + Phase 10 Production Deployment

Next:
- **7D** content cron + deprecate legacy commands (see [PHASE_7_PLAN.md](./PHASE_7_PLAN.md))
- **Verify live:** [NEXT_STEPS.md](./NEXT_STEPS.md), admin DM + Typefully paste
- **Phase 8A** Vector Foundation sau khi 7D đóng (see [PHASE_8_PLAN.md](./PHASE_8_PLAN.md))
- **Deploy VPS:** [DEPLOY.md](./DEPLOY.md) — đẩy về Phase 10
- Re-test `/market_summary` → 6 sections after macro patch
- **Phase 7A:** ✅ `/content <brand>` + `youtube_pack.shorts_script` + personas (see PHASE_7_PLAN)
