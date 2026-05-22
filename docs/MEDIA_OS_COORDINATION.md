# Media OS — Phối hợp Cowork · Cursor · Claude Code · Claude

> **Mục đích:** Một trang để **Cowork** (workflow / verify), **Cursor** (IDE code), **Claude Code** (CLI song song), và **Claude** (chiến lược nội dung) cùng hiểu **đang ở phase nào** và **ai làm gì**.  
> **SSOT:** [`PROJECT_STATUS.md`](../PROJECT_STATUS.md) (đọc đầu mọi session).  
> Cursor rule: [`.cursor/rules/media-os-coordination.mdc`](../.cursor/rules/media-os-coordination.mdc).

---

## 1. Snapshot giai đoạn (2026-05-19)

| Giai đoạn | Trạng thái | Ghi chú |
|-----------|------------|---------|
| Phase 1–7C (lungmat) | **Closed** (verify live 2026-05-16) | `/content`, approve, Typefully legacy |
| **GoClaw runtime** | **Prod** | Linh Cẩu `@linhcau79_bot` — [`GOCLAW_RUNTIME_GUIDE.md`](./GOCLAW_RUNTIME_GUIDE.md) |
| **GoClaw + Zernio pilot** | **Active** | P4 Skipped · P5–P7 Cowork — [`briefs/goclaw-claude-cowork-handoff-2026-05-19.md`](./briefs/goclaw-claude-cowork-handoff-2026-05-19.md) |
| **7D lungmat VPS** | Paused | GoClaw Cron thay prod |
| **ClaudeKit Engineer** | Optional ($99) | Plan: [`CLAUDEKIT_ENGINEER_PLAN.md`](./CLAUDEKIT_ENGINEER_PLAN.md) |

**Chốt:** Linh Cẩu + Alpha media = **GoClaw**. Repo = Skill export + dev. **Cowork** = handoff brief 2026-05-19. Worklog: [`ai-worklog/sessions/2026-05-19-goclaw-runtime-cowork-handoff.md`](./ai-worklog/sessions/2026-05-19-goclaw-runtime-cowork-handoff.md).

---

## 2. Bốn vai trò — ai làm gì

### Cowork (điều phối / verify / automation)

| Làm | Không làm |
|-----|-----------|
| Checklist verify, HTTP enqueue `/content` (n8n) | Sửa TypeScript structural (`Router`, cron `index.ts`) |
| Brief handoff Cursor / Claude Code | Auto-approve TG production |
| Patch prompt nhỏ (vd. MarketSummary) khi align | Copy secret vào chat |

**Playbook:** [cowork/PLAYBOOK.md](./cowork/PLAYBOOK.md)

### Cursor (IDE — code chính trong repo)

| Làm | Không làm |
|-----|-----------|
| Sửa `src/`, `docs/architecture.md` | Chiến lược brand dài hạn |
| GoClaw ops qua **`goclaw-mcp`** (`.cursor/mcp.json.example`) | Đoán Cron/Vault — đọc `GOCLAW_RUNTIME_GUIDE.md` |
| Debug MOCK_LLM, port, callbacks | Trading / signal sale |
| `docs/ai-worklog/` sau phiên quan trọng | Commit `.env` / `mcp.json` có token |

### Claude Code (CLI — song song Cursor)

| Làm | Không làm |
|-----|-----------|
| Implement / refactor / test trên cùng repo | Thay Cowork verify checklist |
| Dùng `CLAUDE.md` + [claude-code/COMMANDS_MAP.md](./claude-code/COMMANDS_MAP.md) | Duplicate Hermes agents trong `src/agents/` |

**Không bắt buộc mua ClaudeKit** — map pattern SDLC trong `COMMANDS_MAP.md` là khung port tự chủ. Nếu mua: [`CLAUDEKIT_ENGINEER_PLAN.md`](./CLAUDEKIT_ENGINEER_PLAN.md).

