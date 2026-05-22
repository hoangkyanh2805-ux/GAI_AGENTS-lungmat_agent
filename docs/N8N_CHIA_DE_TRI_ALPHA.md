# Tư duy chia để trị — Alpha M0 (n8n)

> Áp dụng nguyên tắc **chia bài toán lớn → từng khối nhỏ** (infographic *Chia để trị trong n8n*) vào pilot **Alpha Trading Lab**.  
> **Không GoClaw** cho publish Alpha — mỗi khối = vùng node / workflow riêng, test được độc lập.

**Liên quan:** [`MEDIA_PIPELINE_N8N_M0.md`](./MEDIA_PIPELINE_N8N_M0.md) · [`N8N_ALPHA_PHASES_CHECKLIST.md`](./N8N_ALPHA_PHASES_CHECKLIST.md)

---

## 1. Bài toán lớn (trước đây) vs M0 (sau)

| Trước (GoClaw) | Sau (n8n chia để trị) |
|----------------|------------------------|
| Orchestrator + Team + MCP + CLI | **5 khối** nối tuần tự |
| Một chat làm hết → lỗi khó đoán | Mỗi khối **Execute node** / workflow riêng |
| Fake link, trùng đăng | Zernio HTTP **một** khối Publish |
| Ảnh + chữ + đăng lẫn | Khối **Media** tách khối **Content** |

---

## 2. Năm bước (map infographic → dự án)

| Bước infographic | Alpha M0 |
|------------------|----------|
| **1. Xác định mục tiêu** | 1 bài/ngày: draft X+Threads + TG duyệt + Zernio Published ([`MEDIA_PIPELINE_N8N_M0.md`](./MEDIA_PIPELINE_N8N_M0.md) §5) |
| **2. Phân rã** | 5 khối dưới — mỗi khối 1 “agent” |
| **3. Dựng workflow** | 1 canvas M0 (hoặc 5 workflow M1) |
| **4. Test & tối ưu** | Test **từng khối** trước khi nối full |
| **5. Đo & mở rộng** | Sheet log + Cron → Raymond/VIP (M1) |

---

## 3. Năm khối — SSOT

```text
[K1 Init] → [K2 Content] → [K3 Media] → [K4 Approval] → [K5 Publish+Log]
```

| Khối | Agent | Node trên canvas (gợi ý đặt tên) | Output | Test riêng |
|------|-------|-----------------------------------|--------|------------|
| **K1** Init | — | `Bootstrap` / `Init Config` + `Init Run` | `run_id`, `brands`, `topic` | Execute → có `run_id` |
| **K2** Content | **Content Writer** | `Claude Writer` hoặc `AI Agent Content` → `Parse Pack` → `Compliance` | `pack` JSON | Mock topic → JSON + PASS |
| **K3** Media | **Media** | M0: không node — `mediaId` từ Zernio tay; M1/Flow A: `Check GDrive` | `media.json` | Có `mediaId` hợp lệ |
| **K4** Approval | **Telegram** | `Telegram Preview` / `Send and wait` → `Parse Approval` | `telegram.json` | TG nhận draft + OK đăng |
| **K5** Publish+Log | **Zernio + Sheet** | `Zernio Publish` → `Merge Run` → `Google Sheet Log` | `publish.json`, 1 dòng Sheet | Dashboard Published |

**Config chung:** [`config/n8n/brands.json`](../config/n8n/brands.json) — accountIds X / Threads.

---

## 4. Trên canvas n8n (M0 — 1 workflow, 5 vùng)

Dùng **sticky note** (5 màu) bọc từng nhóm node — dễ nhìn, không đổi logic:

| Sticky | Phủ node |
|--------|----------|
| **K1 — Init** | Trigger, Bootstrap, Init |
| **K2 — Content** | Claude / AI Agent, Parse, Compliance IF |
| **K3 — Media** | *(M0: ghi chú “mediaId tay” trên sticky Wait)* |
| **K4 — Approval** | Telegram preview, Send and wait, Parse approval |
| **K5 — Publish** | Zernio, Merge, Sheet, Confirm TG |

File template:

- HTTP: [`workflows/alpha-m0.template.json`](../workflows/alpha-m0.template.json)
- TG loop #11138: [`workflows/alpha-m0-11138-telegram.template.json`](../workflows/alpha-m0-11138-telegram.template.json)

---

## 5. Thứ tự test (chia để trị — không test cả dây ngay)

| Bước | Khối | Pass khi |
|------|------|----------|
| T1 | K1 | `run_id` + accountIds đúng |
| T2 | K2 | Claude trả JSON, compliance **PASS** |
| T3 | K3 | Có `mediaId` (upload Zernio Media) — **không** cần node |
| T4 | K4 | TG preview + reply OK đăng + mediaId |
| T5 | K5 | Zernio Published + (tuỳ chọn) 1 dòng Sheet |

Sau T1→T5: chạy **full Manual** một lần → Phase 3 done ([`N8N_ALPHA_PHASES_CHECKLIST.md`](./N8N_ALPHA_PHASES_CHECKLIST.md)).

---

## 6. M1 — tách thành workflow riêng (mở rộng)

Khi M0 ổn, mỗi khối có thể thành **sub-workflow** n8n:

| Workflow file (đề xuất) | Khối |
|-------------------------|------|
| `alpha-k2-writer.json` | K2 Content |
| `alpha-k3-media-gdrive.json` | K3 Flow A |
| `alpha-k4-telegram.json` | K4 (webhook approve) |
| `alpha-k5-zernio-publish.json` | K5 |
| `alpha-orchestrator.json` | K1 + gọi Execute Workflow |

**Orchestrator** chỉ truyền `run_id` + `pack` + `media_id` — giống `{runId}.json` schema.

---

## 7. Không làm (tránh “bài toán lớn” lại)

- Một AI Agent làm viết + tạo ảnh + đăng + log (template #11138 gốc) — **đã bỏ** Gemini/Blotato/FB/IG.
- GoClaw Orchestrator chạy song song n8n cùng ngày.
- Thêm node không thuộc K1–K5 trước khi T1–T5 pass.

---

## 8. Checklist nhanh (dán Notion / TG)

- [ ] K1 Init xanh  
- [ ] K2 Content PASS  
- [ ] K3 có mediaId  
- [ ] K4 TG duyệt OK  
- [ ] K5 Zernio Published  
- [ ] Sticky 5 vùng trên canvas (tuỳ chọn, 5 phút)  
- [ ] Export `alpha-m0.live.json` backup  
