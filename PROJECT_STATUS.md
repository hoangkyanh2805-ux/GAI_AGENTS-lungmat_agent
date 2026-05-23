# PROJECT REPORT - XAUUSD AI Media OS / LungMat Agent

> Single Source of Truth cho Founder, Cowork, Cursor, Claude Code va cac AI session tiep theo.
> Moi session nen doc file nay dau tien, cap nhat cuoi session neu co thay doi trang thai.

**Last updated:** 2026-05-22 (Alpha factory M0 POC · handoff **máy mới** → [`ALPHA_FACTORY_SETUP_GUIDE.md`](docs/ALPHA_FACTORY_SETUP_GUIDE.md))
**Repo:** `GAI_AGENTS-lungmat_agent` / `lungmat-agent`
**Production runtime:** [GoClaw](https://goclaw.sh/) `agent.hoa-homes.com` — Linh Cẩu `@linhcau79_bot` · map: [`docs/GOCLAW_RUNTIME_GUIDE.md`](docs/GOCLAW_RUNTIME_GUIDE.md)
**Publish prod (pivot M0):** **n8n pipeline Alpha** (Claude → TG duyệt → Zernio HTTP → Sheet) — [`MEDIA_PIPELINE_N8N_M0.md`](docs/MEDIA_PIPELINE_N8N_M0.md) · config [`config/n8n/brands.json`](config/n8n/brands.json)  
**GoClaw prod:** chỉ **Linh Cẩu** + Coach — **freeze** Alpha Writer / Orchestrator publish
**Alpha flow:** [`docs/ALPHA_MEDIA_WORKFLOW.md`](docs/ALPHA_MEDIA_WORKFLOW.md) · **Plan TG:** [`docs/ALPHA_TELEGRAM_APPROVAL_PLAN.md`](docs/ALPHA_TELEGRAM_APPROVAL_PLAN.md)
**Cowork handoff (đang chạy):** [`docs/briefs/alpha-telegram-approval-cowork-brief.md`](docs/briefs/alpha-telegram-approval-cowork-brief.md)
**Repo role:** Source persona/schema/vault seed + local dev (`ContentAgent`, `ImageClient`) — **khong** VPS prod content cron
**Stack lungmat (dev):** Node 20 + TypeScript + Express + Anthropic + Apify + OpenAI images

---

## Tình hình tổng quan (snapshot)

| Khối | Trạng thái | Ghi chú |
|------|------------|---------|
| **lungmat-agent (repo)** | Phase 7A–7C **closed** live; 7D code có, **không** deploy prod | Dev `/content`, `/coach`, E2E mock |
| **GoClaw prod** | **Đang chạy** `agent.hoa-homes.com` | Linh Cẩu `@linhcau79_bot` + Vault |
| **Pilot Alpha media** | **A0–A2 DONE** · text publish OK | [`PILOT_ALPHA_AUDIT_STATUS.md`](docs/PILOT_ALPHA_AUDIT_STATUS.md) |
| **Telegram duyệt + đăng** | **Plan** — GoClaw ~85% sẵn có · **T1–T4 chưa** | Plan: [`ALPHA_TELEGRAM_APPROVAL_PLAN.md`](docs/ALPHA_TELEGRAM_APPROVAL_PLAN.md) · Cowork: [`alpha-telegram-approval-cowork-brief.md`](docs/briefs/alpha-telegram-approval-cowork-brief.md) |
| **Zernio MCP** | **Live** · X+Threads published (text) | accountId X `6a0c283…` · Threads `6a0c6db…` |
| **Vault P1 / A4** | **24/38**; smoke chưa pass | Song song |
| **Digitop / CSKH / SM** | Docs + skill export | Sau T3 pass |
| **GoClaw Team điều phối** | **Docs Done · ZIP ready** · Founder UI pending | Claude Code Done · [`GOCLAW_UI_FOUNDER.md`](docs/goclaw-export/skills/media-os-orchestrator/GOCLAW_UI_FOUNDER.md) · ZIP: `skills/zips/media-os-orchestrator.zip` |
| **Analytics / BI** (optional) | Skill AT lane | [`analytical-thinking-agents-brief.md`](docs/briefs/analytical-thinking-agents-brief.md) |
| **Ai làm gì tiếp** | **n8n M0 Alpha** + `services/alpha-factory` · E2E curl Zernio pending | Setup: [`ALPHA_FACTORY_SETUP_GUIDE.md`](docs/ALPHA_FACTORY_SETUP_GUIDE.md) |
| **Alpha factory POC** | Code **done** (`f43e758` on `main`) | E2E: session [`2026-05-22-alpha-factory-poc.md`](docs/ai-worklog/sessions/2026-05-22-alpha-factory-poc.md) |

**Blocker đang mở:** (1) **Telegram Channel** chưa pair Alpha Writer (T1) · (2) Skill publish tách X/Threads + `OK đăng` trên TG (T2) · (3) E2E TG+ảnh chưa pass (T3) · (4) Cron 08:00 VN (T4) · (5) Vault 24/38.

### Phase Alpha (A0–A6) — snapshot

| Phase | Mục tiêu | Status |
|-------|----------|--------|
| **A0** | Model + MCP grant + accountId + skill MCP | **Done** 2026-05-21 |
| **A1** | JSON Tele/X/Threads + TG duyệt | **Done** 2026-05-21 |
| **A2** | Publish live X + Threads | **Done** 2026-05-21 · Post `6aeecda0431cc299473c8719` |
| **A3** | Cron 08:00 VN | Not started (= **T4** trong plan TG) |
| **A4** | Vault 38/38 + smoke | Partial (24/38) |
| **A5** | Ảnh + media | Partial — runbook + `hinh/full` local; **chưa** post ảnh live |
| **A6** | Raymond / VIP / CSKH | Sau pilot Alpha |

### Telegram duyệt (T0–T4) — snapshot

| Phase | Mục tiêu | Status |
|-------|----------|--------|
| **T0** | Chốt plan + **Plan A** (ảnh TG / mediaId) | **Done** 2026-05-21 |
| **T1** | GoClaw Channel Telegram + pair Alpha Writer | Not started |
| **T2** | Skill ZIP v1.5+ (TG block, publish đúng) | Repo ready · GoClaw upload ☐ |
| **T3** | E2E điện thoại: text+ảnh → `OK đăng` → Zernio Published | Not started |
| **T4** | Cron 08:00 → draft TG | Not started |
| **T5** | Drive MCP | **Skip** nếu T3 pass Plan A |

**Khả thi (GoClaw native):** Channel + Cron + Skill + Zernio MCP — **không** cần lungmat VPS / Zernio CLI / script crop. Chi tiết §1b trong plan.

---

## 1. Executive Summary

Du an da hoan thanh vong Media OS cot loi den Phase 7C (verify live 2026-05-16):

- Market summary 6 sections — verify live.
- `/content <brand> <topic>` — verify live.
- Approval gate Telegram / X / Threads — verify live.
- Typefully handoff — verify live.
- **Infra trong repo:** `Dockerfile`, `docker-compose.yml`, `.github/workflows/ci.yml` (typecheck + e2e mock + docker build), `docs/DEPLOY.md`.
- **Phase 7D (code):** Cron `/content` 3 brand + route `POST /telegram/webhook` + `TELEGRAM_MODE=webhook` **da co trong codebase** — chua chot la deploy path chinh sau pivot GoClaw.
- `/coach` (Lung Mat, admin-only): code day du (`CoachAgent`, `personaLung.ts`, `isAdminChat`) — **chua verify live** admin + non-admin.
- GoClaw Vault Seed: **38** markdown docs trong `docs/vault-seed/` (+ README) — upload len GoClaw UI **chua xac nhan** 38/38.
- **Zernio dashboard:** X `@AlphaTrading79` + Threads `@alphatrading.lab` — **connected** 2026-05-19 (Founder screenshot).
- **Digitop BĐS + CSKH 1:1 (Telegram DM):** plan docs done — GoClaw CSKH skill + SM+GoClaw+Human M2; **chua** live CSKH bot/SM Phase 0.
- **SalesMartly Hybrid:** webhook **mounted** `POST /salesmartly/webhook`; `HOT_LEAD` → admin TG; `TRADE_INSIGHT` log only (khong auto `/content`). Mac dinh `SALESMARTLY_ENABLED=0`.

**Kien truc chot (GoClaw + Zernio — 2026-05-19):**

```text
GoClaw (runtime)                         Repo lungmat (source)
────────────────                         ─────────────────────
Linh Cẩu @linhcau79_bot (edu)              persona.ts + linh-cau-community-skill.md
Vault 38 docs (24/38 live)                 docs/vault-seed/
Cron 08:00 VN (P6 chưa bật)                alpha-content-writer-skill.md
Alpha Content Writer (P5 chưa)             ContentAgent JSON schema
Zernio MCP → X + Threads (text pilot v1)    ImageClient.ts (A5/P4 ảnh sau)
Admin TG duyệt "OK đăng" (Channel — T1 chưa)   /content + inline approve (dev legacy)
YouTube Studio (Shorts tay)                Typefully backup (Phase 7C)
```

**Pilot dang chay:** Alpha — **A0→A2 Done** · **T1–T4** Telegram duyệt (Cowork) · **A4** song song  
**SSOT verify:** [`docs/PILOT_ALPHA_AUDIT_STATUS.md`](docs/PILOT_ALPHA_AUDIT_STATUS.md)  
**Handoff Cowork (ưu tiên):** [`docs/briefs/alpha-telegram-approval-cowork-brief.md`](docs/briefs/alpha-telegram-approval-cowork-brief.md)  
**Handoff Cowork (pilot cũ):** [`docs/briefs/goclaw-claude-cowork-handoff-2026-05-19.md`](docs/briefs/goclaw-claude-cowork-handoff-2026-05-19.md) · Runbook: [`docs/GOCLAW_P4_P7_MEDIA_RUNBOOK.md`](docs/GOCLAW_P4_P7_MEDIA_RUNBOOK.md)

**Ky thuat hom nay:** `tsc --noEmit` pass local. E2E CI script: `npm run test:e2e:ci` (mock, 39 tests theo PHASE_STATUS).

---

## 2. Current Status Table

| Module / Phase | Code | Live verify | Status |
|---|---:|---:|---|
| Phase 1-5 foundation + persona Linh Cau | Done | Done | Closed |
| Phase 5B Yahoo + publish unify + SOP | Done | Mostly done | Closed (Apify 401 non-blocker) |
| Phase 6 MarketSummary 6 sections | Done | Done 2026-05-16 | Closed |
| Phase 6 Docker + CI (repo) | Done | CI chua chay tren remote neu chua push | Ready when pushed |
| Phase 7A `/content` | Done | Done 2026-05-16 | Closed |
| Phase 7B Multi-approve TG/X/Threads | Done | Done 2026-05-16 | Closed |
| Linh Cẩu GoClaw `@linhcau79_bot` | Skill in repo | Live GoClaw; skill paste **chưa xác nhận** | [`linh-cau-community-skill.md`](docs/goclaw-export/linh-cau-community-skill.md) |
| GoClaw + Zernio Alpha pilot | In progress | A0–A2 **Done**; T1–T4 TG **Plan**; P3 MCP Partial | [`PILOT_ALPHA_AUDIT_STATUS.md`](docs/PILOT_ALPHA_AUDIT_STATUS.md) · [`ALPHA_TELEGRAM_APPROVAL_PLAN.md`](docs/ALPHA_TELEGRAM_APPROVAL_PLAN.md) |
| Digitop BĐS / CSKH 1:1 TG DM | Docs + GoClaw skill export | Not live | **Planned** — [`SALESMARTLY_GOCLAW_HUMAN_TELEGRAM_DM.md`](docs/SALESMARTLY_GOCLAW_HUMAN_TELEGRAM_DM.md) |
| gpt-image-2 (ContentAgent) | Done in repo | Wired | `ImageClient.ts` + `OPENAI_API_KEY` |
| Typefully handoff (7C) | Done | Done 2026-05-16 | **Legacy backup** — Zernio prod |
| Phase 7D cron + webhook | **Done in repo** (7D-1 schedules, 7D-5 webhook route) | Not required for GoClaw-primary path | **Paused deploy** — dung neu Founder mo lai lungmat-agent VPS |
| Lung Mat `/coach` | Done | Pending retest | Needs Founder/Cowork verify |
| Phase 8 Knowledge & Memory | Plan done | Not started | Re-scope; GoClaw overlaps |
| GoClaw Vault Seed (P1) | 38 docs in repo | **24/38** uploaded; smoke chua pass | Partial — [`PILOT_ALPHA_AUDIT_STATUS.md`](docs/PILOT_ALPHA_AUDIT_STATUS.md) |
| SalesMartly Hybrid | Mounted webhook + HOT→admin TG | Chua test webhook | `scripts/test-salesmartly-webhook.sh` |
| Production Deploy (Caddy/VPS) | Docs + `infra/caddy`, compose prod | GoClaw deployed | Archive/reference for lungmat-agent |

---

## 3. What Changed Recently

### 2026-05-21 — A0–A2 DONE: Zernio MCP live, first post published

**Kết quả:**

| Việc | Status |
|------|--------|
| Zernio MCP grant → Alpha Content Writer | ✅ Done |
| accountId X `@AlphaTrading79` | `6a0c28345e333c05299b981a` |
| accountId Threads `@alphatrading.lab` | `6a0c6dbd5e333c05299f1d12` |
| Skill v1.0.6 MCP-only (bỏ CLI) | ✅ Active + Pinned |
| MCP tool thực tế hoạt động | `mcp_zernio__posts_cross_post` |
| Post X + Threads published | Post ID `6aeecda0431cc299473c8719` · 4:17 PM |

**Chốt kỹ thuật:**
- MCP transport: Streamable HTTP · 314 tools
- Publish bằng `mcp_zernio__posts_cross_post` (không phải `posts_create`)
- 409 lần 2 = Zernio/X chặn duplicate — bình thường, không phải lỗi flow
- Model agent Alpha: **vẫn cần xác nhận** đã đổi sang Claude hay chưa

**Việc còn lại (đã chuyển sang track Telegram):**
- **T1–T4:** xem [`alpha-telegram-approval-cowork-brief.md`](docs/briefs/alpha-telegram-approval-cowork-brief.md)
- **A4:** Vault 14 docs + smoke 4 câu

### 2026-05-21 — Plan Telegram duyệt + brief Cowork

**Mục tiêu:** Founder duyệt + đăng **text + ảnh** trên **Telegram** (điện thoại) → Zernio MCP — không GoClaw web Chat.

| Deliverable | Path |
|-------------|------|
| Plan + sơ đồ + gap GoClaw §1b | [`docs/ALPHA_TELEGRAM_APPROVAL_PLAN.md`](docs/ALPHA_TELEGRAM_APPROVAL_PLAN.md) |
| Brief giao Claude Cowork T1–T4 | [`docs/briefs/alpha-telegram-approval-cowork-brief.md`](docs/briefs/alpha-telegram-approval-cowork-brief.md) |
| SOP vận hành (sau T0) | [`docs/ALPHA_TELEGRAM_PUBLISH.md`](docs/ALPHA_TELEGRAM_PUBLISH.md) — blocked đến khi chốt plan |
| A5 runbook ảnh (SSOT kỹ thuật) | [`docs/A5_MEDIA_FLOWS_RUNBOOK.md`](docs/A5_MEDIA_FLOWS_RUNBOOK.md) |

**Chốt vận hành v1:** Plan **A** — ảnh gửi Telegram hoặc `mediaId` từ Zernio app; Drive = backup; **không** Drive MCP trước T3.

**Cowork:** dẫn Founder GoClaw UI Channels → MCP → skill ZIP → test E2E TG → Cron 08:00 VN.

### 2026-05-20 — Alpha media workflow SSOT (flow + phase A0–A6)

**Lý do:** Founder cần một chỗ lưu diagram luồng Tele / X / Threads / Drive / Zernio MCP vs CLI và chia phase Alpha rõ gap.

**Đã tạo / cập nhật:**

| File | Nội dung |
|------|----------|
| [`docs/ALPHA_MEDIA_WORKFLOW.md`](docs/ALPHA_MEDIA_WORKFLOW.md) | Mermaid: tổng thể, sequence, media Drive, MCP vs CLI; phase A0–A6; gap matrix |
| [`docs/PILOT_ALPHA_AUDIT_STATUS.md`](docs/PILOT_ALPHA_AUDIT_STATUS.md) | P3→Partial (MCP); P5→Partial; bảng A0–A6; tiêu chí đóng pilot text v1 |
| [`PROJECT_STATUS.md`](PROJECT_STATUS.md) | Snapshot phase Alpha; publish = Zernio MCP; blocker cập nhật |

**Vận hành chốt:** Pilot text **không cần VPS/npm** — **Zernio MCP** + đổi model khỏi Gemini 429.

### 2026-05-20 — Claude Code: GoClaw docs → AI-readable markdown

**Lý do:** Hai file HTML hướng dẫn GoClaw cần chuyển sang markdown để Claude Code / AI session sau đọc được trực tiếp không cần browser. Đồng thời hoàn thiện 3 skill file còn thiếu trong goclaw-export.

**Đã tạo:**

| Folder | File | Nội dung |
|--------|------|---------|
| `docs/goclaw-export/guide/` | 8 file + `CLAUDE.md` | Train guide: Vault/Memory/KG/Skill/Cron — từ `goclaw-train-guide.html` |
| `docs/goclaw-export/handbook/` | 14 file + `CLAUDE.md` | Quản trị 11 Menu — từ "Cẩm nang Quản trị 11 Menu trong GoClaw.html" |
| `docs/goclaw-export/` | `raymond-content-writer-skill.md` | Skill paste GoClaw — Raymond Content Writer |
| `docs/goclaw-export/` | `vip10x-content-writer-skill.md` | Skill paste GoClaw — VIP 10X Content Writer |
| `docs/goclaw-export/` | `lung-mat-coach-skill.md` | Skill paste GoClaw — Lửng Mật Admin Coach |

**Guide folder** (`docs/goclaw-export/guide/`):
- `00-quickstart.md` — 5 phút first-win + decision tree
- `01-train-agent-dashboard.md` — 5 cách train qua UI (Vault/Memory/KG/File context/Skill)
- `02-train-agent-via-claude.md` — workflow Claude Code + 5 prompt mẫu copy-paste
- `03-create-skill.md` — Path A (ZIP) + Path B (chat skill-creator); SKILL.md format
- `04-troubleshooting.md` — 13 case lỗi: Symptom → Diagnose → Fix → Prevent
- `05-glossary.md` — bảng so sánh 5 cách "đút kiến thức" + thuật ngữ
- `06-read-with-claude.md` — 4 cách dùng Claude đọc bộ tài liệu

**Handbook folder** (`docs/goclaw-export/handbook/`):
- `01-agent.md` — 18 section: model/budget, file context, skills, tools, MCP, cron, memory, vault, KG, groups
- `02-team-link.md` — Kanban, Super Team v2, Agent Link, routing rules
- `03-session.md` — context bar, reset/delete, debug strategies
- `04-channel.md` — 9 channel types + DM/Group policy
- `05-skill.md` — ZIP format, 3 tầng bắt buộc, visibility
- `06-builtin-tools.md` — 14 danh mục, TTS v3, KG extraction LLM
- `07-mcp.md` — stdio/SSE/HTTP, grants, user credentials
- `08-cron.md` — 3 loại cron, timezone, approval gate pattern
- `09-memory.md` — scope, semantic search, chunks
- `10-vault.md` — 7 DocType, 3 scope, wikilinks, Drive sync
- `11-knowledge-graph.md` — entity/relation, auto-extract, dedup
- `12-flow-conclusion.md` — flow diagram + 3 Không / 3 Có + checklist triển khai

**README.md cập nhật:** link đến cả `guide/` và `handbook/`.

**Cách dùng tiếp:** Bất kỳ Claude Code / AI session nào cần hỏi về GoClaw — đọc `docs/goclaw-export/guide/CLAUDE.md` hoặc `docs/goclaw-export/handbook/CLAUDE.md` trước.

### 2026-05-20 — Codex: GoClaw market data source policy

**Ly do:** Linh Cau tra loi sai ve nguon DXY/gia live va tu dung setup co Entry/SL/TP. Can tach ro Vault knowledge vs realtime market data.

**Da cap nhat trong repo:**

- [`docs/goclaw-export/linh-cau-community-skill.md`](docs/goclaw-export/linh-cau-community-skill.md) — them `Market data & source policy`: Vault khong phai nguon gia realtime; gia/DXY/news hien tai phai co source + timestamp; cam search snippet lam gia live; cam Entry/SL/TP/lot size.
- [`docs/goclaw-export/alpha-content-writer-skill.md`](docs/goclaw-export/alpha-content-writer-skill.md) — them buoc `Market data check` + source table cho XAUUSD/DXY/Fed/CPI/PCE/Treasury/FedWatch.
- [`docs/GOCLAW_RUNTIME_GUIDE.md`](docs/GOCLAW_RUNTIME_GUIDE.md) — them map "nap/cau hinh o dau": Vault cho evergreen knowledge, Skill/context cho persona/rules, MCP/API/Built-in Tool cho realtime FX/market data.

**Can lam tren GoClaw UI:**

1. Re-paste skill Linh Cau da cap nhat vao agent `@linhcau79_bot`.
2. Re-paste skill Alpha Content Writer da cap nhat truoc khi P5/P6.
3. Cau hinh market-data source rieng neu muon bot tra loi gia/DXY nhanh: broker/MT5 feed hoac paid market-data API/MCP co timestamp. Neu chua co feed, bot phai noi "chua verify duoc gia live".

### 2026-05-19 — Cursor: GoClaw runtime + Cowork handoff (phiên chat)

**Chốt kiến trúc:** Linh Cẩu `@linhcau79_bot` = **GoClaw prod**; repo = Skill/vault source + lungmat dev.

| Deliverable | Path |
|-------------|------|
| Runtime map (đọc trước khi sửa GoClaw) | [`docs/GOCLAW_RUNTIME_GUIDE.md`](docs/GOCLAW_RUNTIME_GUIDE.md) |
| Skill Linh Cẩu paste UI | [`docs/goclaw-export/linh-cau-community-skill.md`](docs/goclaw-export/linh-cau-community-skill.md) |
| Handoff Claude Cowork | [`docs/briefs/goclaw-claude-cowork-handoff-2026-05-19.md`](docs/briefs/goclaw-claude-cowork-handoff-2026-05-19.md) |
| Cursor MCP template | [`.cursor/mcp.json.example`](.cursor/mcp.json.example) |
| Worklog phiên | [`docs/ai-worklog/sessions/2026-05-19-goclaw-runtime-cowork-handoff.md`](docs/ai-worklog/sessions/2026-05-19-goclaw-runtime-cowork-handoff.md) |

**Quyết định:** P4 `gpt-image-2` **Skipped** — pilot v1 đăng **text-only** Zernio (`posts:create` không `--media`).

**Việc live còn lại:** Cowork dẫn Founder P5→P7 + paste Linh Cẩu skill + `accountId` — tick [`PILOT_ALPHA_AUDIT_STATUS.md`](docs/PILOT_ALPHA_AUDIT_STATUS.md).

### 2026-05-19 — Pilot audit P4–P7 (doc sync)

Audit plan hoan thanh trong repo (khong sua file plan):

| Deliverable | File |
|-------------|------|
| SSOT verify P0–P7 | [`docs/PILOT_ALPHA_AUDIT_STATUS.md`](docs/PILOT_ALPHA_AUDIT_STATUS.md) |
| Runbook P4–P7 + Vault P1 + post-P7 SM | [`docs/GOCLAW_P4_P7_MEDIA_RUNBOOK.md`](docs/GOCLAW_P4_P7_MEDIA_RUNBOOK.md) |
| Codebase audit refresh | [`docs/CODEBASE_AUDIT_DIGITOP_TELEGRAM.md`](docs/CODEBASE_AUDIT_DIGITOP_TELEGRAM.md) |
| Test webhook HOT | [`scripts/test-salesmartly-webhook.sh`](scripts/test-salesmartly-webhook.sh) |

**Ket luan audit:** P2–P3 Done; P1 Partial (24/38); P4 Skipped; P5–P7 Not started.

### 2026-05-19 — GoClaw UI audit (Cowork) — lưu ý Zernio trên UI

| Mục | Doc cũ | Thực tế UI GoClaw | Hành động |
|-----|--------|-------------------|-----------|
| Zernio install | Nodes → npm `@zernio/cli` | **Paired Devices** / **MCP Servers** — không thấy npm Nodes | Founder screenshot MCP Servers + Built-in Tools |
| P3 credential | PASS (key đã set) | Key global OK | Giữ; publish P7 cần tool/MCP Zernio hoạt động |
| Linh Cẩu | — | Agent OK · model `claude-haiku-4-5-20251001` | Paste `linh-cau-community-skill.md` |
| Zernio dashboard | — | X + Threads connected | Giữ |

**Không mâu thuẫn P3:** credential Done ≠ chắc agent gọi được `zernio posts:create` — verify khi P7.

### 2026-05-19 — Zernio Connections + Digitop/SM docs + webhook code

**Zernio (Founder dashboard — Connections):**

| Profile | Handle | Status | Ghi chú |
|---------|--------|--------|---------|
| Twitter/X | `@AlphaTrading79` | ✅ Connected 5/19/2026 | Default; Analytics off, Inbox off |
| Threads | `@alphatrading.lab` | ✅ Connected 5/19/2026 | Default |

**Tiếp theo media pilot (Founder, GoClaw UI):** ~~P4 gpt-image-2~~ **Skipped** → P5 Alpha Writer → P6 Cron → P7 `OK đăng` → Zernio **text-only**. Runbook: [`GOCLAW_P4_P7_MEDIA_RUNBOOK.md`](docs/GOCLAW_P4_P7_MEDIA_RUNBOOK.md).

**Digitop BĐS + SalesMartly (chỉ Telegram DM khách) — tài liệu SSOT:**

| Doc | Nội dung |
|-----|----------|
| [`TELEGRAM_ONLY_GUIDE.md`](docs/TELEGRAM_ONLY_GUIDE.md) | Scope chỉ TG |
| [`DIGITOP_REALESTATE_1TO1_APPLICATION.md`](docs/DIGITOP_REALESTATE_1TO1_APPLICATION.md) | Map UC BĐS → 3 lane bot |
| [`CODEBASE_AUDIT_DIGITOP_TELEGRAM.md`](docs/CODEBASE_AUDIT_DIGITOP_TELEGRAM.md) | UC chưa trong lungmat free-text |
| [`SALESMARTLY_GOCLAW_HUMAN_TELEGRAM_DM.md`](docs/SALESMARTLY_GOCLAW_HUMAN_TELEGRAM_DM.md) | **M2:** SM inbox + GoClaw CSKH + Human |
| [`SWOT_HYBRID_1TO1_SALESMARTLY_GOCLAW.md`](docs/SWOT_HYBRID_1TO1_SALESMARTLY_GOCLAW.md) | SWOT (optional SM) |
| [`goclaw-export/alpha-cskh-1to1-skill.md`](docs/goclaw-export/alpha-cskh-1to1-skill.md) | Skill paste GoClaw |

**Code SalesMartly (session nay):**

- `src/index.ts` — mount `createSalesMartlyRouter()`
- `SalesMartlyClient.notifyHumanHandler` → `ADMIN_TELEGRAM_CHAT_ID`
- `dispatchToAgent` — log only (khong auto publish content tu sales chat)
- `.env.example` — `SALESMARTLY_ENABLED`, `SALESMARTLY_WEBHOOK_SECRET`

**CSKH 1:1 chua live:** SM Phase 0 (connect bot Alpha TG) + GoClaw Alpha CSKH — sau media pilot.

### 2026-05-19 — GoClaw Alpha Pilot session (Cowork)

**Tiến độ pilot Alpha:**

| Hạng mục | Status | Ghi chú |
|----------|--------|---------|
| Vault 38 docs upload | 24/38 — đang upload thêm | Cần thêm 14 docs |
| Vault smoke (4 câu) | Chưa test | Sau khi upload đủ 38 |
| Zernio API key | ⚠️ Revoke + tạo lại nếu từng lộ | Dùng key moi tren GoClaw CLI |
| Zernio credential GoClaw | PASS | Key set; UI path = MCP/Built-in Tools (không Nodes npm) |
| X @AlphaTrading79 connected Zernio | ✅ **Done** 5/19/2026 | Dashboard Connections |
| Threads @alphatrading.lab connected Zernio | ✅ **Done** 5/19/2026 | Dashboard Connections |
| OpenAI gpt-image-2 provider | **Skipped** | Pilot v1 text-only — bật lại sau |
| Agent Alpha Content Writer | **Not started** | P5 — [`alpha-content-writer-skill.md`](docs/goclaw-export/alpha-content-writer-skill.md) |
| Cron 08:00 VN | **Not started** | P6 |
| E2E draft→OK→Zernio post | **Not started** | P7 — link post: _chua co_ |
| Zernio accountId ghi chú | **Not started** | `zernio accounts list` — blocker P7 |

**Bang P0–P7 (tom tat — chi tiet + tick Done):** [`docs/PILOT_ALPHA_AUDIT_STATUS.md`](docs/PILOT_ALPHA_AUDIT_STATUS.md)

| Phase | Status |
|-------|--------|
| P0 Keys | Not started |
| P1 Vault + smoke | Partial (24/38) |
| P2 Zernio X + Threads | **Done** |
| P3 Zernio CLI GoClaw | **Done** |
| P4 OpenAI gpt-image-2 | **Skipped** |
| P5 Alpha Content Writer | Not started |
| P6 Cron 08:00 VN | Not started |
| P7 E2E Zernio post | Not started |

**Security note:** Không paste API key vào chat. Key Zernio cũ từng lộ — nếu chưa revoke, làm trên zernio.com trước P7.

**Repo update 2026-05-19:**
- `src/integrations/ImageClient.ts` — OpenAI gpt-image-2 client mới
- `src/content/contentPack.ts` — thêm `thumbnail_image_url`, `content_image_url`
- `src/agents/ContentAgent.ts` — wire image generation (non-fatal fallback)
- `src/config/env.ts` — thêm `OPENAI_API_KEY`
- Node.js v24.15.0 cài trên máy Founder
- Git: 127 files committed + pushed lên GitHub (`41a54c5 → f01a802`)

### 2026-05-19 — GoClaw platform audit + video Genio

Nguon: [goclaw.sh](https://goclaw.sh/), [goclaw.sh/vi](https://goclaw.sh/vi/), video [twcQq2HxBe4](https://www.youtube.com/watch?v=twcQq2HxBe4).

**GoClaw co san (khong can build lai tren lungmat):**

| Capability | GoClaw | lungmat-agent |
|---|---|---|
| Telegram bot/channel | Native channel | Da verify — co the giu lam factory test |
| Vault + vector memory | Co | Phase 8 → drop |
| Cron / scheduled jobs | Co (UI Cron tab) | Phase 7D code co — khong deploy prod |
| Multi LLM (Gemini, Claude…) | 20+ providers | Anthropic only |
| Agent Teams + task board | Co | Khong co |
| Zalo / WhatsApp / Discord | Native | Khong co |
| X / Threads publish | Zernio CLI (GoClaw Nodes) | Typefully legacy (dev) |
| YouTube | Studio + pack JSON; Zernio metadata optional | — |
| Facebook | **Out of scope** | — |

**Video Mr Goon day gi (ap dung thuc te):**

1. Deploy GoClaw qua [TOSE.sh](https://tose.sh/) (~300k VND/thang host thap nhat).
2. Add Telegram channel (BotFather token) → map agent.
3. Cai **Zernio CLI** (`@zernio/cli` Nodes) + `ZERNIO_API_KEY` → post X + Threads (+ YT meta).
4. Dat **Cron** + OpenAI **gpt-image-2** thumbnail.
5. Admin duyet Telegram truoc khi Zernio publish.

**Scope hien tai:** X + Threads + YouTube — **khong** Facebook. Tool trong video co the la Genio/Zernio cung loai CLI — dung **Zernio** ([zernio.com](https://zernio.com/agents)).

**Phan biet persona:**

| Persona | Runtime hien tai | Vai tro |
|---|---|---|
| Linh Cau 🐆 | GoClaw `@linhcau79_bot` | Frontline community, Q&A + Vault |
| Lửng Mật 🦡 | lungmat `/coach` (admin DM) | Coach Media OS / verify / ops — **chua** tren GoClaw |

Neu muon Lửng tren GoClaw: upload `docs/lung-mat/SOUL.md` lam agent persona/skill — rieng agent admin, khong public channel.

**Ung dung de xuat theo phase:**

| Phase | Viec | Tool |
|---|---|---|
| **P0 pilot** | Alpha: Vault + Zernio + Skill + Cron + E2E | [`GOCLAW_ALPHA_PILOT_CHECKLIST.md`](docs/GOCLAW_ALPHA_PILOT_CHECKLIST.md) |
| P1 | Raymond + VIP10X clone Skill | GoClaw Cron 13h/19h |
| P2 | `/coach` verify lungmat | lungmat local |
| Drop | n8n content cron, lungmat VPS prod, Phase 8 pgvector, Facebook | — |

**Chi phi tham chieu (tu video + goclaw.sh):**

- GoClaw host TOSE: ~300k–700k VND/thang (config thap).
- Genio/Zernio free tier: 2 account — du Alpha X + Threads pilot.
- Zernio paid ~$18/th thang (3 brand scale).
- X API pass-through qua Zernio: ~$0.015/post; co link ~$0.20 — set spend cap.
- Typefully: legacy backup (~$19/th) — khong bat buoc pilot.

### 2026-05-19 — Status audit (codebase)

Doi chieu codebase vs report:

| Hang muc | Thuc te trong repo |
|----------|-------------------|
| Phase 7D | `src/index.ts`: cron `daily_content_*` + job `content`; `createTelegramWebhookRouter`, `TELEGRAM_MODE` webhook/longpoll |
| SalesMartly | `POST /salesmartly/webhook` mounted; `HOT_LEAD` → Telegram admin DM |
| SalesMartly | `dispatchToAgent` log only — CSKH/edu qua GoClaw+SM, khong `/content` auto |
| Coach | `CoachAgent` + `isAdminChat` — san sang verify |
| Vault seed | 38 file `.md` (khong tinh README) duoi `docs/vault-seed/` |
| Git | Nhieu path untracked — can commit de khoa CI/history |

### 2026-05-19 — SalesMartly Hybrid (truoc do)

Created/updated:

- `docs/SOP_SalesMartly_Hybrid.md`
- `src/integrations/SalesMartlyClient.ts` (gom `SalesMartlyPayload`)
- `src/routes/salesmartly.ts`
- `src/config/env.ts`: `SALESMARTLY_ENABLED`, `SALESMARTLY_WEBHOOK_SECRET`

Done (2026-05-19): mount router, `notifyHumanHandler` → admin TG.

Pending:

- SM automation → webhook URL + `SALESMARTLY_ENABLED=1`
- Test HOT_LEAD end-to-end
- SM Phase 0: connect Telegram bot Alpha only
- GoClaw Alpha CSKH skill live

### 2026-05-18 — GoClaw Pivot

GoClaw deployed tren `agent.hoa-homes.com` (Vault, Memory, Knowledge Graph, Cron/Hooks, Telegram runtime). Anh huong roadmap:

- Phase 8 pgvector/Voyage/Supabase memory — phan lon trung GoClaw.
- Phase 9 BullMQ/workers — co the trung GoClaw workers.
- Phase 10 VPS/Caddy — tham chieu; production runtime hien tai la GoClaw.
- Phase 7D **code van huu ich** cho lungmat-agent local/VPS nhung **khong** day len production lungmat-agent neu Founder chua chot.

Duong de xuat: **Path D** — `lungmat-agent` primary Media OS + GoClaw 30 ngay experiment (Lung coach / memory / Vault).

### 2026-05-18 — GoClaw Vault Seed

38 markdown docs under `docs/vault-seed/` (psychology 15, ta-foundation 6, price-action 4, candlestick 1, position-sizing 3, smc 9).

Upload: Destination **Shared**; tags theo `docs/vault-seed/README.md`.

Smoke tests sau upload: "FVG la gi?", "R-multiple tinh sao?", "Tilt la gi?", "Spring Wyckoff la gi?"

### 2026-05-16 to 2026-05-17 — Media OS Verify

Closed live: Phase 6, 7A, 7B, 7C (market summary, content, multi-approve, Typefully).

Con lai tu verify loop: `/coach` admin DM + non-admin rejection.

---

## 4. Active Workstreams

### A. Must Do Now

0. **Claude Cowork — Telegram duyệt (ưu tiên)** — [`alpha-telegram-approval-cowork-brief.md`](docs/briefs/alpha-telegram-approval-cowork-brief.md)  
   - Founder chốt **`OK plan A`** → T1 Channel TG → T3 E2E → T4 Cron  
   - SSOT plan: [`ALPHA_TELEGRAM_APPROVAL_PLAN.md`](docs/ALPHA_TELEGRAM_APPROVAL_PLAN.md)

0. **Claude Cowork — pilot cũ (tham khảo)** — [`goclaw-claude-cowork-handoff-2026-05-19.md`](docs/briefs/goclaw-claude-cowork-handoff-2026-05-19.md)

0a. **Linh Cẩu trên GoClaw**
   - Paste [`linh-cau-community-skill.md`](docs/goclaw-export/linh-cau-community-skill.md)
   - Vault 38/38 + smoke 4 câu

0b. **GoClaw Alpha — A0–A2 Done; tiếp T1–T4 Telegram**
   - **SSOT verify:** [`docs/PILOT_ALPHA_AUDIT_STATUS.md`](docs/PILOT_ALPHA_AUDIT_STATUS.md)
   - **Cowork brief:** [`docs/briefs/alpha-telegram-approval-cowork-brief.md`](docs/briefs/alpha-telegram-approval-cowork-brief.md)
   - P5/P7 text: Done · ảnh+TG: T3 · Cron: T4 (= A3)

0c. **CSKH 1:1 Telegram DM (Digitop BĐS + SM optional)** — sau media pilot
   - Plan: `docs/SALESMARTLY_GOCLAW_HUMAN_TELEGRAM_DM.md` (M2)
   - Skill: `docs/goclaw-export/alpha-cskh-1to1-skill.md`
   - Repo: `SALESMARTLY_ENABLED=1` + webhook khi SM rule HOT ready
   - Phase 0: SM connect **chỉ** Telegram bot Alpha; Founder trả tay + tag hot/warm

1. **Verify `/coach`**
   - Admin DM: `/coach verify live con buoc nao?`
   - Expected: Lung Mat voice, checklist thuc te, co the nhac `/debug_env`.
   - Non-admin: `/coach` → reject + huong dan `ADMIN_TELEGRAM_CHAT_ID`.

2. **Confirm GoClaw Vault upload**
   - Target: 38 docs (bo README neu muon).
   - 4 prompt smoke test tren bot GoClaw (`@linhcau79_bot`).
   - Cap nhat pass/fail vao report.

3. **Commit batch Media OS** (neu Founder dong y)
   - Push de `.github/workflows/ci.yml` chay tren GitHub.
   - Tranh commit `.env`, secrets, `botlungmat/result.json`.

4. **SalesMartly** — sau P7 media pass
   - Code: webhook mounted + HOT → admin TG (`scripts/test-salesmartly-webhook.sh`)
   - Chua: `SALESMARTLY_ENABLED=1`, SM Phase 0 connect bot Alpha TG
   - Khong block P4–P7

### B. Should Do Next

1. **ClaudeKit Engineer (optional)** — đọc [`docs/CLAUDEKIT_ENGINEER_PLAN.md`](docs/CLAUDEKIT_ENGINEER_PLAN.md); Phase 0 thử Claude Code trước khi trả $99.
2. **Roadmap sau GoClaw pivot**
   - Danh dau Phase 8/9/10 + 7D deploy trong `docs/IMPLEMENTATION_ROADMAP.md` la reference/re-scope.
   - `docs/PHASE_STATUS.md` va `docs/NEXT_STEPS.md` **lac phien ban** (van ghi Phase 6 chua bat dau) — nen sync hoac tro PROJECT_STATUS lam SSOT.

2. **Content publishing**
   - Raymond DWH v2: publish-ready (`docs/content-drafts/dwh-pack-raymond.md`).
   - Alpha DWH: can fix (`dwh-pack-alpha.md`).
   - VIP10X: rewrite hoac skip topic hien tai.

3. **Apify 401** — non-blocker; kiem token + credits.

### C. Later

1. Raymond + VIP10X Skill export → GoClaw agents + Cron.
2. SalesMartly wire-up (neu urgent) — `SALESMARTLY_ENABLED=0` default.
3. Lửng Mật agent tren GoClaw (Skill tu `personaLung.ts`).
4. Bridge lungmat dev test ↔ GoClaw Skill sync khi can.

---

## 5. Decisions Locked

- Brands: Alpha / Raymond / VIP 10X.
- **Production publish:** GoClaw + **Zernio** (X + Threads + YouTube meta). **Khong** Facebook.
- **Admin duyet** truoc Zernio auto-post.
- lungmat `/content` + Typefully = **legacy dev/backup** (Phase 7C verified).
- Repo = persona/schema/vault source; export → GoClaw Skill.
- `/coach` = admin-only Lung Mat (lungmat); co the clone len GoClaw sau.
- gpt-image-2 cho thumbnail + post image — **deferred** (P4 Skipped; pilot v1 text-only).
- Khong n8n content cron trong pilot.
- `MOCK_LLM=1` = dev/test only.
- Raw Telegram sales chat **khong** upload Shared Vault.
- Sales chat: anonymize + distill truoc upload.
- Khong commit `.env`, `botlungmat/result.json`, media exports, API keys, chat IDs, cert keys.

---

## 6. Guardrails

### Sales / Compliance

- Khong lo customer identity; khong ep nap tien; khong hua loi.
- Khong "safe", "sure win", "bao go".
- Khong recommend lot size cu the khi chua biet von/rui ro.
- Uu tien giao duc, risk-first, position sizing.

### GoClaw Vault Scope

- Foundation trading: **Shared**.
- Sales/case rieng: **Team** / **Agent**, khong **Shared**.

### Codebase

- Khong refactor Router/Safety/Supervisor khong thong bao.
- Khong deploy lungmat-agent Phase 7D len VPS production neu Founder chua chot sau GoClaw pivot.
- Canonical path: `G:\Other computers\My Computer\Project\GAI_AGENTS-lungmat_agent`.

---

## 7. Key Files

| File | Purpose |
|---|---|
| `PROJECT_STATUS.md` | **SSOT** trang thai du an (file nay) — cap nhat sau moi session |
| `docs/PILOT_ALPHA_AUDIT_STATUS.md` | **SSOT verify** P0–P7 Done/Not started + link post P7 |
| `docs/PHASE_STATUS.md` | Phase-level (can sync — hien co dong cu) |
| `docs/architecture.md` | Architecture — doc truoc khi sua code |
| `docs/PHASE_7_PLAN.md` | Phase 7 plan |
| `docs/VERIFY_LIVE_TELEGRAM.md` | Live verify checklist |
| `docs/PHASE_8_PLAN.md` | Phase 8 K&M — reference sau GoClaw |
| `docs/IMPLEMENTATION_ROADMAP.md` | Long roadmap — can pivot note |
| `docs/vault-seed/README.md` | GoClaw seed index + upload mapping |
| `docs/SOP_SalesMartly_Hybrid.md` | SalesMartly workflow |
| `docs/lung-mat/SOUL.md` | Lung Mat persona |
| `docs/DEPLOY.md` / `docs/PRODUCTION_DEPLOY.md` | Deploy lungmat-agent / reference |
| `src/index.ts` | Bootstrap, cron 7D-1, webhook mount 7D-5 |
| `src/routes/salesmartly.ts` | Webhook route (mounted in `index.ts`) |
| `src/integrations/SalesMartlyClient.ts` | Client + `SalesMartlyPayload` |
| `src/agents/CoachAgent.ts` | `/coach` admin coach |
| `src/llm/personaLung.ts` | Lung Mat system prompt |
| `IDENTITY.md` | Linh Cau vs Lửng Mật roles |
| `docs/GOCLAW_ALPHA_PILOT_CHECKLIST.md` | Pilot Alpha 1 trang |
| `docs/SOP_GoClaw_Zernio_PUBLISH.md` | SOP publish GoClaw + Zernio |
| `docs/briefs/goclaw-claude-cowork-handoff-2026-05-19.md` | **Handoff Cowork hiện tại** (P5→P7) |
| `docs/briefs/goclaw-alpha-pilot-cowork-brief.md` | Handoff Cowork (bản cũ, tham chiếu) |
| `docs/goclaw-export/alpha-content-writer-skill.md` | Skill paste GoClaw |
| `docs/CLAUDEKIT_ENGINEER_PLAN.md` | EngineerKit $99 — dev workflow |
| `docs/AGENT_ROSTER_AUDIT.md` | Agent gap audit |
| `docs/DIGITOP_AGENCY_APPLICATION.md` | Digitop 4-layer agency → Media OS map |
| `docs/DIGITOP_REALESTATE_1TO1_APPLICATION.md` | TG 1:1 CSKH (Lane B) vs Linh Cẩu — Digitop BĐS UC-01 |
| `docs/SWOT_HYBRID_1TO1_SALESMARTLY_GOCLAW.md` | SWOT + plan: SalesMartly CRM + GoClaw AI + Human |
| `docs/CODEBASE_AUDIT_DIGITOP_TELEGRAM.md` | Audit: Digitop UC vs code thực tế (TG only) |
| `docs/TELEGRAM_ONLY_GUIDE.md` | **SSOT scope — chỉ Telegram** (đọc trước SWOT/SM) |
| `docs/SALESMARTLY_GOCLAW_HUMAN_TELEGRAM_DM.md` | SM + GoClaw + Human — chỉ TG DM (5 agent phân tích) |
| `docs/GOCLAW_RUNTIME_GUIDE.md` | **Map** Linh Cẩu + Alpha + upstream goclaw/docs/MCP |
| `docs/goclaw-export/guide/CLAUDE.md` | **Navigation** Cẩm nang train agent (8 file AI-readable) |
| `docs/goclaw-export/handbook/CLAUDE.md` | **Navigation** Cẩm nang quản trị 11 Menu (14 file AI-readable) |
| `docs/goclaw-export/linh-cau-community-skill.md` | Skill Linh Cẩu paste GoClaw |
| `.cursor/mcp.json.example` | Template `goclaw-mcp` cho Cursor |
| `docs/ALPHA_TELEGRAM_APPROVAL_PLAN.md` | Plan + gap GoClaw TG duyệt |
| `docs/briefs/alpha-telegram-approval-cowork-brief.md` | **Cowork handoff T1–T4** |
| `docs/GOCLAW_P4_P7_MEDIA_RUNBOOK.md` | Runbook P4–P7 media |
| `scripts/test-salesmartly-webhook.sh` | Test HOT_LEAD → admin TG |
| `docs/XAUUSD_MEDIA_OS.md` | Constitution §2.5 GoClaw+Zernio |
| `docs/MEDIA_OS_COORDINATION.md` | Cowork · Cursor · Claude Code · GoClaw |
| `src/integrations/ImageClient.ts` | gpt-image-2 |
| `docs/SOP_TYPEFULLY_HANDOFF.md` | Legacy Typefully (backup) |
| `docs/ALPHA_FACTORY_SETUP_GUIDE.md` | **M0 factory** — đọc đầu tiên trên máy mới |
| `docs/ALPHA_FACTORY_NOTION_IMPORT.md` | Import Notion (tuỳ chọn) |
| `docs/ai-worklog/sessions/2026-05-22-alpha-factory-poc.md` | POC + blocker Zernio HTTP |

---

## 7b. Máy mới — Alpha factory M0 (đọc theo thứ tự)

| # | Path |
|---|------|
| 1 | [`docs/ALPHA_FACTORY_SETUP_GUIDE.md`](docs/ALPHA_FACTORY_SETUP_GUIDE.md) |
| 2 | [`docs/ai-worklog/INDEX.md`](docs/ai-worklog/INDEX.md) → [`sessions/2026-05-22-alpha-factory-poc.md`](docs/ai-worklog/sessions/2026-05-22-alpha-factory-poc.md) |
| 3 | `PROJECT_STATUS.md` (file này) + [`docs/architecture.md`](docs/architecture.md) |
| 4 | [`docs/ALPHA_FACTORY_NOTION_IMPORT.md`](docs/ALPHA_FACTORY_NOTION_IMPORT.md) (tuỳ chọn) |

**Copy-paste cho Cursor / Claude:**

```text
git pull origin main
rồi đọc docs/ALPHA_FACTORY_SETUP_GUIDE.md, session docs/ai-worklog/sessions/2026-05-22-alpha-factory-poc.md, và docs/architecture.md trước khi sửa code.
Sau pull: cd services/alpha-factory → copy .env.example .env → điền key (không có trong repo).
```

---

## 8. Next Session Prompt

```text
Doc PROJECT_STATUS.md truoc.
Cowork (uu tien): docs/briefs/alpha-telegram-approval-cowork-brief.md
Plan: docs/ALPHA_TELEGRAM_APPROVAL_PLAN.md
Tick: docs/PILOT_ALPHA_AUDIT_STATUS.md

Uu tien Founder/Cowork:
1. OK plan A (anh Telegram hoac mediaId Zernio app)
2. T1: GoClaw Channels → Telegram → pair Alpha Content Writer
3. T2: Upload skill ZIP v1.5+ → Rescan
4. T3: E2E tren dien thoai — OK dang → Zernio Published (co anh)
5. T4: Cron 08:00 Asia/Ho_Chi_Minh → draft TG
6. Song song: Vault 38/38 + smoke 4 cau
```

---

## 9. Done Definition For Current Loop

Loop dong khi (bang chung trong [`PILOT_ALPHA_AUDIT_STATUS.md`](docs/PILOT_ALPHA_AUDIT_STATUS.md)):

- [ ] P1: Vault 38/38 + smoke 4 cau (FVG, R-multiple, Tilt, Spring)
- [x] P4: **Skipped** (gpt-image-2 sau)
- [x] P5 / A1: draft JSON + Compliance (web/TG)
- [x] P7 / A2: Post live X + Threads text — Post `6aeecda0431cc299473c8719`
- [x] Zernio accountId
- [ ] **T1:** Telegram Channel pair Alpha Writer
- [ ] **T3:** E2E TG text+anh → Zernio Published
- [ ] **T4 / P6 / A3:** Cron 08:00 VN → draft TG
- [ ] Pilot text v1 closed: 3 ngay T4 on dinh
- `/coach` pass admin + non-admin (lungmat — song song, khong block media)
- Raymond + VIP10X Skill ready (sau Alpha pilot closed)
