# Media pipeline n8n — M0 Alpha (SSOT)

> **Mục tiêu:** Thay GoClaw **Alpha Writer / Orchestrator / publish** bằng **n8n workflow** — mỗi bước = 1 “agent” (node group) → ghi **file JSON** → Zernio HTTP + Google Sheet.  
> **GoClaw giữ:** Linh Cẩu + Lửng Mật Coach (community).  
> **Freeze:** Không thêm Team Router / exec CLI trên GoClaw cho Alpha.

**Cập nhật:** 2026-05-23

---

## 0. Lộ trình 2 flow (checklist)

**Phase 0→4 (không đi lạc):** [`N8N_ALPHA_PHASES_CHECKLIST.md`](./N8N_ALPHA_PHASES_CHECKLIST.md) · **Điền key:** [`N8N_ALPHA_KEYS_SETUP.md`](./N8N_ALPHA_KEYS_SETUP.md)  
**Chia 5 khối (Init → Content → Media → Approval → Publish):** [`N8N_CHIA_DE_TRI_ALPHA.md`](./N8N_CHIA_DE_TRI_ALPHA.md)  
**Pivot GitHub content engine (không Claude trong n8n):** [`briefs/alpha-github-content-engine-n8n-brief.md`](./briefs/alpha-github-content-engine-n8n-brief.md)  
**Audit template LC + n8n 3066/2950 + gist:** [`ALPHA_TEMPLATE_SOURCES_AUDIT.md`](./ALPHA_TEMPLATE_SOURCES_AUDIT.md)  
**OSS catalog (top12 + 3 layer):** [`ALPHA_OSS_CONTENT_FACTORY_CATALOG.md`](./ALPHA_OSS_CONTENT_FACTORY_CATALOG.md)

Làm **theo thứ tự** — mỗi flow có runbook riêng:

| Phase | Runbook | Mục tiêu |
|-------|---------|----------|
| **A** | [`N8N_ALPHA_FLOW_A_GDRIVE.md`](./N8N_ALPHA_FLOW_A_GDRIVE.md) | Canvas hiện tại: **GDrive** → Telegram duyệt → `mediaId` (chưa Claude / chưa Zernio HTTP bắt buộc) |
| **B** | [`N8N_ALPHA_FLOW_B_CLAUDE_ZERNIO.md`](./N8N_ALPHA_FLOW_B_CLAUDE_ZERNIO.md) | Import template repo: **Claude Writer** → compliance → TG → **Zernio Publish** |

```text
  Flow A (pass)  ──►  import Flow B  ──►  cùng mediaId M0  ──►  M0 done §5
```

**Hai workflow trên n8n:** giữ tên rõ `Alpha — Flow A GDrive` và `Alpha — Flow B Claude+Zernio` (tránh sửa nhầm canvas).

---

## 1. Map GoClaw cũ → n8n M0

| GoClaw (cũ) | n8n M0 (Alpha) | Output JSON |
|-------------|----------------|-------------|
| Alpha Content Writer | **Sub-workflow: Writer** (Claude Sonnet) | `{runId}.pack.json` |
| create_image / Drive | **Sub-workflow: Media** (M0: manual `mediaId`) | `{runId}.media.json` |
| Telegram admin duyệt | **Sub-workflow: Telegram** | `{runId}.telegram.json` |
| Zernio MCP / CLI | **Sub-workflow: Publish** (HTTP Request) | `{runId}.publish.json` |
| — | **Sub-workflow: Sheet log** | append row + `{runId}.json` (full run) |

**File tổng:** `output/alpha/{yyyy-MM-dd}/{runId}.json` — schema [`alpha-run.schema.json`](../config/n8n/schemas/alpha-run.schema.json)

Config brand: [`config/n8n/brands.json`](../config/n8n/brands.json)

