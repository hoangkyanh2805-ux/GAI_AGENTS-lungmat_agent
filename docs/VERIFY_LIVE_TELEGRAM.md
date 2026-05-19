# Verify live Telegram — Phase 7B/7C

> Làm **trước** Phase 7D. Tick từng ô khi pass.

**Tham chiếu:** [SOP_LIVE_TELEGRAM_AGENT_PIPELINE_V1.md](./SOP_LIVE_TELEGRAM_AGENT_PIPELINE_V1.md) · [SOP_TYPEFULLY_HANDOFF.md](./SOP_TYPEFULLY_HANDOFF.md)

---

## 0. Chuẩn bị `.env`

```env
MOCK_LLM=0
TELEGRAM_BOT_TOKEN=...
ADMIN_TELEGRAM_CHAT_ID=...          # DM admin (bắt buộc cho nút approve)
TELEGRAM_CHAT_ID_ALPHA=...          # channel Alpha
TELEGRAM_CHAT_ID_RAYMOND=...        # (tuỳ brand test)
TELEGRAM_CHAT_ID_VIP10X=...
ANTHROPIC_API_KEY=...
APIFY_API_TOKEN=...                 # tuỳ chọn
AGENT_SHARED_SECRET=...
```

| Biến | Pass |
|------|------|
| `MOCK_LLM=0` | ☐ |
| `ADMIN_TELEGRAM_CHAT_ID` set | ☐ |
| Ít nhất `TELEGRAM_CHAT_ID_ALPHA` set | ☐ |
| Bot là **admin** trong channel Alpha (quyền post) | ☐ |

```powershell
cd "G:\Other computers\My Computer\Project\GAI_AGENTS-lungmat_agent"
npm run dev
```

Log startup: `"hasAdminChatId":true`, `"mockLlm":false`, `"telegramConfigured":true`

---

## 1. Health + debug (Telegram hoặc PowerShell)

### 1a. Trên Telegram

Gửi bot (chat riêng admin):

```text
/debug_env
```

| Field | Mong đợi | Pass |
|-------|----------|------|
| `hasAdminChatId` | `true` | ☐ |
| `mockLlm` | `false` | ☐ |
| `telegramConfigured` | `true` | ☐ |

### 1b. PowerShell (tuỳ chọn)

```powershell
$base = "http://localhost:3000"
$h = @{ "x-agent-secret" = "<AGENT_SHARED_SECRET>" }
Invoke-RestMethod GET "$base/health"
Invoke-RestMethod POST "$base/agent/command" -Headers $h -ContentType "application/json" `
  -Body '{"command":"/debug_env","user":"ops","source":"manual","payload":{}}'
```

---

## 2. `/content` — pack + admin DM (7A + 7B)

Gửi bot:

```text
/content alpha liquidity sweep XAUUSD test live
```

| Kiểm tra | Pass |
|----------|------|
| Reply có 4 block: TG brief, X thread, Threads, YouTube Shorts script | ☐ |
| Cuối reply có 3 approval id (TG / X / Threads) | ☐ |
| **Admin DM** nhận preview + 4 nút: TG, X, Threads, Reject TG | ☐ |

Nếu **không** có admin DM → `ADMIN_TELEGRAM_CHAT_ID` sai hoặc chưa nhắn bot `/start` trong chat riêng.

---

## 3. Approve TG → channel Alpha (7B)

Trên **admin DM**, bấm **✅ TG → Channel**.

| Kiểm tra | Pass |
|----------|------|
| Callback toast: approved (telegram) | ☐ |
| Message mới trên **channel Alpha** (đúng `TELEGRAM_CHAT_ID_ALPHA`) | ☐ |
| Nội dung = telegram brief (không phải full pack) | ☐ |

Lỗi thường gặp:

| Triệu chứng | Fix |
|-------------|-----|
| Approve OK, không lên channel | Sai chat id; bot chưa là admin channel |
| `TELEGRAM_CHAT_ID not configured` | Set `TELEGRAM_CHAT_ID_ALPHA` |

---

## 4. Approve X → Typefully copy (7C)

Bấm **✅ X → Typefully** (approval X còn pending — chạy `/content` mới nếu đã approve hết).

| Kiểm tra | Pass |
|----------|------|
| Toast/reply: approved + text thread | ☐ |
| Có dòng social set `AlphaTradingLab_Elite` (Alpha) | ☐ |
| **Không** post lên channel TG | ☐ |
| Paste thủ công vào Typefully → schedule OK | ☐ |

---

## 5. Approve Threads

Bấm **✅ Threads**.

| Kiểm tra | Pass |
|----------|------|
| Reply có nội dung `threads_post` | ☐ |
| Không post TG | ☐ |

---

## 6. Legacy + HTTP (tuỳ chọn)

| Test | Pass |
|------|------|
| `/market_summary` — 6 sections (H1, Macro, Events…) | ☐ |
| `POST /approval/<tg-id>/approve` + `"publish":true` → channel | ☐ |
| `POST /approval/<x-id>/approve` + `"publish":true` → **400** (chặn publish TG) | ☐ |

---

## 7. Kết luận

| Kết quả | Hành động |
|---------|-----------|
| Tất cả ☐ trên → pass | Cập nhật [PHASE_STATUS.md](./PHASE_STATUS.md), ghi ngày verify trong [ai-worklog](./ai-worklog/INDEX.md) |
| Fail bước nào | Ghi log + screenshot → sửa trước khi làm 7D |

**Ngày verify:** ___________  
**Người test:** ___________
