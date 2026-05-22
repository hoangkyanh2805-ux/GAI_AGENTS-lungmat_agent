# Runbook P4 → P7 — Media pilot Alpha (GoClaw UI)

> **Điều kiện đã xong:** P1 Vault (càng đủ 38 càng tốt) · P2 Zernio X+Threads connected · P3 `@zernio/cli` trên GoClaw  
> **SSOT Skill:** [`goclaw-export/alpha-content-writer-skill.md`](./goclaw-export/alpha-content-writer-skill.md)  
> **Checklist đầy đủ:** [`GOCLAW_ALPHA_PILOT_CHECKLIST.md`](./GOCLAW_ALPHA_PILOT_CHECKLIST.md)  
> **Tick Done sau mỗi phase:** [`PILOT_ALPHA_AUDIT_STATUS.md`](./PILOT_ALPHA_AUDIT_STATUS.md)

**Cập nhật:** 2026-05-19 (P4 **Skipped** — pilot text-only)

---

## ⚡ Đường nhanh hôm nay (P4 bỏ qua)

Founder **không** cấu hình OpenAI gpt-image-2. Làm theo thứ tự:

```text
[5']  zernio accounts list → điền accountId (bảng dưới)
[25'] P5 Agent + paste Skill (bản text-only) + test draft
[10'] P6 Cron 08:00 VN
[20'] P7 Reply "OK đăng" → zernio posts:create KHÔNG --media → verify X + Threads
```

Skill: [`alpha-content-writer-skill.md`](./goclaw-export/alpha-content-writer-skill.md) (đã bỏ bước ảnh).

---

## Trước P5 — ghi accountId (P7 cần)

Trên máy có Zernio CLI (hoặc GoClaw terminal node):

```bash
zernio auth:check
zernio accounts list
```

Ghi vào đây (Founder điền):

| Brand | Platform | accountId |
|-------|----------|-----------|
| Alpha | X `@AlphaTrading79` | `________________` |
| Alpha | Threads `@alphatrading.lab` | `________________` |

Trong Skill thay `{ALPHA_ACCOUNT_IDS}` = id X (hoặc cả hai nếu Zernio chấp nhận list — thử `zernio posts:create --help`).

---

## P4 — OpenAI + gpt-image-2 (GoClaw Provider) — **SKIPPED pilot v1**

> **Founder quyết định:** bỏ qua P4; đăng **text-only** qua Zernio. Bật lại khi cần thumbnail/ảnh post.
> Lưu ý: đường upload ảnh/video Zernio MCP hiện chưa ổn định, nên pilot này giữ text-only để tránh lỗi media upload.

**Mục tiêu (khi bật lại):** Agent tạo được 2 ảnh/tháng (thumbnail 16:9 + post vuông).

| # | Việc trên GoClaw | ☐ |
|---|------------------|---|
| 1 | **Settings / Providers** → Add **OpenAI** | |
| 2 | Dán `OPENAI_API_KEY` (billing bật) | |
| 3 | Bật capability **Image generation** / tool ảnh | |
| 4 | Model ảnh: **`gpt-image-2`** (khớp repo `ImageClient.ts`) | |

**Test nhanh (chat bất kỳ agent có tool ảnh):**

```text
Tạo 1 ảnh test gpt-image-2 size 1024x1024:
"Premium gold trading visual Alpha Trading Lab, dark finance, gold accent, no text."
```

| Pass | ☐ |
|------|---|
| Ảnh trả về URL/file, không lỗi 401/429 | |

**Lỗi thường gặp:** sai model (`dall-e-3` ≠ `gpt-image-2`) · key hết quota · tool ảnh chưa bật cho agent P5.

---

## P5 — Agent Alpha Content Writer

| # | Việc | ☐ |
|---|------|---|
| 1 | **Agents** → **+ Create** → tên `Alpha Content Writer` | |
| 2 | Model: Claude Sonnet/Haiku hoặc GPT-4o (ổn định JSON) | |
| 3 | **Tools / Integrations:** Vault retrieve · Web search · Zernio MCP tools — **không** dùng CLI `zernio` (pilot text-only) | |
| 4 | **Skill / System prompt:** paste **toàn bộ** [`alpha-content-writer-skill.md`](./goclaw-export/alpha-content-writer-skill.md) | |
| 5 | Thay `{ALPHA_ACCOUNT_IDS}` bằng accountId P7 | |
| 6 | **Channel:** Telegram → bot nhận **admin DM** (`ADMIN_TELEGRAM_CHAT_ID`) | |

> Sau khi paste skill, kiểm tra kỹ prompt phải ghi rõ: `Gửi draft admin Telegram CHỜ DUYỆT — KHÔNG gọi Zernio cho đến khi admin OK.`
> Nếu skill cũ vẫn chỉ thị dùng CLI/exec để upload hoặc publish, đó là bug. Sửa ngay sang MCP-only: chỉ công cụ Zernio MCP `mcp_zernio__*`.

**Bug fix record:** Alpha Content Writer pilot phải dùng MCP, không CLI, không `exec`, không shell upload trực tiếp từ skill.
**Lưu ý:** CLI chỉ dùng như fallback thủ công bên ngoài agent khi agent không tự publish được. Không đổi skill Alpha sang CLI.

```text
Topic: test pilot P5 — XAUUSD liquidity và Fed tuần này.
Làm full JSON pack — KHÔNG tạo ảnh (pilot text-only).
Compliance gate PASS.
Gửi draft admin Telegram — KHÔNG gọi Zernio.
```

| Pass | ☐ |
|------|---|
| JSON đủ 4 field + `shorts_script` có [HOOK] | |
| Dòng `Compliance: PASS` | |
| Dòng `Images: skipped (pilot text-only)` | |
| Giọng Alpha, không signal | |

