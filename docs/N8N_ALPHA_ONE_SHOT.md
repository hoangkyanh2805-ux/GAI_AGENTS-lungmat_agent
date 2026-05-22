# Alpha n8n — Một flow, import/key một lần

> Canvas **alpha-m0-template** (1 dãy) = **đủ M0**. Không tạo thêm workflow trừ khi sau này cần GDrive riêng (Flow A).

---

## 1. Còn thiếu mấy flow?

```
M0 bắt buộc:  [ Flow B ]  ← bạn đang có (1 workflow)
M0 tuỳ chọn:  [ Flow A GDrive ]  ← 0 hoặc 1, có thể không làm
M1 sau:       Raymond, VIP, azzam webhook  ← chưa
```

| Câu hỏi | Trả lời |
|---------|---------|
| Còn phải import flow mới? | **Không** (canvas ổn) |
| Còn flow B / C? | **Không** — chỉ A tuỳ chọn |
| Việc còn lại? | **Key 1 lần** → **Test Manual** → bật Cron (Phase 4) |

---

## 2. Export / import (chỉ khi cần)

### Đã có flow trên n8n (trường hợp bạn)

- **Không** import lại.
- Sau test OK: **⋯ → Download** → lưu `alpha-m0.live.json` (máy local, không push git có secret).

### Instance n8n mới / canvas mất

1. **⋯ → Import from File** → `workflows/alpha-m0.template.json`
2. Đặt tên: `Alpha Media M0`
3. Nhảy xuống **mục 3** điền key

---

## 3. Điền key — một chỗ (không rải rác)

**Không** nhập API key vào: Init Config · sticky note · từng node Claude/Zernio tay.

### A. n8n → Settings → Variables (4 biến)

```
ANTHROPIC_API_KEY          = sk-ant-...
ZERNIO_API_KEY             = ...
ZERNIO_API_BASE            = https://...   (base API Zernio)
N8N_TELEGRAM_ADMIN_CHAT_ID = -100...       (số, không @username)
```

Phase 4 thêm: `N8N_MEDIA_SHEET_ID`

### B. Credentials (1 cái)

- **Telegram API** → token @BotFather → gắn node **Telegram Preview** + **Telegram FAIL**

Claude + Zernio dùng **Variables** (template đã `{{ $env.... }}`).

### C. Init Config

Chỉ **brand / topic / accountIds** — không secret. Đã có trong template.

### D. Save workflow

Cron + Google Sheet vẫn **disabled**.

---

## 4. Phase tiếp (ngắn)

| Phase | Việc |
|-------|------|
| 2 | Tick xong mục 3 trên → [`N8N_ALPHA_PHASES_CHECKLIST.md`](./N8N_ALPHA_PHASES_CHECKLIST.md) |
| 3 | Manual Trigger + `mediaId` + resume Wait |
| 4 | Bật Sheet + Cron |

Chi tiết test: [`N8N_ALPHA_PHASES_CHECKLIST.md`](./N8N_ALPHA_PHASES_CHECKLIST.md) Phase 3.