**Import workflow:** [`workflows/alpha-m0.template.json`](../workflows/alpha-m0.template.json) — hướng dẫn [`workflows/README.md`](../workflows/README.md). Sau khi chạy ổn trên n8n, export lại `alpha-m0.live.json` (không commit credential).

---

## 2. Kiến trúc workflow (1 brand = Alpha)

```text
[Cron 08:00 VN]  hoặc  [Webhook manual]
        │
        ▼
┌───────────────────┐
│ 0. Init Run       │  run_id, load brands.json → alpha
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 1. Writer Agent   │  Claude + alpha-writer-system.md
│                   │  → pack.json + validate schema
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 2. Compliance     │  Code node: ≤280, no signal keywords
│                   │  FAIL → stop, Telegram báo lỗi
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 3. Telegram Draft │  Gửi preview + tweet1 + threads
│                   │  status: awaiting_approval
└─────────┬─────────┘
          ▼
    [Wait: Telegram Trigger]
    Founder: OK đăng (+ optional mediaId text)
          ▼
┌───────────────────┐
│ 4. Media Agent    │  Parse mediaId từ reply (M0 manual)
│                   │  → media.json
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 5. Publish Agent  │  Zernio HTTP cross_post / posts_create
│                   │  → publish.json (post_id, status)
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 6. Sheet Agent    │  Append alpha_publish_log
│                   │  Merge → {runId}.json final
└───────────────────┘
```

---

## 3. Sub-workflow / node chi tiết

### 3.0 Init

- Input: `brand=alpha`, `topic` (optional, default từ `brands.json`)
- `run_id` = `alpha-{date}-{hhmm}-{random}`
- Write stub: `status: draft_ready`

### 3.1 Writer Agent

| Node | Ghi chú |
|------|---------|
| **AI Agent** hoặc **HTTP Anthropic** | Model: `claude-sonnet-4-5` |
| System prompt | [`config/n8n/prompts/alpha-writer-system.md`](../config/n8n/prompts/alpha-writer-system.md) + full SKILL |
| User | `Topic: {{topic}}. Research headlines if tool enabled.` |
| **Structured Output Parser** | Schema `alpha-content-pack.schema.json` |
| **Write Binary/File** | `{{jsonDir}}/alpha/{{date}}/{{runId}}.pack.json` |

Optional: **HTTP** Exa/Tavily → inject headlines vào user message.

### 3.2 Compliance (Code node)

```javascript
// Pseudo — enforce before Telegram
const tweets = $json.pack.x_thread;
for (const t of tweets) {
  if (t.length > 280) throw new Error('Tweet >280');
}
const banned = [/vào long/i, /entry/i, /SL:/i, /chắc ăn/i];
// set compliance PASS/FAIL on pack
```

### 3.3 Telegram Agent

| Node | Ghi chú |
|------|---------|
| **Telegram Send** | Chat `N8N_TELEGRAM_ADMIN_CHAT_ID` |
| Body | `telegram_brief` rút gọn + `x_thread[0]` + `threads_post` + `Compliance: PASS` |
| **Wait / Trigger** | Reply text match `approvalKeywords` từ brands.json |
| Write | `{{runId}}.telegram.json` |

### 3.4 Media Agent (M0)

| Mode | M0 |
|------|-----|
| **manual_mediaId** | Founder reply: `mediaId: abc123` hoặc chỉ paste id |
| Drive auto | **M1** — Zernio upload HTTP + Drive download node |

Write `{{runId}}.media.json`:

```json
{ "mode": "manual_mediaId", "media_id": "..." }
```

### 3.5 Publish Agent (Zernio HTTP)

**Không MCP. Không CLI trong GoClaw.**

