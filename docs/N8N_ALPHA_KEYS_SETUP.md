# Alpha n8n — Điền key (Phase 2)

> Làm **sau khi** canvas Flow B đã gọn 1 dãy. Không test publish trước khi tick xong mục **Bắt buộc**.

Checklist tổng: [`N8N_ALPHA_PHASES_CHECKLIST.md`](./N8N_ALPHA_PHASES_CHECKLIST.md)

---

## 1. n8n Variables (Settings → Variables)

Tạo từng biến (tên **đúng** chữ, copy-paste):

| Tên biến | Giá trị | Ghi chú |
|----------|---------|---------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | API Keys → Anthropic Console |
| `ZERNIO_API_KEY` | token Zernio | Dashboard → API / Settings |
| `ZERNIO_API_BASE` | URL gốc API | VD base tenant — **không** đoán; lấy doc Zernio |
| `N8N_TELEGRAM_ADMIN_CHAT_ID` | số âm hoặc dương | VD `-1001234567890` — **không** @username |

**Phase 4 mới cần:**

| Tên | Giá trị |
|-----|---------|
| `N8N_MEDIA_SHEET_ID` | ID từ URL Sheet `.../d/THIS_PART/edit` |

**Tuỳ chọn:** `N8N_TELEGRAM_BOT_TOKEN` — chỉ nếu node Telegram dùng expression `{{ $env.N8N_TELEGRAM_BOT_TOKEN }}` thay vì credential.

### Lấy Telegram chat id

1. Founder chat bot → `/start`
2. Gửi 1 tin bất kỳ
3. Mở `https://api.telegram.org/bot<TOKEN>/getUpdates` → tìm `"chat":{"id": ...}`

---

## 2. Node Claude Writer

Template dùng **HTTP Request** + header:

- `x-api-key` = `{{ $env.ANTHROPIC_API_KEY }}`

**Việc:**

- [ ] Biến `ANTHROPIC_API_KEY` đã tạo trong n8n
- [ ] Mở node → **Execute step** (sau Init Run) — không còn 401/404 credit

Lỗi 401: sai key. 404 billing: nạp credit Anthropic.

---

## 3. Node Telegram Preview + Telegram FAIL

**Cách A (khuyên dùng):** Credential **Telegram API**

1. n8n → Credentials → **Telegram API**
2. Access Token = token từ @BotFather
3. Gắn credential vào **cả 2** node Telegram
4. `Chat ID` = `{{ $env.N8N_TELEGRAM_ADMIN_CHAT_ID }}`

**Việc:**

- [ ] Credential tạo và chọn trên 2 node
- [ ] Chat ID expression trỏ env

---

## 4. Node Zernio Publish

**Phase 2:** chỉ cần key có — **chưa** cần publish thành công.

Header trong template:

- `Authorization` = `Bearer {{ $env.ZERNIO_API_KEY }}`
- URL = `{{ $env.ZERNIO_API_BASE }}/v1/posts` (**placeholder**)

**Việc Phase 2:**

- [ ] `ZERNIO_API_KEY` + `ZERNIO_API_BASE` trong Variables
- [ ] Node không báo thiếu credential (nếu dùng Generic Credential thì gắn Bearer)

**Việc Phase 3** (khi Execute lỗi 404/422):

- [ ] Mở Zernio dashboard / OpenAPI → sửa **path + body** node cho đúng `posts_create` / cross-post
- [ ] Giữ `accountIds` từ Init Config

---

## 5. Google Sheet Log

- Node **disabled** — **không** điền Sheet ở Phase 2.
- Phase 4: OAuth Google + `N8N_MEDIA_SHEET_ID` + bật node.

---

## 6. Kiểm tra nhanh (2 phút)

| Kiểm tra | Kỳ vọng |
|----------|---------|
| Variables có 4 biến bắt buộc | Đủ |
| Claude Writer | Không đỏ “missing credential” nếu chỉ dùng env |
| Telegram | Credential xanh |
| Zernio | Env có key |
| Cron | Disabled |
| Sheet | Disabled |

**Xong Phase 2** → sang [`N8N_ALPHA_PHASES_CHECKLIST.md`](./N8N_ALPHA_PHASES_CHECKLIST.md) **Phase 3** (Manual Trigger 1 lần).

---

## Không làm ở bước này

- Paste key vào sticky note trên canvas
- Commit `.env` / workflow export có secret lên git
- Bật Cron hoặc Sheet
- Sửa prompt dài / import SKILL full
