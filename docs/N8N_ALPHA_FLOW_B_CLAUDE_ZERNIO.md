# Flow B — Alpha n8n (Claude Writer + Zernio — template repo)

> **Phase hiện tại:** xem [`N8N_ALPHA_PHASES_CHECKLIST.md`](./N8N_ALPHA_PHASES_CHECKLIST.md) — điền key: [`N8N_ALPHA_KEYS_SETUP.md`](./N8N_ALPHA_KEYS_SETUP.md)

> **Một canvas = một dãy node.** Nếu thấy **2 luồng song song** (trên: `Claude Writer` + `Compliance PASS?` · dưới: `0 Init Run` → `1 Writer Agent`…) — đó là **trùng** cùng pipeline, không phải Flow A + B. **Xóa dãy dưới** (scaffold) hoặc dãy trên; giữ **một** (khuyến nghị: dãy trên từ `alpha-m0.template.json`).

> **Khi nào:** Sau khi **Flow A pass** ([`N8N_ALPHA_FLOW_A_GDRIVE.md`](./N8N_ALPHA_FLOW_A_GDRIVE.md)).  
> **Mục tiêu B:** Viết bài Claude → compliance → Telegram duyệt → **Zernio HTTP** publish X+Threads → log JSON/Sheet.  
> **File import:** [`workflows/alpha-m0.template.json`](../workflows/alpha-m0.template.json)

**SSOT:** [`MEDIA_PIPELINE_N8N_M0.md`](./MEDIA_PIPELINE_N8N_M0.md) · **Prompt:** [`config/n8n/prompts/alpha-writer-system.md`](../config/n8n/prompts/alpha-writer-system.md) + SKILL Alpha Writer

---

## 1. Sơ đồ (template repo)

```text
[Manual Trigger]     [Cron 08:00 — TẮT đến khi pass B]
        │
        ▼
  Init Config ──► Init Run (run_id)
        │
        ▼
  Claude Writer (HTTP Anthropic)
        │
        ▼
  Parse Pack + Compliance (Code)
        │
        ▼
  Compliance PASS? ──no──► Telegram FAIL
        │
       yes
        ▼
  Telegram Preview ──► Wait Approval
        │
        ▼
  Parse Approval (OK đăng + mediaId)
        │
        ▼
  Zernio Publish (HTTP) ──► Merge Run JSON ──► [Sheets]
```

**Ảnh M0:** `mediaId` từ Zernio Media (upload tay hoặc từ Flow A) — **không** auto Drive upload trong template.

---

## 2. Chuẩn bị (trước import)

### 2.1 Điều kiện vào Flow B

| # | Việc | Done |
|---|------|------|
| B0 | Flow A pass (Drive + Telegram duyệt đã test) | [ ] |
| B1 | `ANTHROPIC_API_KEY` còn credit (Sonnet) | [ ] |
| B2 | `ZERNIO_API_KEY` + base URL đúng dashboard | [ ] |
| B3 | Đã có **1 `mediaId` test** trên Zernio Media | [ ] |
| B4 | GoClaw Alpha/Orchestrator **không** publish cùng ngày test | [ ] |

### 2.2 Import workflow

| # | Việc | Done |
|---|------|------|
| B5 | n8n → **Import from File** → `workflows/alpha-m0.template.json` | [ ] |
| B6 | Đặt tên workflow: `Alpha Media — Flow B Claude+Zernio` | [ ] |
| B7 | Đọc sticky **README** trên canvas | [ ] |

---

## 3. Cấu hình sau import

### 3.1 Credentials

| Node | Credential | Done |
|------|------------|------|
| Claude Writer | Env `ANTHROPIC_API_KEY` (header trong template) | [ ] |
| Telegram Preview / FAIL | Telegram Bot API | [ ] |
| Zernio Publish | Bearer `ZERNIO_API_KEY` | [ ] |
| Google Sheet Log | Google Sheets OAuth — **disabled** đến pass B | [ ] |

### 3.2 Biến môi trường n8n

| Env | Done |
|-----|------|
| `ANTHROPIC_API_KEY` | [ ] |
| `ZERNIO_API_KEY` | [ ] |
| `ZERNIO_API_BASE` | [ ] |
| `N8N_TELEGRAM_ADMIN_CHAT_ID` | [ ] |
| `N8N_MEDIA_SHEET_ID` (sau) | [ ] |
| `N8N_MEDIA_JSON_DIR` (VPS volume, sau) | [ ] |

### 3.3 Init Config (khớp brands.json)

| Field | Giá trị |
|-------|----------|
| `zernio_account_ids` | `6a0c6dbd5e333c05299f1d12`, `6a0c28345e333c05299b981a` |
| `x_handle` | `@AlphaTrading79` |
| `threads_handle` | `@alphatrading.lab` |
| `topic` | default XAUUSD brief hoặc override |

### 3.4 Claude Writer — nâng chất (khuyến nghị)

| # | Việc | Done |
|---|------|------|
| B8 | System message: paste [`alpha-writer-system.md`](../config/n8n/prompts/alpha-writer-system.md) + SKILL (bỏ MCP GoClaw) | [ ] |
| B9 | Model: `claude-sonnet-4-20250514` hoặc Sonnet production đang dùng | [ ] |
| B10 | (Tuỳ chọn) Structured output / validate [`alpha-content-pack.schema.json`](../config/n8n/schemas/alpha-content-pack.schema.json) | [ ] |

