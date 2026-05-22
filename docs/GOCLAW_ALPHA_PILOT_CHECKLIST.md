# Checklist Pilot — Alpha 1 brand trên GoClaw + Zernio

> **Mục tiêu:** Setup GoClaw → Alpha sinh content **text-only** (P4 ảnh skipped) → duyệt TG → Zernio X + Threads.  
> **Runtime map:** [`GOCLAW_RUNTIME_GUIDE.md`](./GOCLAW_RUNTIME_GUIDE.md) · **Cowork handoff:** [`briefs/goclaw-claude-cowork-handoff-2026-05-19.md`](./briefs/goclaw-claude-cowork-handoff-2026-05-19.md)  
> **Nguồn agent:** repo `lungmat-agent` (`ContentAgent.ts`, `personas/alpha.ts`, `ImageClient.ts`, `docs/vault-seed/`).  
> **Không cần:** n8n, Typefully, lungmat VPS prod cho pilot này.

**GoClaw:** `https://agent.hoa-homes.com` · **Brand:** Alpha Trading Lab · **X:** `@AlphaTrading79`  
**Scope kênh:** Chỉ Telegram (admin DM + channel). SSOT: [`TELEGRAM_ONLY_GUIDE.md`](./TELEGRAM_ONLY_GUIDE.md)  
**Framework agency (4 tầng):** [`DIGITOP_AGENCY_APPLICATION.md`](./DIGITOP_AGENCY_APPLICATION.md)  
**Audit verify (SSOT):** [`PILOT_ALPHA_AUDIT_STATUS.md`](./PILOT_ALPHA_AUDIT_STATUS.md)  
**Flow + phase A0–A6 (diagram):** [`ALPHA_MEDIA_WORKFLOW.md`](./ALPHA_MEDIA_WORKFLOW.md)

---

## Trước khi bắt đầu (chuẩn bị 15 phút)

