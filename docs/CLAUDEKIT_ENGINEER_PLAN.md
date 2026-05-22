# Plan — ClaudeKit / EngineerKit × XAUUSD Media OS

> **Nguồn (cùng sản phẩm):**  
> - [ClaudeKit Engineer](https://claudekit.cc/engineer#pricing)  
> - [EngineerKit — agentkit.best](https://agentkit.best/engineer)  
> **Agent audit:** [`AGENT_ROSTER_AUDIT.md`](./AGENT_ROSTER_AUDIT.md) — đánh giá gap, agent cần tạo thêm  
> **SSOT dự án:** [`PROJECT_STATUS.md`](../PROJECT_STATUS.md)  
> **Cập nhật:** 2026-05-19

---

## 1. ClaudeKit Engineer là gì? (tóm tắt từ trang pricing)

| Hạng mục | Chi tiết |
|----------|----------|
| **Giá** | **$99 một lần** — lifetime, update miễn phí, hoàn tiền 14 ngày |
| **Bundle** | Engineer + Marketing **$149** (riêng lẻ $198) — Marketing **không** cần cho pilot hiện tại |
| **Nền tảng** | Chạy trên **[Claude Code](https://docs.anthropic.com/en/docs/claude-code)** (CLI Anthropic), **không** thay GoClaw/Cursor |
| **Là gì** | Pack **17 agent** + **76 slash command** + skill templates + `CLAUDE.md` — SDLC (plan → code → test → review → docs → git) |
| **Không phải** | Boilerplate app, runtime bot, tool đăng X/Threads (Zernio làm việc đó) |

**Ẩn dụ:** ClaudeKit = **bộ phận IT trong công ty** (viết code, test, doc, commit). GoClaw = **bếp + shipper** (content + publish). Hai thứ **bổ sung**, không trùng.

---

## 2. So với stack dự án hiện tại

```text
┌─────────────────────────────────────────────────────────────┐
│  PRODUCTION (content + publish)                             │
│  GoClaw + Vault + Cron + Zernio + gpt-image-2               │
│  → Cowork dẫn pilot (UI setup)                              │
└─────────────────────────────────────────────────────────────┘
                              │
                    Skill export từ repo
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  REPO lungmat-agent (source + dev)                          │
│  ContentAgent, personas, vault-seed, ImageClient, E2E       │
│  → Cursor (IDE) + Claude Code (+ ClaudeKit nếu mua)         │
└─────────────────────────────────────────────────────────────┘
```

| Công việc | Tool phù hợp | ClaudeKit có giúp? |
|-----------|--------------|-------------------|
| Setup GoClaw, Zernio, Cron | **Cowork** + Founder UI | ❌ Không |
| Pilot checklist Alpha | **Cowork** | ❌ Không |
| Sửa `ContentAgent.ts`, export Skill | **Cursor** / Claude Code | ✅ planner, fullstack-developer, docs-manager |
| `npm run test:e2e:ci`, typecheck | **Cursor** / Claude Code | ✅ tester, debugger |
| Cập nhật `architecture.md`, PROJECT_STATUS | Mọi session | ✅ **docs-manager** (giá trị cao) |
| Commit/PR chuyên nghiệp | Claude Code | ✅ **git-manager** |
| Viết bài X/Threads hàng ngày | **GoClaw agent** | ❌ (copywriter kit ≠ brand Alpha) |
| Thumbnail trading | **gpt-image-2** | ⚠️ ui-ux-designer kit — trùng một phần, không cần cho MVP |

---

## 3. Khuyến nghị mua hay không

### ✅ Nên mua Engineer ($99) **nếu**

- Founder dùng **Claude Code CLI ≥ 2 buổi/tuần** trên repo này
- Sắp làm: export Skill Raymond/VIP10X, wire SalesMartly, mở rộng E2E, sync docs sau GoClaw pivot
- Muốn workflow **plan → implement → test → review → docs → commit** có sẵn, không tự viết slash command

### ⏸️ Chưa mua **nếu**

- Chỉ dùng **Cursor + Cowork** cho pilot GoClaw (2–4 tuần tới)
- Chưa cài / chưa quen Claude Code CLI
- Ngân sách tight — repo **đã có** [`COMMANDS_MAP.md`](./claude-code/COMMANDS_MAP.md) + [`cowork/PLAYBOOK.md`](./cowork/PLAYBOOK.md) port khung miễn phí

### ❌ Không mua Bundle Marketing ($149) **lúc này**

- Publish social đã chốt **Zernio + GoClaw**
- Marketing kit (SEO, email MCP) = phase sau, khi 3 brand publish ổn 2 tuần

**Quyết định trước đó (2026-05-16):** không bắt buộc mua kit — vẫn đúng; plan này **nâng cấp** thành: *mua khi Claude Code trở thành công cụ dev chính song song Cursor*.

---

## 4. Plan áp dụng vào dự án (4 phase)

### Phase 0 — Dùng khung có sẵn (0$, tuần này)

**Mục tiêu:** Xác nhận Claude Code có fit trước khi trả $99.

| # | Việc | Owner |
|---|------|-------|
| 0.1 | Cài Claude Code, mở repo `G:\...\GAI_AGENTS-lungmat_agent` | Founder |
| 0.2 | Tạo / merge root `CLAUDE.md` từ skeleton trong `COMMANDS_MAP.md` §6 | Claude Code hoặc Cursor |
| 0.3 | 1 task thử: export `raymond-content-writer-skill.md` từ `personas/raymond.ts` | Claude Code |
| 0.4 | Pass: `npx tsc --noEmit` + file skill mới trong `docs/goclaw-export/` | |

**Pass Phase 0 → cân nhắc mua. Fail (không dùng Code) → giữ Cursor-only.**

---

### Phase 1 — Mua + bootstrap Engineer ($99, ngày 1)

```bash
bun add -g claudekit-cli   # hoặc npm tương đương theo docs kit
ck new --dir ../lungmat-claudekit-sandbox --kit engineer   # sandbox trước, KHÔNG ghi đè repo
```

| # | Việc | Lưu ý |
|---|------|-------|
| 1.1 | Bootstrap **sandbox** riêng — xem cấu trúc `.claude/`, commands | Không `ck new` trực tiếp lên repo production |
| 1.2 | So sánh kit commands vs `COMMANDS_MAP.md` — chọn lệnh **không trùng** `/content`, `/coach` Hermes | Tránh nhầm bot command vs dev command |
| 1.3 | Copy có chọn lọc vào repo: `.claude/commands/` (dev only), merge `CLAUDE.md` | Giữ SSOT `PROJECT_STATUS.md` |

---

### Phase 2 — Map 17 kit agents → việc Media OS (tuần 2–3)

| Kit agent | Áp dụng cụ thể cho dự án | Không dùng cho |
|-----------|-------------------------|----------------|
| **planner** | Plan wire SalesMartly; plan Raymond/VIP10X skill export | GoClaw UI steps |
| **researcher** | So sánh Zernio vs Typefully backup; API docs | Nội dung trading hàng ngày |
| **tester** | Mở rộng `scripts/e2e-local.ts`; CI mock paths | Test GoClaw UI |
| **code-reviewer** | Review PR ContentAgent, ImageClient, salesmartly route | Review draft X post |
| **docs-manager** | Sync `architecture.md`, `XAUUSD_MEDIA_OS.md`, `PHASE_STATUS` sau mỗi feature | Thay PROJECT_STATUS SSOT |
| **git-manager** | Commit batch goclaw-export, skill files | — |
| **debugger** | Apify 401, CI fail, typecheck | Debug Zernio trên GoClaw |
| **scout** | Tìm file liên quan approval, publish flows | — |
| **copywriter** | Changelog release, README deploy — **không** thay persona Alpha | Brand content pack |
| **journal-writer** | `docs/ai-worklog/sessions/` | — |
| **project-manager** | Track GoClaw pilot checklist status | — |
| **ui-ux-designer** | Optional: mock dashboard admin — **không** ưu tiên | Thumbnail XAUUSD (dùng gpt-image-2) |
| **database-admin** | Chỉ khi bật Supabase/pgvector lại | Phase 8 đã re-scope GoClaw Vault |

**Nguyên tắc:** Kit agents = **dev workflow**. Hermes `src/agents/` = **runtime bot** — **không merge**, không duplicate Router.

---

### Phase 3 — Vận hành lâu dài (sau Alpha pilot pass)

```text
Hàng ngày (content):
  GoClaw Cron → duyệt TG → Zernio          [Cowork / Founder]

Hàng tuần (code/docs):
  Claude Code + ClaudeKit:
    planner → implement → tester → docs-manager → git-manager   [Founder]

Ad-hoc (IDE nhanh):
  Cursor                                                    [Founder]
```

| Trigger | Tool |
|---------|------|
| GoClaw/Zernio lỗi publish | Cowork checklist |
| Sửa TypeScript / export Skill | Cursor hoặc Claude Code (+ kit) |
| Cập nhật constitution / phase doc | docs-manager (kit) hoặc Cursor |
| Chiến lược brand / tone | Claude chat — **không** kit |

---

## 5. Bảng giá trị / chi phí

| Hạng mục | Chi phí | Ghi chú |
|----------|---------|---------|
| ClaudeKit Engineer | **$99** một lần | + Claude API subscription riêng |
| ClaudeKit Marketing bundle | +$50 (tổng $149) | **Skip** phase hiện tại |
| Claude Code / Anthropic API | ~$20–100+/tháng tùy usage | Bắt buộc để dùng kit |
| Cursor (đang có) | — | Giữ song song |
| GoClaw + Zernio | ~$15–25+/tháng | Không liên quan kit |

**ROI thực tế cho dự án:** Nếu kit tiết kiệm **≥ 2–3 giờ** cho 1 feature (SalesMartly wire-up + docs sync + E2E) → hoà vốn. Nếu chỉ dùng Cowork + Cursor cho pilot GoClaw → **chưa cần mua ngay**.

---

## 6. Rủi ro / tránh

| Rủi ro | Cách tránh |
|--------|------------|
| Kit ghi đè repo / duplicate agents | Sandbox trước; không copy `.claude/` blind vào root |
| Nhầm slash kit vs `/content` bot | Prefix dev commands hoặc chỉ dùng trong Claude Code session |
| Scope creep (Marketing, Next.js skills) | Chỉ import commands liên quan Node/Express/docs/test |
| Bỏ Cowork pilot vì có kit | GoClaw setup vẫn **Cowork** — kit không vào UI GoClaw |
| Trùng docs SSOT | `PROJECT_STATUS.md` vẫn do founder/Cowork chốt; docs-manager **đề xuất**, không tự ý đổi quyết định |

---

## 7. Checklist quyết định Founder

```text
☐ Phase 0: Claude Code thử 1 task export Skill — có dùng tiếp không?
☐ GoClaw Alpha pilot đang chạy (Cowork) — không delay vì cài kit
☐ Nếu mua: sandbox → cherry-pick commands → merge CLAUDE.md
☐ Không mua Marketing bundle cho đến khi 3 brand publish ổn
☐ Sau mua: cập nhật PROJECT_STATUS + worklog
```

---

## 8. File liên quan trong repo

| File | Vai trò |
|------|---------|
| [`claude-code/COMMANDS_MAP.md`](./claude-code/COMMANDS_MAP.md) | Port khung miễn phí (§7 nếu mua kit) |
| [`cowork/PLAYBOOK.md`](./cowork/PLAYBOOK.md) | Cowork — không thay bằng kit |
| [`briefs/goclaw-alpha-pilot-cowork-brief.md`](./briefs/goclaw-alpha-pilot-cowork-brief.md) | Pilot đang active |
| [`FOUNDERS_PLAYBOOK_APPLICATION.md`](./FOUNDERS_PLAYBOOK_APPLICATION.md) | Playbook Anthropic — kit là product riêng |
| [`MEDIA_OS_COORDINATION.md`](./MEDIA_OS_COORDINATION.md) | 4 tool + ClaudeKit vị trí |

---

## 9. Kết luận 1 câu

> **ClaudeKit Engineer ($99)** đáng mua như **bộ dev cho repo lungmat-agent** (plan, test, docs, git) khi Founder dùng Claude Code thường xuyên — **không** thay GoClaw/Zernio/Cowork cho content production; làm **Phase 0 miễn phí** trước, mua sau khi Alpha pilot GoClaw đang chạy ổn.
