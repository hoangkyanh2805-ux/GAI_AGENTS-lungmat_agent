# Next Steps — Lungmat Agent

> Checklist vận hành và lộ trình sau Phase 5B.  
> Tham chiếu kỹ thuật: [architecture.md](./architecture.md) · Vận hành Telegram: [SOP_LIVE_TELEGRAM_AGENT_PIPELINE_V1.md](./SOP_LIVE_TELEGRAM_AGENT_PIPELINE_V1.md) · Trạng thái phase: [PHASE_STATUS.md](./PHASE_STATUS.md)

**Cập nhật:** 2026-05-15

---

## Trạng thái hiện tại

| Phase | Trạng thái |
|-------|------------|
| 1–5A | Done (runtime, E2E 39/39, Telegram publish, Apify research) |
| 5B | Code + doc xong — **cần verify live** |
| 6 | Chưa bắt đầu (Docker, CI, deploy 24/7) |

Đã có trong codebase:

- Publish thống nhất: `src/publish/telegramPublish.ts`
- Yahoo market: `YAHOO_SYMBOL_MAP` (XAUUSD, forex, BTC/ETH, SPY/AAPL/…)
- `DailyReportAgent` + cron mặc định: focus vàng / XAUUSD
- SOP: `ADMIN_TELEGRAM_CHAT_ID`, `/debug_env`, luồng publish A / A′ / B

---

## 1. Verify live (ưu tiên — làm trước)

Làm theo [SOP §5–6, 8–10](./SOP_LIVE_TELEGRAM_AGENT_PIPELINE_V1.md).

### 1.1 Chuẩn bị `.env`

```env
MOCK_LLM=0
AGENT_SHARED_SECRET=<secret-mạnh>
TELEGRAM_BOT_TOKEN=<từ BotFather>
TELEGRAM_CHAT_ID=<id channel/group publish>
ADMIN_TELEGRAM_CHAT_ID=<id DM admin — chat riêng với bot>
APIFY_API_TOKEN=<nếu dùng research thật>
ANTHROPIC_API_KEY=<nếu dùng LLM thật>
```

| Biến | Vai trò |
|------|---------|
| `TELEGRAM_CHAT_ID` | Nơi bot **đăng bài** sau approve |
| `ADMIN_TELEGRAM_CHAT_ID` | DM admin nhận **draft cron** + nút Approve/Reject |

### 1.2 Checklist verify

| # | Việc | Pass khi |
|---|------|----------|
| 1 | Điền `.env` đủ biến trên | File lưu, restart server |
| 2 | `npm run dev` hoặc `npm run start` | Log: `[ENV] startup` có `"hasAdminChatId":true` |
| 3 | `GET http://localhost:3000/health` | `{"status":"OK"}` |
| 4 | Bot gửi `/debug_env` | `hasAdminChatId: true`, `mockLlm: false`, `telegramConfigured: true` |
| 5 | `/market_summary` với `tickers: ["XAUUSD"]` | Reply có giá + tóm tắt tiếng Việt (Yahoo, không mock) |
| 6 | `/write_thread` | Có draft + `approval_id` trong reply |
| 7 | Publish một bước (xem §1.3) | Message thật trên **channel** |
| 8 | (Tuỳ chọn) `/daily_report` hoặc đợi cron | Admin DM có draft + Approve → channel có bài |

### 1.3 Lệnh PowerShell mẫu

```powershell
$base = "http://localhost:3000"
$secret = "dev_secret_lungmat_2026"   # khớp AGENT_SHARED_SECRET trong .env
$headers = @{ "x-agent-secret" = $secret }

# Debug env
Invoke-RestMethod -Method POST -Uri "$base/agent/command" `
  -Headers $headers -ContentType "application/json" `
  -Body '{"command":"/debug_env","user":"ops","source":"manual","payload":{}}'

# Market summary (XAUUSD)
Invoke-RestMethod -Method POST -Uri "$base/agent/command" `
  -Headers $headers -ContentType "application/json" `
  -Body '{"command":"/market_summary","user":"ops","source":"manual","payload":{"tickers":["XAUUSD"]}}'

# Thread draft
$r = Invoke-RestMethod -Method POST -Uri "$base/agent/command" `
  -Headers $headers -ContentType "application/json" `
  -Body '{"command":"/write_thread","user":"ops","source":"manual","payload":{"topic":"gold XAUUSD"}}'
# Lấy approval_id từ /approval_list hoặc meta trong reply

$id = "<approval-uuid>"

# Publish một bước (cách A′)
Invoke-RestMethod -Method POST -Uri "$base/approval/$id/approve" `
  -Headers $headers -ContentType "application/json" `
  -Body '{"reviewed_by":"human","publish":true}'
```

