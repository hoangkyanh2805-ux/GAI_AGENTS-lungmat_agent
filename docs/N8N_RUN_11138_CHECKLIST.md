# Chạy luồng Alpha M0 (#11138 fork) — điền key & checklist

> Canvas: **AI Agent Content** → Claude Sonnet → Telegram → Zernio.  
> File: [`workflows/alpha-m0-11138-telegram.template.json`](../workflows/alpha-m0-11138-telegram.template.json)

**Node đỏ (!)** trên ảnh = thiếu **credential** hoặc **Variables** — làm đúng thứ tự dưới.

---

## Bước 0 — n8n cho phép biến môi trường

Nếu lỗi *access to env vars denied*:

1. **Settings** (góc trái) → **Security** hoặc **Environment**
2. Bật cho phép workflow dùng **environment variables** / `$env` trong expressions
3. **Save** → reload workflow

- [ ] Không còn lỗi env khi Execute node dùng `$env.ZERNIO_*`

---

## Bước 1 — Variables (một chỗ, 4 biến)

**Settings → Variables → Add variable** (tên copy chính xác):

| # | Tên | Lấy ở đâu | [ ] |
|---|-----|------------|-----|
| 1 | `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys → `sk-ant-...` | |
| 2 | `ZERNIO_API_KEY` | Zernio dashboard → API / token | |
| 3 | `ZERNIO_API_BASE` | Base URL API (tenant) — **không đoán**; từ doc Zernio | |
| 4 | `N8N_TELEGRAM_ADMIN_CHAT_ID` | Số chat Founder — xem **Bước 2b** | |

**Chưa cần:** `N8N_MEDIA_SHEET_ID` (Sheet đang tắt).

- [ ] Đủ 4 biến
- [ ] Không paste key vào sticky / node text

---

## Bước 2 — Telegram Bot (1 credential → 5 node)

### 2a. Tạo credential

1. [@BotFather](https://t.me/BotFather) → `/newbot` hoặc dùng bot sẵn → copy **token**
2. n8n → **Credentials** → **Add credential** → **Telegram API**
3. **Access Token** = paste token → **Save**
4. Đặt tên: `Telegram Alpha Bot`

### 2b. Lấy Chat ID (Founder)

1. Founder mở bot → **Start** → gửi `hi`
2. Trình duyệt (thay `TOKEN`):

   `https://api.telegram.org/botTOKEN/getUpdates`

3. Tìm `"chat":{"id": -100xxxxxxxx}` → paste vào Variable `N8N_TELEGRAM_ADMIN_CHAT_ID`

### 2c. Gắn credential vào **từng node đỏ Telegram**

Mở node → **Credential to connect with** → chọn `Telegram Alpha Bot`:

| Node | [ ] |
|------|-----|
| **Listen for incoming events** | |
| **Send proposal to user** | |
| **Telegram FAIL** | |
| **Send and wait approval** | |
| **Confirm Published** | |

- [ ] Cả 5 node hết dấu đỏ credential

### 2d. Bật workflow nếu dùng Telegram Trigger

1. **Listen for incoming events** phải có webhook (n8n cloud tự tạo khi **Activate**)
2. Workflow → toggle **Active** (góc trên phải)

- [ ] Active ON (nếu test bằng nhắn bot)
- [ ] Hoặc chỉ test **Manual Trigger** trước → Active sau

---

## Bước 3 — Claude Sonnet (node đỏ AI)

1. **Credentials** → **Add** → **Anthropic**
2. **API Key** = cùng `sk-ant-...` (hoặc dùng key riêng trong credential)
3. Mở node **Claude Sonnet** (dưới AI Agent) → chọn credential **Anthropic**
4. Model: `claude-sonnet-4-20250514` (hoặc Sonnet production đang dùng)
5. **Execute step** trên **Claude Sonnet** (sau Bootstrap có data) — không 401/402

| Lỗi | Sửa |
|-----|-----|
| 401 | Sai API key |
| 402 / credit | Nạp credit Anthropic |
| Missing model | Đổi model trong dropdown |

- [ ] **Claude Sonnet** hết đỏ
- [ ] **AI Agent Content** chạy được (có `output` text)