| # | Việc | Có chưa? |
|---|------|:--------:|
| 1 | Login GoClaw (agent.hoa-homes.com) | ☐ |
| 2 | Tài khoản [zernio.com](https://zernio.com) — free 2 account | ☐ |
| 3 | OpenAI API key (gpt-image-2 + LLM nếu dùng OpenAI viết bài) | ☐ |
| 4 | Anthropic hoặc LLM khác trên GoClaw (viết content) | ☐ |
| 5 | Telegram BotFather token (channel/DM admin) | ☐ |
| 6 | X + Threads account Alpha đã connect Zernio | ☐ |

---

## Bước 1 — Vault (kiến thức nền, làm 1 lần)

**Ẩn dụ:** nạp sách nấu ăn vào bếp trước khi đầu bếp viết menu.

1. GoClaw → **Bộ nhớ / Vault**
2. Upload 38 file từ `docs/vault-seed/` (bỏ README nếu muốn)
3. Folder + tag theo `docs/vault-seed/README.md` (psychology → `memory`/`episodic`, smc/ta → `skill`)
4. **Smoke test** chat Linh Cẩu hoặc agent test:
   - "FVG là gì?"
   - "R-multiple tính sao?"
   - Pass = agent trả lời có nội dung vault, không bịa.

☐ Vault upload xong · ☐ 4 câu smoke pass

---

## Bước 2 — Zernio (xe giao bài)

**Ẩn dụ:** thuê 1 shipper biết đường lên X và Threads.

### 2a. Dashboard Zernio

1. [zernio.com/signup](https://zernio.com/signup) → tạo API key
2. **Profiles** → tạo profile `Alpha Trading Lab`
3. **Connect accounts:**
   - X (Twitter) — `@AlphaTrading79`
   - Threads — cùng brand Alpha
4. Ghi lại `accountId` X và Threads (Settings hoặc `zernio accounts list`)

☐ Zernio API key · [x] X `@AlphaTrading79` connected 5/19/2026 · [x] Threads `@alphatrading.lab` connected 5/19/2026 · ☐ accountId ghi chú (`zernio accounts list`)

### 2b. Cài Zernio CLI trên GoClaw

1. GoClaw → **Nodes** (hoặc Integrated tools / npm)
2. Package: `@zernio/cli`
3. **Environment / CLI Credential:**
   - `ZERNIO_API_KEY` = key từ dashboard
   - Không dùng biến sai chính tả như `ZERNOP_API_KEY`
4. Binary Name: `zernio`
5. Binary Path (optional): `/app/data/runtime/npm-global/bin/zernio` hoặc để auto-detect
6. Bấm Install → thấy version (vd `0.3.x`)

[x] `@zernio/cli` / `zernio` CLI credential enabled on GoClaw · [x] `ZERNIO_API_KEY` set · screenshot confirmed 2026-05-19

---

## P4 — OpenAI (vẽ thumbnail + ảnh post) — **SKIPPED pilot v1**

> Founder bỏ qua — đăng text-only. Chi tiết khi bật lại: [`GOCLAW_P4_P7_MEDIA_RUNBOOK.md`](./GOCLAW_P4_P7_MEDIA_RUNBOOK.md) § P4

[x] P4 **Skipped** (2026-05-19) — không cấu hình gpt-image-2 trong pilot v1

## Bước 3 — OpenAI (tạm ẩn — làm sau)

**Ẩn dụ:** chụp ảnh món trước khi shipper mang đi.

1. GoClaw → **Provider** → Add **OpenAI** → dán API key
2. Bật tool **tạo hình ảnh** (image generation)
3. Model: **`gpt-image-2`** (khớp `src/integrations/ImageClient.ts`)

**Prompt ảnh (copy vào Skill agent — từ repo):**

```text
Sau khi sinh JSON, tạo 2 ảnh OpenAI gpt-image-2:

1) Thumbnail (1536x1024):
   "Premium gold trading visual for Alpha Trading Lab. Topic: {topic}.
    Style: dark finance aesthetic, gold accent, clean chart background, no fake profit claims.
    Bold headline overlay: {youtube_pack.thumbnail_brief}. 16:9 widescreen."

2) Post image (1024x1024):
   "Premium gold trading visual for Alpha Trading Lab. Topic: {topic}.
    Square post graphic, subtle chart motif, minimal text, gold palette, X/Threads feed."
```

☐ P4 OpenAI provider · ☐ P4 gpt-image-2 test 1 ảnh thành công

---

## P5 — Agent Alpha Writer

> Chi tiết: [`GOCLAW_P4_P7_MEDIA_RUNBOOK.md`](./GOCLAW_P4_P7_MEDIA_RUNBOOK.md) § P5 · Skill SSOT: [`goclaw-export/alpha-content-writer-skill.md`](./goclaw-export/alpha-content-writer-skill.md)

## Bước 4 — Agent Alpha Writer (tận dụng content agent repo)

**Ẩn dụ:** thuê đầu bếp Alpha — copy recipe từ repo, không viết lại.

1. GoClaw → **Agent** → **+ Tạo agent**
2. Tên: `Alpha Content Writer`
3. Model: Claude Haiku/Sonnet hoặc model mạnh bạn đang dùng
4. Gắn: Vault retrieve · Web search · Zernio CLI credential (**không** OpenAI image — P4 skipped)
5. **Skill** — paste **toàn bộ** file [`goclaw-export/alpha-content-writer-skill.md`](./goclaw-export/alpha-content-writer-skill.md) (có compliance gate)
6. Thay `{ALPHA_ACCOUNT_IDS}` bằng accountId từ `zernio accounts list`
7. Channel: gắn Telegram admin DM (nhận draft duyệt)

☐ P5 Agent tạo xong · ☐ P5 Skill paste · ☐ P5 Tools gắn đủ · ☐ P5 accountId điền · ☐ P5 test draft (no Zernio)

---

## P6 — Cron 08:00 VN

> Chi tiết: [`GOCLAW_P4_P7_MEDIA_RUNBOOK.md`](./GOCLAW_P4_P7_MEDIA_RUNBOOK.md) § P6

## Bước 5 — Cron (hẹn giờ sáng, thay n8n)

**Ẩn dụ:** báo thức 8h — bếp tự nấu, gửi anh nếm thử.

1. GoClaw → **Scheduled tasks / Cron**
2. Tạo job:

| Field | Giá trị |
|-------|---------|
| Tên | `daily_alpha_xauusd` |
| Giờ | `08:00` timezone `Asia/Ho_Chi_Minh` |
| Agent | Alpha Content Writer |
| Prompt | *(copy bên dưới)* |
| Deliver | Telegram admin DM |

**Prompt Cron:**

```text
Topic hôm nay: XAUUSD daily brief — liquidity và macro (Fed, DXY).

Research tin mới. Retrieve vault liên quan.
Sinh full content pack JSON (KHÔNG ảnh — pilot text-only).
Gửi draft admin Telegram CHỜ DUYỆT — KHÔNG gọi Zernio cho đến khi admin OK.
```

> Flow fix: Nếu cron skill hiện tại hoặc chat prompt vẫn tự gọi Zernio trước khi admin OK, đó là bug. Sửa ngay skill `alpha-content-writer-skill.md` để chỉ dừng ở draft admin, rồi chờ `OK đăng` mới publish.
> Thêm nữa: skill cũ không được dùng CLI/exec để đăng Zernio. Chỉ dùng tool MCP Zernio `mcp_zernio__*`.


☐ P6 Cron tạo · ☐ P6 Next run 08:00 VN · ☐ P6 (optional) Run now → draft TG

---

## P7 — E2E Zernio post

> Chi tiết: [`GOCLAW_P4_P7_MEDIA_RUNBOOK.md`](./GOCLAW_P4_P7_MEDIA_RUNBOOK.md) § P7

## Bước 6 — Chạy thử tay (trước khi chờ Cron)

Chat trực tiếp với **Alpha Content Writer**:

```text
Topic: test pilot — XAUUSD liquidity sweep tuần này.
Làm full pack + ảnh. Gửi draft admin. Chưa đăng Zernio.
```

**Pass khi:**

| # | Kiểm tra | ☐ |
|---|----------|---|
| 1 | JSON đủ 4 field (telegram, x_thread, threads, youtube_pack) | |
| 2 | `shorts_script` có [HOOK] 3s đầu | |
| 3 | Text post live (ảnh optional — P4 skipped) | |
| 4 | Giọng Alpha institutional, không signal spam | |
| 5 | Admin reply "OK đăng" → Zernio post lên X + Threads | |
| 6 | X/Threads có text + ảnh kèm | |

☐ **P7 E2E pass** (ghi ngày + link post vào `PROJECT_STATUS.md`)

---

## Bước 7 — YouTube (cùng pack, tay 15 phút)

Zernio **không quay video**. Từ pack Alpha:

1. Copy `youtube_pack.shorts_script` → quay Shorts 45–60s (chart + voice)
2. Upload **YouTube Studio** — dùng thumbnail từ gpt-image-2 (ảnh bước 6)
3. Title / description / tags lấy từ `youtube_pack`

☐ 1 Shorts pilot upload (optional tuần 1)

---

## Chi phí pilot Alpha (ước lượng / tháng)

| Hạng mục | ~Chi phí |
|----------|----------|
| GoClaw host | 300–700k VND |
| Zernio (2 acc free — Alpha X + Threads) | $0 |
| LLM viết bài | ~$2–10 tùy model/volume |
| OpenAI gpt-image-2 (~60 ảnh/tháng) | ~$3–8 |
| X API qua Zernio (~30 post, ít link) | ~$0.50–2 |
| **Tổng pilot** | **~$5–20 + host** |

Set **X spend cap** trong Zernio dashboard nếu lo bill.

---

## Xử lý nhanh khi lỗi

| Triệu chứng | Làm gì |
|-------------|--------|
| JSON lỗi / thiếu field | Nhắc agent "chỉ trả JSON, không markdown" |
| Không có ảnh | Check OpenAI key + model gpt-image-2 |
| Zernio fail | `zernio auth:check` · accountId đúng chưa |
| Bài X format xấu | Sửa Skill: mỗi tweet 1 dòng, đánh số 1/ 2/ |
| Bill X cao | Bỏ link trong tweet; CTA ở Threads |
| Cron không chạy | Cron tab → timezone Asia/Ho_Chi_Minh |

---

## Done — pilot Alpha đóng khi

- [ ] Vault 38 docs + smoke test pass
- [ ] Zernio X + Threads Alpha connected + CLI trên GoClaw
- [ ] Alpha Writer agent + Skill (text-only pilot v1)
- [ ] 1 vòng **draft → admin OK → Zernio post** thành công
- [ ] Cron 08:00 chạy ít nhất 3 ngày liên tiếp ổn định
- [ ] (Tuỳ chọn) 1 YouTube Shorts từ cùng pack

**Sau pass:** clone agent → Raymond + VIP10X (`personas/raymond.ts`, `vip10x.ts`) · Cron 13:00 / 19:00.

---

## File repo tham chiếu

| File | Vai trò |
|------|---------|
| `src/agents/ContentAgent.ts` | JSON schema + flow research → image → approve |
| `src/llm/personas/alpha.ts` | Persona Alpha |
| `src/integrations/ImageClient.ts` | gpt-image-2 + prompt ảnh |
| `docs/vault-seed/` | 38 docs upload Vault |
| `config/brands.json` | Alpha · `@AlphaTrading79` · Typefully set (backup) |

*Cập nhật: 2026-05-19 — pilot GoClaw + Zernio Alpha only.*