### 1.4 Các cách publish (cùng engine)

| Cách | Mô tả |
|------|--------|
| **A** | `POST /approval/:id/approve` → rồi `/publish_telegram` với `approval_id` |
| **A′** | `POST /approval/:id/approve` body `{ "publish": true }` |
| **B** | `/approve_publish` hoặc nút **Approve** trên DM admin (cron / scheduler) |

Chi tiết: [architecture.md §14](./architecture.md#14-approval--publish-human-in-the-loop).

### 1.5 Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Fix |
|-------------|-------------|-----|
| Cron chạy nhưng không có DM admin | Thiếu `ADMIN_TELEGRAM_CHAT_ID` | Set biến, restart; `/debug_env` → `hasAdminChatId: true` |
| `mock_chat` / không gửi Telegram thật | `MOCK_LLM=1` | `MOCK_LLM=0`, restart |
| 401 Unauthorized | Sai `x-agent-secret` | Khớp với `.env` |
| Approve OK nhưng không lên channel | Sai `TELEGRAM_CHAT_ID` | Dùng id channel/group đúng |

Xem thêm: [SOP §11](./SOP_LIVE_TELEGRAM_AGENT_PIPELINE_V1.md).

---

## 2. Sau khi verify — đóng Phase 5B

- [ ] Hoàn thành checklist §1.2 (ít nhất bước 1–7)
- [ ] Sửa [PHASE_STATUS.md](./PHASE_STATUS.md): Phase 5B → **DONE**, ghi ngày verify
- [ ] (Tuỳ chọn) `git commit` — không commit file `.env`

Gợi ý commit message:

```text
Complete Phase 5B: unified publish, Yahoo market data, ops SOP
```

---

## 3. Vận hành hàng ngày (sau verify)

| Việc | Cách |
|------|------|
| Server 24/7 | Máy/VPS chạy `npm run start` liên tục |
| Cron vàng | Tự seed: research + `market_summary` XAUUSD (sáng/tối) — xem [architecture.md §5](./architecture.md#5-khởi-động-srcindexts) |
| Theo dõi queue | `/queue_status` hoặc `GET /queue` |
| Pending approve | `/approval_list` hoặc `GET /approval?status=pending` |
| Lỗi hệ thống | `/check_errors` |

---

## 4. Phase 6 — Production (Docker + CI đã có trong repo)

| Tài liệu | Nội dung |
|----------|----------|
| [DEPLOY.md](./DEPLOY.md) | Deploy VPS: `docker compose up -d` |
| [PHASE_6_PLAN.md](./PHASE_6_PLAN.md) | Chi phí, spec, checklist |

**CI local (giống GitHub):**

```bash
npm ci
npm run typecheck:ci
$env:MOCK_LLM="1"; $env:AGENT_SHARED_SECRET="dev_secret_lungmat_ci"; npm run test:e2e:ci
```

**VPS nhanh:**

```bash
git clone <repo> && cd lungmat-agent
cp .env.example .env && nano .env
docker compose up -d --build
curl http://localhost:3000/health
```

Thứ tự: **§1 verify live** → **DEPLOY.md** lên VPS.

---

## 5. Lộ trình tổng (copy checklist)

```text
[ ] 1. Verify live — checklist §1.2
[ ] 2. Server chạy liên tục + cron vàng
[ ] 3. PHASE_STATUS: 5B → DONE
[ ] 4. Phase 6: Docker + CI
[ ] 5. (Sau) Content automation mở rộng — Threads/X, vector DB
```

---

## 6. Tài liệu liên quan

| File | Dùng khi |
|------|----------|
| [architecture.md](./architecture.md) | Hiểu / sửa code — AI & dev đọc file này trước |
| [SOP_LIVE_TELEGRAM_AGENT_PIPELINE_V1.md](./SOP_LIVE_TELEGRAM_AGENT_PIPELINE_V1.md) | Setup Telegram + publish tay |
| [PHASE_STATUS.md](./PHASE_STATUS.md) | Trạng thái phase ngắn |
| [ROADMAP.md](./ROADMAP.md) | Vision dài hạn |
| `.cursor/rules/architecture.mdc` | Rule Cursor trỏ tới architecture |

---

*Khi hoàn thành mục trong checklist, cập nhật file này hoặc PHASE_STATUS cho đồng bộ.*
