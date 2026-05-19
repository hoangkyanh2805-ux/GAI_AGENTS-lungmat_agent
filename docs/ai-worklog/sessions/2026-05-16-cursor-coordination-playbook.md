# Session 2026-05-16 — Cursor: coordination, Cowork align, Founder’s Playbook

| Field | Value |
|-------|--------|
| **Date** | 2026-05-16 |
| **AI tool** | Cursor (Auto) |
| **Human** | Founder |
| **Phase** | 6 + 7A–7C code done · verify live pending · 7D chưa |
| **Status** | done (docs); verify vẫn pending |

---

## Mục tiêu session (theo thứ tự chat)

1. Lưu lịch sử làm việc AI (tiếp tục `docs/ai-worklog/`)
2. User hỏi **ClaudeKit Engineer** ($99) — tư vấn mua hay không
3. Cowork lệch context (chỉ thấy Phase 6) — **trả lời align** 4 câu hỏi
4. Tạo **`COWORK_ALIGNMENT_QA.md`** cho Cowork bookmark
5. Đọc **`PROJECT_STATUS.md`** — xác nhận phase / blocker / next step
6. Tóm tắt session + **cập nhật `PROJECT_STATUS.md`**
7. User hỏi buffer IDE — giải thích unsaved tab vs file trên disk
8. **Kết hợp Cursor + Claude Code + Cowork** — skeleton port (không mua kit)
9. Đọc **Founder’s Playbook** PDF Anthropic — tư vấn + **`FOUNDERS_PLAYBOOK_APPLICATION.md`**
10. Lưu lại đoạn chat này (file này)

---

## Quyết định chính

| # | Quyết định | Lý do |
|---|------------|--------|
| 1 | **Không bắt buộc mua ClaudeKit** để chạy Media OS | Repo đã có ContentAgent, SSOT, playbooks; kit = Claude Code workflows |
| 2 | **Cowork không chạy kit native** — dùng doc playbook | Cowork = verify + handoff, không phải Claude Code CLI |
| 3 | **Song song Cursor + Claude Code + Cowork** | Một SSOT (`PROJECT_STATUS`), phân vai rõ |
| 4 | **Playbook lifecycle:** đang **cuối MVP**, blocker = verify Telegram | Không nhảy Launch/7D trước evidence |
| 5 | **ClaudeKit port khung** trong repo | `COMMANDS_MAP` + `cowork/PLAYBOOK` thay vì copy kit vào git |

---

## Công việc đã làm

### Docs (session này)

| File | Nội dung |
|------|----------|
| `docs/COWORK_ALIGNMENT_QA.md` | Trả lời Cowork: `/content` = ContentAgent, 7D = Phase 7D, Typefully handoff |
| `docs/cowork/PLAYBOOK.md` | Cowork: verify, HTTP, handoff Cursor/Claude Code |
| `docs/claude-code/COMMANDS_MAP.md` | Map pattern SDLC → lệnh Hermes + skeleton `CLAUDE.md` |
| `docs/MEDIA_OS_COORDINATION.md` | Cập nhật 4 tool + port khung |
| `docs/FOUNDERS_PLAYBOOK_APPLICATION.md` | Map Anthropic Founder’s Playbook → Media OS + checklist 30 ngày |
| `PROJECT_STATUS.md` | Tóm tắt session 2026-05-16; link docs mới |
| `docs/ai-worklog/INDEX.md` | Link coordination + playbook |
| `.cursor/rules/media-os-coordination.mdc` | Trỏ PLAYBOOK + COMMANDS_MAP |

### Code / env (session trước trong cùng thread, ghi để đủ context)

- Phase **7B/7C** đã implement trước summary: `contentApprovals`, `TypefullyClient`, `telegramCallback`, v.v.
- Verify debug: `MOCK_LLM=0`, `ADMIN_TELEGRAM_CHAT_ID`, `dotenv override` — verify live vẫn pending founder

### Tư vấn (không commit)

- ClaudeKit: thử Claude Code trước; $99 hợp nếu dùng Code thường xuyên
- Founder’s Playbook: orchestrator founder, validate trước scale, `CLAUDE.md` + scope

---

## File map nhanh (session 2026-05-16)

```text
docs/
  COWORK_ALIGNMENT_QA.md          ← paste cho Cowork
  FOUNDERS_PLAYBOOK_APPLICATION.md
  cowork/PLAYBOOK.md
  claude-code/COMMANDS_MAP.md
  MEDIA_OS_COORDINATION.md        (updated)
PROJECT_STATUS.md                 (updated)
docs/ai-worklog/sessions/2026-05-16-cursor-coordination-playbook.md  ← file này
```

---

## Trạng thái dự án (snapshot cuối session)

| Hạng mục | Trạng thái |
|----------|------------|
| Phase 6 code | Done (Cowork patch 6 sections) |
| 7A–7C code | Done |
| Live verify Telegram | **Pending** — `VERIFY_LIVE_TELEGRAM.md` |
| 7D cron | Not started |
| SSOT | `PROJECT_STATUS.md` |

---

## Blocker (không đổi)

Founder cần:

1. `taskkill` node + `npm run dev` (G: sync → `C:\lungmat_agent`)
2. `.env`: `MOCK_LLM=0`, `ADMIN_TELEGRAM_CHAT_ID`, `TELEGRAM_CHAT_ID_ALPHA` (channel thật)
3. Chạy checklist verify + paste kết quả

---

## Việc tiếp theo

- [ ] Verify live → cập nhật `PHASE_STATUS` + tick `PROJECT_STATUS`
- [ ] Tạo root `CLAUDE.md` (từ `COMMANDS_MAP.md` §6)
- [ ] Phase 7D-1 (cron alpha) — **sau** verify
- [ ] (Tuỳ chọn) `docs/MVP_SCOPE.md` ngắn — chống scope creep

---

## Prompt cho AI session sau

```text
Đọc PROJECT_STATUS.md → docs/ai-worklog/sessions/2026-05-16-cursor-coordination-playbook.md.

Cowork dùng docs/cowork/PLAYBOOK.md + COWORK_ALIGNMENT_QA.md.
Claude Code dùng docs/claude-code/COMMANDS_MAP.md.
Lifecycle lens: docs/FOUNDERS_PLAYBOOK_APPLICATION.md.

Blocker: verify live Telegram chưa pass. Đừng mở scope 7D/kit trước verify trừ khi founder yêu cầu.
```

---

*End of session log.*
