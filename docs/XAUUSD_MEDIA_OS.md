# XAUUSD AI Media Operating System — Constitution & Channel Map

> **Mission:** AI-native financial media network — XAUUSD, gold, market intelligence, **multi-platform distribution**.  
> **Không phải:** hedge fund tự trade, bot bắn signal spam, hệ thống execution.  
> **Là:** intelligence + multi-brand media + content machine + education + **AI-assisted publishing**.

**Repo runtime hiện tại:** `lungmat-agent` (Hermes multi-agent) — layer **orchestration + Telegram bots + content generation**.  
**Stack ngoài repo:** Typefully (X + Threads), n8n, ChatGPT/Claude/Cowork, Supabase, Apify, TradingView.

**Cập nhật:** 2026-05-15

**Lịch sử làm việc AI:** [ai-worklog/README.md](./ai-worklog/README.md)

---

## 1. Ưu tiên vận hành (không đổi)

```text
1. Content consistency
2. Distribution
3. Audience growth
4. SOP stability
5. Automation
6. Agent orchestration
7. Infrastructure optimization
```

**Scale trước:** 3 flagship brands — **Alpha**, **Raymond**, **VIP 10X**.  
**Không** over-engineer; **có** publish daily.

---

## 2. Topology kênh (custom theo setup thực tế)

### 2.1 Nguyên tắc phân vai công cụ

| Nền tảng | Công cụ publish | Ai generate draft |
|----------|-----------------|-------------------|
| **Telegram** (8 channel, scale 3 brand) | **1 bot Telegram / brand** (hoặc 1 bot multi-tenant + map `chat_id`) | `lungmat-agent` → approve → `TelegramPublisherAgent` |
| **X (Twitter)** | **Typefully** — 1 social set / brand (`@AlphaTrading79`, …) | Agent sinh thread → **đẩy Typefully draft** (API / n8n / copy SOP) |
| **Threads** | **Typefully** (cùng social set X+Threads) | Cùng draft pack — adapt ngắn cho Threads |

```text
                    ┌─────────────────────┐
                    │  lungmat-agent      │
                    │  (content + approve)│
                    └──────────┬──────────┘
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
   │ TG Bot Alpha  │   │ TG Bot Raymond│   │ TG Bot VIP10X │
   │ → channel TG  │   │ → channel TG  │   │ → channel TG  │
   └───────────────┘   └───────────────┘   └───────────────┘
           │                   │                   │
           │            Typefully (per brand)       │
           └───────────────────┼───────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │ X thread + Threads  │
                    │ (schedule / publish)│
                    └─────────────────────┘
```

**Mỗi flagship brand = 1 bộ:**

- 1 Telegram **channel** (+ bot token hoặc shared bot + `TELEGRAM_CHAT_ID` riêng)
- 1 **X** account (Typefully social set)
- 1 **Threads** account (linked trong Typefully)

Screenshot tham chiếu: Typefully `AlphaTradingLab_Elite` / `@AlphaTrading79` — X + Threads icons trên cùng social set.

### 2.2 Telegram channels (quan sát thực tế)

| Channel (tên hiển thị) | Flagship? | Ghi chú |
|------------------------|-----------|---------|
| **Alpha Trading Lab** | ✅ #1 | Institutional / liquidity |
| **Raymond - Gold Trading Expert** | ✅ #2 | Mentor / education |
| **VIP 10X - Gold master Signals** | ✅ #3 | Momentum / urgency |
| EDRIC Trading Lab | Phase 2 | Sau khi 3 brand ổn |
| Guru's Underground Trading | Phase 2 | |
| LUCA XAUUSD - 1000PIPS | Phase 2 | |
| (+ 2 channel khác trong “8 TG”) | Backlog | Map trong `brands.yaml` khi onboard |

### 2.3 Typefully social sets (flagship)

| Brand | Typefully set (ví dụ) | X handle (ví dụ) |
|-------|----------------------|------------------|
| Alpha Trading Lab | AlphaTradingLab_Elite | @AlphaTrading79 |
| Raymond | _(tạo social set tương tự)_ | _(map khi có)_ |
| VIP 10X | _(tạo social set tương tự)_ | _(map khi có)_ |

**Không build X/Threads API trong `lungmat-agent` trước** nếu Typefully đã là stack chính — ưu tiên **export draft** sang Typefully (Phase 7B).

### 2.4 YouTube — Typefully không có → chọn hướng nào?

