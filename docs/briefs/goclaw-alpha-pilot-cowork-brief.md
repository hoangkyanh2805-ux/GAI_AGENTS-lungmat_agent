# Brief — GoClaw Alpha Pilot (handoff Claude Cowork)

> **Giao cho:** Claude Cowork (vận hành + checklist + hướng Founder trên UI).  
> **Không giao Claude Code** trừ khi cần sửa file repo (export skill, docs).  
> **Owner:** Founder · **SSOT checklist:** [`docs/GOCLAW_ALPHA_PILOT_CHECKLIST.md`](../GOCLAW_ALPHA_PILOT_CHECKLIST.md)

**Generated:** 2026-05-19  
**Handoff mới nhất:** [`goclaw-claude-cowork-handoff-2026-05-19.md`](./goclaw-claude-cowork-handoff-2026-05-19.md) — P4 Skipped, P5→P7, Linh Cẩu skill, runtime guide.  
**Quyết định đã chốt:** Stack pilot = **GoClaw + Zernio** (X + Threads + YouTube script). **P4 gpt-image-2 SKIPPED** (text-only pilot v1). lungmat-agent = nguồn persona/schema, không VPS prod.

---

## 1. Mục tiêu (done when)

Pilot **Alpha Trading Lab** trên GoClaw `agent.hoa-homes.com`:

1. Vault 38 docs uploaded + smoke test pass
2. Zernio CLI trên GoClaw + X `@AlphaTrading79` + Threads connected
3. Agent **Alpha Content Writer** + Skill (text-only — P4 ảnh skipped)
4. Cron 08:00 VN chạy daily brief
5. **1 vòng end-to-end:** draft Telegram → Founder `OK đăng` → Zernio post X+Threads (text OK; ảnh optional sau)
6. Báo cáo pass/fail + cập nhật `PROJECT_STATUS.md`

**Out of scope pilot:** Raymond, VIP10X, Facebook, lungmat VPS deploy, auto-post không duyệt.

---

## 2. Cowork làm / không làm

| Cowork LÀM | Cowork KHÔNG |
|------------|--------------|
| Dẫn Founder từng bước checklist §3 | Login thay Founder (cần Founder trên GoClaw UI) |
| Verify smoke vault, cron next run, Zernio auth | Sửa `RouterAgent`, `ContentAgent.ts` |
| Thu output Founder paste (screenshot, log) | Commit API keys / `.env` |
| Ghi blocker → handoff Cursor nếu cần file repo | Auto-approve publish production |
| Cập nhật `PROJECT_STATUS` + worklog cuối session | |

---

## 3. Checklist thực hiện (theo thứ tự)

Tham chiếu chi tiết: [`GOCLAW_ALPHA_PILOT_CHECKLIST.md`](../GOCLAW_ALPHA_PILOT_CHECKLIST.md)

| Phase | Việc | Founder cần | Pass |
|-------|------|-------------|------|
| P0 | Chuẩn bị keys: GoClaw, Zernio, OpenAI, Telegram | Login + keys | ☐ |
| P1 | Upload `docs/vault-seed/` (38 md) → GoClaw Vault | Paste từng file hoặc bulk | 4 smoke câu pass |
| P2 | Zernio: profile Alpha, connect X + Threads | zernio.com dashboard | accountId ghi chú |
| P3 | GoClaw Nodes: `@zernio/cli` + `ZERNIO_API_KEY` | UI Nodes | CLI version hiện |
| P4 | OpenAI gpt-image-2 | — | **SKIPPED** pilot v1 |
| P5 | Tạo agent + paste Skill | [`alpha-content-writer-skill.md`](../goclaw-export/alpha-content-writer-skill.md) | JSON + Compliance PASS |
| P6 | Cron 08:00 VN | Scheduled tasks UI | next run đúng |
| P7 | Test E2E | Reply `OK đăng` trên TG | Post X+Threads live (text OK) |

---

## 4. File repo Cowork đọc trước

| File | Vai trò |
|------|---------|
| `PROJECT_STATUS.md` | Trạng thái dự án |
| `docs/GOCLAW_ALPHA_PILOT_CHECKLIST.md` | Checklist 1 trang |
| `docs/goclaw-export/alpha-content-writer-skill.md` | Skill paste GoClaw |
| `docs/vault-seed/README.md` | Upload mapping + tags |
| `src/agents/ContentAgent.ts` | JSON schema gốc |
| `src/integrations/ImageClient.ts` | Prompt ảnh gpt-image-2 |

---

## 5. Báo cáo cuối session (template)

Cowork điền và paste cho Founder:

```markdown
## GoClaw Alpha Pilot — Report YYYY-MM-DD

| Hạng mục | Status | Ghi chú |
|----------|--------|---------|
| Vault 38 docs | pass/fail/partial | |
| Vault smoke (4 câu) | pass/fail | |
| Zernio CLI on GoClaw | pass/fail | |
| X + Threads connected | pass/fail | accountIds: ... |
| OpenAI gpt-image-2 | pass/fail | |
| Alpha Writer agent | pass/fail | |
| Cron 08:00 | pass/fail | |
| E2E draft→OK→post | pass/fail | link post nếu có |

**Blocker:** ...
**Next:** Raymond/VIP10X hoặc fix ...
```

---

## 6. Handoff Cursor (chỉ khi cần code repo)

```yaml
handoff_to: Cursor
from: Cowork
read_first:
  - PROJECT_STATUS.md
  - docs/briefs/goclaw-alpha-pilot-cowork-brief.md
task: "<vd: export raymond/vip10x skill, fix docs, commit goclaw-export>"
out_of_scope: ["GoClaw UI setup Founder đang làm"]
```

---

## 7. Video tham chiếu

- GoClaw + TOSE + Zernio CLI: https://www.youtube.com/watch?v=twcQq2HxBe4  
- Platform: https://goclaw.sh · Zernio: https://zernio.com/agents
