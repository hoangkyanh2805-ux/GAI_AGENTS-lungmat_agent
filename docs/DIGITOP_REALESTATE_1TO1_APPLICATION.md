# Digitop BĐS — Telegram 1:1 khách hàng (khác Linh Cẩu)

> **Scope:** **Chỉ Telegram** — SSOT: [`TELEGRAM_ONLY_GUIDE.md`](./TELEGRAM_ONLY_GUIDE.md)  
> **Nguồn:** [Digitop — Real Estate use case](https://digitop.ai/use-cases/real-estate/) (UC-01 CSKH 24/7, UC-02 data isolation, UC-05 Agent Teams)  
> **Liên quan:** [`DIGITOP_AGENCY_APPLICATION.md`](./DIGITOP_AGENCY_APPLICATION.md) · [`CODEBASE_AUDIT_DIGITOP_TELEGRAM.md`](./CODEBASE_AUDIT_DIGITOP_TELEGRAM.md)

**Cập nhật:** 2026-05-19

---

## 1. Vấn đề Founder đặt ra

| Kênh | Ai trả lời | Loại hội thoại |
|------|------------|----------------|
| **Linh Cẩu** `@linhcau79_bot` | Agent giáo dục / Vault | Cộng đồng, Q&A trading concept — **không** sales 1:1 |
| **Telegram 1:1 khách** | ❓ Chưa thiết kế rõ | Khách nhắn riêng: hỏi VIP, giá, đăng ký, follow-up — **giống CSKH BĐS** |
| **Admin DM Founder** | Lửng Mật `/coach` | Chỉ `ADMIN_TELEGRAM_CHAT_ID` — vận hành Media OS |

**Sai lầm cần tránh:** dùng **một bot Linh Cẩu** vừa dạy vault vừa chốt sale 1:1 → lẫn giọng, lộ sales data vào Shared Vault, vi phạm compliance (VIP10X tone trên bot “giáo dục”).

---

## 2. Digitop BĐS map sang Trading / Media OS

### 5 pain BĐS → bài toán của bạn

| Pain Digitop BĐS | Tương đương Media OS / Trading community |
|------------------|------------------------------------------|
| Lead trễ → mất khách | Khách DM hỏi VIP Alpha lúc 23h, sáng mới reply → sang group đối thủ |
| Data rải rác Zalo/Excel | Lead nằm TG cá nhân Founder, không CRM |
| Shadow AI (paste ChatGPT) | NV paste SĐT khách lên ChatGPT công cộng |
| Paperwork 60–70% | Founder tự trả lời lặp “giá VIP?”, “vào kênh sao?” |
| Không thấy pipeline | Không biết lead nào nóng, ai nurture |

### 5 UC Digitop → giải pháp đề xuất

| UC Digitop | Map dự án | Nền tảng |
|------------|-----------|----------|
| **UC-01** CSKH 24/7, qualify lead | **Brand CSKH Agent** (1:1 TG) | **GoClaw** (Telegram channel) |
| **UC-02** Data isolation theo dự án/team | Tách memory **per user** + **per brand**; sales FAQ **không** Shared Vault foundation | GoClaw Team/Agent scope |
| **UC-03** Chống Shadow AI | AI nội bộ GoClaw, không paste CRM ra ChatGPT | GoClaw enterprise |
| **UC-04** Soạn báo cáo / template | Cron pipeline báo cáo lead tuần (P2) | GoClaw Cron |
| **UC-05** Agent Teams pipeline | Tiếp nhận → qualify → nurture → báo cáo | GoClaw multi-agent (đơn giản hóa) |

---

## 3. Kiến trúc 4 làn — bắt buộc tách

```text
                    KHÁCH HÀNG / FOUNDER
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
  LANE A                  LANE B                 LANE D
  Linh Cẩu 🐆            Brand CSKH 1:1          Admin DM
  (public/edu)          (sales/support)        (Founder ops)
        │                     │                     │
  Vault foundation      Product FAQ Vault       /coach Lửng Mật
  No hard sell          Per-user memory         Approval content
  No lead CRM dump      Qualify + handoff       Zernio OK
        │                     │
        │               LANE C (optional)
        │               SalesMartly → webhook
        └─────────────────────┴── KHÔNG merge Shared Vault sales ↔ trading edu
```

### Lane A — Linh Cẩu (giữ nguyên vai)

- **Mục tiêu:** giáo dục, retrieve `docs/vault-seed/`, tone trung lập / coach.
- **Kênh:** bot công khai, group (nếu có), DM **chỉ** Q&A kiến thức — redirect sales sang Lane B.
- **Không:** báo giá VIP, hứa lợi nhuận, thu SĐT vào Shared memory.

**Prompt guard (thêm vào GoClaw Linh Cẩu Skill):**

```text
Nếu user hỏi giá VIP / đăng ký / mua khóa / inbox sale:
→ Trả lời ngắn + hướng DM bot brand tương ứng hoặc link onboarding (không thu lead tại đây).
```

### Lane B — Brand CSKH Telegram 1:1 (mới — Digitop UC-01)

| Thành phần | Mô tả |
|------------|--------|
| **Agent** | `Alpha CSKH` · `Raymond CSKH` · `VIP10X CSKH` (3 agent GoClaw **riêng**) |
| **Bot** | Khuyến nghị **1 bot Telegram / brand** (map `brands.json` → `TELEGRAM_CHAT_ID_*` là channel; bot DM dùng `user_id`) |
| **Vault** | Layer **Team/Agent**: FAQ giá, quy trình join channel, objection — **không** mix 3 brand |
| **Memory** | GoClaw **per-user** — lịch sử 1:1 khách A không lộ cho khách B |
| **Hành vi** | Trả lời <30s; thu: tên, kinh nghiệm, mục tiêu, timeline; **không** signal buy/sell |
| **Handoff** | `HOT_LEAD` → notify `ADMIN_TELEGRAM_CHAT_ID` + tóm tắt hội thoại |

### Lane C — SalesMartly (CRM hub — khuyến nghị kết hợp)

- **SSOT contact:** [`app.salesmartly.com/next/contact/all`](https://app.salesmartly.com/next/contact/all) — mọi TG/Zalo/FB gom một inbox.
- GoClaw CSKH = não AI; Human assign trong SM khi HOT.
- Webhook → `lungmat` (`SalesMartlyClient`) — skeleton, **chưa mount**.
- **Phương án chốt + SWOT:** [`SWOT_HYBRID_1TO1_SALESMARTLY_GOCLAW.md`](./SWOT_HYBRID_1TO1_SALESMARTLY_GOCLAW.md)

### Lane D — Admin (đã có)

- `CoachAgent` + `ADMIN_TELEGRAM_CHAT_ID` — **không** phải CSKH khách.
- Approval content → Zernio (Media lane, khác sales lane).

---

## 4. Pipeline Agent Teams (đơn giản — Digitop UC-05)

Không cần 4 agent phức tạp lúc MVP — gộp vào **một Skill CSKH** có phase nội bộ:

```text
1. TIẾP NHẬN  — chào, xác nhận brand, hỏi 2–3 câu qualify
2. PHÂN LOẠI — cold / warm / hot (rule-based)
3. TRẢ LỜI   — FAQ từ Vault brand; trading deep → "em gửi anh link kênh / bài vault"
4. HANDOFF   — hot → ping Founder TG; warm → tag nurture (nhắc follow 48h cron P2)
5. LOG       — 1 dòng CRM (sheet/Supabase P2)
```

**Cron P2 (Digitop UC-04/05):**

- 08:00 T2: báo cáo pipeline tuần → Admin DM (số lead hot/warm, câu hỏi lặp).

---

## 5. Audit hiện trạng vs cần có

### 5.1 Bảng audit

| Khả năng | Linh Cẩu (GoClaw) | lungmat `TelegramReceiver` | SalesMartly SOP | Cần làm |
|----------|-------------------|----------------------------|-----------------|---------|
| Free-text 1:1 (không slash) | ✅ GoClaw native | ❌ Chỉ `/command` | ✅ (platform) | **Lane B trên GoClaw** |
| Qualify lead 24/7 | ❌ Sai vai | ❌ | ✅ thiết kế | Brand CSKH Skill |
| Per-user memory | ✅ GoClaw | `MemoryAgent` dev only | SM CRM | GoClaw per-user |
| Brand isolation | ⚠️ 1 bot | N/A | Per flow | 3 agent hoặc 3 bot |
| Compliance trading | Vault | `SafetyAgent` dev | Cần rule | Skill taboo sales |
| Human handoff hot | ❌ | ❌ | TODO webhook | Notify admin TG |
| Không lẫn với `/coach` | ✅ khác chat | `isAdminChat` | N/A | Giữ tách |
| CRM / audit log | GoClaw audit | File logs | Planned | P2 Supabase |

### 5.2 Kết luận audit

| Mức | Kết luận |
|-----|----------|
| **Phù hợp GoClaw?** | **Có** — UC-01 BĐS = Telegram 1:1 CSKH chính là thế mạnh GoClaw (đa kênh, memory, agent tách). |
| **Dùng Linh Cẩu cho 1:1 sales?** | **Không** — tách Lane B. |
| **Dùng lungmat prod cho 1:1?** | **Không** — receiver không đọc free text; pivot prod = GoClaw. |
| **SalesMartly** | **Optional** khi thêm Zalo/FB; TG thuần → Lane B đủ MVP. |

---

## 6. Triển khai GoClaw (checklist Founder)

### P0 — Alpha CSKH 1:1 (sau Alpha Writer pilot)

| # | Việc |
|---|------|
| 1 | Tạo agent **Alpha CSKH** (Skill riêng, **không** share Skill với Linh Cẩu) |
| 2 | Vault **Team Alpha**: `faq-pricing.md`, `faq-onboarding.md`, `objections.md` (không upload Shared) |
| 3 | Map Telegram bot Alpha → agent CSKH (DM + optional channel khác) |
| 4 | Skill: qualify script + compliance (no signal) + handoff hot → Admin DM |
| 5 | Test: 3 persona khách (lạnh / hỏi giá / hot muốn VIP ngay) |

### P1 — Raymond + VIP10X CSKH

- Clone Skill, đổi persona + Vault Team tương ứng.

### P2 — Pipeline & đa kênh

- Cron báo cáo lead; wire SalesMartly webhook; CRM row per `conversation_id`.

---

## 7. Skill export — skeleton (paste GoClaw)

File đầy đủ: [`docs/goclaw-export/alpha-cskh-1to1-skill.md`](./goclaw-export/alpha-cskh-1to1-skill.md)

Tóm tắt hành vi:

- Xưng hệ theo brand Alpha (institutional, không hype VIP10X).
- Thu lead: `tên`, `kinh nghiệm trading`, `mục tiêu`, `timeline`.
- Cấm: entry/SL/TP, “chắc ăn”, cam kết lợi nhuận.
- Hot lead: gửi Founder `ADMIN_TELEGRAM_CHAT_ID` template tóm tắt.
- Deep TA: “Anh xem thêm kênh Alpha / bài vault” — không thay thế Linh Cẩu dài.

---

## 8. So sánh 3 hướng xử lý 1:1

| Hướng | Ưu | Nhược | Verdict |
|-------|-----|-------|---------|
| **A. Linh Cẩu trả hết** | 1 bot | Lẫn edu/sales, compliance | ❌ |
| **B. GoClaw Brand CSKH ×3** | Đúng Digitop, tách memory | Setup 3 agent | ✅ **MVP** |
| **C. SalesMartly + webhook** | Zalo/FB | Code TODO | 🟡 Scale only |
| **H. Hybrid Hub (SM+GoClaw+Human)** | CRM + AI + chốt | Setup 2 tool | ✅ **Khuyến nghị** nếu đã dùng SM |

---

## 9. Liên kết tài liệu repo

| File | Vai trò |
|------|---------|
| `config/brands.json` | 3 brand + env chat channel |
| `src/auth/isAdminChat.ts` | Chỉ Lane D |
| `src/integrations/SalesMartlyClient.ts` | Lane C skeleton |
| `docs/SOP_SalesMartly_Hybrid.md` | Hybrid flow đầy đủ |
| `docs/XAUUSD_MEDIA_OS.md` §2.1 | Topology kênh (cập nhật thêm Lane B) |

---

## 10. Tóm tắt 1 câu

> **Khách nhắn Telegram 1:1** = **Lane B (Brand CSKH trên GoClaw)**, giống Digitop BĐS UC-01; **Linh Cẩu** chỉ Lane A giáo dục; **Founder admin** = Lane D; SalesMartly = Lane C khi mở thêm kênh.

*Tham chiếu: [digitop.ai/use-cases/real-estate](https://digitop.ai/use-cases/real-estate/)*