**Thực tế:** [Typefully](https://typefully.com) mạnh ở **text thread** (X, Threads, LinkedIn, Bluesky…) — **không** publish YouTube.  
[Buffer](https://buffer.com) là **scheduler đa kênh** — có YouTube trong stack marketing, nhưng YouTube chủ yếu là **video**, không phải “paste caption rồi viral” như X.

**Quan trọng:** Tool publish **không** quyết định content có hấp dẫn hay không.  
Hấp dẫn = **persona + hook + research + format SOP** (lungmat-agent / Claude). Typefully chỉ giúp **chỉnh thread** (Ctrl+J); Buffer chỉ giúp **lên lịch**.

#### Nguyên tắc: tách 2 lớp

```text
LỚP 1 — TẠO (1 nguồn)          LỚP 2 — PHÂN PHỐI (best tool / kênh)
──────────────────────          ─────────────────────────────────────
lungmat-agent /content        Telegram  → bot / channel
+ prompts/SOP                 X         → Typefully  (giữ — UX thread tốt)
+ Apify research              Threads   → Typefully  (cùng social set)
                              YouTube   → lane riêng (xem bảng dưới)
```

**Không** thay Typefully bằng Buffer cho X/Threads chỉ vì Buffer có YouTube — sẽ mất editor thread + workflow đang dùng (Alpha đã setup).

#### Bảng so sánh lựa chọn

| Hướng | X + Threads | YouTube | Content “hấp dẫn”? | Phù hợp solo founder |
|-------|-------------|---------|---------------------|----------------------|
| **A — Hybrid (khuyến nghị)** | Typefully | Script pack + upload **YouTube Studio** (hoặc Shorts tay) | Cao — cùng brain, format riêng cho video | ✅ MVP nhanh |
| **B — Hybrid + Buffer** | Typefully | Buffer schedule **những gì Buffer hỗ trợ** (community / reminder / link video đã up) | Trung bình — Buffer composer generic | ✅ nếu đã trả Buffer |
| **C — Buffer all-in-one** | Buffer | Buffer | Thường **thấp hơn** cho thread — không phải vì Buffer “dở”, mà vì thiếu thread-native workflow | ❌ không khuyến nghị thay Typefully |
| **D — Code YouTube API** | Typefully | `lungmat-agent` upload video | Cao nhưng tốn dev + OAuth từng channel | Phase sau |

#### Khuyến nghị cụ thể (A + chút B)

1. **Giữ Typefully** cho X + Threads (3 social set / 3 brand).  
2. **YouTube:** agent sinh thêm **`youtube_pack`** trong cùng lệnh `/content <brand>`:

   | Field | Dùng cho |
   |-------|----------|
   | `title` | SEO + click |
   | `description` | mô tả + CTA channel TG |
   | `shorts_script` | 45–60s, hook 3s đầu |
   | `long_script_outline` | 5–8 phút (optional) |
   | `thumbnail_brief` | text cho designer / Canva |
   | `tags` | vàng, XAUUSD, Fed… |

3. **Publish YouTube (MVP):** người quay **Shorts** (chart + voice hoặc faceless) → upload **Studio** — 15–30 phút/brand/ngày nếu template sẵn.  
4. **Buffer (optional):** dùng cho **nhắc lịch**, cross-post link video lên X/Threads *sau khi* video live — **không** dùng Buffer làm nơi *viết* thread thay Typefully.  
5. Trước khi trả tiền Buffer: vào Buffer → Connect YouTube → xem channel hỗ trợ **đăng video file** hay chỉ **community / link** — plan khác nhau.

#### Content YouTube vẫn “đúng brand”

| Brand | YouTube format gợi ý |
|-------|----------------------|
| **Alpha** | Shorts: 1 concept liquidity / 1 chart breakdown; long: “Smart money explained” |
| **Raymond** | Shorts: 1 bài học discipline; long: psychology series |
| **VIP 10X** | Shorts: session energy / volatility recap; **không** fake signal overlay |

Cùng topic với X thread trong ngày — **repurpose có chủ đích**, không copy-paste caption X vào YouTube.

#### Sơ đồ cập nhật (có YouTube)

```text
lungmat-agent  /content <brand>
       │
       ├─► telegram_brief ──► TG bot
       ├─► x_thread       ──► Typefully ──► X
       ├─► threads_post   ──► Typefully ──► Threads
       └─► youtube_pack   ──► Studio (human video) ──► YouTube
                            └─► (optional) Buffer remind / cross-post
```

#### Phase code (khi làm 7A)

Thêm output `youtube_pack` vào writer — **không** cần YouTube API ở MVP.  
Phase 7E (sau): YouTube Data API hoặc Buffer API nếu volume lớn.

---

## 3. Flagship brands — persona matrix

Dùng cho Layer 2/3 prompts (`/prompts/agents`, SOP). Runtime code: `withBrandPersona(brandId)` (sẽ thay / bổ sung `Linh Cẩu` solo).

### Alpha Trading Lab

| | |
|--|--|
| **Positioning** | Institutional, smart money, liquidity, technical breakdown |
| **Tone** | Sharp, intelligent, calm, professional |
| **Audience** | Intermediate / pro |
| **TG** | Chart concepts, “Liquidity Structures”, không hype PnL |
| **X** | 1 thread/ngày — authority thread |
| **Threads** | 1 hook ngắn / takeaway từ thread |

### Raymond - Gold Trading Expert

| | |
|--|--|
| **Positioning** | Mentor, education, psychology, discipline |
| **Tone** | Calm, trusted, teacher-like |
| **Audience** | Beginner / intermediate |
| **TG** | Educational brief, discipline |
| **X** | 1 educational post / insight |
| **Threads** | Mindset / lesson ngắn |

### VIP 10X - Gold master Signals

| | |
|--|--|
| **Positioning** | Momentum, urgency, volatility, session narrative |
| **Tone** | Energetic, bold, fast-paced (**không** fake signal spam) |
| **Audience** | Action-oriented |
| **TG** | Session energy, narrative — sale team signal chi tiết **riêng** |
| **X** | 1 momentum post |
| **Threads** | Urgency hook (không “mua ngay giá X”) |

### Linh Cẩu (legacy / ops)

`src/llm/persona.ts` — có thể giữ cho **admin DM ops bot** (duyệt draft, `/debug_env`), **không** gán cho cả 3 brand consumer-facing.

---

## 4. Daily content MVP (3 brand)

| Brand | X | Threads | Telegram | YouTube (MVP) |
|-------|---|---------|----------|----------------|
| **Alpha** | 1 thread | 1 post (derived) | 1 brief / ngày | 1 Shorts / tuần → 3–5/tuần khi ổn |
| **Raymond** | 1 educational post | 1 post | 1 brief | 1 Shorts edu / tuần |
| **VIP 10X** | 1 momentum post | 1 post | 1 brief | 1 Shorts narrative / tuần |

**Text daily:** 3 X + 3 Threads + 3 TG = **9 units/ngày**.  
**Video:** bắt đầu **3 Shorts/tuần** (1/brand) — script từ `youtube_pack`, quay/upload Studio; không ép 1 Shorts/ngày ngay từ đầu.

**Focus nội dung:** authority, clarity, psychology, narrative — **không** scam signal graphics, fake PnL, spam emoji.

---

## 5. Kiến trúc 3 lớp prompt (repo `xauusd-ai-media-os` — song song)

| Layer | Folder | Vai trò |
|-------|--------|---------|
| **L1 Constitution** | `prompts/core/` | Brain công ty — file này là bản tóm trong `lungmat-agent/docs/` |
| **L2 Agent roles** | `prompts/agents/` | Market intel, TA, Persona, Publishing, Analytics, Memory |
| **L3 SOP** | `prompts/sop/` | Thread TG, hook, visual brief, analytics review |

**`lungmat-agent`** = runtime Layer 2 execution (code). Prompt text có thể sync từ `prompts/` → `src/llm/brands/` (Phase 7).

---

## 6. Workflow publish chuẩn (1 brand, 1 lần)

```text
[Ops / Admin DM hoặc n8n trigger]
  /content alpha "Liquidity grab trên XAUUSD sau CPI"

  → Persona: Alpha
  → Research (Apify): Fed, DXY, gold headlines [optional]
  → Writer output:
        telegram_brief   (Markdown, 200–400 từ)
        x_thread         (5–7 tweets, 1/ 2/ …)
        threads_post     (≤500 chars)

  → Approval (admin DM):
        ✅ TG Alpha channel
        ✅ Push Typefully draft (Alpha social set)
        ❌ Reject

  → Publish:
        TG  → TelegramPublisherAgent (TELEGRAM_CHAT_ID_ALPHA)
        X+Threads → Typefully (human schedule hoặc Typefully API)
```

### Lệnh đề xuất (Phase 7 code)

```text
/content <brand> <topic...>
/content alpha liquidity sweep XAUUSD
/content raymond discipline after drawdown
/content vip10x London session volatility
```

`brand` ∈ `alpha | raymond | vip10x`

---

## 7. Cấu hình kỹ thuật (đề xuất `config/brands.json`)

```json
{
  "alpha": {
    "displayName": "Alpha Trading Lab",
    "telegramChatId": "-100xxxxxxxx",
    "telegramBotTokenEnv": "TELEGRAM_BOT_TOKEN_ALPHA",
    "typefullySocialSetId": "optional-id",
    "xHandle": "@AlphaTrading79",
    "personaId": "alpha"
  },
  "raymond": { "..." : "..." },
  "vip10x": { "..." : "..." }
}
```

**Admin bot** (duyệt): 1 token + `ADMIN_TELEGRAM_CHAT_ID` — giữ như hiện tại.

---

## 8. Map stack → việc ai làm

| Tool | Vai trò trong Media OS |
|------|------------------------|
| **ChatGPT** | CTO, roadmap, constitution |
| **Claude** | Content strategist, thread narrative |
| **Cowork / Cursor** | `lungmat-agent` code, integrations |
| **Typefully** | **Publish X + Threads** (draft, schedule, AI rewrite Ctrl+J) |
| **YouTube Studio** | **Publish video** (file upload — MVP) |
| **Buffer** (optional) | Lịch / cross-post / YouTube phụ trợ — **không** thay Typefully cho X |
| **Telegram bots** | **Publish TG** từng brand |
| **n8n** | Glue: cron daily → gọi `/content` → webhook Typefully |
| **Apify** | News research |
| **Supabase** | Audit logs (optional) |
| **TradingView** | Visual source (screenshots — SOP manual/semi-auto) |

---

## 9. Phase mapping (lungmat-agent repo)

| Phase | Trạng thái | Media OS fit |
|-------|------------|--------------|
| 1–5 | Done | Pipeline TG + persona experiment (Linh Cẩu) |
| 6 macro | Code done | **Intelligence feed** cho writer — không post raw summary lên 8 channel |
| 6 Docker/CI | Done | Deploy multi-bot VPS |
| **7A** | Next | `/content <brand>` + 3-format writer + **brand personas** |
| **7B** | Next | Approve per brand; TG publish per `brands.json` |
| **7C** | **Typefully** | Export draft (API hoặc SOP copy) — **không** X API trực tiếp trừ khi bỏ Typefully |
| **7D** | Sau | Cron daily matrix 3 brand; deprecate trader-only cron |
| **8** | Repo `prompts/` | Sync constitution + SOP vào monorepo hoặc submodule |

Chi tiết implement: [PHASE_7_PLAN.md](./PHASE_7_PLAN.md) (sẽ align với file này).

---

## 10. DO / DO NOT (operating rules)

**DO**

- Publish speed + quality
- Solo founder execution
- Modular brands + reuse Typefully
- Daily discipline 3 flagship

**DO NOT**

- Autonomous trading
- Signal spam / fake PnL visuals
- Microservices sớm
- Automate 100% trước khi 9 units/ngày ổn 2 tuần
- Build X API song song Typefully (trùng)

---

## 11. Definition of success

- 3 brand publish đều **hàng ngày**
- Workflow lặp lại được (SOP + 1 lệnh `/content`)
- Audience trust (tone đúng matrix)
- **Không** đo success bằng độ phức tạp infra

---

## 12. Bước tiếp theo (hành động)

1. Điền `config/brands.json` (3 `telegramChatId` + Typefully set names).  
2. Implement **Phase 7A** trong code: `/content <brand>` + `personas/alpha|raymond|vip10x.ts`.  
3. SOP Typefully: paste `x_thread` + `threads_post` vào đúng social set (5 phút/brand) cho đến khi có API.  
4. n8n (optional): 7:00 cron → 3× HTTP POST `/content` cho alpha, raymond, vip10x.  

**Confirm để code:** `"làm 7A media OS"` + paste 3 `TELEGRAM_CHAT_ID` (có thể redact giữa số).

---

*Constitution gốc từ bot Alpha (2026-05-15) — custom cho topology Typefully + multi Telegram bot.*
