# n8n Hybrid Stack v2 — Build Plan (Scale 10 Brand)

> SSOT production pipeline 10 brand × (Telegram + X + Threads).  
> Last updated: 2026-05-22 (**v2.1 — OSS Content Factory pivot**)

---

## 0. v2.2 — Kiến trúc 3 layer + **LangChain winner** (2026-05-22)

> **Supersedes** v2.1 (ai-twitter-bot POC) và v2.0 (n8n = full content gen).  
> **Re-rank SSOT:** [`ALPHA_OSS_CONTENT_FACTORY_CATALOG.md`](./ALPHA_OSS_CONTENT_FACTORY_CATALOG.md)

```text
Layer 1 — CONTENT FACTORY
  INPUT (F3): fin-thread / Horizon → URL queue
  CORE (F0): oss-forks/social-media-agent-lungmat
             LangGraph + Claude Haiku + FireCrawl + HITL (Telegram)
  PREMIUM (F2): TradingAgents → VIP10X
  Output: POST /webhook/content-ready { alpha-content-pack }

Layer 2 — n8n THIN
  workflows/alpha-m0.template.json — NO LLM when webhook has pack

Layer 3 — PUBLISHER
  M0: Zernio HTTP (giữ P7) · LateWiz UI optional · Postiz M2 optional
```

