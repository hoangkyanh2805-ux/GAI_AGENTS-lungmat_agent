# 🚩 PROJECT STATUS — XAUUSD AI Media OS

> **Single Source of Truth (SSOT)** cho coordination giữa Cowork / Cursor / Claude / Founder.
> **Mọi AI session PHẢI đọc file này đầu tiên. Cập nhật cuối session.**

**Last updated:** 2026-05-15 (Cowork)
**Repo:** `GAI_AGENTS-lungmat_agent` (a.k.a. `lungmat-agent`)
**Stack:** Node 20 + TS + Express + Telegram (long-poll) + Anthropic + Apify + Yahoo + ForexFactory + Supabase (optional)

---

## 📍 Hiện tại đang ở

**Phase 6 + Phase 7A/7B/7C** — code DONE trên tree, **chờ Founder verify live trên Telegram**.

| Phase | Code | Live verify |
|---|---|---|
| 1–5 (foundation → persona Linh Cẩu) | ✅ | ✅ |
| **6** Macro-aware MarketSummary 6 sections | ✅ (patch latest by **Cowork**) | ⏳ |
| **7A** `/content <brand> <topic>` multi-brand SubAgent | ✅ (by **Cursor**) | ⏳ |
| **7B** Multi-approve TG / X / Threads | ✅ (by **Cursor**) | ⏳ |
| **7C** Typefully handoff (copy + optional API) | ✅ (by **Cursor**) | ⏳ |
| **7D** Cron 3-brand + cleanup legacy commands | ⬜ Not started | ⬜ |

### Việc vừa làm xong
Cowork patch 2 chỗ trong `src/agents/MarketSummaryAgent.ts`:
- `macroText` luôn emit 3 sections (intraday / news / calendar) với placeholder khi data trống.
- System prompt ép **PHẢI** render đủ 6 sections (`📊 ⏱ 📰 📅 🎯 ⚠️`) — không tự skip khi data rỗng.

### Đang đợi (Blocker)
Founder verify trong Telegram theo `docs/VERIFY_LIVE_TELEGRAM.md`:
1. `/debug_env` → `hasAdminChatId:true`, `mockLlm:false`, `telegramConfigured:true`
2. `/market_summary` → reply có 6 headers
3. `/content alpha liquidity sweep XAUUSD test live` → admin DM 4-block pack + 3 approval buttons
4. Bấm ✅ TG / X / Threads → đúng channel Alpha + Typefully copy

---

## 🛠️ Quyết định kỹ thuật quan trọng (không re-debate)

- **3 brand:** Alpha / Raymond / VIP 10X. Constitution: `docs/XAUUSD_MEDIA_OS.md`.
- **Telegram** = bot per brand (`TELEGRAM_CHAT_ID_<BRAND>`). **X + Threads** = Typefully handoff, **không** auto-post.
- **`/content`** là SubAgent `ContentAgent` (Phase 7A). **`/write_thread`** (ThreadWriterAgent) tách riêng, không gọi từ ContentAgent. Hai luồng coexist; Media OS ưu tiên `/content`.
- **Market data:** Yahoo `GC=F` (Gold Futures) làm XAUUSD spot proxy — Yahoo `XAUUSD=X` returns 404. Forex pairs khác giữ `*=X`.
- **News:** Apify `apify/google-search-scraper` cho macro news (Fed/CPI/DXY).
- **Calendar:** ForexFactory public JSON (`nfs.faireconomy.media/ff_calendar_thisweek.json`) — no auth.
- **LLM:** Anthropic Claude — Sonnet cho analysis, Haiku cho routing. Persona `Linh Cẩu` (`src/llm/persona.ts`) cho user-facing agents.
- **Approval gate** chỉ kích hoạt cho **cron-fired / HTTP enqueue jobs**. User gõ `/command` trong Telegram = direct reply, bypass approval.
- **`MOCK_LLM=1`** short-circuit toàn pipeline LLM + embeddings (dev/test no-credit-burn).
- **Runtime sync:** `scripts/runtime.js` sync `G:\Other computers\…\GAI_AGENTS-lungmat_agent` → `C:\lungmat_agent` trước khi chạy nodemon. **G:\ là canonical.**

---

## ⏭️ Bước tiếp theo (Next Steps)

### Phải làm NGAY (Founder action)
Theo thứ tự trong `docs/VERIFY_LIVE_TELEGRAM.md`:

1. `/debug_env` → paste output
2. `/market_summary` → paste reply (verify 6 sections)
3. `/content alpha liquidity sweep XAUUSD test live` → paste reply + screenshot admin DM
4. Bấm ✅ TG → channel Alpha có post brief?
5. Bấm ✅ X → reply có social set `AlphaTradingLab_Elite`?
6. Bấm ✅ Threads → reply có `threads_post`?

