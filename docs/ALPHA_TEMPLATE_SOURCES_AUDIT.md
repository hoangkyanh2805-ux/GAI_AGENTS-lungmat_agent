# Audit — Template sources Alpha X + Threads pipeline

> **Nhiệm vụ:** Tìm repo/workflow có sẵn để **custom**, không build n8n từ trắng.  
> **Ngày:** 2026-05-22  
> **Nguồn audit:**  
> - [langchain-ai/social-media-agent](https://github.com/langchain-ai/social-media-agent)  
> - [n8n #3066](https://n8n.io/workflows/3066-automate-multi-platform-social-media-content-creation-with-ai/)  
> - [n8n #2950](https://n8n.io/workflows/2950-ai-powered-social-media-content-generator-and-publisher)  
> - [Gist omergocmen](https://gist.github.com/omergocmen/1774ba77afabba25ba9d0cfecec96753)  
> **SSOT dự án:** `workflows/alpha-m0.template.json`, `config/n8n/brands.json`, SKILL Alpha, `PILOT_ALPHA_AUDIT_STATUS.md`, brief [`alpha-github-content-engine-n8n-brief.md`](./briefs/alpha-github-content-engine-n8n-brief.md)

---

## Executive summary (re-rank 2026-05-22)

| Nguồn | Verdict | Điểm Alpha |
|-------|---------|------------|
| **langchain social-media-agent** | **Winner Layer 1** | **~88/100** |
| **alpha-m0.template.json** | **Winner Layer 2** | **~78/100** |
| **n8n #3066** | Reference only | ~48/100 |
| **n8n #2950** | **SKIP** | ~32/100 |
| **Gist omergocmen** | **SKIP** | ~25/100 |

**Full ranking 16:** [`ALPHA_OSS_CONTENT_FACTORY_CATALOG.md`](./ALPHA_OSS_CONTENT_FACTORY_CATALOG.md)  
**LC audit:** [`oss-forks/langchain-social-agent-audit.md`](./oss-forks/langchain-social-agent-audit.md)  
**Clone:** [`oss-forks/social-media-agent-lungmat/`](../oss-forks/social-media-agent-lungmat/)

---

## Gap analysis — dự án đang triển khai

| Hạng mục | Trạng thái repo | Gap nếu dùng template n8n “full AI” |
|----------|-----------------|--------------------------------------|
| X + Threads publish | **Done** Zernio P7 `6aeecda0…` | Template dùng X API / Graph trực tiếp → **đổi credential, mất cross_post** |
| Content pack schema | `alpha-content-pack.schema.json` | Template JSON schema khác (LinkedIn/Twitter object) |
| Compliance trading | Code node + SKILL | Template: hashtag/CTA chung, **không** no-signal |
| TG duyệt `@alpha79_bot` | Plan T1–T3; n8n template có Wait | #11138 loop = **mỗi tin = LLM lại** (đã fail pilot) |
| Media M0 | manual `mediaId` Zernio | #3066 Pollinations/ImgBB; LC agent Supabase |
| GoClaw Alpha | **Freeze** publish | LC agent = URL→Twitter+LinkedIn only |
| Token cost | Pivot: AI **1 lần**/bài | #3066/#2950/Gist: AI **trong** n8n mỗi run |
| n8n export JSON | `alpha-m0.template.json` ✅ | #3066/#2950: import được, cần strip nodes |

**Điểm đã có trong repo — không vứt:**

- `brands.json` — accountId, approval keywords, cron 08:00 VN  
- `alpha-m0.template.json` — Claude HTTP **hoặc** webhook nhận `pack.json` sẵn  
- SKILL v1.5.x — persona XAUUSD, compliance, Zernio MCP (reference cho prompts)

---

## Ma trận đánh giá (8 tiêu chí bạn yêu cầu)

| Tiêu chí | LC social-media-agent | n8n **#3066** | n8n **#2950** | **Gist** | **alpha-m0.template** |
|----------|----------------------|---------------|---------------|----------|------------------------|
| **Generate content** | ✅ URL→post (Anthropic) | ✅ GPT-4/Gemini agent | ✅ Gemini | ✅ Gemini agent | ✅ Claude HTTP (có thể tắt) |
| **Human approval** | ✅ HITL Agent Inbox | ✅ Gmail double-approval | △ Form review (mô tả) | ❌ **Auto-post ngay** | ✅ Wait + TG preview |
| **X / Twitter** | ✅ schedule/post | ✅ Official API | ✅ Twitter node | ✅ Twitter node | ✅ qua Zernio |
| **Threads** | ❌ | △ *marketing ghi Threads; publish list không rõ Threads API* | ❌ | ❌ | ✅ Zernio |
| **Ảnh / media** | △ Advanced (Supabase) | ✅ DALL-E/Pollinations/ImgBB | ✅ imgbb + FB/IG | ❌ | △ M0 manual mediaId |
| **Import/export n8n JSON** | ❌ (LangGraph) | ✅ Use template | ✅ Buy/import | ✅ JSON sẵn | ✅ trong repo |
| **Đổi prompt XAUUSD/trading** | ✅ `prompts/` + TWEET_EXAMPLES | ✅ “Content Factory” node | ✅ Agent prompt | ✅ 1 dòng prompt | ✅ `alpha-writer-system.md` + SKILL |
| **Đổi publish → Zernio HTTP** | △ Thay Arcade/Twitter nodes | △ Xóa IG/FB/LI/X nodes → HTTP | △ Thay 4 publish nodes | △ Thay X+LI nodes | ✅ **Đã có** node Zernio |

---

## 1. langchain-ai/social-media-agent

### Là gì

- **LangGraph** agent: input **URL** → generate **Twitter + LinkedIn** → **human-in-the-loop** (accept/reject/edit) → schedule qua **Arcade** hoặc Twitter/LinkedIn OAuth.
- Stack: Yarn, LangGraph CLI, Anthropic, FireCrawl, optional Supabase (ảnh), Slack cron.

### Khớp / gap Alpha

| ✅ | ❌ / gap |
|----|---------|
| Generate + HITL (giống duyệt Founder) | **Không Threads** |
| Anthropic (cùng hệ Claude) | **Không** `pack.json` schema Alpha |
| Prompts tách file — custom XAUUSD | Input **URL**, không topic XAUUSD/Fed/DXY |
| Cron + Slack ingest links | Approval = **Agent Inbox**, không Telegram |
| Image advanced mode | Publish **Arcade/Twitter API**, không Zernio |

### Custom path (ước lượng 3–5 ngày dev)

1. Fork `src/agents/generate-post/prompts/` → `BUSINESS_CONTEXT`, `TWEET_EXAMPLES` = Alpha institutional gold.  
2. Thêm node/output: `x_thread[]`, `threads_post`, `compliance` → export `pack.json`.  
3. **Không** dùng Arcade publish → webhook POST sang n8n `alpha-m0` Wait hoặc Zernio HTTP.  
4. Threads: **plugin mới** hoặc bỏ qua và chỉ dùng Zernio từ n8n (khuyến nghị).  
5. HITL: thay Agent Inbox bằng **Telegram bot** (n8n nhận pack đã duyệt).

**Điểm Alpha:** ~**58/100** — tốt nhất cho **Layer 1**, không thay được Layer 2+3.

---

## 2. n8n workflow #3066

### Là gì (theo trang template)

- AI: GPT-4/Gemini, SERP, image gen (OpenAI/Pollinations).  
- Approval: **HTML email** + double-approval Gmail.  
- Publish: IG/FB Graph, **X Official API**, LinkedIn.  
- Marketing: 7+ nền gồm **Threads, TikTok, YT Shorts** — **cần mở JSON** để xác nhận node Threads publish (mô tả publish không liệt Threads).

### Khớp / gap Alpha

| ✅ | ❌ / gap |
|----|---------|
| Multi-platform AI content | **AI trong n8n** → token mỗi execution |
| Telegram trong credentials list | Approval = **email**, không `OK đăng` TG |
| Có thể import JSON | Nhiều nền thừa (FB/IG/TikTok…) |
| Sheets analytics hook | Không Zernio; không compliance trading |

### Custom path

1. **Import** template → đổi tên `Alpha — Orchestrator (from 3066 stripped)`.  
2. **Xóa:** Social Media Content Factory agent, SERP, image gen (hoặc chuyển ra Claude Code).  
3. **Giữ/đổi:** Gmail → **Telegram Send and Wait** (copy từ `alpha-m0.template.json`).  
4. **Thêm:** Code compliance + HTTP Zernio (copy từ repo).  
5. **Threads:** nếu template không có node Threads → **bắt buộc Zernio** (đúng pilot).  
6. Trigger: Webhook `pack_ready` thay vì cron AI.

**Điểm Alpha:** ~**48/100** — chỉ đáng fork nếu cần **email approval song song** hoặc SERP headlines inject.

---

## 3. n8n workflow #2950

### Là gì

- Form → **Gemini** → LinkedIn + Instagram + Facebook + **Twitter** — auto publish.  
- Paid template ($5), imgbb + Graph APIs.  
- **Không Threads.**

### Khớp / gap

- Generate ✅ nhưng **Gemini** ≠ stack Claude/SKILL.  
- “Review before publishing” trên form — **không** Wait Telegram.  
- **Không** Zernio, **không** trading compliance.

**Điểm Alpha:** ~**32/100** — **Reject** làm base; có thể học UI form field.

---

## 4. Gist omergocmen (1774ba77…)

### Là gì

- 8 nodes: **Form Trigger** → **AI Agent** (Gemini 2.0 flash) → **Structured Output Parser** → **X + LinkedIn publish song song** → Merge → Form completion.  
- **Không có** Wait, Telegram, Threads, media.

### Phân tích JSON (gist)

```text
On form submission → AI Agent → X node + LinkedIn node (parallel) → Merge → Form done
```

- Prompt mặc định: `write min 50 word about post title for Linkedin and X separately`  
- Schema: `platform_posts.Twitter.post` + hashtags — **khác** `alpha-content-pack`  
- **Publish ngay** sau generate → **vi phạm** “admin OK trước Zernio”

### Custom path (chỉ học 1 phần)

- Copy **Structured Output Parser** pattern → map sang `alpha-content-pack.schema.json`.  
- **Không** copy X/LinkedIn nodes → thay **Wait + Zernio HTTP**.

**Điểm Alpha:** ~**25/100** — scaffold parser only.

---

## 5. Baseline repo — `workflows/alpha-m0.template.json`

| Tiêu chí | Có? |
|----------|-----|
| Generate | Claude HTTP (tắt được → webhook pack) |
| Approval | Wait + Telegram preview |
| X + Threads | Zernio cross_post |
| Media | Parse `media_id` từ resume |
| n8n JSON | ✅ |
| XAUUSD prompt | system string + link SKILL |
| Zernio | ✅ |

**Gap còn lại:** chưa `alpha-m0.live.json` trên cloud; Writer trong n8n vẫn tốn token nếu bật — pivot tắt Writer, webhook nhận pack từ Layer 1.

**Điểm Alpha:** ~**78/100** — **nền orchestration đúng nhất** trong 5 nguồn.

---

## So sánh với các audit trước (GitHub)

| | postpilot | openpost | LC agent | **alpha-m0** |
|--|-----------|----------|----------|--------------|
| Layer 1 | ✅ CLI | ❌ | ✅ graph | △/off |
| Layer 2 n8n | — | — | — | ✅ |
| X+Threads | △/✅ | ✅ | ❌/❌ | ✅ Zernio |
| TG approval | ❌ | ❌ | ❌ | ✅ |

---

## Khuyến nghị triển khai (không build trắng)

### Phương án A — **Khuyến nghị** (ít rủi ro, giữ P7)

| Bước | Nguồn | Việc |
|------|-------|------|
| 1 | LC social-media-agent | Clone; sửa prompts + output `pack.json` (local/CI) |
| 2 | alpha-m0.template.json | Import n8n; **disable** Claude Writer; thêm Webhook trigger nhận pack |
| 3 | SKILL Alpha | SSOT compliance + persona |
| 4 | Zernio | Giữ node Publish hiện tại |

### Phương án B — Fork n8n #3066 (nếu muốn UI email + SERP)

- Import #3066 → strip AI → graft TG+Zernio từ `alpha-m0.template.json`.  
- Effort: **1–2 ngày** canvas; rủi ro Threads node không có.

### Phương án C — **Không dùng**

- #2950, Gist (auto-post, no Threads).  
- LC agent publish path (Arcade) thay Zernio.  
- n8n #11138 full AI loop (token burn) — README repo vẫn nhắc nhưng **không** làm default.

---

## Checklist custom (Founder / Cowork)

- [ ] Chọn phương án A hoặc B  
- [ ] Layer 1: 1 lần generate → file `output/alpha/{date}/{runId}.pack.json`  
- [ ] Layer 2: n8n test Wait + `OK đăng` + mediaId  
- [ ] Layer 3: Zernio Published (regression P7)  
- [ ] Không bật AI Agent trên Telegram Trigger loop  
- [ ] Cập nhật `MEDIA_PIPELINE_N8N_M0.md` §5 done criteria  

---

## Tham chiếu

- [`ALPHA_BRIGHTBEAN_STUDIO_AUDIT.md`](./ALPHA_BRIGHTBEAN_STUDIO_AUDIT.md)  
- [`ALPHA_MARKETMENOW_OPENPOST_AUDIT.md`](./ALPHA_MARKETMENOW_OPENPOST_AUDIT.md)  
- [`workflows/README.md`](../workflows/README.md)  
- LC Agent Inbox: https://dev.agentinbox.ai/
