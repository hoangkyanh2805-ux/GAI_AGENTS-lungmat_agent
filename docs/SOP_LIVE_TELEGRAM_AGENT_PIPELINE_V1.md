# SOP — Live Telegram Publish Pipeline (AI Agent System)

## Mục tiêu

Thiết lập và verify thành công pipeline:

```text
AI Agent
→ Approval Queue
→ Manual Approve
→ Telegram Publisher
→ Telegram Channel/Group thật
```

Dùng lại SOP này cho mọi dự án AI Agent về sau.

---

# 1. Chuẩn bị môi trường

## Yêu cầu

* NodeJS
* npm
* Git
* Telegram account
* Bot Telegram từ BotFather
* Local project runtime

---

# 2. Clone + chạy project

## Mở terminal

```powershell
cd "G:\Other computers\My Computer\Project\GAI_AGENTS-lungmat_agent"
```

## Install package

```powershell
npm install
```

## Chạy dev server

```powershell
npm run dev
```

---

# 3. Fix lỗi port 3000 bị chiếm

## Lỗi

```text
EADDRINUSE: address already in use :::3000
```

## Fix

Kill toàn bộ node:

```powershell
taskkill /F /IM node.exe
```

Sau đó chạy lại:

```powershell
npm run dev
```

---

# 4. Setup Telegram thật

## Tạo bot

Telegram → BotFather:

```text
/newbot
```

Lấy:

* TELEGRAM_BOT_TOKEN

---

## Lấy TELEGRAM_CHAT_ID

### Cách nhanh

1. Add bot vào group/channel
2. Gửi 1 tin nhắn bất kỳ
3. Mở:

```text
https://api.telegram.org/bot<TOKEN>/getUpdates
```

4. Tìm:

```json
"chat": {
  "id": -100xxxxxxxxxx
}
```

Đó là TELEGRAM_CHAT_ID (channel/group nơi bot **publish** bài).

---

## Lấy ADMIN_TELEGRAM_CHAT_ID (DM admin — draft cron + nút Approve)

Cần cho job tự động (`research`, `market_summary`) gửi draft vào **chat riêng** của admin, không phải channel.

1. Mở chat **1-1** với bot (Start bot).
2. Gửi một tin bất kỳ (ví dụ `/debug_env`).
3. Mở `getUpdates` (cùng URL như trên).
4. Tìm chat **private** với `"type": "private"` — `id` là số dương (ví dụ `123456789`).

```env
ADMIN_TELEGRAM_CHAT_ID=123456789
```

Nếu thiếu biến này: cron vẫn chạy nhưng **không** gửi DM approve — log: `ADMIN_TELEGRAM_CHAT_ID not set — skipping approval gate`.

---

# 5. Setup .env

## File `.env`

```env
PORT=3000
AGENT_SHARED_SECRET=dev_secret_lungmat_2026
NODE_ENV=development

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

TELEGRAM_BOT_TOKEN=YOUR_TOKEN
TELEGRAM_CHAT_ID=-100xxxxxxxxxx
ADMIN_TELEGRAM_CHAT_ID=123456789

APIFY_API_TOKEN=
ANTHROPIC_API_KEY=

MOCK_LLM=0
```

## Quan trọng

Nếu còn:

```env
MOCK_LLM=1
```

thì Telegram chỉ publish giả lập (`mock_chat`).

---

# 6. Verify server chạy

Mở browser:

```text
http://localhost:3000
```

Nếu thấy:

```json
{"status":"OK"}
```

=> server sống.

---

## 6.1 Verify env qua bot hoặc API

### Telegram (nhanh)

Gửi bot:

```text
/debug_env
```

Kiểm tra trong reply JSON:

| Field | Mong đợi (live) |
|-------|------------------|
| `mockLlm` | `false` |
| `telegramConfigured` | `true` |
| `hasAdminChatId` | `true` |
| `hasApifyToken` | `true` (nếu dùng research thật) |

### PowerShell

```powershell
Invoke-RestMethod -Method POST `
  -Uri "$base/agent/command" `
  -Headers @{"x-agent-secret"=$secret} `
  -ContentType "application/json" `
  -Body '{"command":"/debug_env","user":"ops","source":"sop","payload":{}}'
```

### Log startup

Khi `npm run dev`, dòng:

```text
[ENV] startup {"hasAdminChatId":true,...}
```

---

# 7. Tạo AI thread draft

## PowerShell variables

```powershell
$base="http://localhost:3000"
$secret="dev_secret_lungmat_2026"
```

---

## Generate thread

```powershell
Invoke-RestMethod -Method POST `
-Uri "$base/agent/command" `
-Headers @{"x-agent-secret"=$secret} `
-ContentType "application/json" `
-Body '{"command":"/write_thread AI agents replacing SaaS"}'
```

---

# 8. Xem approval queue

```powershell
$list = Invoke-RestMethod -Method POST `
-Uri "$base/agent/command" `
-Headers @{"x-agent-secret"=$secret} `
-ContentType "application/json" `
-Body '{"command":"/approval_list"}'
```

## Xem queue

```powershell
$list.reply
```

Ví dụ:

```text
[pending] 88a8b2d9-a266-4fde-a51e-fe75c8c0f80f
```

Copy full ID.

---

# 8.1 Luồng publish thống nhất (một engine)

Mọi cách publish đều gọi `src/publish/telegramPublish.ts` → `TelegramClient.sendMessage(TELEGRAM_CHAT_ID, content)`.