---

## Bước 4 — Zernio Publish (HTTP)

Không cần credential riêng nếu dùng `$env` — cần **Bước 0 + Bước 1**.

1. Mở **Zernio Publish**
2. URL = `{{ $env.ZERNIO_API_BASE }}/v1/posts` — **placeholder**; sửa khi test publish (Bước 6)
3. Header `Authorization` = `Bearer {{ $env.ZERNIO_API_KEY }}`

- [ ] Variables Zernio đã có
- [ ] Execute node (sau Parse Approval + mediaId) — ghi nhận status code

---

## Bước 5 — Google Sheet (bỏ qua M0 test)

Node **Google Sheet Log** = **disabled** → không cấu hình.

- [ ] Để **disabled** cho đến khi publish ổn 3 lần

---

## Bước 6 — Chạy thử (checklist run)

### Chuẩn bị ảnh (K3)

- [ ] Upload 1 ảnh lên **Zernio → Media** → copy **`mediaId`**

### Cách A — Manual (khuyên lần đầu)

| # | Việc | Pass |
|---|------|------|
| 1 | **Save** workflow | |
| 2 | **Cron** = disabled | |
| 3 | Click **Manual Trigger** → **Execute workflow** | |
| 4 | **Bootstrap** xanh | |
| 5 | **AI Agent** → gửi thêm tin TG *hoặc* chờ output (lần đầu có thể cần nhắn bot topic) | |
| 6 | Trên TG: trao đổi draft → gõ **`OK`** / **`approved`** để AI trả JSON | |
| 7 | **Parse Pack + Compliance** → **PASS** | |
| 8 | **Send and wait approval** → TG hỏi OK đăng | |
| 9 | Reply: `OK đăng mediaId: PASTE_ID` | |
| 10 | **Zernio Publish** xanh (hoặc sửa URL nếu 404) | |
| 11 | **Confirm Published** trên TG | |
| 12 | Zernio dashboard: **Published** | |

### Cách B — Telegram Trigger

| # | Việc | Pass |
|---|------|------|
| 1 | Workflow **Active** | |
| 2 | Nhắn bot: `XAUUSD brief hôm nay` | |
| 3 | Tiếp bước 6–12 ở Cách A | |

### Nếu Zernio 404/422

- [ ] Mở dashboard/OpenAPI Zernio
- [ ] Sửa **path + JSON body** node **Zernio Publish**
- [ ] Giữ `accountIds`: X `6a0c6dbd5e333c05299f1d12`, Threads `6a0c28345e333c05299b981a`

---

## Bước 7 — Sau khi chạy ổn

- [ ] Export: **⋯ → Download** → `alpha-m0-11138.live.json` (local, không commit secret)
- [ ] Bật **Google Sheet** + `N8N_MEDIA_SHEET_ID` (Phase 4)
- [ ] Bật **Cron 08:00 VN** (Phase 4)
- [ ] Tick [`N8N_ALPHA_PHASES_CHECKLIST.md`](./N8N_ALPHA_PHASES_CHECKLIST.md) Phase 3–4

---

## Tóm tắt node đỏ → việc

| Node đỏ | Làm gì |
|---------|--------|
| **Claude Sonnet** | Credential **Anthropic** + API key |
| **Listen / Send proposal / FAIL / Send and wait / Confirm** | Cùng 1 credential **Telegram API** |
| **Zernio** | 4 Variables + (tuỳ instance) bật quyền `$env` |
| **Google Sheet** | Bỏ qua (disabled) |

**Không** thêm node AI Agent thứ hai — **Claude Sonnet** đã nối dưới **AI Agent Content**.

---

## Liên kết

| Doc | |
|-----|--|
| Keys chi tiết | [`N8N_ALPHA_KEYS_SETUP.md`](./N8N_ALPHA_KEYS_SETUP.md) |
| 5 khối test | [`N8N_CHIA_DE_TRI_ALPHA.md`](./N8N_CHIA_DE_TRI_ALPHA.md) |
| Fork #11138 | [`N8N_TEMPLATE_11138_FORK.md`](./N8N_TEMPLATE_11138_FORK.md) |
