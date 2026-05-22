# Pilot Alpha — Audit status (SSOT verify)

> **Mục đích:** Một bảng trạng thái duy nhất — tránh nhầm doc "Active" với đã hoàn thành.  
> **Cập nhật:** 2026-05-22 (accountId corrected after Zernio audit · model → Claude Sonnet 4.5 · skill v1.5.0 MCP-only)  
> **Flow / diagram:** [`ALPHA_MEDIA_WORKFLOW.md`](./ALPHA_MEDIA_WORKFLOW.md)  
> **Runbook:** [`GOCLAW_P4_P7_MEDIA_RUNBOOK.md`](./GOCLAW_P4_P7_MEDIA_RUNBOOK.md) · **Runtime:** [`GOCLAW_RUNTIME_GUIDE.md`](./GOCLAW_RUNTIME_GUIDE.md)  
> **Cowork handoff:** [`briefs/goclaw-claude-cowork-handoff-2026-05-19.md`](./briefs/goclaw-claude-cowork-handoff-2026-05-19.md)  
> **Worklog:** [`ai-worklog/sessions/2026-05-19-goclaw-runtime-cowork-handoff.md`](./ai-worklog/sessions/2026-05-19-goclaw-runtime-cowork-handoff.md)

**Quy ước trạng thái:**

| Status | Nghĩa |
|--------|--------|
| **Done** | Có bằng chứng (screenshot, link, log) |
| **Skipped** | Founder bỏ qua phase (ghi lý do) |
| **Not started** | Chưa làm trên GoClaw / chưa verify |
| **Partial** | Đang dở |
| **Repo only** | Có trong git, chưa live GoClaw |

---

## Ma trận P0–P7 (media pilot)

| Phase | Mô tả | Status | Bằng chứng / ghi chú | Owner |
|-------|--------|--------|----------------------|-------|
| **P0** | Keys GoClaw, Zernio, OpenAI, TG admin | Not started | Checklist P0 toàn ☐ | Founder |
| **P1** | Vault 38 docs + smoke 4 câu | Partial | 24/38 upload; smoke chưa pass | Founder |
| **P2** | Zernio X + Threads dashboard | **Done** | `@AlphaTrading79`, `@alphatrading.lab` 5/19/2026 | Founder |
| **P3** | Zernio trên GoClaw | **Partial** | **MCP** Enabled (`mcp.zernio.com`); **CLI** npm fail — pilot dùng MCP; accountId confirmed 2026-05-21 | Founder |
| **P4** | OpenAI `gpt-image-2` GoClaw | **Skipped** | Founder bỏ qua pilot v1 — đăng text-only; bật lại sau (→ **A5**) | Founder |
| **P5** | Alpha Content Writer + Skill | **Done** | Skill v1.0.6 MCP-only active; JSON + MCP publish verified 2026-05-21 | Founder |
| **P6** | Cron 08:00 `Asia/Ho_Chi_Minh` | Not started | — | Founder |
| **P7** | E2E draft → OK → Zernio → X+Threads | **Done** | Post ID `6aeecda0431cc299473c8719` · Twitter + Threads published 2026-05-21 4:17 PM | Founder |

### Zernio accountId ✅ corrected 2026-05-22

| Platform | Handle | accountId |
|----------|--------|-----------|
| X | `@AlphaTrading79` | `6a0c6dbd5e333c05299f1d12` |
| Threads | `@alphatrading.lab` | `6a0c28345e333c05299b981a` |

Đã sửa do audit Zernio phát hiện accountId bị đảo ngược trong skill cũ. Đã ghi vào Skill `alpha-content-writer` v1.5.0 và `media-os-orchestrator`.

---

## Phase Alpha A0–A6 (ưu tiên vận hành)

> Chi tiết flow mermaid: [`ALPHA_MEDIA_WORKFLOW.md`](./ALPHA_MEDIA_WORKFLOW.md)

