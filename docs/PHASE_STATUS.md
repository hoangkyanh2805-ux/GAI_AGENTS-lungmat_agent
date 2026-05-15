Phase 1-4 DONE:
- Local runtime works
- Typecheck clean
- E2E passed (37/37)
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
- E2E: 39/39 passing (added mock-verification and doc_id-presence tests)

Next:
Phase 5B — MarketSummaryAgent real data + Phase 6 — Production hardening
