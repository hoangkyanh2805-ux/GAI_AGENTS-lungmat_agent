# Alpha n8n — Phases & checklist (không đi lạc)

> **Bạn đang ở:** **Phase 2** (điền key + credential) — sau khi giữ **1 dãy** Flow B trên canvas.  
> **Không làm sâu:** Zernio OpenAPI chi tiết, Drive MCP, Raymond/VIP → Phase 5+.

---

## Còn mấy flow? (M0)

| Loại | Số workflow | Bắt buộc? |
|------|-------------|-----------|
| **Flow B** — Claude → TG → Zernio (canvas `alpha-m0-template`) | **1** | **Có** — bạn **đã có**, không import thêm |
| **Flow A** — GDrive list ảnh | **0–1** | **Không** — bỏ qua nếu upload ảnh tay Zernio |
| Raymond / VIP / azzam | 0 (M1) | Chưa |

**Kết luận M0:** **0 flow mới** nếu giữ canvas hiện tại. Chỉ **điền key 1 lần** → test → (tuỳ chọn) export JSON backup.

**Import JSON lại** chỉ khi: máy/instance mới, hoặc canvas hỏng — file: [`workflows/alpha-m0.template.json`](../workflows/alpha-m0.template.json).

---

## Một lần: export / import / key

| Bước | Làm 1 lần | Ghi chú |
|------|-----------|---------|
| Import | **Không cần** nếu canvas đã đúng 1 dãy | Instance mới: Import `alpha-m0.template.json` |
| Export backup | n8n ⋯ → Download → `alpha-m0.live.json` (local) | Sau Phase 3 pass; **không** commit secret |
| Điền key | **Chỉ** n8n **Settings → Variables** + **1** credential Telegram | **Không** điền key trong Init Config / sticky |

Danh sách key (copy 1 block): [`N8N_ALPHA_KEYS_SETUP.md`](./N8N_ALPHA_KEYS_SETUP.md) §1.

---

## Chia để trị — 5 khối trên 1 canvas

Test **từng khối** trước full run: [`N8N_CHIA_DE_TRI_ALPHA.md`](./N8N_CHIA_DE_TRI_ALPHA.md) (K1 Init → K2 Content → K3 mediaId → K4 TG → K5 Zernio).

---

## Bản đồ phase (5 phase)

| Phase | Tên | Mục tiêu | Trạng thái (tự tick) |
|-------|-----|----------|----------------------|
| **0** | Chuẩn bị | Đọc doc, 1 workflow, xóa dãy trùng | [ ] Done |
| **1** | Flow A (tuỳ chọn) | GDrive → TG → có `mediaId` | [ ] Skip / [ ] Done |
| **2** | **Điền key** | Env n8n + credential node | **← ĐANG Ở ĐÂY** |
| **3** | Test Manual | 1 lần chạy xanh → TG duyệt → Zernio Published | [ ] |
| **4** | Production M0 | Sheet + Cron 08:00, export backup | [ ] |
| **5** | M1 (sau) | Drive auto, thêm brand, azzam webhook | Chưa làm |

**Flow B (canvas hiện tại)** = Phase 2 → 3 → 4.  
**Flow A** = Phase 1 riêng — chỉ khi cần lấy ảnh từ Drive trước khi đăng ([`N8N_ALPHA_FLOW_A_GDRIVE.md`](./N8N_ALPHA_FLOW_A_GDRIVE.md)).

---

## Phase 0 — Chuẩn bị

- [ ] Canvas chỉ còn **1 dãy**: Manual → Init → Claude → … → Zernio → Sheet (tắt)
- [ ] Cron **disabled**
- [ ] Google Sheet Log **disabled**
- [ ] Zernio Publish **chưa** test publish thật (hoặc URL đã sửa nhưng chưa Execute)

---

## Phase 1 — Flow A GDrive (tuỳ chọn)

Bỏ qua nếu ảnh đã upload tay lên Zernio Media.

- [ ] A pass theo [`N8N_ALPHA_FLOW_A_GDRIVE.md`](./N8N_ALPHA_FLOW_A_GDRIVE.md) §5  
- [ ] Có sẵn **1 `mediaId`** để dùng ở Phase 3  

---

## Phase 2 — Điền key (làm ngay)

### 2.1 Biến môi trường (n8n → Settings → Variables)

