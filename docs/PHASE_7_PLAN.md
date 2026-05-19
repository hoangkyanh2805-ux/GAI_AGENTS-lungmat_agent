# Phase 7 — Multi-Brand Content (XAUUSD Media OS)

> **Pivot:** [XAUUSD_MEDIA_OS.md](./XAUUSD_MEDIA_OS.md) — 3 flagship brands, **Telegram = bot/kênh**, **X + Threads = Typefully** (không ưu tiên X API trong code).  
> Sale team: signal chi tiết. Bot: **content + distribution assist**.

**Đọc trước:** [architecture.md](./architecture.md) · [PHASE_STATUS.md](./PHASE_STATUS.md)

---

## 1. Topology (chốt)

| Platform | Tool | Code trong lungmat-agent |
|----------|------|---------------------------|
| Telegram | Bot per brand → `TELEGRAM_CHAT_ID_*` | ✅ `TelegramPublisherAgent` + `brands.json` |
| X | **Typefully** social set / brand | Export draft (7C) — optional API |
| Threads | **Typefully** (linked) | Cùng export pack |

**Mỗi brand:** Alpha, Raymond, VIP 10X = 1 TG channel + 1 X + 1 Threads.

---

## 2. Trạng thái code (audit)

### Giữ

- Approval gate, `telegramPublish.ts`, Research/Apify, RAG nội bộ
- Phase 6 infra (Docker, CI)
- `MarketSummaryAgent` → **intelligence input only** (không cron DM 8 channel)

### Thay / thêm

| Cũ | Mới |
|----|-----|
| Persona solo `Linh Cẩu` cho consumer | `personas/alpha.ts`, `raymond.ts`, `vip10x.ts` |
| `/write_thread` generic English | `/content <brand> <topic>` → 3 outputs |
| `XPublisherAgent` trực tiếp | **Typefully export** (7C) |
| 1 `TELEGRAM_CHAT_ID` | `config/brands.json` multi-brand |
| Cron `market_summary` DM admin | Cron `/content alpha|raymond|vip10x` (7D) |

---

## 3. Deliverables

### 7A — Multi-brand writer ✅ IMPLEMENTED

| ID | Task | Status |
|----|------|--------|
| 7A-1 | `config/brands.json` + `src/config/brands.ts` | ✅ |
| 7A-2 | `src/llm/personas/{alpha,raymond,vip10x}.ts` + `withBrandPersona` | ✅ |
| 7A-3 | `ContentAgent` + `youtube_pack.shorts_script` | ✅ |
| 7A-4 | `/content` + Router + commands | ✅ |
| 7A-5 | Approval with `brand` → per-channel TG env | ✅ |

**Acceptance:** `/content alpha liquidity XAUUSD` → TG + X + Threads + **YouTube Shorts script**; E2E case added.

### 7B — Multi-approve per platform ✅ IMPLEMENTED

| ID | Task | Status |
|----|------|--------|
| 7B-1 | `ApprovalRequest.platform` + `pack_id` | ✅ |
| 7B-2 | 3 approvals /content (tg, x, threads) | ✅ |
| 7B-3 | Callback `approve:tg\|x\|th:<id>` + admin DM buttons | ✅ |
| 7B-4 | `publishApprovedContent` chỉ cho `platform=telegram` | ✅ |

### 7C — Typefully handoff ✅ IMPLEMENTED

| ID | Task | Status |
|----|------|--------|
| 7C-1 | [SOP_TYPEFULLY_HANDOFF.md](./SOP_TYPEFULLY_HANDOFF.md) + `TypefullyClient` | ✅ |
| 7C-2 | `meta.typefully_copy_ready` + `formatTypefullyBundle` | ✅ |
| 7C-3 | Approve X → copy / optional API draft | ✅ |

**Fallback:** Admin copy từ Telegram DM → Typefully editor (screenshot workflow đã có).

### 7D — Daily ops

| ID | Task |
|----|------|
| 7D-1 | Cron 3 jobs: content alpha 7:00, raymond, vip10x (timezone VN) |
| 7D-2 | Tắt cron `market_summary` DM (hoặc chỉ internal RAG) |
| 7D-3 | `/help` menu theo brand; deprecate Sales/Memory/RAG commands |

---

## 4. Out of scope Phase 7

- Direct X/Threads API (trừ khi bỏ Typefully)
- 5 non-flagship TG channels
- `xauusd-ai-media-os/prompts/` monorepo merge (Phase 8)
- Trading execution / signal engine
- Visual auto-generation (TradingView = SOP manual)

---

## 5. Thứ tự

```text
7A → 7B → 7C (SOP trước, API sau) → 7D
```

---

## 6. Daily matrix (reminder)

| Brand | X | Threads | TG |
|-------|---|---------|-----|
| Alpha | 1 thread | 1 post | 1 brief |
| Raymond | 1 edu | 1 post | 1 brief |
| VIP 10X | 1 momentum | 1 post | 1 brief |

---

## 7. Verify

```text
/content alpha test liquidity narrative
→ 3 sections, tone Alpha
→ approve → đúng Alpha TG channel only

→ paste x_thread vào Typefully AlphaTradingLab_Elite → schedule
```

---

*Align với [XAUUSD_MEDIA_OS.md](./XAUUSD_MEDIA_OS.md). Confirm: `làm 7A media OS`.*
