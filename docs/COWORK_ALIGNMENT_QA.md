# Cowork alignment — Q&A (Phase 6 vs Phase 7)

> Copy hoặc bookmark file này khi sync context giữa Cowork, Cursor và founder.  
> Cập nhật khi roadmap đổi.

---

## Sync context cho Cowork

**Không phải hai codebase khác nhau:** Media OS Phase 7 đã nằm **trong cùng repo** `lungmat-agent`. Phase 6 (`MarketSummaryAgent`, macro 6 sections) và Phase 7 (`/content`, đa kênh, Typefully) **song song trên một tree** — chỉ khác **session/chat** Cowork đang xem.

`/content` **đã là SubAgent**, không phải skill rời hay fallback Router → Support.

---

### 1. `/content` làm gì? Thuộc agent nào?

- **Lệnh:** `/content <brand> <topic>` (`brand`: `alpha` | `raymond` | `vip10x`).
- **Router:** `RouterAgent` map **`'/content' → role `'content'`** → **`ContentAgent`** (`src/agents/ContentAgent.ts`).
- **Đăng ký:** `commands.ts` (`CONTENT` → agent `content`), `types` có `AgentRole 'content'`, `index.ts` có `new ContentAgent()` trong list Supervisor.
- **Hành vi:** Research (Apify), Claude JSON → **`ContentPack`**: `telegram_brief`, `x_thread`, `threads_post`, `youtube_pack` (ưu tiên Shorts script). Tạo **3 approval** (TG / X / Threads) + DM admin nút 7B; TG approve → `telegramPublish`; X/Threads → copy Typefully (7C).

---

### 2. TG / X / Threads / Typefully — flow & ThreadWriterAgent

| Kênh | Trong code |
|------|------------|
| **TG** | `publishApprovedContent` chỉ khi `platform === 'telegram'`, route `TELEGRAM_CHAT_ID_<BRAND>`. |
| **X + Threads** | **Không** auto-post qua X API / Meta Threads API trong scope Phase 7. Output trong reply + approve → **handoff copy** vào Typefully (human schedule). |
| **ThreadWriterAgent** | Path **riêng** `/write_thread` — **không** được `ContentAgent` gọi. `/content` sinh `x_thread` trực tiếp trong một lần LLM (multi-brand persona). Hai luồng có thể cùng tồn tại; Media OS ưu tiên storyteller là **`/content`**. |
| **ThreadsPublisher / API Meta** | **Chưa có** “TelegramPublisher equivalent” cho Threads — chỉ text trong pack + nút approve Threads → reply copy. |
| **Typefully** | Mặc định: **handoff** (text + SOP). **`TypefullyClient`**: optional `TYPEFULLY_API_KEY` — thử draft API khi có key; fail/mock → vẫn copy tay. Không có “mở URL pre-filled” như một redirect chuẩn trong code — chủ yếu copy vào editor Typefully. |

---

### 3. “7D cron” nghĩa là gì?

**7D = Phase 7 deliverable D** (“Daily ops”), **không** phải “7 ngày”, **không** phải “7 cron tuỳ ý”.

Theo `docs/PHASE_7_PLAN.md`:

- **7D-1:** Cron **3 job** (vd. Alpha ~7:00, Raymond, VIP10X — timezone VN) enqueue **`/content`** từng brand.
- **7D-2:** Giảm/tắt cron **`market_summary`** DM admin (hoặc chỉ internal/RAG).
- **7D-3:** `/help` theo brand + deprecate một số lệnh legacy (Sales/Memory/RAG…) khi product chốt.

---

### 4. Use case XAUUSD solo trader vs content pipeline?

Chiến lược repo đã **pivot** sang **XAUUSD AI Media OS** (constitution `docs/XAUUSD_MEDIA_OS.md`): **sale/signal** một đường, **bot** hỗ trợ **content + phân phối** (TG kênh brand + X/Threads qua Typefully + YouTube script tay).

Với câu “chỉ trade XAUUSD”:

- **(a)** Share insight lên social / personal brand — **có thể** là một nhánh (đặc biệt nếu dùng 1 brand như Alpha).
- **(b)** **Vận hành team content** song song trading — **đúng hướng** pivot hiện tại (multi-brand, approval, Typefully).
- **(c)** Khác: có thể coexist — ví dụ **`/market_summary`** cho trader đọc nhanh; **`/content`** cho ops đăng đa kênh.

Cowork nên coi **Phase 6** = intelligence/trader-facing summary; **Phase 7** = creator/ops pipeline — cùng codebase, khác use case.

---

### 5. SubAgent `/content` — đã elevate chưa?

**Đã có** `ContentAgent` + file integration liên quan (`contentPack`, `contentApprovals`, `TypefullyClient`, v.v.). Skeleton Cowork liệt ra **trùng phần lớn những gì đã implement** — không cần “tạo ContentAgent từ đầu”, chỉ cần **đọc đúng branch/repo** và **`git pull` / mở đúng workspace**.

Đề xuất thứ tự Cowork vẫn hợp lý:

1. Verify Phase 6: `/market_summary` đủ **6 sections** (Telegram).
2. Verify Phase 7: **`/content`** + admin DM + TG publish + copy Typefully (`docs/VERIFY_LIVE_TELEGRAM.md`).
3. Sau đó mới **7D cron** + cleanup lệnh — tránh conflict vì đây là chỉnh `index.ts` scheduler / cron definitions.

---

### Tài liệu then chốt để Cowork đọc một lần

| File | Nội dung |
|------|----------|
| `docs/PHASE_STATUS.md` | Trạng thái phase ngắn |
| `docs/PHASE_7_PLAN.md` | 7A–7D tasks |
| `docs/XAUUSD_MEDIA_OS.md` | Constitution Media OS |
| `docs/MEDIA_OS_COORDINATION.md` | Cowork · Cursor · Claude |
| `docs/VERIFY_LIVE_TELEGRAM.md` | Checklist verify Telegram |

---

## Liên quan

- [MEDIA_OS_COORDINATION.md](./MEDIA_OS_COORDINATION.md)
