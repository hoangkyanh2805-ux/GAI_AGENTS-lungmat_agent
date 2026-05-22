# Codebase audit — Digitop BĐS UC vs thực tế (Telegram only)

> **Câu hỏi:** Case [Digitop Real Estate](https://digitop.ai/use-cases/real-estate/) có **thật trong repo** không?  
> **Scope dự án:** **Chỉ Telegram** — không Zalo/FB/WhatsApp trong code.  
> **Ngày audit:** 2026-05-19 · **Refresh:** 2026-05-19 (SalesMartly mount)  
**SSOT pilot verify:** [`PILOT_ALPHA_AUDIT_STATUS.md`](./PILOT_ALPHA_AUDIT_STATUS.md)

---

## 1. Kết luận một câu

**Digitop BĐS (CSKH 1:1 free-text 24/7 + qualify + CRM + Agent Teams) — chưa có trong `lungmat-agent` source.**  
Có: **tài liệu plan** (`docs/DIGITOP_*`, `docs/goclaw-export/alpha-cskh-1to1-skill.md`) + **GoClaw ngoài repo** (nếu Founder đã deploy).  
Trong repo: Telegram **chỉ slash command** + **approval publish** + **admin `/coach`** — đó là Media OS, không phải sales CSKH 1:1.

---

## 2. Bảng Digitop UC → code `src/`

| Digitop UC | Mô tả marketing | Trong `lungmat-agent`? | Bằng chứng |
|------------|-----------------|------------------------|------------|
| **UC-01** CSKH 24/7, reply 5s, qualify lead | Chat 1:1 tự do | ❌ **Không** | `TelegramReceiver` bỏ qua tin không bắt đầu `/` |
| **UC-02** Data isolation theo dự án | Multi-tenant CRM | ⚠️ **Một phần** | `config/brands.json` + `TELEGRAM_CHAT_ID_*` cho **publish channel**, không CRM 1:1 |
| **UC-03** Chống Shadow AI | Enterprise AI nội bộ | ❌ Không (policy/process) | Không module |
| **UC-04** Auto báo cáo / paperwork | Cron báo cáo | ❌ Không | `DailyReportAgent` khác mục đích |
| **UC-05** Agent Teams pipeline | Tiếp nhận→qualify→nurture | ❌ Không | Chỉ `SupervisorAgent` route slash |

---

## 3. Telegram trong repo — cái gì **có thật**

| Tính năng | File | Live? |
|-----------|------|-------|
| Nhận lệnh `/content`, `/market_summary`, … | `TelegramReceiver.ts` L96 `startsWith('/')` | ✅ Có (long-poll hoặc webhook) |
| Webhook Telegram | `routes/telegramWebhook.ts`, mount `index.ts` L245 | ✅ Có |
| Approval nút inline TG/X/Threads | `telegramCallback.ts`, `ApprovalStore` | ✅ Có (verify 7B/7C) |
| Admin DM duyệt draft | `ADMIN_TELEGRAM_CHAT_ID`, scheduler publish draft | ✅ Có |
| `/coach` Lửng Mật **chỉ admin** | `CoachAgent.ts` + `isAdminChat.ts` | ✅ Có code — verify live pending |
| `/lead_capture` | `skills/leadCapture.ts` | ⚠️ Stub — in-memory reply, **không** lưu CRM |
| `SalesAgent` | `SalesAgent.ts` | ⚠️ Chỉ 3 slash skills |
| Free-text khách 1:1 | — | ❌ **Không** |
| `HOT_LEAD` → notify Founder | `SalesMartlyClient.ts` | ✅ Code — `TelegramClient` → `ADMIN_TELEGRAM_CHAT_ID` |
| SalesMartly webhook | `routes/salesmartly.ts`, `index.ts` | ✅ **Mounted** — chưa E2E test |
| GoClaw / Zernio | — | ❌ **Không** trong `src/` (chỉ `docs/goclaw-export/`) |
| Alpha CSKH agent | `docs/goclaw-export/alpha-cskh-1to1-skill.md` | ❌ Markdown export, chưa runtime repo |

### Đoạn code quyết định (không 1:1 free-text)

```96:96:src/integrations/TelegramReceiver.ts
    if (!text.startsWith('/')) return;
```

---

## 4. SalesMartly — có trong code không?

| Hạng mục | Thực tế |
|----------|---------|
| `SalesMartlyClient.ts` | ✅ File tồn tại |
| `routes/salesmartly.ts` | ✅ File tồn tại |
| Mount `app.use(...salesmartly)` | ✅ `index.ts` |
| `dispatchToAgent` | ✅ Log only — **không** auto `/content` (CSKH qua GoClaw) |
| `notifyHumanHandler` | ✅ Gửi admin Telegram |
| `.env.example` | ✅ `SALESMARTLY_ENABLED`, `SALESMARTLY_WEBHOOK_SECRET` |
| E2E test | ❌ Chưa | `scripts/test-salesmartly-webhook.sh` |
| Kênh Zalo/FB trong code | ❌ **Không** — scope chỉ Telegram |

**SalesMartly** = SaaS ngoài repo; webhook lungmat chỉ khi `SALESMARTLY_ENABLED=1`. UI `contact/all` = Founder setup.

---

## 5. Scope “chỉ Telegram” — chỉnh lại plan

| Thành phần doc cũ | Telegram-only |
|-------------------|---------------|
| SalesMartly gom Zalo/FB | **Bỏ** trừ khi Founder chỉ connect **Telegram vào SM** |
| GoClaw 7 kênh Digitop | **Chỉ** Telegram channel trên GoClaw |
| Hybrid Hub đa kênh | Rút gọn: **TG bot(s) + optional SM-as-inbox-TG-only** |

**Phương án thực tế Telegram-only (3 lựa chọn):**

| # | Mô hình | Code repo | GoClaw |
|---|---------|-----------|--------|
| **T1** | 1 bot lungmat: slash + approval (hiện tại) | ✅ | Không cần cho 1:1 sales |
| **T2** | GoClaw bot brand: free-text CSKH 1:1 | ❌ | ✅ Paste `alpha-cskh-1to1-skill.md` |
| **T3** | TG → SalesMartly inbox → human (SM UI) | ❌ wire | SM product, không lungmat |

**Không thể** có UC-01 Digitop đầy đủ **chỉ bằng lungmat VPS** mà không GoClaw hoặc SM.

---

## 6. So khớp pain Digitop (Telegram)

| Pain BĐS | Telegram-only thực tế hôm nay |
|----------|----------------------------------|
| Trễ reply 1:1 | Founder trả tay hoặc **chưa** có bot free-text |
| Data rải Excel/Zalo | Có thể TG cá nhân — **không** CRM trong repo |
| Shadow AI | Ngoài phạm vi code |
| Paperwork lặp | `/lead_capture` không lưu DB |
| Không thấy pipeline | Không có tag hot/warm trong code |

---

## 7. Việc cần làm nếu muốn UC-01 **thật** (Telegram only)

**Tối thiểu (không SalesMartly):**

1. GoClaw: agent **Alpha CSKH** + bot TG brand (paste skill đã có).  
2. Linh Cẩu: redirect câu sales sang bot CSKH.  
3. Human: `ADMIN_TELEGRAM_CHAT_ID` nhận HOT (trong skill GoClaw).

**Nếu muốn CRM trong SalesMartly (chỉ TG):**

1. Connect **chỉ Telegram** vào SM — dùng UI, không cần Zalo trong code.  
2. Test webhook: `scripts/test-salesmartly-webhook.sh` + `SALESMARTLY_ENABLED=1`.  
3. Không bật SM AI + GoClaw cùng lúc (1 thread 1 responder).

**Không cần code lungmat** cho free-text 1:1 nếu chọn **T2 GoClaw-only**.

---

## 8. Tài liệu vs code (tránh nhầm)

| Loại | Ví dụ | Là code? |
|------|-------|----------|
| Plan / marketing map | `DIGITOP_REALESTATE_1TO1_APPLICATION.md`, `SWOT_HYBRID_*` | ❌ |
| GoClaw paste | `goclaw-export/*.md` | ❌ (runtime GoClaw UI) |
| Runtime lungmat | `src/agents/ContentAgent.ts`, `TelegramReceiver.ts` | ✅ |
| External | GoClaw VPS, SalesMartly SaaS, Zernio | Ngoài repo |

---

*Audit by static review `src/` + `index.ts` mounts. Production GoClaw state không nằm trong git.*