| Phase | Mục tiêu | Status | Ghi chú |
|-------|----------|--------|---------|
| **A0** | Unblock: model (≠ Gemini 429), MCP grant, accountId, skill → MCP not CLI | **Done** | MCP granted; accountIds confirmed; skill v1.0.6; tool = `mcp_zernio__posts_cross_post` |
| **A1** | JSON Tele + X + Threads; admin TG duyệt; compliance | **Done** | Content pack verified; MCP publish confirmed |
| **A2** | E2E publish X + Threads (web hoặc MCP) | **Done** | Post `6aeecda0431cc299473c8719` · 2026-05-21 4:17 PM |
| **A3** | Cron 08:00 `Asia/Ho_Chi_Minh` | **Not started** | = P6 |
| **A4** | Vault 38/38 + smoke 4 câu | **Partial** | = P1 (24/38) |
| **A5** | Drive folder + ảnh P4 + YT edit | **Partial** | Runbook `A5_MEDIA_FLOWS_RUNBOOK.md` + **Tiêu chuẩn ảnh + đặt tên** SSOT · Skill v1.5.0 · Drive pilot linked · F1/F2/F3 chờ thực thi |
| **A6** | Raymond / VIP / CSKH / SM | **Not started** | Sau pilot Alpha closed |

**Phase đang làm:** **T1** Telegram Channel (+ T1b agent config) → T2 skill → T3 E2E  
**A0–A2 closed 2026-05-21**

### Telegram duyệt + đăng (plan — chưa triển khai)

| Task | Status | Doc |
|------|--------|-----|
| Sơ đồ + plan duyệt TG | **Plan** | [`ALPHA_TELEGRAM_APPROVAL_PLAN.md`](./ALPHA_TELEGRAM_APPROVAL_PLAN.md) §1b GoClaw feasibility **~85%** |
| Founder chốt T0 — **Plan A** | **Done** 2026-05-21 | TG photo / mediaId · no Drive MCP · no exec |
| Channel Telegram Alpha | Not started | Plan T1 — **không** tạo agent mới, chỉ pair Channel |
| Agent config T1b (Edit có sẵn) | Not started | Sonnet + MCP + Messaging; exec OFF |
| E2E TG text+ảnh→Zernio | Not started | Plan T3 |
| SOP vận hành | Blocked | [`ALPHA_TELEGRAM_PUBLISH.md`](./ALPHA_TELEGRAM_PUBLISH.md) sau T0 |

### A5 sub-tasks