### Sau khi 6 step pass
1. Cập nhật `docs/PHASE_STATUS.md` ghi ngày verify pass.
2. Log session vào `docs/ai-worklog/sessions/2026-05-15-verify-live-telegram.md`.
3. Mở **Phase 7D** (xem `docs/PHASE_7_PLAN.md §3.7D`):
   - 7D-1: Cron 3 jobs `/content alpha|raymond|vip10x` (timezone VN, 7:00 / 8:00 / 9:00)
   - 7D-2: Disable cron `market_summary` DM admin (hoặc chỉ internal RAG)
   - 7D-3: `/help` per brand + deprecate Sales/Memory/RAG commands

### Phase 8+ (long horizon, không cam kết deadline)
- VPS deploy production (Docker + Caddy + 24/7)
- Real X/Threads API (nếu bỏ Typefully)
- Multi-LLM adapter (GPT/Qwen/Gemini)
- Trading signal engine (separate sale team workflow)

---

## ⚠️ Lưu ý đặc biệt (đừng quên)

- **KHÔNG đụng** `RouterAgent` / `SafetyAgent` / `SupervisorAgent` khi chưa align với owner phase.
- **KHÔNG commit** `.env` vào git. Token + API key chỉ trong env hoặc Cowork secrets vault.
- **KHÔNG paste** API key / chat ID nguyên bản vào chat/screenshot. (1 lần đã rotate Anthropic vì lộ.)
- **Approval flow** chỉ cho cron-fired / HTTP enqueue. User-triggered `/command` trong Telegram = direct reply, KHÔNG qua approval.
- **`Edit` tool** đôi khi silent-truncate file lớn. Sau mọi edit > 50 lines → **Grep verify** ngay.
- **Bash mount** workspace có thể stale (cache delay). `Read`/`Write`/`Glob`/`Edit` qua G:\ host path là canonical.
- **Nodemon chỉ watch `src/**/*.ts`** — sửa `.env` → phải kill node + restart manual.

---

## 👥 Role boundaries (per `docs/MEDIA_OS_COORDINATION.md`)

| Role | Làm | KHÔNG làm |
|---|---|---|
| **Cowork** (chat session điều phối) | Verify checklist, nudge founder, small targeted prompt patches, brief Cursor/Claude Code | Code TypeScript structural changes, auto-approve, viết feature lớn |
| **Cursor** (IDE in repo) | Code mới, refactor, debug, update `docs/architecture.md` + `ai-worklog/` | Viết chiến lược brand dài hạn |
| **Claude** (chat strategy) | Brand tone, season campaign, messaging guardrails | Merge PR, sửa Router/Supervisor code |
| **Founder** | Final approval, schedule Typefully + YouTube, business decisions | (anything AI can/should do — không cần làm bằng tay) |

---

## 📂 Tài liệu key (đọc đúng cái khi cần)

| File | Khi cần |
|---|---|
| `docs/PHASE_STATUS.md` | Roadmap tổng quan + ngày done từng phase |
| `docs/PHASE_7_PLAN.md` | Chi tiết Phase 7A/B/C/D |
| `docs/XAUUSD_MEDIA_OS.md` | Constitution — strategic pivot |
| `docs/MEDIA_OS_COORDINATION.md` | Phân vai Cowork / Cursor / Claude |
| `docs/VERIFY_LIVE_TELEGRAM.md` | Checklist verify từng step |
| `docs/SOP_TYPEFULLY_HANDOFF.md` | SOP copy X/Threads sang Typefully |
| `docs/SOP_LIVE_TELEGRAM_AGENT_PIPELINE_V1.md` | SOP toàn pipeline |
| `docs/architecture.md` | Code-level architecture (cho Cursor) |
| `docs/ai-worklog/INDEX.md` | Log từng session AI |
| `docs/COWORK_ALIGNMENT_QA.md` | Q&A align Cowork context |

---

## 🔄 Handoff Protocol (BẮT BUỘC)

### Khi BẮT ĐẦU session AI mới (Cowork / Cursor / Claude):
Founder paste câu này đầu chat:
```
Hãy đọc file @PROJECT_STATUS.md để nắm trạng thái hiện tại của dự án.
Khi đã hiểu, xác nhận với tôi và đợi lệnh tiếp theo.
```

### Khi KẾT THÚC session (trước khi tắt chat / hết limit):
Founder paste:
```
Hãy tóm tắt tiến độ session này, các quyết định vừa đưa ra,
và bước tiếp theo. Cập nhật vào file @PROJECT_STATUS.md.
```

AI cập nhật cần sửa:
- `**Last updated:**` timestamp
- Table phase status (tick ✅ nếu vừa pass)
- Section **Việc vừa làm xong**
- Section **Đang đợi (Blocker)** (blocker mới)
- Section **Bước tiếp theo** nếu order thay đổi

---

*Biên bản công ty AI. Mỗi session 1 cập nhật. Không có file này, mỗi Bot đều "mất trí nhớ".*