| Biến | Bắt buộc Phase 3? | Lấy ở đâu |
|------|---------------------|-----------|
| `ANTHROPIC_API_KEY` | **Có** | console.anthropic.com |
| `ZERNIO_API_KEY` | **Có** (khi publish) | Zernio dashboard / API |
| `ZERNIO_API_BASE` | **Có** | Base URL API Zernio (đúng tenant) |
| `N8N_TELEGRAM_ADMIN_CHAT_ID` | **Có** | Chat id Founder (số) |
| `N8N_TELEGRAM_BOT_TOKEN` | Có* | @BotFather — *nếu node không dùng credential riêng |
| `N8N_MEDIA_SHEET_ID` | Phase 4 | Google Sheet ID |
| `N8N_MEDIA_JSON_DIR` | Phase 4+ | VPS path, có thể để sau |

Checklist:

- [ ] Đã tạo đủ biến trên  
- [ ] Không paste key vào sticky note / commit git  

### 2.2 Credential từng node (click node đỏ)

| Node | Credential | Phase |
|------|------------|-------|
| **Claude Writer** | Dùng env `ANTHROPIC_API_KEY` (header) — node hết đỏ khi env có | 2 |
| **Telegram Preview** + **Telegram FAIL** | Telegram Bot API | 2 |
| **Zernio Publish** | Bearer qua env hoặc Header Auth | 2 |
| **Google Sheet Log** | Google OAuth — **để trống đến Phase 4** | 4 |

- [ ] Không còn node đỏ trừ Sheet (được tắt/disabled)

### 2.3 Init Config (node Set — không phải secret)

Đã có trong template; kiểm tra khớp [`config/n8n/brands.json`](../config/n8n/brands.json):

- [ ] `zernio_account_ids`: X `6a0c6dbd5e333c05299f1d12`, Threads `6a0c28345e333c05299b981a`

**Phase 2 xong khi:** env + Telegram + Claude không lỗi credential; Zernio node cấu hình key (chưa cần publish thành công).

Chi tiết điền key: [`N8N_ALPHA_KEYS_SETUP.md`](./N8N_ALPHA_KEYS_SETUP.md)

---

## Phase 3 — Test Manual (1 lần)

Không bật Cron. Có sẵn **`mediaId`** (Zernio Media).

| # | Việc | [ ] |
|---|------|-----|
| 3.1 | Save workflow | |
| 3.2 | **Manual Trigger** → Execute | |
| 3.3 | Claude Writer **xanh** (có JSON) | |
| 3.4 | Compliance **PASS** (hoặc sửa / re-run) | |
| 3.5 | Telegram nhận **preview** | |
| 3.6 | Resume **Wait Approval** với `approved` + `media_id` | |
| 3.7 | Sửa **Zernio Publish** URL/body nếu 4xx — chỉ khi lỗi | |
| 3.8 | Dashboard Zernio: **Published** | |

Resume mẫu:

```json
{ "approved": true, "media_id": "PASTE_ID", "reply_text": "OK đăng" }
```

**Phase 3 xong** = 3.3–3.8 tick. Chi tiết lỗi: [`N8N_ALPHA_FLOW_B_CLAUDE_ZERNIO.md`](./N8N_ALPHA_FLOW_B_CLAUDE_ZERNIO.md) §4 — chỉ mở khi fail.

---

## Phase 4 — Production M0

- [ ] 3 lần Manual ổn (không duplicate Threads)
- [ ] Bật **Google Sheet Log** + `N8N_MEDIA_SHEET_ID`
- [ ] Bật **Cron 08:00 VN** (`Asia/Ho_Chi_Minh`)
- [ ] Export `alpha-m0.live.json` (local, không commit secret)
- [ ] Freeze GoClaw Alpha publish cùng ngày
- [ ] Tick [`MEDIA_PIPELINE_N8N_M0.md`](./MEDIA_PIPELINE_N8N_M0.md) §5 done

---

## Phase 5 — M1 (chưa làm)

Drive → Zernio auto, @azzamgoldpro, Raymond/VIP — **không** làm khi Phase 3 chưa xong.

---

## Đừng đi lạc (bỏ qua đến Phase 5)

- Sửa full SKILL / prompt dài trong Claude (M0: prompt ngắn trong node đủ test)
- GoClaw Orchestrator / Team Router / MCP publish
- Node **X API** trực tiếp song song Zernio
- Raymond / VIP workflow
- Sub-workflow tách file JSON từng stage (nice-to-have)

---

## Liên kết nhanh

| Cần | Doc |
|-----|-----|
| Điền key từng bước | [`N8N_ALPHA_KEYS_SETUP.md`](./N8N_ALPHA_KEYS_SETUP.md) |
| Flow B chi tiết (khi fail) | [`N8N_ALPHA_FLOW_B_CLAUDE_ZERNIO.md`](./N8N_ALPHA_FLOW_B_CLAUDE_ZERNIO.md) |
| Flow A (ảnh Drive) | [`N8N_ALPHA_FLOW_A_GDRIVE.md`](./N8N_ALPHA_FLOW_A_GDRIVE.md) |
