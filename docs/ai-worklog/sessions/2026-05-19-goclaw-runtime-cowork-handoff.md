# Session — GoClaw runtime map + P4 skip + Claude Cowork handoff

**Date:** 2026-05-19 · **Agent:** Cursor  
**Owner tiếp:** Claude Cowork + Founder (GoClaw UI)

---

## Mục tiêu phiên

Đồng bộ dự án với stack thật: **Linh Cẩu = GoClaw prod** (`@linhcau79_bot`), pilot Alpha qua Zernio; giao việc Cowork; bỏ P4 ảnh pilot v1.

---

## Đã làm (repo)

### Audit & SSOT trạng thái

| File | Thay đổi |
|------|----------|
| [`PILOT_ALPHA_AUDIT_STATUS.md`](../PILOT_ALPHA_AUDIT_STATUS.md) | Ma trận P0–P7; P4 **Skipped**; tiêu chí đóng pilot text-only |
| [`PROJECT_STATUS.md`](../../PROJECT_STATUS.md) | Bỏ mâu thuẫn Active/Not started; bảng P0–P7; handoff Cowork |
| [`CODEBASE_AUDIT_DIGITOP_TELEGRAM.md`](../CODEBASE_AUDIT_DIGITOP_TELEGRAM.md) | SM webhook mounted + HOT→admin TG |
| [`GOCLAW_P4_P7_MEDIA_RUNBOOK.md`](../GOCLAW_P4_P7_MEDIA_RUNBOOK.md) | Đường nhanh P5→P7; P4 skipped; Zernio không `--media` |
| [`GOCLAW_ALPHA_PILOT_CHECKLIST.md`](../GOCLAW_ALPHA_PILOT_CHECKLIST.md) | P4 skipped; trỏ audit SSOT |

### GoClaw runtime (upstream → dự án)

| File | Thay đổi |
|------|----------|
| [`GOCLAW_RUNTIME_GUIDE.md`](../GOCLAW_RUNTIME_GUIDE.md) | **Mới** — map 3 agent, Vault, Telegram, Cron, link docs.goclaw.sh |
| [`goclaw-export/linh-cau-community-skill.md`](../goclaw-export/linh-cau-community-skill.md) | **Mới** — skill Linh Cẩu edu (từ `persona.ts` + IDENTITY) |
| [`goclaw-export/README.md`](../goclaw-export/README.md) | Thêm Linh Cẩu + runtime guide |
| [`.cursor/mcp.json.example`](../../.cursor/mcp.json.example) | Template `goclaw-mcp` → `agent.hoa-homes.com` |
| [`.cursor/rules/goclaw-runtime.mdc`](../../.cursor/rules/goclaw-runtime.mdc) | Rule Cursor khi sửa GoClaw |
| [`architecture.md`](../architecture.md) | Dòng GoClaw runtime map |
| [`TELEGRAM_ONLY_GUIDE.md`](../TELEGRAM_ONLY_GUIDE.md) | §5 Linh Cẩu + runtime guide; SM mounted |
| [`MEDIA_OS_COORDINATION.md`](../MEDIA_OS_COORDINATION.md) | GoClaw runtime row; Cursor + MCP |

### Handoff Claude Cowork

| File | Thay đổi |
|------|----------|
| [`briefs/goclaw-claude-cowork-handoff-2026-05-19.md`](../briefs/goclaw-claude-cowork-handoff-2026-05-19.md) | **Mới** — brief + copy-paste mở session |
| [`briefs/goclaw-alpha-pilot-cowork-brief.md`](../briefs/goclaw-alpha-pilot-cowork-brief.md) | Trỏ brief mới; P4 skipped |
| [`cowork/PLAYBOOK.md`](../cowork/PLAYBOOK.md) | Quick link brief 2026-05-19 |

### Khác (phiên trước trong cùng arc)

- [`scripts/test-salesmartly-webhook.sh`](../../scripts/test-salesmartly-webhook.sh)
- Rà soát [nextlevelbuilder](https://github.com/nextlevelbuilder) — **goclaw** + **goclaw-docs** + **goclaw-mcp** phù hợp nhất

---

## Trạng thái pilot (không đổi live)

| Phase | Status |
|-------|--------|
| P1 Vault | Partial 24/38 |
| P2–P3 Zernio | Done (UI: cần xác nhận Zernio qua MCP nếu không thấy Nodes npm) |
| P4 ảnh | **Skipped** |
| P5–P7 | Not started — **Cowork + Founder** |

---

## Founder / Cowork — việc tiếp

1. Mở Cowork với prompt trong [`goclaw-claude-cowork-handoff-2026-05-19.md`](../briefs/goclaw-claude-cowork-handoff-2026-05-19.md)
2. Paste `linh-cau-community-skill.md` lên agent Linh Cẩu GoClaw
3. `zernio accounts list` → accountId
4. P5 → P6 → P7 theo runbook
5. Tick [`PILOT_ALPHA_AUDIT_STATUS.md`](../PILOT_ALPHA_AUDIT_STATUS.md)

---

## Blocker ghi nhận (Cowork UI audit)

GoClaw UI hiện tại: tab **Nodes** = Paired Devices (không phải npm `@zernio/cli`). Cần Founder screenshot **MCP Servers** + **Built-in Tools** để xác nhận Zernio trước P7.

---

## Không làm trong phiên

- Không verify P5–P7 trên GoClaw UI (Founder)
- Không commit `.env` / token MCP
- Không sửa plan file Cursor (`.cursor/plans/`)
