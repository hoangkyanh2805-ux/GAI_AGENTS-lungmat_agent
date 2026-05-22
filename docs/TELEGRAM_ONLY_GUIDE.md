# Hướng dẫn vận hành — Chỉ Telegram

> **SSOT** cho scope dự án: **mọi tương tác khách & vận hành qua Telegram**.  
> Không Zalo, Facebook Messenger, WhatsApp trong plan mặc định.  
> **Audit code:** [`CODEBASE_AUDIT_DIGITOP_TELEGRAM.md`](./CODEBASE_AUDIT_DIGITOP_TELEGRAM.md)  
> **Case Digitop BĐS (ý tưởng):** [digitop.ai/use-cases/real-estate](https://digitop.ai/use-cases/real-estate/) — triển khai qua **GoClaw**, không qua lungmat free-text.

**Cập nhật:** 2026-05-19

---

## 1. Ba việc khác nhau — ba “cửa” Telegram

| # | Việc | Bot / kênh TG | Công cụ | Có trong repo `src/`? |
|---|------|---------------|---------|----------------------|
| **1** | **Media** — sinh bài, duyệt, đăng X/Threads | Admin DM + channel | GoClaw Writer + Zernio; lungmat `/content` dev | ✅ Approval, `/content` |
| **2** | **Edu** — Q&A vault, không sales | `@linhcau79_bot` Linh Cẩu | GoClaw + Vault | ❌ runtime GoClaw |
| **3** | **Sales CSKH 1:1** — giá VIP, qualify, chốt | Bot **brand** (Alpha / Raymond / VIP10X) | GoClaw **Alpha CSKH** skill | ❌ chỉ `goclaw-export/` |

**Không trộn:** Linh Cẩu không báo giá VIP; bot CSKH không đăng X; admin `/coach` không phải CSKH khách.

---

## 2. Sơ đồ Telegram-only

```text
                         KHÁCH / FOUNDER
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
   Linh Cẩu 🐆           Brand bot DM           Admin DM Founder
   (edu / vault)         (CSKH 1:1)            (duyệt + /coach)
         │                     │                     │
    GoClaw agent          GoClaw CSKH           lungmat/GoClaw
    Vault Shared          Vault Team FAQ        ADMIN_TELEGRAM_CHAT_ID
         │                     │                     │
         │               HOT → ping admin ───────────┤
         │                     │                     │
         └─ redirect sales ────┘                     │
                                                       ▼
                                              Approve draft → Zernio → X/Threads
```

**Publish X/Threads:** không qua Telegram khách — qua Zernio sau khi Founder bấm duyệt trên **admin TG**.

---

## 3. Digitop BĐS — áp dụng thế nào (chỉ TG)

| Digitop UC | Telegram-only | Ai làm |
|------------|---------------|--------|
| CSKH 24/7, qualify | Khách DM **bot brand** | GoClaw `alpha-cskh-1to1-skill.md` |
| Data tách brand | 3 bot hoặc 3 agent GoClaw | Founder setup |
| Human chốt deal | Founder trả trong **cùng thread TG** | Human — nhận ping HOT |
| Báo cáo pipeline | T2 admin TG tóm tắt (P2) | GoClaw cron optional |

**lungmat-agent không đọc tin nhắn tự do** — chỉ lệnh `/...` và callback duyệt.

---

## 4. lungmat-agent (repo) — chỉ dùng Telegram để

| Tính năng | Lệnh / luồng | Ghi chú |
|-----------|--------------|---------|
| Dev test content | `/content alpha …` | Mock hoặc live |
| Duyệt publish | Nút inline + `/approve_publish` | `ADMIN_TELEGRAM_CHAT_ID` |
| Coach vận hành | `/coach` | **Chỉ** admin chat id |
| Lead (stub) | `/lead_capture` | Không CRM — không dùng prod CSKH |
| Webhook nhận update | `TELEGRAM_MODE=webhook` | Prod TG → server |

**Không bật** cho khách 1:1 sales nếu kỳ vọng chat “giá VIP bao nhiêu” — cần GoClaw CSKH.

---

## 5. GoClaw — checklist Telegram

**SSOT runtime (upstream + map dự án):** [`GOCLAW_RUNTIME_GUIDE.md`](./GOCLAW_RUNTIME_GUIDE.md)  
**Cursor MCP (optional):** [`.cursor/mcp.json.example`](../.cursor/mcp.json.example) → copy `.cursor/mcp.json`

### 5.0 Linh Cẩu (edu — đang chạy GoClaw)

| Việc | File |
|------|------|
| Skill paste UI | `docs/goclaw-export/linh-cau-community-skill.md` |
| Vault 38 docs | `docs/vault-seed/` → Shared |
| Giọng nguồn | `src/llm/persona.ts`, `IDENTITY.md` |

### 5.1 Đã có / đang pilot (media)

| Việc | File |
|------|------|
| Alpha Content Writer | `docs/goclaw-export/alpha-content-writer-skill.md` |
| Pilot từng bước | `docs/GOCLAW_ALPHA_PILOT_CHECKLIST.md` |
| Publish SOP | `docs/SOP_GoClaw_Zernio_PUBLISH.md` |
| **Plan duyệt TG (đọc trước)** | **`docs/ALPHA_TELEGRAM_APPROVAL_PLAN.md`** |
| **Brief giao Claude Cowork** | **`docs/briefs/alpha-telegram-approval-cowork-brief.md`** |
| SOP đăng TG (sau chốt plan) | `docs/ALPHA_TELEGRAM_PUBLISH.md` |

### 5.2 CSKH 1:1 (sau media pilot)

| # | Việc |
|---|------|
| 1 | Tạo bot Telegram **Alpha** (BotFather) — **khác** `@linhcau79_bot` |
| 2 | GoClaw agent **Alpha CSKH** → paste `alpha-cskh-1to1-skill.md` |
| 3 | Vault Team: FAQ giá / onboarding / objections (3 file) |
| 4 | Linh Cẩu: thêm câu redirect “hỏi giá → inbox bot Alpha” |
| 5 | Test: cold / hỏi giá / HOT → Founder nhận TG |

### 5.3 Ba brand (P1)

- Raymond / VIP10X: clone skill + bot TG riêng.  
- Channel publish: `TELEGRAM_CHAT_ID_*` trong `.env` (lungmat dev) hoặc GoClaw channel.

---

## 6. SalesMartly + GoClaw + Human (chỉ TG DM) — optional

Nếu Founder dùng [SalesMartly `contact/all`](https://app.salesmartly.com/next/contact/all) làm CRM cho **Telegram DM khách**:

→ **[`SALESMARTLY_GOCLAW_HUMAN_TELEGRAM_DM.md`](./SALESMARTLY_GOCLAW_HUMAN_TELEGRAM_DM.md)** — phân tích 5 agent, mô hình **M2**, plan Phase 0–2.

| Nếu | Làm |
|-----|-----|
| Cần CRM + AI + chốt người | SM (chỉ kênh TG) + GoClaw CSKH + Human assign `hot` |
| Volume thấp, không CRM | Bỏ SM — GoClaw CSKH + ping admin TG |

Repo: webhook mounted (`POST /salesmartly/webhook`); bật `SALESMARTLY_ENABLED=1` sau Phase 0 SM.

---

## 7. Biến môi trường Telegram (`.env`)

```env
TELEGRAM_BOT_TOKEN=          # bot lungmat dev hoặc admin
TELEGRAM_CHAT_ID=            # channel mặc định
TELEGRAM_CHAT_ID_ALPHA=
TELEGRAM_CHAT_ID_RAYMOND=
TELEGRAM_CHAT_ID_VIP10X=
ADMIN_TELEGRAM_CHAT_ID=      # DM duyệt + HOT lead + /coach
TELEGRAM_MODE=webhook        # prod
TELEGRAM_WEBHOOK_URL=
TELEGRAM_WEBHOOK_SECRET=
```

Bot CSKH brand trên **GoClaw UI** — token không bắt buộc nằm trong repo lungmat.

---

## 8. Thứ tự triển khai (Founder)

```text
Tuần 1–2: GoClaw Alpha Writer + Zernio + duyệt admin TG  (media)
Tuần 3:   GoClaw Alpha CSKH bot TG + FAQ Vault            (sales 1:1)
Tuần 4+:  Raymond / VIP10X bot + writer cron
```

**Không làm trước media pilot:** CSKH 1:1 scale 3 brand khi chưa có compliance writer ổn.

---

## 9. Tài liệu — đọc theo thứ tự

| Thứ tự | File |
|--------|------|
| 1 | **File này** — `TELEGRAM_ONLY_GUIDE.md` |
| 2 | `PILOT_ALPHA_AUDIT_STATUS.md` — tick P0–P7 Done |
| 3 | `PROJECT_STATUS.md` |
| 4 | `GOCLAW_ALPHA_PILOT_CHECKLIST.md` (media) |
| 5 | `GOCLAW_P4_P7_MEDIA_RUNBOOK.md` (P4–P7) |
| 6 | `goclaw-export/alpha-cskh-1to1-skill.md` (CSKH, sau P7) |
| 7 | `CODEBASE_AUDIT_DIGITOP_TELEGRAM.md` (thật vs plan) |

**Tham khảo, không SSOT scope:** `SWOT_HYBRID_*` (đa kênh), `SOP_SalesMartly_Hybrid.md` (optional).

---

## 10. Tóm tắt

> Dự án **chỉ Telegram**: media + duyệt trên **admin TG**; edu qua **Linh Cẩu**; sales 1:1 qua **bot brand GoClaw**; **lungmat** = dev/approval slash commands — **không** CSKH chat tự do. Digitop BĐS **đúng hướng** nhưng **chạy trên GoClaw**, không có sẵn trong code lungmat.