1. Đọc `brands.json` → `accountIds`, API key env.  
2. **HTTP Request** tới Zernio API (path theo [Zernio docs](https://zernio.com) — điền sau khi có OpenAPI):

```json
{
  "text": "{{ pack.x_thread[0] }}",
  "threads_text": "{{ pack.threads_post }}",
  "platforms": ["twitter", "threads"],
  "accountIds": ["6a0c6dbd5e333c05299f1d12", "6a0c28345e333c05299b981a"],
  "status": "PUBLISHED",
  "mediaIds": ["{{ media.media_id }}"]
}
```

3. Validate response → `zernio_post_id`, build URLs từ handle (không bịa).  
4. Write `{{runId}}.publish.json`.  
5. **FAIL** → `status: failed`, Sheet ghi error, Telegram báo.

### 3.6 Sheet Agent

| Cột | Nguồn |
|-----|--------|
| run_id | init |
| date | cron |
| topic | pack |
| compliance | pack |
| media_id | media |
| zernio_post_id | publish |
| x_status / threads_status | publish |
| cost_usd_estimate | writer stage |

Merge tất cả stages → **`{{runId}}.json`** (full run, example: [`alpha-run.example.json`](../config/n8n/examples/alpha-run.example.json))

---

## 4. Env (n8n credentials)

| Env | Mục đích |
|-----|----------|
| `ANTHROPIC_API_KEY` | Writer |
| `ZERNIO_API_KEY` | Publish |
| `N8N_TELEGRAM_BOT_TOKEN` | Draft + wait approval |
| `N8N_TELEGRAM_ADMIN_CHAT_ID` | Founder DM |
| `N8N_MEDIA_SHEET_ID` | Google Sheet log |
| `N8N_MEDIA_JSON_DIR` | `/data/media-runs` hoặc volume VPS |

---

## 5. M0 Done criteria

- [ ] Cron hoặc manual trigger chạy **Writer** → `pack.json` hợp schema  
- [ ] Telegram nhận draft  
- [ ] Founder `OK đăng` + `mediaId` → **Publish** → Zernio dashboard **Published**  
- [ ] Sheet 1 dòng + `{runId}.json` trên disk  
- [ ] **Không** dùng GoClaw Alpha/Orchestrator trong cùng ngày test  

---

## 6. M1 (sau M0)

| Brand | Việc |
|-------|------|
| Raymond / VIP10x | Clone workflow, `enabled: true` trong brands.json |
| Drive → Zernio upload node | Tự `mediaId` |
| @azzamgoldpro forward | Webhook intake → Writer |
| Sub-workflow export | 1 JSON per brand per day |

---

## 7. Repo layout

```text
config/n8n/
  brands.json              ← SSOT brand + zernio + cron
  prompts/alpha-writer-system.md
  schemas/
    alpha-content-pack.schema.json
    alpha-run.schema.json
  examples/alpha-run.example.json

docs/MEDIA_PIPELINE_N8N_M0.md   ← file này

output/alpha/                     ← runtime (gitignore, trên VPS n8n)
  2026-05-23/
    alpha-2026-05-23-0800-xxxx.json
    alpha-2026-05-23-0800-xxxx.pack.json
    ...
```

---

## 8. Liên kết

| Doc | |
|-----|--|
| **Flow A checklist** | [`N8N_ALPHA_FLOW_A_GDRIVE.md`](./N8N_ALPHA_FLOW_A_GDRIVE.md) |
| **Flow B checklist** | [`N8N_ALPHA_FLOW_B_CLAUDE_ZERNIO.md`](./N8N_ALPHA_FLOW_B_CLAUDE_ZERNIO.md) |
| GoClaw community | [`GOCLAW_RUNTIME_GUIDE.md`](./GOCLAW_RUNTIME_GUIDE.md) |
| Skill SSOT | [`alpha-content-writer/SKILL.md`](./goclaw-export/skills/alpha-content-writer/SKILL.md) |
| Ảnh Drive | [`A5_MEDIA_FLOWS_RUNBOOK.md`](./A5_MEDIA_FLOWS_RUNBOOK.md) |
| Audit Zernio IDs | [`PILOT_ALPHA_AUDIT_STATUS.md`](./PILOT_ALPHA_AUDIT_STATUS.md) |