---

## P6 — Cron 08:00 Asia/Ho_Chi_Minh

| Field | Giá trị |
|-------|---------|
| Name | `daily_alpha_xauusd` |
| Schedule | `08:00` · timezone **`Asia/Ho_Chi_Minh`** |
| Agent | Alpha Content Writer |
| Deliver / notify | Telegram admin DM |

**Prompt Cron** (copy từ skill — đừng đổi ý “chờ duyệt”):

```text
Topic: XAUUSD daily brief — liquidity và macro (Fed, DXY).
Research tin mới. Retrieve vault liên quan.
Sinh full content pack JSON (KHÔNG ảnh — pilot text-only).
Compliance gate PASS trước khi gửi.
Gửi draft admin Telegram CHỜ DUYỆT — KHÔNG gọi Zernio cho đến khi admin OK.
```

| # | Verify | ☐ |
|---|--------|---|
| 1 | UI hiển thị **next run** ~08:00 VN ngày mai | |
| 2 | (Tuỳ chọn) **Run now** 1 lần → draft về admin TG | |

---

## P7 — E2E: draft → OK → Zernio post X + Threads

### Bước A — Chạy draft (nếu chưa có từ P5/P6)

Chat **Alpha Content Writer**:

```text
Topic: E2E pilot — XAUUSD sweep liquidity hôm nay.
Full pack text-only. Gửi admin. Chưa đăng.
```

Đọc draft trên **admin Telegram** → sửa nếu cần (reply text, không bắt buộc code).

### Bước B — Duyệt

Reply admin DM (đúng từ khóa skill):

```text
OK đăng
```

hoặc `duyệt` / `đăng`.

### Bước C — Agent gọi Zernio (hoặc Founder tay)

Agent **phải** (pilot text-only — **không** `--media`):

```bash
zernio posts:create \
  --text "<x_thread 5-7 tweets>" \
  --platforms twitter,threads \
  --accounts <ALPHA_ACCOUNT_ID>
```

**Nếu agent không gọi được** — Founder chạy tay trên GoClaw shell:

1. Paste `x_thread` (không URL trong tweet).  
2. `zernio posts:create` như trên.

**Threads riêng** (nếu Zernio không gộp được 2 platform):

```bash
zernio posts:create \
  --text "<threads_post <=500 chars>" \
  --platforms threads \
  --accounts <THREADS_ACCOUNT_ID>
```

**Khi bật lại P4 (ảnh):** thêm `zernio media:upload` + `--media <media_id>`.

### Bước D — Verify live

| # | Kiểm tra | ☐ |
|---|----------|---|
| 1 | [x.com/AlphaTrading79](https://x.com/AlphaTrading79) — post mới (text OK pilot v1) | |
| 2 | Threads `@alphatrading.lab` — post tương ứng | |
| 3 | Không đăng khi chưa "OK" (test 1 lần từ chối) | |
| 4 | Zernio dashboard / log không error | |

### Bước E — Cập nhật trạng thái (bắt buộc)

Sau P7 pass, cập nhật [`PILOT_ALPHA_AUDIT_STATUS.md`](./PILOT_ALPHA_AUDIT_STATUS.md):

- P4 giữ **Skipped**; P5–P7 → **Done** + ngày  
- Điền **URL post X** + tick Threads (ảnh optional)  
- Điền **accountId** Zernio  
- Sync tóm tắt vào [`PROJECT_STATUS.md`](../PROJECT_STATUS.md)

---

## Thứ tự session hôm nay (gợi ý 60–90 phút)

```text
P4 SKIPPED
[25'] P5 Agent + Skill paste + test draft (no publish)
[10'] P6 Cron 08:00 + optional Run now
[20'] P7 Reply OK đăng → verify X + Threads (text-only)
```

---

## Handoff nếu kẹt

| Blocker | Ai fix |
|---------|--------|
| JSON lỗi / markdown bọc | Sửa Skill nhắc "chỉ JSON" · Cowork |
| Zernio auth | `zernio auth:check` · dashboard reconnect X/Threads |
| Không ảnh | Pilot v1 bỏ ảnh — OK text-only |
| Muốn ảnh sau | Làm lại P4 OpenAI + `--media` |
| Repo code / webhook | Cursor |

---

---

## Phụ lục — Vault P1 (song song P4–P7)

| # | Việc | ☐ |
|---|------|---|
| 1 | Upload 14 file còn thiếu → đủ **38/38** trong `docs/vault-seed/` | |
| 2 | Smoke: "FVG là gì?" · "R-multiple?" · "Tilt?" · "Spring Wyckoff?" | |
| 3 | Tick P1 **Partial** → **Done** trong [`PILOT_ALPHA_AUDIT_STATUS.md`](./PILOT_ALPHA_AUDIT_STATUS.md) | |

---

## Phụ lục — Sau P7 (Digitop / SalesMartly)

Không block media pilot. Thứ tự:

1. 3 ngày Cron 08:00 ổn định  
2. [`SALESMARTLY_GOCLAW_HUMAN_TELEGRAM_DM.md`](./SALESMARTLY_GOCLAW_HUMAN_TELEGRAM_DM.md) **Phase 0** — SM connect chỉ Telegram bot Alpha  
3. Test webhook: `scripts/test-salesmartly-webhook.sh` (lungmat local hoặc VPS)  
4. GoClaw **Alpha CSKH** skill — [`alpha-cskh-1to1-skill.md`](./goclaw-export/alpha-cskh-1to1-skill.md)

---

*Tài liệu này chỉ UI GoClaw — không thay thế deploy lungmat VPS.*