### 3.5 Zernio Publish — bắt buộc sửa

Template dùng **placeholder** `POST {{ZERNIO_API_BASE}}/v1/posts`.

| # | Việc | Done |
|---|------|------|
| B11 | Mở Zernio OpenAPI / dashboard → copy path + body **posts_create** / **cross_post** thật | [ ] |
| B12 | Map field: `text`, threads body, `accountIds`, `mediaIds`, `status: PUBLISHED` | [ ] |
| B13 | Test **Execute node** Zernio với payload tối thiểu (draft) trước khi full workflow | [ ] |
| B14 | URL post chỉ tin khi có `post_id` từ response — không bịa link | [ ] |

---

## 4. Test Manual — checklist

| Bước | Hành động | Pass? |
|------|-----------|-------|
| T1 | **Manual Trigger** → **Init Run** có `run_id` | [ ] |
| T2 | **Claude Writer** → response 200, có JSON trong body | [ ] |
| T3 | **Parse Pack** → `pack.x_thread[]`, `threads_post`, `compliance.status` | [ ] |
| T4 | Compliance **PASS** (tweet ≤280, không signal keywords) | [ ] |
| T5 | **Telegram Preview** → Founder thấy tweet1 + threads | [ ] |
| T6 | Resume **Wait Approval** (webhook hoặc TG reply):

```json
{
  "approved": true,
  "media_id": "PASTE_ZERNIO_MEDIA_ID",
  "reply_text": "OK đăng"
}
```

| [ ] |
| T7 | **Zernio Publish** → response có post id | [ ] |
| T8 | Zernio dashboard: X + Threads **Published** (không duplicate test) | [ ] |
| T9 | **Merge Run JSON** khớp [`alpha-run.schema.json`](../config/n8n/schemas/alpha-run.schema.json) (mẫu: [`alpha-run.example.json`](../config/n8n/examples/alpha-run.example.json)) | [ ] |
| T10 | Bật **Google Sheets** → 1 dòng `alpha_publish_log` | [ ] |

**Webhook resume (Wait node):** Executions → Wait → **Resume** → paste JSON trên.

---

## 5. Nối Flow A → Flow B (vận hành M0)

| Cách | Mô tả |
|------|--------|
| **Thủ công (M0)** | Sáng: Flow A hoặc tay → upload ảnh Zernio → `mediaId`. Chiều: Flow B → Claude draft → TG duyệt → paste **cùng `mediaId`** khi resume Wait. |
| **M1** | Drive node tải file → HTTP upload Zernio → auto `mediaId` vào Parse Approval. |

Không chạy **Flow A node X (Post)** và **Flow B Zernio Publish** cho cùng một bài trong một lần test.

---

## 6. Done criteria — Flow B (= M0 hoàn chỉnh)

Theo [`MEDIA_PIPELINE_N8N_M0.md`](./MEDIA_PIPELINE_N8N_M0.md) §5:

- [ ] Writer → `pack` hợp schema (hoặc example tương đương)
- [ ] Telegram draft + `OK đăng` + `mediaId`
- [ ] Zernio **Published** trên dashboard
- [ ] Sheet 1 dòng (hoặc Record Post từ A+B gộp tay)
- [ ] `{runId}.json` lưu được (VPS dir hoặc export execution)
- [ ] Cron **vẫn tắt** cho đến 3 lần manual B pass
- [ ] Export: `workflows/alpha-m0-claude-zernio.live.json`

Sau đó mới bật **Cron 08:00 VN** (`brands.json` → `cron.draftAt`).

---

## 7. Bật production (sau pass B)

| # | Việc | Done |
|---|------|------|
| P1 | Bật Cron Flow B (08:00 `Asia/Ho_Chi_Minh`) | [ ] |
| P2 | Freeze GoClaw Alpha publish trong doc/ops | [ ] |
| P3 | Cập nhật `docs/PHASE_STATUS.md` / `PROJECT_STATUS.md` — n8n M0 live | [ ] |
| P4 | M1: Drive→Zernio auto, @azzamgoldpro webhook, Raymond/VIP clone | [ ] |

---

## 8. Lỗi thường gặp

| Triệu chứng | Sửa |
|-------------|-----|
| Claude 401/404 | API key; credit Anthropic |
| Parse Pack throw | Response không phải JSON — sửa prompt “chỉ JSON” |
| Compliance FAIL | Sửa pack tay hoặc re-run Writer |
| Zernio 4xx | Sửa URL/body node; kiểm tra `accountIds` |
| Threads duplicate | Chỉ một đường publish (Zernio), tắt X API node |
| Fake URL | Chỉ build URL từ `post_id` response |

---

## 9. Liên kết

| Doc | |
|-----|--|
| Flow A | [`N8N_ALPHA_FLOW_A_GDRIVE.md`](./N8N_ALPHA_FLOW_A_GDRIVE.md) |
| Import | [`workflows/README.md`](../workflows/README.md) |
| SSOT | [`MEDIA_PIPELINE_N8N_M0.md`](./MEDIA_PIPELINE_N8N_M0.md) |
