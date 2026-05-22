# Brief — Alpha Telegram duyệt + đăng (handoff Claude Cowork)

> **Giao cho:** Claude Cowork — dẫn Founder trên **GoClaw UI** + **Telegram điện thoại** + **Zernio**.  
> **Không giao Cowork:** sửa code lungmat, chạy script crop local, Zernio CLI trên VPS.  
> **Cursor chỉ khi:** cần rebuild/upload skill ZIP từ repo.  
> **Owner:** Founder · **SSOT plan:** [`ALPHA_TELEGRAM_APPROVAL_PLAN.md`](../ALPHA_TELEGRAM_APPROVAL_PLAN.md) · **Audit:** [`PILOT_ALPHA_AUDIT_STATUS.md`](../PILOT_ALPHA_AUDIT_STATUS.md)

**Generated:** 2026-05-21  
**Runtime:** https://agent.hoa-homes.com  
**Quyết định mặc định brief:** **Plan A** — ảnh qua Telegram photo hoặc Founder paste `mediaId` từ Zernio app (không Drive MCP v1).

---

## 1. Mục tiêu (done when)

Founder **chỉ dùng điện thoại** (Telegram) để:

1. Nhận **draft** text (X tweet1 + Threads) từ bot Alpha  
2. Gửi **ảnh** (photo TG) hoặc `mediaId` (đã upload Zernio)  
3. Reply **`OK đăng`**  
4. Agent đăng **X + Threads** qua **Zernio MCP** — dashboard status **Published**  
5. Cowork cập nhật [`PILOT_ALPHA_AUDIT_STATUS.md`](../PILOT_ALPHA_AUDIT_STATUS.md) + báo cáo cuối session

**Đã có (không làm lại trừ verify):**

- Zernio X `@AlphaTrading79` + Threads `@alphatrading.lab` connected  
- MCP Zernio enabled · text publish đã pass (Post `6aeecda0431cc299473c8719`)  
- Skill `alpha-content-writer` active · model **Claude Sonnet** (không Gemini free)

**Out of scope:**

- GoClaw web Chat là kênh duyệt chính  
- Zernio CLI / npm Nodes  
- Google Drive MCP (T5 — skip nếu T3 pass)  
- Script `alpha-media-prep.ps1` / crop ảnh  
- lungmat bot, n8n, SalesMartly

---

## 2. Cowork làm / không làm

| Cowork LÀM | Cowork KHÔNG |
|------------|--------------|
| Dẫn Founder checklist **T1 → T4** (mục 3) từng click GoClaw | Login thay Founder |
| Hướng tạo bot BotFather + paste token Channel | Paste API keys vào chat công khai |
| Verify MCP Test + grant Alpha Writer | Chạy `zernio` CLI trên server |
| Hướng test E2E trên **Telegram app** | Auto-post không `OK đăng` |
| Thu screenshot: Channel OK, Zernio Published, Post ID | Sửa `src/` lungmat trừ khi handoff Cursor |
| Cập nhật audit + worklog | Bật `exec` cho agent public (chỉ Founder quyết) |

**Handoff Cursor** khi: cần sửa `SKILL.md` → rebuild `docs/goclaw-export/skills/zips/alpha-content-writer.zip`.

---

## 3. Checklist thực hiện (theo thứ tự)

### T0 — Chốt plan (Founder, 1 phút)

- [x] **Plan A** — ảnh qua **Telegram photo** hoặc **`mediaId`** từ Zernio app · **không** Drive MCP · **không** `exec`  
- Tick audit khi bắt đầu T1: [`PILOT_ALPHA_AUDIT_STATUS.md`](../PILOT_ALPHA_AUDIT_STATUS.md)

### Lưu ý quan trọng — agent đã có sẵn

**Alpha Content Writer** đã tồn tại trên GoClaw (P5 Done). **Không tạo agent mới.**

| Đúng | Sai |
|------|-----|
| **Agents** → click **Alpha Content Writer** → **Edit** / bánh răng | Agents → **+ Tạo agent** mới |
| **Channels** → **+** (tạo **Channel** Telegram mới) | Tạo agent trùng tên |

T1 = Channel mới + pair vào agent cũ. T1b = sửa config agent cũ.

### T1 — Telegram Channel (GoClaw UI ~20 phút)