| Task | Status | Ghi chú |
|------|--------|---------|
| Runbook `A5_MEDIA_FLOWS_RUNBOOK.md` | **Done** | F1/F2/F3 + Tiêu chuẩn ảnh/đặt tên + Drive pilot folder |
| Skill v1.1.0 (`image_prompts` + F3 Telegram trigger) | **Done** | ZIP rebuilt `alpha-content-writer.zip` |
| F1: 1 post live có ảnh | Not started | Option A (Zernio manual upload) → dùng ngay |
| F2: 1 post Gemini gen ảnh | Not started | Sinh prompts → Founder gen → upload Zernio |
| F3: Telegram `/publish_video` → post live | Not started | Cần TG bot connect GoClaw |
| Drive folder `Alpha_Media/YYYY-Wxx/` + pilot `00_inbox`/`01_ready_jpg` | Partial | Local `hinh/` prep **Done** (`alpha-media-prep.ps1`, 12 ảnh) — Founder kéo `01_ready_jpg` lên [Drive pilot](https://drive.google.com/drive/folders/1IW_UN4hnezRWvF3RSNMmaUXcf9pdzwbv) |

### P7 evidence (điền khi pass)

| Field | Giá trị |
|-------|---------|
| Ngày E2E pass | 2026-05-21 |
| URL post X | View on twitter (Post ID: 6aeecda0431cc299473c8719) |
| Threads verified | ✅ published 4:17:29 PM |
| Có ảnh kèm post | ☐ (optional — pilot v1 text-only OK) |

---

## Track song song (không thuộc pilot media Done)

### Digitop BĐS / CSKH 1:1 (Telegram DM)

| Hạng mục | Status | Doc |
|----------|--------|-----|
| Plan + skill export | Repo only | [`DIGITOP_REALESTATE_1TO1_APPLICATION.md`](./DIGITOP_REALESTATE_1TO1_APPLICATION.md) |
| Alpha CSKH live GoClaw | Not started | [`alpha-cskh-1to1-skill.md`](./goclaw-export/alpha-cskh-1to1-skill.md) |
| **Bắt đầu sau** | — | P7 media pass |

### SalesMartly + GoClaw + Human (TG DM only)

| Hạng mục | Status | Ghi chú |
|----------|--------|---------|
| Plan M2 | Done (doc) | [`SALESMARTLY_GOCLAW_HUMAN_TELEGRAM_DM.md`](./SALESMARTLY_GOCLAW_HUMAN_TELEGRAM_DM.md) |
| Webhook code | Repo only | `POST /salesmartly/webhook` mounted |
| HOT → admin TG | Repo only | Chưa test — [`scripts/test-salesmartly-webhook.sh`](../scripts/test-salesmartly-webhook.sh) |
| SM connect TG | Not started | Phase 0 — sau P7 |
| `SALESMARTLY_ENABLED=1` | Not started | Sau test webhook |

---

## Repo / code (audit 2026-05-19)

| Hạng mục | Status |
|----------|--------|
| `ImageClient.ts` gpt-image-2 | Done |
| `alpha-content-writer-skill.md` + compliance | Done |
| `GOCLAW_P4_P7_MEDIA_RUNBOOK.md` | Done |
| SalesMartly mount + notifyHumanHandler | Done (code) |
| lungmat free-text 1:1 khách | Không (by design) |

---

## Tiêu chí đóng pilot Alpha (text v1)

- [ ] **A0** model + MCP + accountId + skill (MCP only)
- [ ] **A1** JSON 3 kênh + compliance PASS (admin TG)
- [ ] **A2** post live X + Threads (text OK)
- [ ] **A3** Cron 08:00 VN
- [ ] **A4** Vault 38/38 + smoke 4 câu
- [x] **A5 / P4** ảnh — **Skipped** trong v1

*(P0–P7 legacy: P2 Done · P3 Partial · P4 Skipped · P5 Partial · P6–P7 Not started)*

**Pilot closed date:** _______________

---

## Founder — hành động tiếp theo (copy checklist)

1. [`ALPHA_MEDIA_WORKFLOW.md`](./ALPHA_MEDIA_WORKFLOW.md) — flow + phase A0–A6
2. **A0:** đổi model Alpha · MCP Test + grant · accountId · skill chỉ MCP
3. **A1–A2:** JSON 3 kênh → TG duyệt → Zernio Posts (tay) rồi MCP
4. Song song **A4:** upload 14 vault + smoke
5. **A3** sau A2 pass · **A5** sau đóng pilot text
6. Sau 3 ngày cron ổn: [`SALESMARTLY_GOCLAW_HUMAN_TELEGRAM_DM.md`](./SALESMARTLY_GOCLAW_HUMAN_TELEGRAM_DM.md) Phase 0

---

## Rủi ro (nhắc nhanh)

1. Doc "Active" ≠ Done — chỉ tin bảng này + bằng chứng.
2. Thiếu accountId → P7 fail.
3. Duyệt GoClaw = reply `OK đăng` — không phải nút inline lungmat (trừ khi dùng dev bot song song).
4. Vault 24/38 → draft yếu.
5. Zernio key từng lộ → revoke + key mới.
6. Gemini free tier 429 → agent không gọi MCP/CLI.
7. Doc P3 "CLI Done" ≠ MCP path thực tế — ưu tiên MCP.

*Cập nhật file này mỗi khi một phase A0–A6 hoặc P# chuyển Done.*