### Claude (chat — chiến lược / brief)

| Làm | Không làm |
|-----|-----------|
| Tone 3 brand, campaign, guardrails | Merge PR, sửa Router code |

---

## 3. Luồng handoff (3 tool + founder)

```text
PROJECT_STATUS.md (SSOT)
    │
    ├─ Cowork    → verify / checklist / n8n trigger / brief
    ├─ Cursor    → implement 7D, fix bug, architecture.md
    ├─ Claude Code → parallel implement / test / review (COMMANDS_MAP)
    └─ Claude chat → brand narrative
    │
    ▼
GoClaw Cron → admin duyệt → Zernio (X/Threads) + YouTube Studio
    │
    └─ Claude Code (+ ClaudeKit optional) → repo Skill export, E2E, docs
```

**Mở session (mọi tool):** đọc `PROJECT_STATUS.md` trước.  
**Kết session:** cập nhật `PROJECT_STATUS.md` + `docs/ai-worklog/INDEX.md`.

---

## 4. Port khung (kit-style → repo) — không cần mua kit

| Pattern tham khảo | Cowork | Cursor | Claude Code |
|-------------------|--------|--------|-------------|
| planner | PLAYBOOK §5 ticket YAML | Plan trong chat + PHASE_7_PLAN | COMMANDS_MAP §2 plan |
| tester | Nhắc verify TG | `npm run test:e2e-local` | Terminal trong session |
| code-reviewer | Checklist VERIFY | Diff + architecture §14 | Review trong session |
| docs-manager | Nhắc PROJECT_STATUS | architecture.md + worklog | CLAUDE.md + worklog |

**Hermes agents** (`ContentAgent`, …) = runtime bot — **không** thay bằng doc playbook.

---

## 5. Template ticket Cowork (copy-paste)

```yaml
phase_snapshot: "7A–7C code done | verify pending | 7D next"
goal: "<vd: verify TG Alpha channel>"
owner_tool:
  strategy: Claude
  implementation: Cursor   # hoặc Claude Code
  ops_verify: Cowork
read_first:
  - PROJECT_STATUS.md
  - docs/cowork/PLAYBOOK.md
  - docs/VERIFY_LIVE_TELEGRAM.md
secrets: never in repo
```

---

## 6. Tài liệu then chốt

| File | Ai đọc |
|------|--------|
| [PROJECT_STATUS.md](../PROJECT_STATUS.md) | **Tất cả** — SSOT |
| [cowork/PLAYBOOK.md](./cowork/PLAYBOOK.md) | Cowork |
| [claude-code/COMMANDS_MAP.md](./claude-code/COMMANDS_MAP.md) | Claude Code (+ Cursor tham khảo) |
| [COWORK_ALIGNMENT_QA.md](./COWORK_ALIGNMENT_QA.md) | Cowork onboarding |
| [VERIFY_LIVE_TELEGRAM.md](./VERIFY_LIVE_TELEGRAM.md) | Cowork + Founder |
| [PHASE_7_PLAN.md](./PHASE_7_PLAN.md) | Cursor / Claude Code |
| [architecture.md](./architecture.md) | Cursor / Claude Code |
| [XAUUSD_MEDIA_OS.md](./XAUUSD_MEDIA_OS.md) | Claude strategy |
| [ai-worklog/INDEX.md](./ai-worklog/INDEX.md) | Mọi session kết thúc |
| [FOUNDERS_PLAYBOOK_APPLICATION.md](./FOUNDERS_PLAYBOOK_APPLICATION.md) | Lifecycle Idea→Scale áp dụng Media OS |

---

## 7. Agent “điều phối” trong Cursor

Rule **Media OS Coordination** (`media-os-coordination.mdc`, `alwaysApply: false`) — bật khi cần tóm phase và handoff; không thay Cowork verify tay.

---

*Cập nhật khi verify pass hoặc 7D bắt đầu.*
