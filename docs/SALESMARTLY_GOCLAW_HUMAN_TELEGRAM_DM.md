# SalesMartly + GoClaw + Human — Chỉ Telegram DM khách

> **Mục tiêu:** Ứng dụng **thực tế** case [Digitop BĐS UC-01](https://digitop.ai/use-cases/real-estate/) với 3 lớp: **CRM/inbox** (SalesMartly) · **AI** (GoClaw) · **Người** (Founder).  
> **Scope cứng:** **Chỉ Telegram DM** với khách — không Zalo/FB/WA.  
> **Phân tích:** 5 “agent” góc nhìn (kiến trúc, sales ops, compliance, tích hợp, vận hành Founder).

**Cập nhật:** 2026-05-19 · Liên quan: [`TELEGRAM_ONLY_GUIDE.md`](./TELEGRAM_ONLY_GUIDE.md) · [`CODEBASE_AUDIT_DIGITOP_TELEGRAM.md`](./CODEBASE_AUDIT_DIGITOP_TELEGRAM.md)

---

## 0. Kết luận nhanh (sau phân tích)

| Câu hỏi | Trả lời |
|---------|---------|
| Có nên dùng SM + GoClaw + Human? | **Có**, nếu Founder muốn **một màn CRM** (`contact/all`) + AI 24/7 + người chốt HOT |
| Chỉ Telegram DM? | **Có** — connect **chỉ** Telegram bot brand vào SalesMartly |
| lungmat-agent bắt buộc? | **Không** cho chat 1:1 — chỉ **webhook HOT notify** (optional, P1) |
| Mô hình khuyến nghị | **M2 — SM inbox + GoClaw não + Human takeover SM** (§4) |

**Điểm số ứng dụng (Telegram DM only):** **4.0 / 5** — trừ 1 điểm vì tích hợp kỹ thuật SM↔GoClaw cần verify trên tài khoản Founder.

---

## 1. Triệu hồi 5 agent phân tích

### Agent 1 — Kiến trúc hệ thống

**Câu hỏi:** Ai sở hữu luồng Telegram DM?

| Vai trò | Công cụ | Trách nhiệm |
|---------|---------|-------------|
| **Inbox SSOT** | SalesMartly `contact/all` | Lịch sử, tag, assign, human reply UI |
| **AI responder** | GoClaw agent **Brand CSKH** | Qualify, FAQ, compliance, draft |
| **Orchestrator nhẹ** | lungmat webhook (optional) | `HOT_LEAD` → `ADMIN_TELEGRAM_CHAT_ID` |
| **Human** | Founder trong SM | Chốt VIP, negotiation, khiếu nại |

**Nguyên tắc:** Một conversation — **một chế độ** tại một thời điểm:

```text
mode = AI  | human  | paused
```

- `AI`: GoClaw (hoặc SM gọi webhook GoClaw) được phép gửi tin.  
- `human`: Founder đã **assign self** trên SM → **tắt** auto AI.  
- `paused`: khách spam / compliance risk.

**Tách bot (bắt buộc):**

| Bot TG | SM + GoClaw? | Ghi chú |
|--------|--------------|---------|
| `@linhcau79_bot` | **Không** nối SM sales | Edu only; redirect sales |
| `@AlphaBot` (brand) | **Có** | CSKH 1:1 |
| Admin DM Founder | Không SM khách | `ADMIN_TELEGRAM_CHAT_ID` — duyệt media |

**Verdict kiến trúc:** ✅ Phù hợp Digitop UC-02 (cách ly brand) nếu **1 bot SM = 1 brand**.

---

### Agent 2 — Sales Ops (pipeline)

**Câu hỏi:** SM giải pain gì cho Founder chỉ với TG?

| Pain | Không SM | Có SM (TG only) |
|------|----------|-----------------|
| Lịch sử DM rải máy TG | Khó tìm lại | ✅ Thread trong `contact/all` |
| Không biết ai hot | Nhớ đầu | ✅ Tag `hot` + filter |
| Founder reply quên context | Scroll TG | ✅ Note + custom field trên contact |
| Báo cáo tuần | Không | ✅ Export / filter SM (P2) |

**Pipeline tag (trong SM):**

| Tag | Định nghĩa | Ai chuyển |
|-----|------------|-----------|
| `cold` | Hỏi lướt, chưa qualify xong | AI |
| `warm` | Đã qualify, chưa mua | AI |
| `hot` | Hỏi giá/chuyển khoản/gặp người | AI → **assign Human** |
| `won` / `lost` | Chốt xong | Human |

**SLA đề xuất (TG DM):**

| Mức | SLA |
|-----|-----|
| AI first reply | < 30 giây |
| Human khi `hot` | < 2h giờ làm việc |
| Follow-up `warm` | 48h (nhắc Founder / cron P2) |

**Verdict sales ops:** ✅ **4.5/5** — SM có giá trị rõ ngay cả chỉ Telegram.

---

### Agent 3 — Compliance (trading)

**Câu hỏi:** SM + GoClaw có tăng rủi ro signal / lộ data?

| Rủi ro | Mitigation |
|--------|------------|
| AI hứa lợi nhuận | GoClaw Skill compliance + Human review mọi `hot` trước chốt giá |
| Signal buy/sell | Cấm trong Skill; `TRADE_INSIGHT` chỉ edu snippet |
| PII trong ChatGPT công | Trả lời trong SM/GoClaw — **không** copy paste ra ChatGPT |
| Nhân viên sau này thấy hết contact | SM permission theo brand (khi scale) |

**Quy tắc Human khi takeover:**

- Không gửi entry/SL/TP/lot trong DM.  
- Giá/gói chỉ theo FAQ Founder đã duyệt trong Vault Team.  
- Phàn nàn nghiêm trọng → `paused` + Human only.

**Verdict compliance:** ✅ **4/5** — phụ thuộc kỷ luật Skill + Human, không phụ thuộc SM.

---

### Agent 4 — Tích hợp kỹ thuật

**Câu hỏi:** Repo + SM + GoClaw nối thế nào **thật**?

| Thành phần | Trạng thái | Ghi chú |
|------------|------------|---------|
| GoClaw CSKH skill | ✅ File `alpha-cskh-1to1-skill.md` | Paste UI |
| SM Telegram connect | ⚙️ Founder UI | Bot brand → SM |
| SM → webhook → lungmat | ❌ `SalesMartlyClient` TODO, chưa mount | P1 code |
| GoClaw ↔ SM API 2 chiều | ⚠️ **Verify** trong SM admin | Spike 1 ngày |
| lungmat free-text 1:1 | ❌ Không | Đúng thiết kế |

**Hai mô hình kỹ thuật (chọn 1 sau spike):**

| ID | Mô tả | Khi chọn |
|----|--------|----------|
| **M1** | GoClaw **giữ** webhook TG bot; SM **đọc** mirror / import | SM không hỗ trợ outbound webhook tốt |
| **M2** | SM **giữ** TG bot; rule SM → webhook → GoClaw → trả lời qua SM API | SM là inbox chính ✅ **khuyến nghị** |
| **M3** | SM chỉ CRM; GoClaw trả lời TG trực tiếp; Founder **copy** note vào SM | MVP nhanh, không automation |

**Webhook tối thiểu (lungmat P1):**

```json
{
  "secret": "...",
  "conversation_id": "sm_xxx",
  "channel": "telegram",
  "intent": "HOT_LEAD",
  "customer": { "name": "...", "telegram_user_id": "..." },
  "notes": "Hỏi VIP giá",
  "metadata": { "brand": "alpha" }
}
```

→ `notifyHumanHandler` → `TelegramClient.sendMessage(ADMIN_TELEGRAM_CHAT_ID, ...)`.

**Verdict tích hợp:** ⚠️ **3/5 hôm nay** → **4.5/5** sau mount webhook + verify M2.

---

### Agent 5 — Vận hành Founder (hàng ngày)

**Câu hỏi:** Founder làm gì mỗi ngày?

| Buổi | Việc | Ở đâu |
|------|------|-------|
| Sáng | Mở SM `contact/all` → filter `hot` + `warm` chưa reply | SalesMartly |
| Trong ngày | AI trả FAQ; Founder chỉ inbox `hot` | SM reply (gửi ra TG DM khách) |
| Media | Duyệt draft content | Admin TG (khác luồng) |
| Tối | Tag `won/lost`, note 1 dòng | SM |

**Không làm:** trả lời sales trong app TG riêng nếu đã chốt SM là SSOT (tránh mất log).

**Verdict vận hành:** ✅ **4/5** — thêm 1 tool nhưng giảm mất lead.

---

## 2. Bảng tổng hợp — 5 agent chấm điểm

| Agent | Tiêu chí | Điểm /5 | Ghi chú |
|-------|---------|--------|---------|
| Kiến trúc | Tách bot, single mode | 4.5 | Cần 3 bot brand |
| Sales Ops | CRM TG DM | 4.5 | SM mạnh ở contact/all |
| Compliance | Trading guardrails | 4.0 | Skill + Human |
| Tích hợp | Code + SM API | 3.0 → 4.5 | Sau webhook |
| Founder UX | Workflow ngày | 4.0 | Thói quen SM |
| **Trung bình** | | **4.0** | Đủ triển khai có điều kiện |

---

## 3. Mô hình vận hành đề xuất — M2 (Telegram DM only)

```text
Khách ──DM──► Bot Telegram Alpha (connect SalesMartly)
                    │
                    ▼
            ┌───────────────────┐
            │  SalesMartly      │
            │  contact/all      │
            │  tag / assign     │
            └─────────┬─────────┘
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
    [Rule: FAQ]  [Rule: HOT]  [Human assign]
         │            │            │
         ▼            ▼            ▼
    Webhook      Webhook      Founder reply
    GoClaw CSKH  HOT_LEAD     trong SM UI
    (qualify)    → Admin TG       │
         │            │            │
         └────────────┴────────────┘
                      │
              Tin ra TG DM khách
              (một luồng, một mode)
```

### 3.1 Ba tầng rõ ràng

| Tầng | Công cụ | Làm gì | Không làm |
|------|---------|--------|-----------|
| **1 — Inbox** | SalesMartly | Lưu thread TG DM, tag, assign, human gửi tin | Không bật SM AI trùng GoClaw |
| **2 — AI** | GoClaw **Alpha CSKH** | Qualify, FAQ Vault Team, compliance | Không đăng X, không signal |
| **3 — Human** | Founder | Trả `hot`, chốt VIP, khiếu nại | Không bỏ qua SM log |

### 3.2 Luồng từng tin (TG DM)

```text
1. Khách DM bot Alpha (TG)
2. SM nhận → hiện contact/all
3. Nếu chưa assign human:
   a. SM trigger (hoặc manual) → GoClaw CSKH
   b. GoClaw: qualify + FAQ + compliance PASS
   c. Trả lời khách QUA SM (M2) hoặc GoClaw direct (M1/M3)
4. Nếu hot / complaint / "gặp người":
   - Tag hot + assign Founder
   - Webhook HOT_LEAD → ADMIN_TELEGRAM_CHAT_ID
   - mode = human → TẮT AI
5. Founder trả trong SM → khách thấy trên TG
6. Chốt → tag won/lost + note
```

### 3.3 Digitop UC map (TG DM only)

| UC Digitop | Thực hiện |
|------------|-----------|
| UC-01 CSKH 24/7 | GoClaw CSKH qua SM/TG |
| UC-02 Data isolation | 1 SM workspace / brand hoặc tag `brand:alpha` |
| UC-03 Anti Shadow AI | Làm việc trong SM + GoClaw |
| UC-04 Báo cáo | SM export + cron admin TG (P2) |
| UC-05 Pipeline | Tag cold/warm/hot trong SM |

---

## 4. So sánh M1 / M2 / M3 (chỉ Telegram)

| | M1 GoClaw-primary | **M2 SM-primary** ✅ | M3 Song song thủ công |
|---|-------------------|----------------------|------------------------|
| Inbox SSOT | GoClaw memory | **SM contact/all** | Cả hai, dễ lệch |
| AI reply | TG trực tiếp | SM send hoặc API | GoClaw TG |
| Human | TG admin + SM note | **SM reply** | TG tay + ghi SM |
| Độ khó setup | TB | TB-Cao | Thấp |
| Khuyến nghị | Backup | **Chính** | MVP 1 tuần |

---

## 5. Plan triển khai (Telegram DM + SM)

### Phase 0 — SM + Human (3–5 ngày, không GoClaw auto)

| # | Việc |
|---|------|
| 1 | SM: connect **chỉ** Telegram bot Alpha |
| 2 | Tắt SM AI auto-reply |
| 3 | Tag `cold/warm/hot`, template FAQ copy tay |
| 4 | Founder trả 100% trong SM UI |
| 5 | Exit: 10 hội thoại có tag |

### Phase 1 — Thêm GoClaw AI (1–2 tuần)

| # | Việc |
|---|------|
| 1 | GoClaw paste `alpha-cskh-1to1-skill.md` |
| 2 | Vault Team FAQ 3 file |
| 3 | Spike SM: rule gọi GoClaw / webhook (chọn M2 hoặc M3) |
| 4 | Mount lungmat `notifyHumanHandler` → admin TG |
| 5 | Test: AI FAQ + HOT → Founder SM + ping admin |

### Phase 2 — Scale brand (2 tuần)

| # | Việc |
|---|------|
| 1 | Raymond / VIP10X bot TG → SM (workspace/tag riêng) |
| 2 | Linh Cẩu redirect → đúng bot brand |
| 3 | Báo cáo T2 filter SM |

**Song song (không block):** GoClaw Alpha **Content Writer** + admin TG duyệt Zernio (media).

---

## 6. Cấu hình SalesMartly (Telegram only)

**Kênh bật:** Telegram — bot Alpha (sau Raymond, VIP10X).

**Kênh tắt:** Zalo, Facebook, WhatsApp, Email (trong scope dự án).

**Custom fields / tags:**

| Key | Values |
|-----|--------|
| `brand` | alpha \| raymond \| vip10x |
| `stage` | cold \| warm \| hot \| won \| lost |
| `handoff` | ai \| human |

**Automation SM (gợi ý):**

- Keyword `giá`, `VIP`, `mua`, `chuyển khoản` → tag `hot` + assign Founder + (webhook HOT).  
- Assign user = Founder → set `handoff=human`, pause AI.  
- Không chạy SM AI chatbot nếu GoClaw đang trả.

---

## 7. Repo lungmat — phạm vi tối thiểu

| Việc | Status |
|------|--------|
| Mount `/salesmartly/webhook` | Done (`index.ts`) |
| `notifyHumanHandler` → `ADMIN_TELEGRAM_CHAT_ID` | Done |
| `dispatchToAgent` → log only (no `/content` auto) | Done |
| `.env.example` `SALESMARTLY_*` | Done |
| E2E test | **Pending** — [`scripts/test-salesmartly-webhook.sh`](../scripts/test-salesmartly-webhook.sh) |

**Test webhook (sau P7 media):**

```bash
# .env: SALESMARTLY_ENABLED=1, SALESMARTLY_WEBHOOK_SECRET=..., ADMIN_TELEGRAM_CHAT_ID=..., TELEGRAM_BOT_TOKEN=...
npm run dev
./scripts/test-salesmartly-webhook.sh http://localhost:3000
```

**Không cần:** lungmat đọc TG DM khách trực tiếp.

---

## 8. Checklist Founder — chốt phương án

```text
☐ Chốt M2: SM = inbox TG DM, GoClaw = AI, Human = assign hot
☐ Chỉ connect Telegram trên SM (tắt kênh khác)
☐ Bot brand Alpha ≠ @linhcau79_bot
☐ Tắt SM AI khi bật GoClaw CSKH
☐ Phase 0: SM + human trước, GoClaw sau
☐ HOT → notify ADMIN_TELEGRAM_CHAT_ID (wire P1)
☐ Media publish vẫn admin TG + Zernio (tách luồng)
```

---

## 9. Khi KHÔNG cần SalesMartly

Chỉ dùng **GoClaw CSKH + admin TG HOT** nếu:

- Volume < ~5 DM/ngày  
- Founder OK scroll Telegram  
- Không cần báo cáo pipeline  

→ Xem [`TELEGRAM_ONLY_GUIDE.md`](./TELEGRAM_ONLY_GUIDE.md) §6 (không SM).

---

## 10. Tài liệu liên quan

| File | Vai trò |
|------|---------|
| [`TELEGRAM_ONLY_GUIDE.md`](./TELEGRAM_ONLY_GUIDE.md) | SSOT scope TG |
| [`goclaw-export/alpha-cskh-1to1-skill.md`](./goclaw-export/alpha-cskh-1to1-skill.md) | Skill AI |
| [`SOP_SalesMartly_Hybrid.md`](./SOP_SalesMartly_Hybrid.md) | Webhook schema |
| [`SWOT_HYBRID_1TO1_SALESMARTLY_GOCLAW.md`](./SWOT_HYBRID_1TO1_SALESMARTLY_GOCLAW.md) | SWOT đầy đủ (tham khảo) |

---

> **Một câu:** SalesMartly = **sổ TG DM** + tag/assign; GoClaw = **nhân viên AI** qualify/FAQ; Human = **chốt hot trong SM** — chỉ Telegram, không kênh khác.