| Quyết định v2.2 | Chi tiết |
|-----------------|----------|
| **Winner L1** | [langchain-ai/social-media-agent](https://github.com/langchain-ai/social-media-agent) |
| **Fork path** | [`oss-forks/social-media-agent-lungmat/`](../oss-forks/social-media-agent-lungmat/) |
| **Audit** | [`oss-forks/langchain-social-agent-audit.md`](./oss-forks/langchain-social-agent-audit.md) |
| **Cowork brief** | [`briefs/oss-fork-alpha-content-factory-brief.md`](./briefs/oss-fork-alpha-content-factory-brief.md) |
| **Persona** | [`oss-forks/prompts/alpha-persona.md`](../oss-forks/prompts/alpha-persona.md) |
| **#3066 / #2950 / gist** | #3066 reference · #2950/gist **SKIP** |
| **ai-twitter-bot** | Hạ **#6** — legacy profile `docker-compose` |

**GoClaw:** vẫn chỉ Linh Cẩu + Lửng Mật Coach. Alpha Writer **freeze** trên GoClaw.

---

## 0b. v2.0 — Kiến trúc cũ (10 brand scale — tham chiếu)

**Kiến trúc TÁCH RỜI (v2.0 — trước OSS pivot):**

- **n8n** = orchestration + *có thể* AI Agent Claude trên canvas (Haiku/Flash Lite nếu không fork OSS).
- **GoClaw** = community + admin only. **DROP** Alpha Orchestrator publish.
- **Zernio** = publisher X+Threads HTTP REST (giữ — pilot P7).
- **Vault** = Linh Cẩu; persona distill 5–8K cho n8n **chỉ khi** không dùng Layer 1 factory.

**Stack tóm tắt v2.0:**
- n8n self-host/cloud: orchestration + optional gen + publish + log
- Zernio HTTP REST (không MCP cho n8n path)
- Telegram approval gate
- Google Sheets brand config + log

> **Publisher §1 bên dưới:** Typefully được phân tích trong v2.0. **M0 giữ Zernio** theo P7; LateWiz = UI Zernio. Postiz = option B sau POC.

---

## 1. Publisher decision — Buffer vs Zernio vs Typefully

### Bảng so sánh 10 brand × 2 social account/brand = 20 social account

| Tiêu chí | Buffer (đang dùng AZZAM) | Zernio (đang dùng GoClaw) | **Typefully** (đề xuất mới) |
|---|---|---|---|
| **X support** | Native | Native | Native |
| **Threads support** | Native (beta) | Native | **Native + best UX** |
| **TG support** | Không (TG bot direct) | Có nhưng dùng TG bot trực tiếp tốt hơn | Không |
| **API quality** | GraphQL — stable | REST + MCP | REST + **MCP** (`mcp.typefully.com/mcp`) |
| **n8n integration** | Đã proven (workflow AZZAM) | REST node OK | REST node OK + có MCP |
| **GoClaw MCP integration** | ❌ (phải HTTP node tay) | ✅ native | ✅ **native** |
| **Threading composition** | ⚠️ Basic single-post | ✅ Multi-post | ✅ **Specialized — best in class** |
| **AI rewrite/hooks** | Không | Không | ✅ Built-in |
| **Multi-account / brand** | 1 channel = 1 account | 1 profile = nhiều account | 1 workspace = nhiều account |
| **Pricing 10 brand × 2 account** | Agency $120 max 10 channel → cần ~$240 (2 acc) | Pro ~$50-99/tháng | Team ~$79/tháng + có thể Agency negotiable |
| **Specialization fit cho scope (X+Threads only)** | ❌ Over-spec (10+ platform) | ❌ Over-spec (14 platform) | ✅ **Đúng scope** |
| **Maturity** | Cao | Mới | Trung — focus chuyên |
| **Audit status (turn trước)** | 4 security issue trong workflow | OK | Chưa audit |

### Quyết định: **Typefully làm publisher chính cho stack v2**

**Lý do (theo thứ tự quan trọng):**

1. **Đúng scope hẹp**: Founder chốt TG + X + Threads, không IG/FB/TikTok. Typefully chuyên 4 nền tảng này (cộng LinkedIn + Bluesky free thêm). Buffer/Zernio over-spec.
2. **MCP native**: Cả n8n REST và GoClaw MCP đều xài chung 1 publisher → cost + ops đỡ phân mảnh.
3. **Threading UX**: Content trading dễ vượt 280 ký tự X — Typefully native multi-post thread (Buffer chỉ single-post tốt).
4. **AI rewrite**: Mỗi brand cần "spin" cùng 1 fact theo persona khác — Typefully AI hỗ trợ ngay trong API.
5. **Pricing**: Team $79 (verify lại) < Buffer $120-240 < Zernio Pro $99.
6. **Migration cost**: Đổi POST endpoint từ Buffer GraphQL → Typefully REST — chỉ 1 node /workflow, không refactor toàn bộ.

### Fallback / hybrid (nếu Founder muốn giữ Zernio)

- **Zernio** vẫn dùng cho GoClaw side (đã grant MCP, accountId X `6a0c283…`, Threads `6a0c6db…`).
- **Typefully** dùng cho n8n side.
- Trade-off: 2 publisher = 2 nguồn truth post_id → log phức tạp hơn. **Chỉ làm nếu cost tổng <$150**.

**Không khuyến nghị**: Buffer cho stack mới. Lý do — đã có 4 security issue (hardcode token, REPLACE_BOT_TOKEN không replace), pricing tăng nhanh ở 10 channel, không có MCP.

---

## 2. Architecture v2 — sơ đồ flow (clean tách, 2026-05-22)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  TRIGGERS (all in n8n)                                                    │
│  ─ Cron Master 08:00 VN (loop 10 brand)                                  │
│  ─ Cron Forex Session 15:00 + 21:00 VN (Alpha + Raymond focus)           │
│  ─ Telegram Trigger (Founder /publish brand topic — adhoc)               │
│  ─ Webhook Inbound (signal AZZAM hoặc news API)                          │
└────────┬────────────────────────────────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STAGE 1 — BRAND CONFIG (Google Sheet)                                   │
│  ─ Read Sheet "brands" → 10 rows                                          │
│  ─ Loop per brand → set $vars                                            │
└────────┬────────────────────────────────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STAGE 2 — CONTENT GENERATION (n8n NATIVE, không qua GoClaw)             │
│  ─ AI Agent node = Claude Sonnet 4.6 hoặc Haiku 4.5 API trực tiếp        │
│  ─ System prompt = distilled SKILL.md per brand (~5-8K token)            │
│       = persona (2K) + framework cheat (3K) + compliance rules (1K)      │
│       (KHÔNG nhúng full 38 docs Vault)                                   │
│  ─ User prompt = brand_id + topic + market data hôm nay (~2K token)      │
│  ─ Output JSON: {tg_text, x_text, threads_text, image_pref, confidence}  │
│  ─ Cost per call: ~$0.03-0.06 (Sonnet) hoặc $0.001 (Haiku/Flash Lite)    │
└────────┬────────────────────────────────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STAGE 3 — IMAGE PIPELINE                                                │
│  ─ Check Drive folder /chart/{brand}/{YYYYMMDD}.png                      │
│  ─ Nếu có → Drive Download → ImgBB Upload → URL                          │
│  ─ Nếu không + image_pref=required → call Con sen (GoClaw) hoặc skip     │
│  ─ Nếu image_pref=none → text-only path                                  │
└────────┬────────────────────────────────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STAGE 4 — TRUST TIER ROUTING                                            │
│  ─ Tier 0 (confidence > 0.9 + content_type=evergreen): AUTO publish      │
│  ─ Tier 1 (confidence 0.7-0.9): BATCH queue 18:00 daily review          │
│  ─ Tier 2 (confidence < 0.7 hoặc news/promo): MANUAL approve via TG btn  │
│  ─ Tier 3 (blocked types: lot size / signal precise): drop + log         │
└────────┬────────────────────────────────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STAGE 5 — FAN-OUT PUBLISH                                               │
│  ─ Telegram Bot: sendPhoto / sendMessage to {brand}.tg_channel           │
│  ─ Typefully API: POST /v1/drafts/ (createDraft) + publishNow:true       │
│     → cho cả X + Threads trong 1 call                                    │
│  ─ Hoặc Zernio MCP (fallback): posts_cross_post                          │
└────────┬────────────────────────────────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STAGE 6 — LOG + ALERT                                                   │
│  ─ Append Sheet "publish_log": brand · timestamp · platform · post_id    │
│     · status · cost_estimate                                             │
│  ─ If any platform fail → Telegram alert Founder admin                   │
│  ─ Daily summary 21:00 VN: pass/fail rate · top engagement               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. n8n Workflow v2 — node-by-node spec

### Workflow 1: `master-publish-loop` (main scheduler)

| # | Node | Type | Config chính |
|---|---|---|---|
| 1 | Schedule Trigger | scheduleTrigger | Cron `0 0 8 * * *` Asia/Ho_Chi_Minh |
| 2 | Read Brand Config | googleSheets | Sheet "brands", 10 rows |
| 3 | Split In Batches | splitInBatches | Batch size 1 (sequential per brand) |
| 4 | Set Brand Context | set | `$vars.brand_id = $json.brand_id`, persona, channels |
| 5 | Execute Workflow: generate-content | executeWorkflow | Call sub-workflow `generate-content` với brand_id |
| 6 | Execute Workflow: resolve-image | executeWorkflow | Call sub-workflow `resolve-image` |
| 7 | Execute Workflow: route-by-trust | executeWorkflow | Tier 0/1/2 routing |
| 8 | Merge results | merge | Combine 3 platform outputs |
| 9 | Append Log | googleSheets | Append to publish_log |
| 10 | If any fail | if | Trigger alert |
| 11 | Telegram Alert Admin | telegram | Notify founder on fail |

### Workflow 2: `generate-content` (sub-workflow) — clean n8n native

Đầu vào: `{brand_id, topic?, source_data?}`
Đầu ra: `{tg_text, x_text, threads_text, image_pref, confidence, source_key}`

| # | Node | Type | Config chính |
|---|---|---|---|
| 1 | Webhook Trigger | webhook | URL `/n8n/generate-content` |
| 2 | Get Brand Config | googleSheets | Lookup brand_id |
| 3 | Load distilled system prompt | code | Đọc `brand.system_prompt_url` (Drive/Sheet) hoặc inline ~5-8K |
| 4 | Build user prompt | code | `{brand_id, topic, market_data, today_date}` |
| 5 | **AI Agent** | aiAgent | **Claude Sonnet/Haiku API trực tiếp** (Anthropic SDK key). Không qua GoClaw. |
| 6 | Parse Output JSON | code | Validate schema + extract tg/x/threads texts |
| 7 | Calculate Confidence | code | Heuristic: length OK + no banned phrases + has hashtag + market data match |
| 8 | Set source_key | code | `${brand_id}_${YYYYMMDD}_${topic_hash}` (idempotency) |
| 9 | Return | respondToWebhook | Return JSON |

**Lưu ý quan trọng**:
- Node 5 dùng **Anthropic API key** trong n8n credentials (`$credentials.anthropicApi`).
- **Không gọi GoClaw** — GoClaw không tham gia chain này.
- System prompt distill từ SKILL.md GoClaw (port 1 lần, sau update tay).

### Workflow 3: `resolve-image` (sub-workflow)

Đầu vào: `{brand_id, date}`
Đầu ra: `{image_url | null, source: 'drive'|'generated'|'none'}`

| # | Node | Type | Config chính |
|---|---|---|---|
| 1 | Webhook Trigger | webhook | URL `/n8n/resolve-image` |
| 2 | Drive List Files | googleDrive | Folder `/charts/{brand_id}/`, filename match `{YYYYMMDD}.*` |
| 3 | If file exists | if | files.length > 0 |
| 4a | Drive Download (true) | googleDrive | Download to binary |
| 4b | Call Con sen (false + image_pref=required) | httpRequest | GoClaw Con sen image-gen |
| 5 | ImgBB Upload | httpRequest | POST `api.imgbb.com/1/upload` + `$vars.IMGBB_API_KEY` |
| 6 | Extract direct URL | code | `response.data.display_url` |
| 7 | Return | respondToWebhook | `{image_url, source}` |

### Workflow 4: `route-by-trust` (sub-workflow)

Đầu vào: `{brand_id, content, image_url, confidence}`
Đầu ra: `{published, post_ids: {x, threads, tg}, status}`

| # | Node | Type | Config chính |
|---|---|---|---|
| 1 | Webhook Trigger | webhook | URL `/n8n/route-by-trust` |
| 2 | Calculate Tier | code | If confidence > 0.9 → Tier 0, etc. |
| 3 | Switch by tier | switch | 4 branch |
| 4a | Tier 0 — Auto Publish | executeWorkflow | call `publish-fanout` |
| 4b | Tier 1 — Queue Batch | googleSheets | Append to `batch_queue` sheet, return queued |
| 4c | Tier 2 — Manual TG | telegram | Send to founder w/ inline keyboard Approve/Reject |
| 4d | Tier 3 — Drop | code | Log dropped + return |
| 5 | Wait Callback (Tier 2) | wait | Wait for callback via callback workflow |
| 6 | Return | respondToWebhook | Status |

### Workflow 5: `publish-fanout` (sub-workflow) — Zernio HTTP REST

Đầu vào: `{brand, content, image_url}`
Đầu ra: `{x_post_id, threads_post_id, tg_message_id, errors[]}`

| # | Node | Type | Config chính |
|---|---|---|---|
| 1 | Webhook Trigger | webhook | URL `/n8n/publish-fanout` |
| 2 | Telegram sendPhoto / sendMessage | telegram | Native node, chat_id = `brand.tg_channel` |
| 3 | Build Zernio Payload (X) | code | `{accountId: brand.x_account_id, text, media: [image_url]}` |
| 4 | POST Zernio X | httpRequest | POST `https://zernio.com/api/v1/posts` Bearer `$vars.ZERNIO_API_KEY` |
| 5 | Build Zernio Payload (Threads) | code | `{accountId: brand.threads_account_id, text, media: [image_url]}` |
| 6 | POST Zernio Threads | httpRequest | nt |
| 7 | Parse responses | code | Extract post IDs, gom errors |
| 8 | Return | respondToWebhook | All post IDs + errors |

**Lưu ý**:
- Dùng **Zernio HTTP REST endpoint** trực tiếp — không qua MCP.
- 2 call song song (X + Threads), có thể merge thành 1 `posts_cross_post` nếu Zernio REST hỗ trợ.
- Fallback nếu Zernio fail: Typefully API hoặc Buffer GraphQL (cấu hình thêm credential).

### Workflow 6: `callback-handler` (parallel)

Receive Telegram callback (Approve/Reject) → resume Tier 2 wait → fan-out.

(Reuse pattern từ AZZAM workflow nodes 7225-7400, đã có sẵn — chỉ refactor + bỏ hardcode.)

---

## 4. Brand config schema — Google Sheet "brands" tab

| Column | Type | Example | Note |
|---|---|---|---|
| `brand_id` | string | `alpha` | Unique key |
| `display_name` | string | `Alpha Trading Lab` | Hiển thị TG |
| `system_prompt_url` | string | Drive file ID hoặc Sheet cell | Distilled persona ~5-8K token |
| `llm_model` | enum | `claude-haiku-4-5` / `claude-sonnet-4-6` / `gemini-flash-lite` | Per brand chọn model |
| `tg_channel_id` | string | `-100123456` | Telegram channel ID broadcast |
| `x_account_id` | string | Zernio accountId | Vd `6a0c283…` |
| `threads_account_id` | string | Zernio accountId | Vd `6a0c6db…` |
| `schedule_cron` | string | `0 0 8 * * *` | Optional override |
| `default_trust_tier` | int | `1` | 0=auto, 1=batch, 2=manual |
| `image_dir` | string | `/charts/alpha/` | Drive folder path |
| `image_pref` | enum | `required` / `optional` / `none` | Logic ảnh |
| `active` | bool | `TRUE` | Master switch per brand |
| `daily_post_limit` | int | `3` | Rate limit safety |

### 10 brand mẫu (tham khảo — Founder điền sau)

| brand_id | display_name | persona angle | image_pref |
|---|---|---|---|
| alpha | Alpha Trading Lab | SMC sâu, quant pro | required |
| raymond | Raymond DWH | Veteran swing structure | required |
| vip10x | VIP 10X | High-conviction premium | required |
| linhcau | Linh Cẩu | Gen Z trader meme | optional |
| lungmat | Lửng Mật | Mentor coach 1:1 | optional |
| _brand6 | (TBD psychology) | — | — |
| _brand7 | (TBD fundamental) | — | — |
| _brand8 | (TBD prop firm) | — | — |
| _brand9 | (TBD risk mgmt) | — | — |
| _brand10 | (TBD news/macro) | — | — |

---

## 5. Trust tier logic — chi tiết

| Tier | Tên | Confidence | Content type | Action | Founder load/ngày |
|---|---|---|---|---|---|
| **0** | Auto-publish | > 0.9 | Market summary daily, evergreen edu | Publish ngay sau image resolve | 0 phút (spot-check 10%) |
| **1** | Batch review | 0.7-0.9 | Educational deep-dive, weekly review | Queue → 18:00 daily TG batch button "Approve all"/"Review N" | 5-10 phút/ngày |
| **2** | Manual review | < 0.7, news, promo, sale | Real-time event, sale link | TG inline Approve/Reject per post | 15-20 phút/ngày |
| **3** | Block | Anything containing: lot size, "sure win", "100%", entry+SL+TP precise | Drop + log + alert | 0 phút |

**Confidence heuristic (workflow `generate-content` node 6):**
```js
let confidence = 0.5; // base
if (text.length > 50 && text.length < 1000) confidence += 0.15;
if (text.includes('#XAUUSD') || text.includes('#GoldTrading')) confidence += 0.05;
if (text.match(/lot\s*size|sure\s*win|100%|guarantee/i)) confidence = 0; // block
if (text.match(/SL\s+\d+|TP\s+\d+/i) && text.match(/entry\s+\d+/i)) confidence = 0; // block
if (image_url) confidence += 0.10;
if (source_data && source_data.verified) confidence += 0.15;
return Math.min(confidence, 0.95);
```

---

## 6. Image + Video pipeline — Drive là nguồn duy nhất

### 6.1. Drive folder structure (đội edit upload vào đây)

```
/media-output/                              ← master folder, n8n watch
  /alpha/2026-05/
    alpha_20260522_morning_chart.png
    alpha_20260522_signal1_video.mp4
  /raymond/2026-05/
    raymond_20260522_evening_carousel-1.jpg
    raymond_20260522_evening_carousel-2.jpg
  /vip10x/2026-05/
    vip10x_20260522_premium_thumb.png
  /_archive/                                ← n8n move sau khi publish
  /_failed/                                 ← n8n move nếu sai format
```

### 6.2. Naming convention (đội edit BẮT BUỘC tuân thủ)

```
{brand_id}_{YYYYMMDD}_{slot}_{type}.{ext}

brand_id: alpha | raymond | vip10x | linhcau | lungmat | ... (10 brand)
YYYYMMDD: ngày dự kiến đăng (vd 20260522)
slot: morning | midday | evening | signal1 | signal2 | event | promo
type: chart | video | thumb | carousel-N (N=1..10)
ext: png | jpg | mp4 (không upload webp, mov, avi)
```

### 6.3. n8n workflow: `drive-watch-media` (sub-workflow)

| # | Node | Type | Config |
|---|---|---|---|
| 1 | Drive Trigger | googleDriveTrigger | Watch `/media-output/` recursive, event `fileCreated` |
| 2 | Parse filename | code | Regex parse → `{brand, date, slot, type, ext}` |
| 3 | Validate brand exists | code | Check brand_id in brands Sheet, else → `/_failed/` |
| 4 | Download from Drive | googleDrive | Binary output |
| 5 | Route by type | switch | image → ImgBB ; video ≤50MB → TG CDN ; video >50MB → Zernio media |
| 6 | Upload to CDN | httpRequest / telegram | Return direct URL |
| 7 | Append `media_queue` Sheet | googleSheets | `{date, brand, slot, type, cdn_url, drive_file_id, status:'ready'}` |
| 8 | Move source file | googleDrive | → `/_archive/{brand}/{YYYY-MM}/` |
| 9 | If error | if | → `/_failed/` + TG alert founder + editor |

### 6.4. Tích hợp với publish workflow

**Mode 1 — Content first (daily 08:00 cron):**
```
Cron → AI Agent gen content → Check Sheet media_queue: brand+date+slot match?
  ├── CÓ → embed cdn_url vào post
  └── KHÔNG + image_pref=required → delay đến 09:00, retry
                                     → nếu vẫn không có, alert founder, post text-only
```

**Mode 2 — Media first (Drive trigger event-driven):**
```
Drive Trigger (file mới event slot)
  → gen caption phù hợp media+brand
  → TG approval gate
  → publish ngay
```

### 6.5. Limits theo platform

| Platform | Image | Video | Pipeline đề xuất |
|---|---|---|---|
| X | 5MB JPG / 15MB PNG / 5MB GIF | 512MB, max 2:20, MP4 | ImgBB cho image, Zernio cho video |
| Threads | 8MB | 100MB, max 5 phút | nt |
| Telegram broadcast | 10MB direct, 50MB qua document | 50MB direct, 2GB qua document | Native TG node |
| YouTube Shorts | — | 256GB, max 60s | Manual Studio (chưa auto) |

### 6.6. Service Account Drive — security

1. Google Cloud Console → tạo Service Account riêng cho n8n (`n8n-media@project.iam.gserviceaccount.com`).
2. Download JSON key → upload vào n8n Credentials.
3. Share folder `/media-output/` với email service account, quyền **Viewer**.
4. Đội edit có quyền **Editor** từng folder brand riêng (không phải master).
5. Founder = Owner.

### 6.7. KHÔNG dùng Drive direct URL

`drive.google.com/uc?id=...` không ổn định cho X/Threads crawler. **Luôn re-upload sang ImgBB hoặc Telegram CDN trước khi publish.**

---

## 7. Cost projection — 10 brand × 1 post/ngày × 3 platform (clean tách)

### Kịch bản 1: Claude Haiku 4.5 cho daily content (khuyến nghị)

| Item | $/tháng | Note |
|---|---:|---|
| n8n self-host VPS (Hetzner CX11) | $4.50 | Đủ 10 workflow concurrent |
| GoClaw TOSE (giảm scope: chỉ Linh Cẩu + Lửng Mật) | $12-20 | Downgrade vì bỏ Orchestrator + Alpha Writer |
| Claude Haiku 4.5 (300 post × ~10K in + 2K out) | $3-5 | $0.80/M in + $4/M out |
| Sonnet 4.6 cho occasional review/strategy | $2-4 | 20-30 call/tháng |
| Zernio Pro (10 brand = 20 account) | $39-99 | Verify tier pricing |
| ImgBB | $0 | Free đủ |
| Con sen image (di chuyển sang n8n - nano-banana hoặc skip nếu Drive đủ) | $0-6 | Tuỳ chiến lược ảnh |
| Google Sheets / Drive | $0 | Free |
| Telegram Bot | $0 | Free |
| **Tổng/tháng** | **$60-138** | |
| **Per brand** | **$6-14** | |
| **Per post** | **$0.20-0.46** | 300 post/tháng |

### Kịch bản 2: Claude Sonnet 4.6 cho daily content (cao cấp)

| Item | $/tháng |
|---|---:|
| n8n + GoClaw lite + ImgBB + Sheets + TG | $16-25 |
| Claude Sonnet (300 post × 10K in + 2K out) | $18-25 |
| Sonnet weekly review | $3-5 |
| Zernio Pro | $39-99 |
| Con sen image | $0-6 |
| **Tổng/tháng** | **$76-160** |

### Kịch bản 3: Gemini Flash Lite (rẻ nhất, chất lượng vừa)

| Item | $/tháng |
|---|---:|
| Infra + Zernio + image | $55-130 |
| Gemini Flash Lite (300 post) | $0.50-1 |
| **Tổng/tháng** | **$55-131** |

### So sánh

| Stack | $/tháng (10 brand) | Per brand |
|---|---:|---:|
| Hire 10 nhân sự 8tr loaded | $4.700 | $470 |
| **Architecture v2 clean tách (Haiku)** | **$60-138** | **$6-14** |
| Architecture v2 (Sonnet) | $76-160 | $7-16 |
| Architecture v2 (Gemini Flash Lite) | $55-131 | $5-13 |

→ **Ratio: 31-78× rẻ hơn hire** ở scale 10 brand.

---

## 8. Migration path từ AZZAM workflow

### Phase 0 — Security fix AZZAM workflow cũ (P1, tuần này, 2-4h)

1. Revoke Buffer token `knp-L8FDi…` → tạo mới.
2. Replace all hardcode Bearer → Header Auth credential.
3. Replace `REPLACE_BOT_TOKEN` + `REPLACE_ADMIN_CHAT_ID` → giá trị thực.
4. Xoá Sticky Note có token.
5. Backup workflow JSON về `docs/n8n-export/azzam-buffer-v1-cleaned.json` (sau khi clean).

### M0 — POC Alpha 1 brand (tuần này, 15-20h)

**Mục tiêu**: 1 workflow n8n native, Cron → AI Agent (Claude Haiku) → Telegram approval → Zernio HTTP publish → Sheet log. **Chạy parallel** GoClaw Alpha hiện tại, không tắt.

| Step | Việc | Effort | Deliverable |
|---|---|---|---|
| 1 | Cài n8n self-host VPS (Hetzner CX11 €4/tháng) hoặc n8n cloud trial | 1-2h | n8n live, login OK |
| 2 | Distill SKILL.md Alpha Content Writer thành 5-8K token system prompt | 2-3h | `docs/n8n-prompts/alpha-system-v1.md` |
| 3 | Setup Anthropic API key + Zernio API key + Telegram bot token trong n8n Credentials | 0.5h | All credentials added |
| 4 | Test 1 call Anthropic API + 1 call Zernio HTTP POST | 1h | Confirm cả 2 phản hồi OK |
| 5 | Build workflow M0: 6 node chính (Cron → AI Agent → Parse → TG approval → Zernio HTTP → Sheet log) | 4-6h | Workflow chạy được manual trigger |
| 6 | Test E2E 1 bài text-only (không ảnh) | 1h | Bài đăng X + Threads thành công |
| 7 | Add ImgBB upload + image branch | 1-2h | E2E text + image |
| 8 | Cron 08:00 VN + chạy parallel với GoClaw Alpha 7 ngày | 7 ngày | 7 bài/7 ngày, log đầy đủ |

**Pass M0** khi: 3 ngày liên tiếp không escalation + Founder duyệt ≤ 5 phút/bài + cost thực ≤ $1.5/ngày.

### M1 — Cutover GoClaw Alpha → n8n (tuần 3)

9. Tắt skill Alpha Content Writer trên GoClaw.
10. Tắt skill Media OS Orchestrator trên GoClaw.
11. Verify Linh Cẩu + Lửng Mật vẫn chạy bình thường.
12. Downgrade GoClaw TOSE plan nếu workload giảm.
13. Cập nhật PROJECT_STATUS.md §2 (Alpha pilot status).

### M2 — Clone 3 brand (tuần 4-5)

14. Distill SKILL.md Raymond + VIP10X thành system prompt.
15. Add row brands sheet cho Raymond + VIP10X.
16. Test E2E mỗi brand 3 ngày.
17. Setup Drive folder `/charts/{brand_id}/` per brand.

### M3 — Scale 5 → 10 brand (tuần 6-9)

18. Thiết kế 5-7 brand mới (persona + angle, Founder + AI hỗ trợ).
19. Verify Zernio Pro tier limit cho 20 account.
20. Tăng cron load test n8n VPS.
21. Daily summary 21:00 VN báo cáo pass/fail rate.

### M4 — Image + AZZAM signal pipeline (tuần 10+)

22. Port AZZAM signal flow (luồng 2 từ workflow cũ) sang n8n v2.
23. Add Con sen image gen call từ n8n (nếu Drive không đủ).
24. Archive workflow Buffer cũ vào `docs/n8n-export/azzam-buffer-v1-archive.json` (sau khi clean security).
25. Quyết định: keep Buffer cho 1 luồng riêng hay drop hẳn.

---

## 9. Risk + open questions cần Founder chốt

### Risk

1. **Zernio rate limit** cho 20 account (10 X + 10 Threads), 300 post/tháng — cần verify Zernio Pro tier.
2. **Anthropic API quota** cho 10 brand × 300 post — Founder cần tạo API key + set spend cap.
3. **Brand differentiation**: 10 brand cùng XAUUSD = cannibalization risk → cần content angle khác biệt rõ (xem turn trước §3.B).
4. **Founder approval load**: nếu Tier 0 không đạt 70% → Founder vẫn quá tải.
5. **System prompt drift**: distill SKILL.md → 5-8K prompt có thể bỏ sót case edge → cần monitor 30 ngày đầu.
6. **GoClaw downscope risk**: downgrade TOSE plan → có thể ảnh hưởng Linh Cẩu uptime nếu quá thấp.

### Cần Founder chốt 4 thứ (đã giảm từ 5 vì lock kiến trúc)

1. ~~**Typefully** account~~ → ĐÃ CHỐT giữ Zernio HTTP REST làm publisher. Typefully chỉ là backup.
2. ~~**GoClaw REST API**~~ → KHÔNG cần — n8n tự sinh content, không gọi GoClaw.
3. **5 brand mới đặt tên gì?** (persona + angle). Cần Founder + product thinking, không phải tech. Mình hỗ trợ template.
4. **n8n self-host hay n8n cloud?** Khuyến nghị self-host Hetzner CX11 ($4.50/tháng).
5. **LLM model cho writer?** Khuyến nghị **Claude Haiku 4.5** cho daily + **Sonnet 4.6** cho weekly review.
6. **Có giữ Buffer subscription không?** (nếu AZZAM workflow cũ vẫn cần) — sau M4 quyết định.

---

## 10. Liên quan + tài liệu tham chiếu

- AZZAM workflow gốc (đang chạy): `C:\Users\Admin\Downloads\AZZAM → Buffer (Signal Pipeline - Production).json`
- Audit AZZAM (4 security issue): session 2026-05-22 (chưa file riêng — TODO viết `docs/N8N_AZZAM_BUFFER_AUDIT.md`)
- Brand config schema này nên đồng bộ với `docs/goclaw-export/skills/` (persona_skill column)
- PROJECT_STATUS.md §2 cập nhật sau khi v2 POC pass: thêm "n8n Hybrid v2" row.

---

## 11. Next action ngay (sau khi Founder review file này)

1. ☐ Founder verify Typefully tier hiện tại + check pricing 20 account.
2. ☐ Founder confirm publisher: **Typefully (recommended)** hay giữ Buffer / pivot Zernio.
3. ☐ Founder paste brand list 10 brand (5 đã có + 5 mới) — mình refine persona angle.
4. ☐ Sau khi confirm publisher → mình build workflow JSON template cho 1 brand POC (Alpha) làm starter pack.
5. ☐ Founder fix 4 security issue trong AZZAM workflow cũ (xem Phase 0).