| Bước | Menu GoClaw | Founder làm |
|------|-------------|-------------|
| 1 | **@BotFather** (Telegram) | `/newbot` → tên + username bot → copy **token** `7xxx:AAF...` (không paste chat công khai) |
| 2 | [agent.hoa-homes.com](https://agent.hoa-homes.com) → **Channels** → **+** → Telegram | Paste token → **Test kết nối** → **Lưu** |
| 3 | Channel → **Pair Agent** | Chọn **Alpha Content Writer** (agent có sẵn) → Save |
| 4 | Channel → Settings / Policy | `dm_policy`: **allowlist** · thêm Telegram user ID Founder (`@userinfobot` → `/start`) |
| 5 | Điện thoại | Mở bot → `/start` → `ping` |

**Pass T1:** Bot trả lời trong **≤30 giây** (screenshot).

**Lấy `chat_id` cho T4 Cron delivery:** sau khi nhắn bot, `https://api.telegram.org/bot{TOKEN}/getUpdates` → `"chat":{"id":...}`.

**Ref:** handbook [`04-channel.md`](../goclaw-export/handbook/04-channel.md) §4.3 · [`GOCLAW_RUNTIME_GUIDE.md`](../GOCLAW_RUNTIME_GUIDE.md) §2.4

### T1b — Sửa agent có sẵn (GoClaw UI ~10 phút)

**Agents → Alpha Content Writer → Edit** (không tạo mới):

| Mục | Cài |
|-----|-----|
| **Model** | `claude-sonnet-4-5` / **Claude Sonnet 4.5** (không Gemini 429) |
| **MCP** tab → Zernio | **Grant** Alpha Writer → **Test connection** → pass |
| **Built-in Tools** | `vault_search` ON · `web_search` ON · **Messaging** ON |
| **Built-in Tools** | **`exec` OFF** (Plan A) |
| **Skills** tab | `alpha-content-writer` toggle **ON** |

**Pass T1b:** MCP test trả list tools (có `posts_cross_post` / `mcp_zernio__*`).

### T2 — Upload Skill v1.5.0 (~5 phút)

ZIP repo: `docs/goclaw-export/skills/zips/alpha-content-writer.zip` (hoặc bản copy trên Desktop nếu Founder đã export).

1. GoClaw → **Skills** → **Upload** → chọn ZIP → **Rescan**  
2. Verify: tên `alpha-content-writer` · **v1.5.0** · Active · tab Content có mục **Telegram admin**  
3. **Agents → Alpha Content Writer → Skills** → toggle ON (nếu chưa)

**Pass T2:** Skill v1.5.0 Active · không còn hướng dẫn Zernio CLI trong skill.

*Nếu ZIP cũ:* handoff Cursor rebuild từ `docs/goclaw-export/skills/alpha-content-writer/SKILL.md`.

### T3 — E2E một vòng (điện thoại + Zernio)

**Không dùng GoClaw web Chat** — chỉ Telegram.

**Bước Founder (copy):**

```text
Viết bài XAUUSD hôm nay — preview X + Threads, chưa publish.
```

Sau preview, gửi **một trong hai**:

- **Cách 1 (khuyến nghị):** Upload ảnh trong **Zernio → Media** → copy `mediaId` → gửi bot:
  ```text
  mediaId: [PASTE_ID]
  X (<=280, không link): [paste tweet 1]
  Threads (<=500): [paste]
  Chờ duyệt.
  ```
- **Cách 2:** Gửi **photo** trực tiếp trong Telegram + text như trên (không mediaId).

Khi agent báo PASS + preview cuối:

```text
OK đăng
```

**Pass T3:**

| Kiểm tra | Bằng chứng |
|----------|------------|
| Bot báo Post ID | Screenshot TG |
| Zernio dashboard | Status **Published** (không Failed) |
| X | Tweet ≤280 · có ảnh nếu test ảnh |
| Threads | ≤500 · ảnh JPG/PNG OK |

**Fail thường gặp:**

| Lỗi | Sửa |
|-----|-----|
| X >280 | Cắt tweet1 trước publish |
| Threads format | Ảnh JPG/PNG; không crop chart |
| Agent báo Done nhưng Zernio Failed | Không chốt pass — sửa + `OK đăng` lại |
| Không có mediaId | Founder upload Zernio app trước (Cách 1) |

### T4 — Cron sáng (sau T3 pass)

| Field | Giá trị |
|-------|---------|
| Name | `daily_alpha_xauusd` |
| Expression | `0 8 * * *` |
| Timezone | **`Asia/Ho_Chi_Minh`** |
| Agent | Alpha Content Writer |
| Delivery | Telegram **admin chat_id** |
| Message | *(copy bên dưới)* |

```text
Topic: XAUUSD daily brief — liquidity và macro (Fed, DXY).
Research tin mới. Retrieve vault liên quan.
Sinh content pack JSON (text). Compliance PASS.
Gửi draft qua Telegram CHỜ DUYỆT — KHÔNG gọi Zernio cho đến khi admin OK đăng.
Sau draft: nhắc admin gửi ảnh hoặc mediaId rồi OK đăng.
```

- [ ] **Run now** → draft vào TG  
- [ ] Next run 08:00 VN đúng  

**Pass T4:** **Run now** → draft vào TG trong ~2 phút; **không** auto-publish (chờ `OK đăng`).

**Thứ tự:** T1 → T1b → T2 → T3 (có thể text-only trước, ảnh sau) → T4.

**Cowork hỏi Founder sau T1:** bot đã trả lời `/start` / `ping` chưa? → mới sang T2.

### T5 — Drive MCP

**Skip** nếu T3 pass với Plan A.

---

## 4. ID & constants (điền sẵn — không hỏi lại)

| | Giá trị |
|--|---------|
| Zernio X accountId | `6a0c28345e333c05299b981a` |
| Zernio Threads accountId | `6a0c6dbd5e333c05299f1d12` |
| MCP server | `https://mcp.zernio.com/mcp` |
| Drive kho (backup) | https://drive.google.com/drive/folders/1IW_UN4hnezRWvF3RSNMmaUXcf9pdzwbv |

**Publish:** chỉ tool prefix `mcp_zernio__*` — **không** `zernio posts:create` CLI.

---

## 5. File Cowork đọc trước (theo thứ tự)

| # | File |
|---|------|
| 1 | [`ALPHA_TELEGRAM_APPROVAL_PLAN.md`](../ALPHA_TELEGRAM_APPROVAL_PLAN.md) — sơ đồ + §1b feasibility |
| 2 | [`PILOT_ALPHA_AUDIT_STATUS.md`](../PILOT_ALPHA_AUDIT_STATUS.md) — tick T1–T4 |
| 3 | [`GOCLAW_RUNTIME_GUIDE.md`](../GOCLAW_RUNTIME_GUIDE.md) |
| 4 | [`goclaw-export/handbook/04-channel.md`](../goclaw-export/handbook/04-channel.md) |
| 5 | [`goclaw-export/handbook/08-cron.md`](../goclaw-export/handbook/08-cron.md) |
| 6 | [`goclaw-export/skills/alpha-content-writer/SKILL.md`](../goclaw-export/skills/alpha-content-writer/SKILL.md) |

---

## 6. Báo cáo cuối session (Cowork điền)

```markdown
## Alpha Telegram Approval — Report YYYY-MM-DD

| Phase | Status | Evidence |
|-------|--------|----------|
| T0 Plan A | pass/fail | |
| T1 Telegram Channel | pass/fail | screenshot DM |
| T1b MCP + model Sonnet | pass/fail | |
| T2 Skill ZIP | pass/fail | version |
| T3 E2E TG → Zernio Published | pass/fail | Post ID + Zernio screenshot |
| T4 Cron 08:00 VN | pass/fail/not run | next run |

**Blockers:** (nếu có)

**Next:** T4 only / Vault A4 / handoff Cursor skill
```

Cập nhật: [`PILOT_ALPHA_AUDIT_STATUS.md`](../PILOT_ALPHA_AUDIT_STATUS.md) mục **Telegram duyệt + đăng**.

---

## 7. Escalation

| Tình huống | Ai |
|------------|-----|
| Skill cần sửa publish logic | Cursor — `SKILL.md` + rebuild ZIP |
| MCP tool name khác | Cowork ghi tool list từ GoClaw MCP Test → Cursor patch skill |
| Channel webhook lỗi | Founder + GoClaw diagnostics §4.15 handbook |
| Founder muốn Drive auto | Mở lại plan T5 — không làm ngầm trong T3 |

---

*Brief này là nhiệm vụ vận hành; không thay [`ALPHA_TELEGRAM_APPROVAL_PLAN.md`](../ALPHA_TELEGRAM_APPROVAL_PLAN.md) (thiết kế).*
