# Agent Roster Audit — Đánh giá & đề xuất bổ sung

> **Mục đích:** “Triệu hồi” đánh giá lại toàn bộ agent trong dự án — cái nào giữ, nâng cấp, tạo mới.  
> **EngineerKit:** [agentkit.best/engineer](https://agentkit.best/engineer) ≈ [claudekit.cc/engineer](https://claudekit.cc/engineer) — cùng sản phẩm ($99, 17 agent dev cho **Claude Code**).  
> **SSOT:** [`PROJECT_STATUS.md`](../PROJECT_STATUS.md) · **Plan kit:** [`CLAUDEKIT_ENGINEER_PLAN.md`](./CLAUDEKIT_ENGINEER_PLAN.md)

**Cập nhật:** 2026-05-19

---

## 1. Ba tầng agent — đừng trộn lẫn

```text
TẦNG A — PRODUCTION (GoClaw)     → content, publish, community, cron
TẦNG B — REPO RUNTIME (lungmat)   → dev/test, legacy /content, E2E
TẦNG C — DEV WORKFLOW (EngineerKit) → plan, code, test, review, docs (Claude Code)
```

| Tầng | Công cụ | Tạo agent mới ở đâu? |
|------|---------|----------------------|
| **A Production** | GoClaw UI → Agent + Skill | `docs/goclaw-export/*.md` paste |
| **B Runtime code** | `src/agents/*.ts` | Chỉ khi cần API/webhook lungmat |
| **C Dev kit** | Mua EngineerKit → Claude Code | **Không** thêm vào `src/agents/` |

**EngineerKit dùng để nâng cấp TẦNG C (dev)** — không thay GoClaw writers.  
**Tạo agent mới chủ yếu ở TẦNG A (GoClaw)** cho 3 brand + compliance + publish.

---

## 2. Inventory hiện tại

### 2A. GoClaw (production) — `agent.hoa-homes.com`

| Agent | Trạng thái | Vai trò |
|-------|------------|---------|
| **Linh Cẩu** 🐆 | ✅ Live | Q&A community + Vault retrieve |
| **Alpha Content Writer** | 🔄 Pilot | JSON pack + ảnh + Zernio sau duyệt |
| **Raymond Content Writer** | ❌ Chưa | Clone sau Alpha pass |
| **VIP10X Content Writer** | ❌ Chưa | Clone sau Alpha pass |
| **Lửng Mật Coach** | ❌ Optional | Admin ops — skill từ `personaLung.ts` |
| **Alpha CSKH** (1:1 TG) | ❌ Chưa | Sales/support DM — **khác** Linh Cẩu · Digitop BĐS UC-01 |
| **Raymond / VIP10X CSKH** | ❌ Chưa | Clone sau Alpha CSKH |

> **4 làn Telegram:** [`DIGITOP_REALESTATE_1TO1_APPLICATION.md`](./DIGITOP_REALESTATE_1TO1_APPLICATION.md) — A=Linh Cẩu edu · B=Brand CSKH 1:1 · C=SalesMartly · D=Admin `/coach`

### 2B. lungmat-agent (`src/agents/`) — 15 runtime agents

| Agent | Command / role | Production sau pivot |
|-------|----------------|----------------------|
| RouterAgent | routing | Dev/local only |
| SafetyAgent | risk gate | Dev/local only |
| SupervisorAgent | orchestrator | Dev/local only |
| **ContentAgent** | `/content` | **Source schema** → export GoClaw Skill |
| **CoachAgent** | `/coach` | Dev hoặc clone GoClaw admin |
| MarketSummaryAgent | `/market_summary` | Optional feed cho writers |
| ResearchAgent | `/research` | Trùng GoClaw web search |
| ThreadWriterAgent | `/write_thread` | Legacy — gộp vào content pack |
| TelegramPublisherAgent | publish TG | Legacy nếu Zernio+GoClaw TG |
| DailyReportAgent | `/daily_report` | Optional cron |
| OpsAgent | debug, approve | Dev ops |
| RAGAgent | `/rag_*` | Thay bằng GoClaw Vault |
| MemoryAgent | `/memory_*` | Thay bằng GoClaw Memory |
| SupportAgent | `/help`, `/start` | Linh Cẩu trên GoClaw |
| SalesAgent | sales skills | Chưa wire SalesMartly |

### 2C. EngineerKit (17 agent — nếu mua $99)

planner · researcher · ui-ux-designer · fullstack-developer · tester · code-reviewer · debugger · git-manager · docs-manager · project-manager · copywriter · journal-writer · brainstormer · scout · scout-external · code-simplifier · (+ variants)

→ **Chỉ dùng trong Claude Code session** — map tại [`CLAUDEKIT_ENGINEER_PLAN.md`](./CLAUDEKIT_ENGINEER_PLAN.md) § Phase 2.

---

## 3. Đánh giá gap — agent nào THIẾU (Media OS thực tế)

### 🔴 P0 — Cần tạo ngay (GoClaw Skill / Agent)

| Agent đề xuất | Tầng | Lý do | Nguồn từ repo |
|---------------|------|-------|---------------|
| **Media OS Orchestrator** | GoClaw Team Router | **Cửa vào** — delegate, không làm thủ công | `media-os-orchestrator-skill.md` + brief Team |
| **Alpha Content Writer** | GoClaw | Pilot đang chạy | `alpha-content-writer-skill.md` ✅ |
| **Compliance Reviewer** | GoClaw Skill (layer) | Chặn buy/sell, “chắc ăn”, link X đắt — **trước** Zernio | Hard rules `ContentAgent` + constitution |
| **Publish Orchestrator** | GoClaw Skill (bước cuối) | Sau admin OK → `zernio media:upload` + `posts:create` | SOP GoClaw Zernio |
| **Brand Style Bible** (×3) | GoClaw Vault/Team | Digitop Tầng 1 — tone + taboo mỗi brand, tránh “3 ChatGPT” | `personas/*.ts` + `XAUUSD_MEDIA_OS.md` |

> Framework agency: [`DIGITOP_AGENCY_APPLICATION.md`](./DIGITOP_AGENCY_APPLICATION.md)

### 🟠 P1 — Sau Alpha pass (1–2 tuần)

| Agent đề xuất | Tầng | Lý do |
|---------------|------|-------|
| **Raymond Content Writer** | GoClaw | Brand #2 — `personas/raymond.ts` |
| **VIP10X Content Writer** | GoClaw | Brand #3 — `personas/vip10x.ts` |
| **YouTube Shorts Helper** | GoClaw (sub-skill) | Nhắc founder: script + thumb → Studio — không auto video |
| **Alpha CSKH** (1:1) | GoClaw + bot brand | Digitop UC-01 — qualify lead, FAQ, handoff hot — `alpha-cskh-1to1-skill.md` |

### 🟡 P2 — Analytics / BI lane (nội dung Founder 2026-05-21)

| Agent đề xuất | Tầng | Lý do |
|---------------|------|-------|
| **Analytical Thinking Agent** | GoClaw + MCP data | AT skill — data công ty + context phòng ban · brief [`analytical-thinking-agents-brief.md`](./briefs/analytical-thinking-agents-brief.md) |
| **Analytics Team** (Orchestrator) | GoClaw Team Link | Handbook Analytics Team — sau AT3 |
| **DailyReport / Cron insight** | GoClaw Cron | Báo cáo tuần — pattern `DailyReportAgent` |

> **Tách** khỏi Alpha media Telegram pilot. Contact nội bộ: `miyeonsavage347089@gmail.com` (không public).

### 🟡 P2 — Khi scale

| Agent đề xuất | Tầng | Lý do |
|---------------|------|-------|
| **Lửng Mật Coach** | GoClaw admin agent | Thay `/coach` lungmat cho founder |
| **Topic Scout** | GoClaw Cron 07:30 | Digitop Tầng 2 — headline XAUUSD → Founder chọn topic (P2) |
| **Macro Brief Agent** | GoClaw Cron | Tóm Fed/DXY sáng — feed writers (gộp hoặc sau Topic Scout) |
| **SalesMartly Router** | lungmat webhook | TG DM only — `SALESMARTLY_GOCLAW_HUMAN_TELEGRAM_DM.md` |
| **Raymond / VIP10X CSKH** | GoClaw | Clone Alpha CSKH |
| **Lead pipeline cron** | GoClaw | Báo cáo hot/warm → Admin DM (Digitop UC-04/05) |

### 🟢 EngineerKit — dùng thay vì tạo runtime agent

| Nhu cầu dự án | Dùng Kit agent | **Không** tạo `src/agents/` |
|---------------|----------------|------------------------------|
| Plan wire SalesMartly | planner | ❌ PlannerAgent.ts |
| E2E mở rộng | tester | ❌ TesterAgent.ts |
| Sync architecture.md | docs-manager | ❌ DocsAgent.ts |
| Review PR security | code-reviewer | ❌ ReviewerAgent.ts |
| Commit/PR | git-manager | ❌ GitAgent.ts |
| Debug CI | debugger | ❌ |

---

## 4. Agent KHÔNG cần thêm (tránh trùng)

| Ý tưởng | Vì sao bỏ |
|---------|-----------|
| Duplicate ContentAgent trên GoClaw + lungmat prod | Một nguồn Skill, GoClaw chạy |
| EngineerKit copywriter cho bài Alpha | Sai persona — brand Skill đã có |
| ui-ux-designer kit cho thumbnail | gpt-image-2 + `ImageClient.ts` đủ |
| RAGAgent / MemoryAgent prod mới | GoClaw Vault + Memory |
| ThreadWriterAgent riêng | Đã gộp `x_thread` trong content pack |
| 17 kit agents → port vào `src/agents/` | Trùng vai trò dev, phình codebase |
| Linh Cẩu trả lời sales 1:1 | Lane A ≠ B — `DIGITOP_REALESTATE_1TO1_APPLICATION.md` |
| lungmat `TelegramReceiver` cho khách free-text | Chỉ slash command — CSKH trên GoClaw |

---

## 5. Kiến trúc agent sau nâng cấp (mục tiêu)

```text
GoClaw agent.hoa-homes.com
├── Linh Cẩu 🐆           (Lane A — edu + vault Q&A, redirect sales)
├── Alpha CSKH            (Lane B — TG 1:1 khách, handoff hot)
├── Alpha Writer          (cron 08:00 + compliance + zernio)
├── Raymond Writer / CSKH (P1)
├── VIP10X Writer / CSKH  (P1)
├── Topic Scout           (cron 07:30 — P2)
└── Lửng Mật Coach        (Lane D — admin DM only)

lungmat-agent repo
├── src/agents/*          (dev / E2E / legacy — không prod cron)
└── docs/goclaw-export/   (SSOT Skill → paste GoClaw)

Claude Code + EngineerKit ($99 optional)
└── planner / tester / docs-manager / git-manager  (repo maintenance)
```

---

## 6. Dùng EngineerKit để “nâng cấp” — workflow cụ thể

**Không:** `ck new` ghi đè repo → **Có:** sandbox + cherry-pick.

| Bước | Lệnh / việc | Output |
|------|-------------|--------|
| 1 | Claude Code + `/plan` (kit) | Plan export Raymond/VIP Skill |
| 2 | fullstack-developer implement | `raymond-content-writer-skill.md` |
| 3 | tester | E2E path content mock |
| 4 | code-reviewer | Check compliance rules trong Skill |
| 5 | docs-manager | Sync `AGENT_ROSTER_AUDIT.md`, architecture §26 |
| 6 | git-manager | Commit goclaw-export batch |

**Triệu hồi đánh giá định kỳ (mỗi 2 tuần):**

```text
/plan "Audit agent roster vs PROJECT_STATUS — liệt kê gap P0/P1"
→ researcher: đọc AGENT_ROSTER_AUDIT + PHASE_STATUS
→ docs-manager: cập nhật file này nếu có agent mới/thừa
```

---

## 7. Checklist quyết định Founder

```text
☐ Mua EngineerKit $99 (agentkit.best) — sau Phase 0 Claude Code thử miễn phí
☐ GoClaw: hoàn thành Alpha Writer + Compliance gate trong Skill
☐ GoClaw: thêm Raymond + VIP10X Skill (không code TypeScript mới)
☐ lungmat: giữ agents cho dev — không deploy prod cron
☐ Telegram 1:1 khách: Alpha CSKH agent — KHÔNG gán vào Linh Cẩu
☐ SalesMartly: chỉ thêm router khi Founder chốt urgent (Lane C)
☐ Không port 17 kit agents vào src/agents/
```

---

## 8. Tóm tắt 1 câu

> **Nâng cấp bằng EngineerKit ($99) cho việc dev repo; tạo agent mới chủ yếu trên GoClaw (3 brand writer + compliance layer) — không nhân đôi kit agents vào lungmat runtime.**

Thiếu ngay: **Alpha Writer (pilot) + Compliance gate + Publish orchestrator trong Skill** — Raymond/VIP10X chờ Alpha pass.
