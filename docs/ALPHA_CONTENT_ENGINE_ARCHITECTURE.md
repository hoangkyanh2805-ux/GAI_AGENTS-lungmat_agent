# Alpha Content Engine — Kiến trúc (SSOT)

> **Quyết định:** Content sinh OFF n8n (1 lần LLM/bài) → n8n chỉ validate, duyệt, publish, log.  
> **GoClaw:** chỉ Linh Cẩu + Lửng Mật Coach — freeze Alpha Writer publish.  
> **Cập nhật:** 2026-05-22

---

## 1. Bảng đánh giá repo GitHub (top 5)

| # | Repo | License | X+Threads | Tách gen/pub | Self-host | Effort | Trading fit | Score |
|---|------|---------|-----------|--------------|-----------|--------|-------------|-------|
| **1** | **Custom script** (repo này) | Proprietary | ✅ Zernio | ✅ 100% | ✅ local | 0.5 ngày | ✅ Cao | **95%** |
| 2 | [postpilot](https://github.com/stukenov/postpilot) | MIT | ✅ both | ✅ .md pattern | ✅ CLI | 1–2 ngày | ✅ Cao | **72%** |
| 3 | [openpost](https://github.com/rodrgds/openpost) | MIT | ✅ both | ❌ publish only | ✅ Go | 2 ngày | Trung bình | **55%** |
| 4 | [marketmenow](https://github.com/thearnavrustagi/marketmenow) | MIT? | ✅/△ | ✅ CLI | ✅ | 2–3 ngày | Trung bình | **50%** |
| 5 | [bullhorn](https://github.com/mean-weasel/bullhorn) | MIT | ❌ X only | ✅ MCP | ✅ | 1 ngày | Thấp | **38%** |

**Quyết định: Không fork repo ngoài.** Build custom script vì:
- `@anthropic-ai/sdk` đã có trong `package.json`
- System prompt (`alpha-writer-system.md`) + schema (`alpha-content-pack.schema.json`) đã đủ
- Zernio đã handle publish — không cần thêm publish layer từ repo khác
- postpilot dùng OpenRouter (dependency thêm), output format khác schema Alpha

---

## 2. Kiến trúc chốt

```text
┌──────────────────────────────────────────────────────────────┐
│  LAYER 1 — Content Engine (OFF n8n, 1 lần LLM/bài)          │
│                                                              │
│  npm run alpha:pack -- --topic "XAUUSD brief Fed DXY"        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  scripts/alpha-generate-pack.ts                     │    │
│  │  ├─ Load config/n8n/prompts/alpha-writer-system.md  │    │
│  │  ├─ Load config/n8n/brands.json (alpha config)      │    │
│  │  ├─ Call Anthropic claude-sonnet-4-5                │    │
│  │  ├─ validatePack() — tweet ≤280, threads ≤500,      │    │
│  │  │                   no signal, no URL in tweet     │    │
│  │  └─ Write output/alpha/{date}/{runId}.pack.json     │    │
│  │          +          {runId}.json (stub)             │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────────┬─────────────────────────────────┘
                             │  webhook POST {runId, packPath}
                             │  hoặc Cron → Read file
                             ▼
┌──────────────────────────────────────────────────────────────┐
│  LAYER 2 — n8n Orchestrator (ZERO AI nodes)                  │
│                                                              │
│  Trigger: Webhook (nhận từ Layer 1) hoặc Cron 08:00 VN      │
│     │                                                        │
│     ▼                                                        │
│  Read file → Code compliance (JS, miễn phí)                  │
│     │                                                        │
│     ▼                                                        │
│  Telegram Send and Wait                                       │
│  → Founder: "OK đăng [mediaId: xxx]"                         │
│     │                                                        │
│     ▼                                                        │
│  Zernio HTTP POST /posts/cross-post                          │
│  → accountIds từ brands.json                                 │
│     │                                                        │
│     ▼                                                        │
│  Google Sheet append + {runId}.json finalize                 │
└──────────────────────────────────────────────────────────────┘
```

**Token rule:** Claude chỉ chạy ở Layer 1. n8n Code node compliance = miễn phí.

---

## 3. Phân công layer

| Layer | Tool | Vai trò | Không làm |
|-------|------|---------|-----------|
| **Content** | Repo script / CLI | Sinh pack.json 1 lần, compliance local | Không publish, không Telegram |
| **Orchestration** | n8n (mỏng) | Validate file, TG duyệt, Zernio HTTP, Sheet log | Không AI Agent node |
| **Publish** | Zernio HTTP API | Đăng X + Threads, trả postId | Không MCP trong n8n |
| **Community** | GoClaw | Linh Cẩu, Lửng Mật Coach | Freeze Alpha Writer publish |

---

## 4. Files quan trọng

| File | Vai trò |
|------|---------|
| `scripts/alpha-generate-pack.ts` | Layer 1 — generate + validate |
| `config/n8n/prompts/alpha-writer-system.md` | System prompt Claude |
| `config/n8n/schemas/alpha-content-pack.schema.json` | Schema validate |
| `config/n8n/brands.json` | SSOT brand config + accountIds |
| `output/alpha/{date}/{runId}.pack.json` | Content pack (gitignore) |
| `output/alpha/{date}/{runId}.json` | Run stub (n8n đọc) |

---

## 5. PoC 3 bước tuần này

### Bước 1 — Generate (máy local)

```powershell
# Đảm bảo ANTHROPIC_API_KEY trong .env
npm run alpha:pack -- --topic "XAUUSD brief Fed DXY"
```

**Pass:** `output/alpha/{date}/{runId}.pack.json` tạo ra, compliance = PASS, không exit(2).

### Bước 2 — n8n workflow mỏng

Import workflow mới `Alpha Orchestrator v2` (không AI Agent node):

1. **Webhook** nhận `{ runId, packPath }` → hoặc **Manual** trigger paste path
2. **Read Binary File** → parse JSON
3. **Code node** compliance (tweet ≤280, không URL, không signal)
4. **Telegram Send Message** → gửi `telegram_brief` + `x_thread[0]` + `threads_post`
5. **Telegram Trigger / Wait** → Founder reply `OK đăng` (+ optional `mediaId: xxx`)
6. **HTTP Request** → Zernio API `POST /posts/cross-post`
7. **Google Sheets** → append row

Credentials n8n cần:
- `ANTHROPIC_API_KEY` — **chỉ dùng ở Layer 1, không trong n8n**
- `ZERNIO_API_KEY`
- `N8N_TELEGRAM_BOT_TOKEN` + `N8N_TELEGRAM_ADMIN_CHAT_ID`
- `N8N_MEDIA_SHEET_ID`

### Bước 3 — E2E Founder test

1. Chạy `npm run alpha:pack` → có file pack.json
2. POST webhook → n8n nhận
3. Telegram nhận draft
4. Founder reply `OK đăng` (+ mediaId nếu muốn kèm ảnh)
5. Zernio dashboard = **Published**
6. Sheet có 1 dòng log

**Done criteria M0:** 3 ngày liên tiếp không lỗi.

---

## 6. Tại sao không dùng AI Agent trong n8n

| Vấn đề với AI Agent loop n8n | Giải pháp |
|-------------------------------|-----------|
| Mỗi tin Telegram = 1 execution mới = Claude chạy lại | Layer 1 generate 1 lần, n8n chỉ đọc file |
| Compliance rule 4 (tweet >280) fail ngầm trong AI loop | Code node JS validate rõ ràng |
| Token cost không kiểm soát được | 1 API call / bài, cost ghi vào stub |
| Execute vs Active confusion | n8n chỉ có webhook/cron + HTTP nodes đơn giản |

---

## 7. Liên kết

| Doc | |
|-----|--|
| n8n M0 pipeline | [`MEDIA_PIPELINE_N8N_M0.md`](./MEDIA_PIPELINE_N8N_M0.md) |
| Brief GitHub engine | [`briefs/alpha-github-content-engine-n8n-brief.md`](./briefs/alpha-github-content-engine-n8n-brief.md) |
| Skill SSOT | [`goclaw-export/skills/alpha-content-writer/SKILL.md`](./goclaw-export/skills/alpha-content-writer/SKILL.md) |
| brands.json | [`../config/n8n/brands.json`](../config/n8n/brands.json) |
| Pilot audit | [`PILOT_ALPHA_AUDIT_STATUS.md`](./PILOT_ALPHA_AUDIT_STATUS.md) |

---

## 8. OSS + n8n hybrid review

### 8.1 Đánh giá ý tưởng

Tôi đồng ý với hướng đi hiện tại:
- Content generation self-host / OSS factory off n8n
- n8n chỉ nhận content-ready, review, publish, log
- Giữ n8n mỏng, không chạy AI model trực tiếp
- Zernio vẫn làm publish layer chính nếu Founder muốn giữ đơn giản

Điểm cộng lớn của cách này:
- Niche logic trading / XAUUSD được triển khai trong code hoặc fork OSS ngay trên GitHub
- Giảm chi phí token khi dùng Flash Lite cho daily content
- Tránh n8n AI nodes đốt token / lặp prompt / lỗi function-calling
- Cho phép scale nhanh hơn khi clone brand bằng config/template

### 8.2 Khuyến nghị stack

#### Layer 1 — CONTENT FACTORY

- Fork OSS content gen repo chứ không làm full AI agent trong n8n
- Content Factory export HTTP POST đến n8n webhook `content-ready`
- Chạy on schedule riêng, không gói vào n8n để giảm execution cost

#### Layer 2 — n8n ORCHESTRATION

- Webhook receive content
- Match với Drive media / TG CDN
- Approval gate
- Routing publisher
- Google Sheet / analytics log

#### Layer 3 — PUBLISHER

Ưu tiên giữ Zernio
- A) Zernio API (giữ) — đã có tiền trả, đơn giản, thích hợp X + Threads
- B) Postiz self-host — nếu muốn thay Zernio và hỗ trợ đa nền tảng hơn
- C) Mixpost self-host — Buffer alternative mature

Typefully chỉ là backup/manual copy workflow, không nên đặt vào core publish path.

### 8.3 Nguồn tham khảo repo

#### Content gen repo đáng cân nhắc
- `ThePhoenix77/ai-twitter-bot`
- `samgozman/fin-thread`
- `Thysrael/Horizon`
- `TheQuantPy/quantpy-twitter-bot`
- `TauricResearch/TradingAgents`

#### Scheduler / publisher self-host
- `gitroomhq/postiz-app`
- `inovector/mixpost`
- `brightbeanxyz/brightbean-studio`
- `zernio-dev/latewiz`

#### n8n template OSS
- `n8n.io/workflows/3066-automate-multi-platform-social-media-content-creation-with-ai/`
- `n8n.io/workflows/2950-ai-powered-social-media-content-generator-and-publisher`
- `https://gist.github.com/omergocmen/1774ba77afabba25ba9d0cfecec96753`

### 8.4 Token / cost fact-check

- Founder dùng Gemini Flash Lite cho daily content thì 10 brand × 30 ngày ≈ $1.50/tháng LLM cost
- True token burn chỉ xảy ra nếu dùng Sonnet/GPT-5 cho mọi call
- OSS fork approach đáng làm vì logic + niche knowledge, không hẳn vì cost

### 8.5 Đề xuất hành động

| # | Hành động | Output |
|---|----------|--------|
| 1 | Audit chi tiết `ThePhoenix77/ai-twitter-bot` | `docs/oss-forks/ai-twitter-bot-audit.md` |
| 2 | Soạn brief customize cho brand Alpha | `docs/briefs/oss-fork-alpha-content-factory.md` |
| 3 | Cập nhật `N8N_HYBRID_V2_BUILD_PLAN.md` với Layer 1 OSS factory | SSOT |
| 4 | Ưu tiên A — fork ai-twitter-bot POC | POC 1 brand |

### 8.6 Kết luận

- Nếu Founder muốn nhanh: ưu tiên `A` — fork `ai-twitter-bot` cho Alpha/Raymond/Linh Cẩu
- Nếu muốn premium: `C` — fork `TradingAgents` cho VIP10X
- Nếu cần drop Zernio sau này: `B` — `postiz-app` self-host
- Nếu Founder không muốn setup Docker: giữ n8n native + Flash Lite, nhưng đây chỉ là phương án dự phòng.
