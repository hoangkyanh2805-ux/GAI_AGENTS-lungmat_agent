# Brief — Media OS Orchestrator Team (handoff Claude Code)

> **Giao cho:** Claude Code (repo, skill ZIP, docs, routing rules).  
> **Founder / Cowork:** chỉ bước GoClaw UI — file [`GOCLAW_UI_FOUNDER.md`](../goclaw-export/skills/media-os-orchestrator/GOCLAW_UI_FOUNDER.md).  
> **SSOT thiết kế:** [`goclaw-media-os-orchestrator-team-brief.md`](./goclaw-media-os-orchestrator-team-brief.md)  
> **Handbook:** [`handbook/02-team-link.md`](../goclaw-export/handbook/02-team-link.md)

**Generated:** 2026-05-21

---

## 1. Mục tiêu (done when)

GoClaw **Team Router** điều phối agent có sẵn — Founder không mở từng agent thủ công.

| # | Deliverable | Owner |
|---|-------------|-------|
| 1 | Skill `media-os-orchestrator` hoàn chỉnh trong repo | **Claude Code** |
| 2 | ZIP upload: `skills/zips/media-os-orchestrator.zip` | **Claude Code** |
| 3 | `build-zips.ps1` + `goclaw-export/README.md` cập nhật | **Claude Code** |
| 4 | Doc Founder UI + checklist test | **Claude Code** |
| 5 | `PROJECT_STATUS` + `AGENT_ROSTER_AUDIT` + worklog | **Claude Code** |
| 6 | Paste ZIP + Create Team trên GoClaw | **Founder** |
| 7 | Test route 2 intent + screenshot Kanban | **Founder** |

**Out of scope Claude Code:** login GoClaw, tạo bot BotFather, commit secrets.

---

## 2. Claude Code làm / không làm

| Làm | Không làm |
|-----|-----------|
| Hoàn thiện `skills/media-os-orchestrator/SKILL.md` | Deploy GoClaw server |
| Chạy `build-zips.ps1` (thêm skill vào list) | Sửa `RouterAgent` / `SupervisorAgent` lungmat trừ khi task yêu cầu |
| Routing table + optional `team-routing-rules.yaml` | Pair Telegram (Founder T1 — giữ Alpha pilot song song) |
| Cross-link docs | Tạo agent trùng tên trên UI |
| `npx tsc --noEmit` nếu chạm `src/` | Commit `.env` |

---

## 3. File đọc trước (thứ tự)

1. [`goclaw-media-os-orchestrator-team-brief.md`](./goclaw-media-os-orchestrator-team-brief.md)
2. [`handbook/02-team-link.md`](../goclaw-export/handbook/02-team-link.md) §2.1–2.11
3. [`GOCLAW_RUNTIME_GUIDE.md`](../GOCLAW_RUNTIME_GUIDE.md)
4. [`skills/alpha-content-writer/SKILL.md`](../goclaw-export/skills/alpha-content-writer/SKILL.md) — style tham chiếu
5. [`PILOT_ALPHA_AUDIT_STATUS.md`](../PILOT_ALPHA_AUDIT_STATUS.md)

---

## 4. Task list (Claude Code)

### T1 — Skill package

- [ ] Đảm bảo `docs/goclaw-export/skills/media-os-orchestrator/SKILL.md` (routing đủ 4 worker + fallback)
- [ ] Thêm `team-routing-rules.yaml` (mẫu handbook §2.11 — tên agent khớp **tên trên GoClaw UI**)
- [ ] `GOCLAW_UI_FOUNDER.md` — checklist Founder (đã có skeleton, bổ sung nếu thiếu)

### T2 — Build ZIP

- [ ] Thêm `media-os-orchestrator` vào `docs/goclaw-export/skills/build-zips.ps1`
- [ ] Chạy: `cd docs/goclaw-export/skills && pwsh build-zips.ps1`
- [ ] Verify: `zips/media-os-orchestrator.zip` tồn tại, mở được, có `SKILL.md`

### T3 — Docs sync

- [ ] `docs/goclaw-export/README.md` — dòng Media OS Orchestrator
- [ ] `docs/AGENT_ROSTER_AUDIT.md` — P0 orchestrator (đã có — verify)
- [ ] `docs/GOCLAW_RUNTIME_GUIDE.md` — bảng 3 agent + orchestrator
- [ ] `docs/claude-code/COMMANDS_MAP.md` — link brief này
- [ ] `docs/ai-worklog/INDEX.md` — session entry
- [ ] `PROJECT_STATUS.md` — trạng thái Team orchestrator

### T4 — Optional repo

- [ ] `docs/goclaw-export/media-os-orchestrator-skill.md` → 3 dòng redirect tới `skills/media-os-orchestrator/`
- [ ] Không đổi `src/SupervisorAgent.ts` trừ khi Founder yêu cầu mirror routing trong lungmat dev

---

## 5. Routing rules YAML (mẫu — Claude Code điền tên agent đúng UI)

```yaml
# team-routing-rules.yaml — paste tham khảo GoClaw Team Router settings
# Đổi target_agent cho khớp TÊN AGENT trên GoClaw (case-sensitive)

rules:
  - name: Media draft publish
    condition: keyword_match(["viết bài", "draft", "XAUUSD", "Zernio", "đăng", "Threads", "mediaId", "OK đăng"])
    target_agent: Alpha Content Writer
    priority: 1

  - name: Edu vault
    condition: keyword_match(["FVG", "vault", "học", "Wyckoff", "R-multiple", "giải thích"])
    target_agent: Linh Cẩu
    priority: 2

  - name: Sales CSKH
    condition: keyword_match(["giá", "mua", "VIP", "báo giá", "chốt", "sales"])
    target_agent: Alpha CSKH
    priority: 3

  - name: Fallback
    condition: always
    target_agent: Alpha Content Writer
    priority: 99

fallback_agent: Alpha Content Writer
```

Ghi chú trong PR/commit: Founder đổi tên nếu UI khác (vd. `Linh Cau` vs `Linh Cẩu`).

---

## 6. Founder checklist (Claude Code giao kèm ZIP)

Gửi Founder file: [`GOCLAW_UI_FOUNDER.md`](../goclaw-export/skills/media-os-orchestrator/GOCLAW_UI_FOUNDER.md)

Pass khi:

- Team `Media OS` Router + 2 members
- Chat test 2 câu → đúng worker trên Kanban

---

## 7. Báo cáo cuối session (Claude Code điền)

```markdown
## Media OS Orchestrator — Claude Code Report YYYY-MM-DD

| Task | Status |
|------|--------|
| SKILL.md + routing | |
| media-os-orchestrator.zip | |
| build-zips.ps1 | |
| Docs sync | |
| tsc (if touched src) | |

ZIP path: docs/goclaw-export/skills/zips/media-os-orchestrator.zip
Founder UI doc: docs/goclaw-export/skills/media-os-orchestrator/GOCLAW_UI_FOUNDER.md
Blockers:
```

---

## 8. Prompt mở session Claude Code (copy)

```text
Đọc và thực hiện:
docs/briefs/goclaw-media-os-orchestrator-claude-code-brief.md

Mục tiêu: GoClaw Team Router — skill media-os-orchestrator + ZIP + docs sync.
Không sửa lungmat Router/Supervisor trừ khi được yêu cầu.
Không login GoClaw UI.

Khi xong: báo đường dẫn ZIP + checklist Founder GOCLAW_UI_FOUNDER.md.
Cập nhật PROJECT_STATUS và docs/ai-worklog/INDEX.md.
```

---

*Cowork tiếp: hỗ trợ Founder bước UI sau khi Claude Code giao ZIP.*
