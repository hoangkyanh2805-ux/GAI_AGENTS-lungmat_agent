# Claude Code — Command map (Media OS port)

> **Mục đích:** Map pattern lệnh kiểu “AI dev kit” (planner, review, test…) sang **lệnh và file thật** trong repo `lungmat-agent`.  
> **Không** yêu cầu mua ClaudeKit — đây là khung tự port khi anh dùng [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

**SSOT:** [`PROJECT_STATUS.md`](../../PROJECT_STATUS.md) · **Runtime:** `npm run dev` (sync G: → `C:\lungmat_agent`)

---

## 1. Setup Claude Code trong repo

1. Mở thư mục canonical: `G:\Other computers\My Computer\Project\GAI_AGENTS-lungmat_agent`
2. Tạo hoặc merge `CLAUDE.md` ở root (rút gọn từ `PROJECT_STATUS` + link `docs/architecture.md`).
3. Đầu mỗi session Claude Code:

```text
Đọc PROJECT_STATUS.md và docs/claude-code/COMMANDS_MAP.md.
Xác nhận phase. Không sửa Router/Supervisor trừ khi task ghi rõ.
```

4. Sau session: cập nhật `PROJECT_STATUS.md` + `docs/ai-worklog/INDEX.md`.

---

## 2. Map pattern → Media OS (bảng chính)

| Pattern / “slash” tham khảo | Làm gì trên Media OS | Công cụ | Ghi chú |
|----------------------------|----------------------|---------|---------|
| **plan** / implement plan | Đọc `docs/PHASE_7_PLAN.md` §7D; viết plan trong chat; không tạo plan file trùng PHASE | Claude Code / Cursor | SSOT phase đã có |
| **research** | `POST /command` `command: /research` hoặc Apify qua agent | HTTP / Telegram | |
| **implement feature** | Sửa `src/` theo `architecture.md`; `npx tsc --noEmit` | Claude Code / Cursor | G:\ canonical |
| **test** | `npm run test:e2e-local` (MOCK_LLM=1) | Terminal | Port 3099 |
| **review** | Đọc diff; đối chiếu §14 publish trong `architecture.md` | Claude Code | |
| **debug** | `/debug_env`; log `[ENV] startup`; port 3000, MOCK_LLM | Cowork + Cursor | |
| **docs** | Cập nhật `architecture.md` nếu đổi hành vi; `ai-worklog` session | Cursor | |
| **git** | Commit khi founder yêu cầu; không commit `.env` | Human / Cursor | |

---

## 3. Lệnh bot thật (Hermes) — dùng khi test integration

Gọi qua Telegram hoặc HTTP `POST /command/command` (header `x-agent-secret`).

| Command | Agent runtime | Mục đích verify / ops |
|---------|---------------|------------------------|
| `/debug_env` | OpsAgent | Env flags, không lộ secret |
| `/coach <câu hỏi>` | CoachAgent | Admin DM only — Lửng Mật coach phase/verify |
| `/market_summary` | MarketSummaryAgent | Phase 6 — 6 sections |
| `/content <brand> <topic>` | ContentAgent | Phase 7A — full pack |
| `/approval_list` | OpsAgent | Pending approvals |
| `/approve_publish` | OpsAgent | Approve + publish TG (payload `approval_id`, `platform`) |
| `/publish_telegram` | TelegramPublisherAgent | Publish đã approved |
| `/queue_status` | OpsAgent | Job queue |

**Multi-approve (7B):** approve qua nút admin DM `approve:tg|x|th:<uuid>` — không có slash riêng.

Chi tiết publish: `docs/architecture.md` · Verify: `docs/VERIFY_LIVE_TELEGRAM.md`.

---

## 4. Task → file thường đụng (Claude Code)

| Task | File ưu tiên |
|------|----------------|
| 7D cron 3 brand | `src/index.ts`, `src/scheduler/CronScheduler.ts` |
| Content pack / persona | `src/agents/ContentAgent.ts`, `src/llm/personas/`, `config/brands.json` |
| Approve / TG publish | `src/content/contentApprovals.ts`, `src/publish/telegramPublish.ts`, `src/skills/publishApproval.ts` |
| Typefully handoff | `src/integrations/TypefullyClient.ts` |
| Macro summary | `src/agents/MarketSummaryAgent.ts` |
| Env / dotenv | `src/config/env.ts`, `.env` (không commit) |

**Không sửa khi chưa align:** `RouterAgent.ts`, `SupervisorAgent.ts`, `SafetyAgent.ts`.

---

## 5. Phân vai song song (Claude Code vs Cursor vs Cowork)

| Việc | Claude Code | Cursor | Cowork |
|------|-------------|--------|--------|
| 7D cron implement | Có thể lead | Có thể lead | Brief + review |
| Verify Telegram | Hỗ trợ debug | Fix code nếu lỗi | Checklist + paste output |
| Refactor + e2e | Session song song | Session chính | Không |
| Brand campaign copy | — | — | Claude chat / founder |

Tránh **cùng ngày** hai tool sửa `index.ts` cron mà không cập nhật `PROJECT_STATUS`.

---

## 6. CLAUDE.md skeleton (root — copy/adapt)

```markdown
# lungmat-agent (XAUUSD Media OS)

Đọc trước: PROJECT_STATUS.md, docs/architecture.md.

Stack: Node 20, Express, Telegram long-poll, ContentAgent /content, approval 7B, Typefully 7C.

Rules:
- G:\ repo canonical; npm run dev syncs to C:\lungmat_agent.
- MOCK_LLM=0 for live Telegram; restart after .env change.
- Do not edit Router/Supervisor without explicit task.
- Update PROJECT_STATUS + ai-worklog when behavior changes.

Verify: docs/VERIFY_LIVE_TELEGRAM.md
Cowork: docs/cowork/PLAYBOOK.md
```

---

## 7. Nếu sau này mua ClaudeKit Engineer

| Kit asset | Port vào repo |
|-----------|----------------|
| Slash commands | Bổ sung cột vào bảng §2 — **không** trùng tên với `/content` Hermes |
| Agent roles | Map vào `docs/cowork/PLAYBOOK.md` + Cursor rules — **không** duplicate `src/agents/` |
| CLAUDE.md templates | Merge vào root `CLAUDE.md` |

Giữ **một** SSOT: `PROJECT_STATUS.md`.

---

*Khung port — cập nhật khi thêm lệnh hoặc phase 7D.*
