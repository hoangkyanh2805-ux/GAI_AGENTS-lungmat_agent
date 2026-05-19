# Áp dụng The Founder's Playbook — XAUUSD AI Media OS

> **Nguồn:** [The Founder's Playbook](https://claudekit.cc/) (Anthropic, bản PDF *The-Founders-Playbook-05062026_v3*) — tóm tắt và map vào repo `lungmat-agent`.  
> **SSOT dự án:** [`PROJECT_STATUS.md`](../PROJECT_STATUS.md) · **Phối hợp tool:** [`MEDIA_OS_COORDINATION.md`](./MEDIA_OS_COORDINATION.md)

---

## 1. Playbook nói gì (tóm tắt)

Playbook chia startup **AI-native** thành 4 giai đoạn:

| Giai đoạn | Câu hỏi chủ đạo | Vai founder |
|-----------|------------------|-------------|
| **Idea** | Có đáng build không? | Research + validation **trước** code |
| **MVP** | Build gì trước, đúng cách? | Orchestrator + **CLAUDE.md** + scope chặt |
| **Launch** | Business có thể grow không? | Hardening, metrics, bớt founder bottleneck |
| **Scale** | Moat + org bền vững? | GTM, enterprise, workflow lock-in |

Ba **surface** Anthropic (cùng một Claude):

| Surface | Dùng khi |
|---------|----------|
| **Chat** | Hỏi nhanh, rewrite, brainstorm |
| **Claude Cowork** | Research nhiều nguồn, doc/deck, workflow + MCP (Gmail, sheet, cron) |
| **Claude Code** | Agentic coding: plan, git, codebase |

**Nguyên tắc lặp lại trong sách:** đừng nhầm prototype = validation; giữ **sense-making trước building**; dùng AI làm **devil's advocate**; MVP cần **persistent context** (`CLAUDE.md`, architecture); tránh **agentic technical debt** và **scope creep** khi build quá dễ.

---

## 2. Dự án anh đang ở đâu trên lifecycle?

```text
Idea ──► MVP ──► Launch ──► Scale
         ▲
         └── lungmat-agent / Media OS: ĐANG Ở ĐÂY (cuối MVP → chưa Launch)
```

| Playbook stage | Trạng thái Media OS | Bằng chứng trong repo |
|----------------|---------------------|------------------------|
| **Idea** | Đã qua (có pivot) | `XAUUSD_MEDIA_OS.md`, 3 brand, Typefully topology |
| **MVP** | **Đang kết thúc** | 7A–7C code done; **live verify pending** |
| **Launch** | Chưa | Chưa PMF ops (retention TG/Typefully), chưa VPS 24/7 production |
| **Scale** | Chưa | Multi-brand moat, enterprise — out of scope ngắn hạn |

**Khớp playbook:** Anh **không** còn ở Idea thuần — nhưng playbook cảnh báo **nhảy Launch khi chưa có evidence MVP**. Blocker hiện tại (`VERIFY_LIVE_TELEGRAM.md`) chính là **exit criteria MVP** theo nghĩa playbook: product chạy thật với human approve.

---

## 3. Map surface Playbook → stack thực tế của anh

Playbook không nhắc **Cursor**; anh đang **4 kênh**. Map như sau:

| Playbook | Tool anh | Việc Media OS |
|----------|----------|----------------|
| Chat | Claude chat / Cursor chat | Tone 3 brand, brief campaign, devil's advocate pivot |
| Claude Cowork | **Cowork** | Verify checklist, n8n HTTP, synthesis — [`cowork/PLAYBOOK.md`](./cowork/PLAYBOOK.md) |
| Claude Code | **Claude Code** (+ song song **Cursor**) | 7D cron, refactor — [`claude-code/COMMANDS_MAP.md`](./claude-code/COMMANDS_MAP.md) |
| *(không có trong PDF)* | **Cursor** | IDE chính: `src/`, `architecture.md`, rules |

**Orchestrator founder (playbook):** anh đã làm đúng hướng — `PROJECT_STATUS` + Cowork verify + Cursor code + không auto-post TG.

---

## 4. Áp dụng theo từng stage

### 4.1 Idea — giữ làm “gate” khi thêm feature

Playbook: validate problem → solution **trước** build.

| Exercise playbook | Áp dụng Media OS |
|-------------------|------------------|
| Devil's advocate idea | Trước 7D hoặc brand mới: “Có cần cron 3 brand khi verify live chưa pass?” |
| Competitive map | Đã chốt: Typefully (X/Threads), không X API — **không re-debate** ([`XAUUSD_MEDIA_OS.md`](./XAUUSD_MEDIA_OS.md)) |
| Customer discovery | Founder + sale team = signal; bot **không** signal chi tiết — đúng constitution |

**Cảnh báo playbook cho anh:** Đừng coi **code 7A–7C xong** = problem validated. Cần **Telegram + Typefully thật** = prototype pressure test với operator.

---

### 4.2 MVP — trùng 80% việc đang làm

Playbook MVP goals:

1. Product nhỏ nhất có **user thật** dùng  
2. Build nhanh **không** technical debt vô hạn  
3. **Persistent context** session-after-session  

| Khuyến nghị playbook | Đã có / cần làm |
|----------------------|-----------------|
| `CLAUDE.md` / architectural context | Skeleton trong `claude-code/COMMANDS_MAP.md` §6 — **tạo `CLAUDE.md` root** merge `architecture.md` + `PROJECT_STATUS` |
| Scope document (làm / không làm) | `PHASE_7_PLAN.md` §7D + out-of-scope Phase 7 — **thêm 1 file `docs/MVP_SCOPE.md` ngắn** nếu scope creep (tùy chọn) |
| Session log cuối mỗi Claude Code session | = `docs/ai-worklog/` — **tiếp tục** |
| Security review trước user thật | `AGENT_SHARED_SECRET`, không commit `.env`; trước VPS: review auth Telegram, approval gate |
| Metrics trước launch | **Chưa có** — xem §5 bên dưới |

**Anti-pattern playbook ↔ anh:**

| Rủi ro | Triệu chứng | Antidote |
|--------|-------------|----------|
| Mistaking build for validating | “7B code xong” nhưng chưa bấm nút TG | `VERIFY_LIVE_TELEGRAM.md` |
| Agentic technical debt | Nhiều session sửa `index.ts` / Router không sync doc | Cập nhật `architecture.md` khi đổi hành vi; rule Cursor |
| Zero-friction scope creep | Thêm X API, 8 channel, ClaudeKit full port cùng lúc | Chỉ 7D sau verify; `PHASE_7_PLAN` out-of-scope |
| False PMF | Một lần `/content` chạy = thành công | Định nghĩa **done** = 1 tuần 3 brand có pack + approve routine |

---

### 4.3 Launch — sau khi verify live

Playbook Launch: repeatable growth, production hardening, **founder không còn bottleneck** mọi ops.

| Hạng mục | Áp dụng gợi ý |
|----------|----------------|
| Technical debt remediation | Sau verify: audit cron + `ContentAgent` path; Docker/VPS |
| Founder bottleneck | Admin approve TG/Typefully — founder vẫn bottleneck **cố ý** (human-in-the-loop); automate **enqueue** only (7D) |
| Security/compliance | Real users trên TG: bot admin channel, rotate token nếu lộ |
| PM process nhẹ | Weekly: số pack, approve rate, lỗi queue — Cowork compile từ logs |

**Exit Launch (playbook) chưa áp dụng đầy đủ** cho đến khi có: VPS 24/7, metric retention ops, CAC/LTV (nếu có paid).

---

### 4.4 Scale — định hướng dài (Media OS)

Playbook Scale: moat = domain depth + data flywheel + integrations.

| Hướng | Media OS |
|-------|----------|
| Domain expertise | XAUUSD/gold macro, 3 persona brand — `personas/`, RAG ingest |
| Workflow lock-in | Typefully + TG channel + `youtube_pack` routine |
| Data compound | Approval logs, content pack JSON → cải prompt (chưa productized) |

Không làm sớm: enterprise SOC2, multi-market — Phase 8+ trong `PROJECT_STATUS`.

---

## 5. Bài tập playbook → checklist 30 ngày (Media OS)

Ưu tiên theo playbook: **evidence trước scale execution**.

### Tuần 1 — Exit MVP (playbook: “real users react”)

| # | Việc | Tool | Doc |
|---|------|------|-----|
| 1 | Verify 6 bước Telegram | Cowork + Founder | `VERIFY_LIVE_TELEGRAM.md` |
| 2 | Ghi ngày pass vào `PHASE_STATUS` | Cursor | |
| 3 | Tạo `CLAUDE.md` root từ skeleton | Cursor / Claude Code | `claude-code/COMMANDS_MAP.md` §6 |

### Tuần 2 — MVP scope chặt (playbook: scope document)

| # | Việc | Tool |
|---|------|------|
| 4 | Implement **chỉ** 7D-1 (cron alpha) | Cursor hoặc Claude Code (1 lead) |
| 5 | Viết 10 dòng “MVP không làm”: X API, auto-post, 5 channel phụ | Claude chat |
| 6 | `npx tsc` + e2e mock sau 7D | Cursor |

### Tuần 3 — Measurement (playbook: framework trước “launch”)

Định nghĩa **3 metric ops** (không cần analytics phức tạp đầu):

| Metric | Ý nghĩa |
|--------|---------|
| Packs / tuần | Số lần `/content` hoặc cron thành công |
| Approve TG rate | TG approve / pack tạo |
| Time-to-Typefully | Thời gian từ pack → scheduled X (founder ghi tay) |

Cowork: weekly brief từ `logs/` + approval file (nếu có).

### Tuần 4 — Launch prep nhẹ

| # | Việc |
|---|------|
| 7 | VPS + `DEPLOY.md` |
| 8 | Devil's advocate: “Cron 3 brand có làm founder mệt approve không?” |
| 9 | Cập nhật `PROJECT_STATUS` → MVP done, Launch in progress |

---

## 6. Quyết định đã chốt (không để playbook kéo ngược)

Các quyết định repo **align** playbook “orchestrator + validate first”:

- Multi-brand **content ops**, không trading execution trong bot  
- TG publish qua approval; X/Threads Typefully handoff  
- SSOT: `PROJECT_STATUS.md`  
- Cowork ≠ coder; Cursor/Claude Code = build  

**Không re-debate** trừ khi evidence verify fail.

---

## 7. ClaudeKit / kit bên thứ ba

Playbook là **Anthropic official**; ClaudeKit Engineer là **product riêng** (agent pack cho Claude Code). Áp dụng playbook **không bắt buộc mua kit** — anh đã có [`COMMANDS_MAP.md`](./claude-code/COMMANDS_MAP.md) port khung tương tự.

---

## 8. Liên kết tài liệu trong repo

| File | Vai trò |
|------|---------|
| [`PROJECT_STATUS.md`](../PROJECT_STATUS.md) | SSOT phase |
| [`VERIFY_LIVE_TELEGRAM.md`](./VERIFY_LIVE_TELEGRAM.md) | MVP exit evidence |
| [`MEDIA_OS_COORDINATION.md`](./MEDIA_OS_COORDINATION.md) | Cowork · Cursor · Claude Code |
| [`cowork/PLAYBOOK.md`](./cowork/PLAYBOOK.md) | Cowork = playbook “Cowork surface” |
| [`claude-code/COMMANDS_MAP.md`](./claude-code/COMMANDS_MAP.md) | Claude Code = playbook “Code surface” |
| [`architecture.md`](./architecture.md) | Architectural context (≈ CLAUDE.md kỹ thuật) |
| [`XAUUSD_MEDIA_OS.md`](./XAUUSD_MEDIA_OS.md) | Constitution / problem-solution đã chốt |

---

## 9. Một câu chốt

Playbook nói founder 2026 là **điều phối agent**, không phải người gõ hết code. Media OS của anh **đã build agent thật** (`ContentAgent`, approval, cron sắp tới) — bước playbook tiếp theo là **chứng minh trên Telegram/Typefully** (MVP exit), rồi mới **7D + VPS** (Launch), không mở rộng scope vì build quá dễ.

---

*Cập nhật khi verify pass hoặc chuyển sang Launch. Nguồn PDF: Anthropic Founder’s Playbook (05/2026).*