| Cách | Khi nào dùng |
|------|----------------|
| **A — Hai bước HTTP** | `POST /approval/:id/approve` rồi `/publish_telegram` |
| **A′ — Một bước HTTP** | `POST /approval/:id/approve` body `{ "publish": true }` |
| **B — Một bước command** | `/approve_publish` + `approval_id` (nút Telegram DM dùng cách này) |
| **C — Sau khi đã approve** | Chỉ `/publish_telegram` |

---

# 9. Publish Telegram thật

## Set ID

```powershell
$id="88a8b2d9-a266-4fde-a51e-fe75c8c0f80f"
```

---

## Build payload đúng chuẩn

```powershell
$body = @{
    command="/publish_telegram"
    payload=@{
        approval_id=$id
    }
} | ConvertTo-Json -Depth 5
```

---

## Publish (cách A — hai bước)

Trước tiên approve (nếu chưa):

```powershell
Invoke-RestMethod -Method POST `
  -Uri "$base/approval/$id/approve" `
  -Headers @{"x-agent-secret"=$secret} `
  -ContentType "application/json" `
  -Body '{"reviewed_by":"human"}'
```

Rồi publish:

```powershell
Invoke-RestMethod -Method POST `
-Uri "$base/agent/command" `
-Headers @{"x-agent-secret"=$secret} `
-ContentType "application/json" `
-Body $body
```

## Publish (cách A′ — một bước)

```powershell
Invoke-RestMethod -Method POST `
  -Uri "$base/approval/$id/approve" `
  -Headers @{"x-agent-secret"=$secret} `
  -ContentType "application/json" `
  -Body '{"reviewed_by":"human","publish":true}'
```

## Publish (cách B — command)

```powershell
$body = @{
  command="/approve_publish"
  payload=@{ approval_id=$id }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Method POST `
  -Uri "$base/agent/command" `
  -Headers @{"x-agent-secret"=$secret} `
  -ContentType "application/json" `
  -Body $body
```

---

# 9.1 Market summary (Phase 5B — XAUUSD / Yahoo)

```powershell
Invoke-RestMethod -Method POST `
  -Uri "$base/agent/command" `
  -Headers @{"x-agent-secret"=$secret} `
  -ContentType "application/json" `
  -Body '{"command":"/market_summary","user":"ops","source":"sop","payload":{"tickers":["XAUUSD"]}}'
```

Thành công khi reply có giá + phân tích tiếng Việt, không phụ thuộc Google scrape cho XAUUSD.

---

# 9.2 Cron / daily report (vàng)

Server tự seed cron (sáng/tối `XAUUSD` + research gold). Cần:

* Server chạy liên tục
* `hasAdminChatId: true`
* Admin bấm **Approve** trên DM → publish channel (cách B)

Hoặc tay:

```powershell
Invoke-RestMethod -Method POST ... -Body '{"command":"/daily_report","user":"ops","source":"sop","payload":{}}'
```

Mặc định: 1 research topic gold + `market_summary` XAUUSD + `write_thread`.

---

# 10. Verify LIVE thành công

## Thành công thật khi thấy:

Terminal:

```text
Published to Telegram!
chat_id=-100xxxx
```

Telegram:

```text
Bot gửi message thật vào channel/group
```

---

# 11. Các lỗi phổ biến

## 11.1 Unauthorized invalid x-agent-secret

### Nguyên nhân

Sai header secret.

### Fix

```powershell
$secret="dev_secret_lungmat_2026"
```

---

## 11.2 Approval not found or already reviewed

### Nguyên nhân

* dùng sai ID
* chỉ copy short ID
* approval đã approve trước đó

### Fix

Dùng full UUID từ `/approval_list`.

---

## 11.3 Missing approval_id in payload

### Nguyên nhân

JSON PowerShell sai format.

### Fix

Luôn dùng:

```powershell
ConvertTo-Json -Depth 5
```

---

## 11.4 mock_chat xuất hiện

### Nguyên nhân

```env
MOCK_LLM=1
```

### Fix

```env
MOCK_LLM=0
```

Restart server.

---

## 11.5 Scheduler không gửi draft admin

### Nguyên nhân

* `ADMIN_TELEGRAM_CHAT_ID` trống → `hasAdminChatId: false`
* `MOCK_LLM=1` → Telegram receiver tắt (cron vẫn enqueue job)

### Fix

Set `ADMIN_TELEGRAM_CHAT_ID`, `MOCK_LLM=0`, restart. Kiểm tra `/debug_env`.

---

## 11.6 npm ENOENT package.json

### Nguyên nhân

Run npm sai folder.

### Fix

```powershell
cd "PROJECT_FOLDER"
npm run dev
```

---

# 12. Commit trạng thái stable

```powershell
git status
git add .
git commit -m "Verify real Telegram publishing flow"
git push
```

---

# 13. Kết quả cuối cùng

## Runtime đã hoạt động:

```text
SupervisorAgent
RouterAgent
ResearchAgent
ThreadWriterAgent
TelegramPublisherAgent
OpsAgent
RAGAgent
DailyReportAgent
```

## Pipeline hoạt động:

```text
AI Generate
→ Approval Queue
→ Manual Review
→ Telegram Publish
→ Real Telegram Delivery
```

---

# 14. Tên SOP chuẩn

```text
SOP_LIVE_TELEGRAM_AGENT_PIPELINE_V1
```

---

# 15. Dùng lại cho dự án khác

Chỉ cần đổi:

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
ADMIN_TELEGRAM_CHAT_ID=
AGENT_SHARED_SECRET=
```

Tham chiếu kỹ thuật đầy đủ: `docs/architecture.md`.

Các bước còn lại giữ nguyên.
