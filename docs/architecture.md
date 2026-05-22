# Lungmat Agent — System Architecture

> **Mục đích file này:** Tài liệu tham chiếu duy nhất (single source of truth) mô tả **toàn bộ logic** của hệ thống. Khi làm việc với AI hoặc developer mới, **chỉ cần đọc file này** — không cần dựa vào lịch sử chat.
>
> **Cập nhật lần cuối:** 2026-05-19 · **Version runtime:** 1.0.0 · **E2E:** 39/39 passing (`scripts/e2e-local.ts`)

### Production vs repo (2026-05-19)

| Layer | Runtime |
|-------|---------|
| **Content publish prod** | GoClaw + Zernio (X, Threads, YouTube meta) — [`SOP_GoClaw_Zernio_PUBLISH.md`](./SOP_GoClaw_Zernio_PUBLISH.md) |
| **GoClaw runtime map** | Linh Cẩu + Vault + agents — [`GOCLAW_RUNTIME_GUIDE.md`](./GOCLAW_RUNTIME_GUIDE.md) · upstream [docs.goclaw.sh](https://docs.goclaw.sh) |
| **This repo (lungmat-agent)** | Persona/schema source, local `/content` test, E2E, `ImageClient` gpt-image-2 |
| **Legacy** | Typefully handoff Phase 7C — backup only |

---

## Mục lục

1. [Tóm tắt 30 giây](#1-tóm-tắt-30-giây)
2. [Nguyên tắc thiết kế](#2-nguyên-tắc-thiết-kế)
3. [Sơ đồ hệ thống](#3-sơ-đồ-hệ-thống)
4. [Cấu trúc thư mục](#4-cấu-trúc-thư-mục)
5. [Khởi động (`src/index.ts`)](#5-khởi-động-srcindexts)
6. [Luồng xử lý lệnh (Command Pipeline)](#6-luồng-xử-lý-lệnh-command-pipeline)
7. [SupervisorAgent — Orchestrator](#7-supervisoragent--orchestrator)
8. [RouterAgent & SafetyAgent](#8-routeragent--safetyagent)
9. [Danh sách Agent & logic chi tiết](#9-danh-sách-agent--logic-chi-tiết)
10. [Hệ thống Skills (Support / Sales)](#10-hệ-thống-skills-support--sales)
11. [Tích hợp bên ngoài & chế độ Mock](#11-tích-hợp-bên-ngoài--chế-độ-mock)
12. [Memory (L1 / L2 / L3)](#12-memory-l1--l2--l3)
13. [RAG Store](#13-rag-store)
14. [Approval & Publish (Human-in-the-loop)](#14-approval--publish-human-in-the-loop)
15. [Job Queue & Job Worker](#15-job-queue--job-worker)
16. [Cron Scheduler](#16-cron-scheduler)
17. [Execution Trace & Observability](#17-execution-trace--observability)
18. [HTTP API](#18-http-api)
19. [Telegram Integration](#19-telegram-integration)
20. [Type Contracts (`src/types/index.ts`)](#20-type-contracts-srctypesindexts)
21. [Persistence — File vs Supabase](#21-persistence--file-vs-supabase)
22. [Biến môi trường](#22-biến-môi-trường)
23. [Runtime G: → C: (`scripts/runtime.js`)](#23-runtime-g--c-scriptsruntimejs)
24. [Testing](#24-testing)
25. [Mở rộng hệ thống](#25-mở-rộng-hệ-thống)
26. [Trạng thái phase & tài liệu liên quan](#26-trạng-thái-phase--tài-liệu-liên-quan)

---

## 1. Tóm tắt 30 giây

**lungmat-agent** là hệ thống AI agent kiểu **Hermes**: local-first, đa agent, Express HTTP server, nhận lệnh dạng slash command (`/research`, `/help`, …).

| Khía cạnh | Mô tả |
|-----------|--------|
| **Entry** | `src/index.ts` — Express + Telegram long-poll |
| **Orchestrator** | `SupervisorAgent` — route → safety → delegate → trace |
| **Agents** | 11 sub-agent + Router + Safety |
| **Nội dung** | Research (Apify), market summary (Yahoo + LLM), thread writer, Telegram publish |
| **An toàn** | Mọi publish ra channel cần **approval**; scheduler gửi draft tới admin DM |
| **Lưu trữ local** | `logs/*.json` — jobs, approvals, RAG, memory, traces, schedules |
| **Lưu trữ cloud** | Supabase (optional) — `command_logs`, `agent_events` |
| **Mock** | `MOCK_LLM=1` hoặc thiếu API key → mock Apify, Anthropic, Telegram |

---

## 2. Nguyên tắc thiết kế

1. **Local-first** — State chính trên disk (`logs/`), chạy được không cần cloud.
2. **Modular agents** — Mỗi agent implement `SubAgent` với `role` cố định.
3. **Static routing** — `RouterAgent` map command → role (chưa dùng LLM classify).
4. **Human-in-the-loop** — Publish Telegram bắt buộc qua `ApprovalStore`.
5. **Trace mọi request** — `trace_id` UUID xuyên suốt; lưu `logs/traces/{id}.json`.
6. **Fail-soft integrations** — Apify lỗi → fallback mock; Supabase thiếu → skip silently.
7. **Single type file** — `src/types/index.ts` không import gì từ `src/` (tránh circular deps).

---

## 3. Sơ đồ hệ thống

### 3.1 Luồng lệnh đồng bộ (HTTP / Telegram message)

```
┌─────────────┐     ┌──────────────────┐
│ HTTP POST   │     │ TelegramReceiver │
│ /command    │     │ (long-poll)      │
└──────┬──────┘     └────────┬─────────┘
       │                     │
       └──────────┬──────────┘
                  ▼
         ┌─────────────────┐
         │ SupervisorAgent │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
 RouterAgent  SafetyAgent   SubAgent.*
    │             │             │
    │         blocked?          │
    │             │             ▼
    │             └──► reply   AgentResponse
    │                            │
    └────────────────────────────┤
                                 ▼
                    TraceStore + Supabase (async)
                                 │
                                 ▼
                              reply → client
```

### 3.2 Luồng nền (Scheduler → Queue → Worker)

```
CronScheduler (node-cron)
       │ onFire(schedule)
       ▼
  JobQueue.enqueue(job_type, payload)
       │
       ▼
  JobWorker.tick() every 5s
       │
       ├── research        → ResearchAgent.process()
       ├── market_summary  → MarketSummaryAgent.process()
       ├── write_thread    → ThreadWriterAgent.process()
       └── daily_report    → (chỉ enqueue, không handler riêng)
       
  research / market_summary thành công:
       └── publishDraftToAdmin() → Telegram DM + inline buttons
```

### 3.3 Pipeline publish nội dung (end-to-end)

```
/research ──► Apify scrape ──► RAGStore.ingest
       │
       ▼
/market_summary ──► Yahoo Finance (XAUUSD) ──► Anthropic summary ──► RAG ingest
       │
       ▼
/write_thread ──► RAG search ──► Anthropic thread ──► ApprovalStore.create (pending)
       │
       ├── HTTP: POST /approval/:id/approve
       ├── Telegram callback: approve:<id> → /approve_publish
       └── OpsAgent /approve_publish → TelegramClient → TELEGRAM_CHAT_ID (channel)

/publish_telegram ──► cần approval_id + status === 'approved'
```

**Publish:** Mọi entry point dùng `src/publish/telegramPublish.ts` (xem [§14](#14-approval--publish-human-in-the-loop)).

---

## 4. Cấu trúc thư mục

```
GAI_AGENTS-lungmat_agent/
├── src/
│   ├── index.ts              # Bootstrap — KHÔNG business logic ở đây ngoài wiring
│   ├── types/index.ts        # Canonical types — đọc trước khi sửa bất kỳ module nào
│   ├── config/
│   │   ├── env.ts            # ENV object + validateEnv + logEnvStatus
│   │   └── commands.ts       # COMMANDS registry (metadata cho /help)
│   ├── core/
│   │   └── HermesAgent.ts    # LEGACY — không dùng trong index.ts
│   ├── agents/               # Tất cả SubAgent + Supervisor + Router + Safety
│   ├── skills/               # Skill classes cho SupportAgent / SalesAgent
│   ├── routes/               # Express routers
│   ├── integrations/         # Apify, Anthropic, Telegram
│   ├── memory/               # L1, L2, MemoryManager, FileLogger, SupabaseMemory
│   ├── queue/                # JobQueue, JobWorker
│   ├── scheduler/            # CronScheduler
│   ├── approval/             # ApprovalStore
│   ├── publish/              # telegramPublish.ts — publish thống nhất
│   ├── rag/                  # RAGStore
│   ├── trace/                # ExecutionTrace, TraceStore
│   └── tools/                # ToolRegistry, LogTool, SearchMemoryTool
├── db/
│   ├── schema.sql            # Supabase DDL
│   ├── check.ts, seed.ts, test-log.ts
├── docs/
│   ├── architecture.md       # FILE NÀY
│   ├── ROADMAP.md, PHASE_STATUS.md
│   └── SOP_LIVE_TELEGRAM_AGENT_PIPELINE_V1.md
├── scripts/
│   ├── runtime.js            # Sync G: → C:\lungmat_agent + chạy npm
│   └── e2e-local.ts          # 39 test cases
├── logs/                     # Runtime state (gitignored)
│   ├── agent.log
│   ├── memory.json, jobs.json, approvals.json
│   ├── rag/documents.json, schedules.json
│   └── traces/{trace_id}.json
├── package.json
├── tsconfig.json
└── .env.example
```

---

## 5. Khởi động (`src/index.ts`)

Thứ tự khởi tạo (quan trọng khi debug):

| Bước | Thành phần | Ghi chú |
|------|------------|---------|
| 1 | `validateEnv()` | **Bắt buộc** `AGENT_SHARED_SECRET` — thiếu thì `process.exit(1)` |
| 2 | `logEnvStatus()` | In JSON booleans: apifyMode, mockLlm, telegram, supabase |
| 3 | `MemoryManager` + `ToolRegistry` | Register `LogTool`, `SearchMemoryTool` |
| 4 | Agents | Router, Safety, Support, Sales, Memory, Research, MarketSummary, ThreadWriter, TelegramPub, DailyReport, RAG, Ops |
| 5 | `SupervisorAgent` | Wrap tất cả sub-agents |
| 6 | `TelegramReceiver` | Truyền `supervisor` làm processor |
| 7 | `JobWorker` | Register handlers + `start(5000ms)` |
| 8 | `CronScheduler` | Callback: `JobQueue.enqueue` |
| 9 | Seed schedules | Nếu `NODE_ENV !== 'test'` và chưa có schedule trùng tên |
| 10 | Express | Middleware auth + mount routes |
| 11 | `app.listen(ENV.PORT)` | Default 3000 |
| 12 | `telegramReceiver.start()` | Sau khi server listen |
| 13 | SIGINT/SIGTERM | Stop telegram + scheduler |

### Schedules mặc định (seed trong index.ts)

| name | cron | job_type | payload |
|------|------|----------|---------|
| `daily_market_summary_morning` | `0 0 * * *` | market_summary | `{ tickers: ['XAUUSD'] }` |
| `daily_research_morning` | `0 0 * * *` | research | `{ topic: 'gold XAUUSD news Fed inflation DXY dollar', limit: 5 }` |
| `daily_market_summary_evening` | `30 15 * * *` | market_summary | `{ tickers: ['XAUUSD'] }` |

Cron dùng timezone máy chủ (node-cron default).

### Helper `publishDraftToAdmin` (trong index.ts)

Khi job worker chạy `research` hoặc `market_summary` thành công:

1. Kiểm tra `ENV.ADMIN_TELEGRAM_CHAT_ID` — thiếu thì skip (log only).
2. `ApprovalStore.create({ type: 'publish_telegram', content: draftText, ... })`.
3. `TelegramClient.sendMessageWithButtons` với:
   - `approve:{approvalId}`
   - `reject:{approvalId}`

Đây là **đường approval cho output scheduler**, khác với approval từ `ThreadWriterAgent` (xem §14).

---

## 6. Luồng xử lý lệnh (Command Pipeline)

### Input chuẩn: `AgentMessage`

```typescript
{
  id: string;           // randomUUID()
  content: string;      // thường = command string
  command?: string;     // "/research"
  payload: Record<string, unknown>;
  user: string;
  source: string;       // "telegram" | "e2e" | "job_queue" | ...
  project?: string;
  chat_id?: string | number;
  timestamp: string;    // ISO
}
```

### Nguồn gọi `SupervisorAgent.process(command, payload, meta)`

| Nguồn | `meta.source` | Ghi chú |
|-------|---------------|---------|
| `POST /command/command` | từ body, default `"unknown"` | Header `x-agent-secret` bắt buộc |
| `TelegramReceiver` | `"telegram"` | Chỉ xử lý text bắt đầu `/` |
| `TelegramReceiver` callback | `"telegram_callback"` | Map → `/approve_publish` hoặc `/reject_publish` |
| `JobWorker` | `"job_queue"` | `user: "scheduler"` |

### Output: `SupervisorResult`

`AgentResponse` + `trace: TraceRecord`.

`AgentResponse.status`: `'success' | 'error' | 'blocked' | 'pending_approval'`

---

## 7. SupervisorAgent — Orchestrator

**File:** `src/agents/SupervisorAgent.ts`

### Pipeline 4 bước

```
1. RouterAgent.route(message, ctx)     → RoutingDecision
2. SafetyAgent.evaluate(...)           → SafetyDecision
   - approved === false → return blocked + finalize trace
3. registry.agents.get(target).process(message, ctx)
   - agent không tồn tại → error
4. Persist (fire-and-forget):
   - logCommand() → Supabase command_logs
   - finalize(ctx) → TraceStore.save()
   - mỗi step → logAgentEvent() → Supabase agent_events
```

### Error handling

- Try/catch bọc toàn pipeline → `status: 'error'`, trace vẫn được finalize và save.
- Sub-agent lỗi → `status: 'error'` từ agent đó (không rethrow).

---

## 8. RouterAgent & SafetyAgent

### RouterAgent (`src/agents/RouterAgent.ts`)

- **Bảng tĩnh** `COMMAND_ROUTES`: exact match `"/command"` → `AgentRole`.
- Command không có trong bảng → fallback `'support'`.
- `ctx.mock_llm` hiện **không thay đổi** routing (hook sẵn cho LLM intent sau này).
- Parse command: `message.command ?? message.content.trim().split(/\s+/)[0]`.

### SafetyAgent (`src/agents/SafetyAgent.ts`)

| Risk | Commands | Hành vi |
|------|----------|---------|
| **HIGH** | (reserved, ví dụ `/delete_all`) | `approved: false` → blocked |
| **MEDIUM** | `/memory_store`, `/publish_telegram` | `approved: true`, log audit |
| **LOW** | còn lại | `approved: true` |

**Quan trọng:** `/publish_telegram` được approve bởi Safety nhưng **TelegramPublisherAgent** vẫn kiểm tra `ApprovalStore.status === 'approved'` — hai lớp bảo vệ.

---

## 9. Danh sách Agent & logic chi tiết

### Bảng tổng hợp commands → agent

| Command | Agent | File |
|---------|-------|------|
| `/help`, `/report_today`, `/check_errors`, `/audit_pipeline`, `/check_pending` | support | `SupportAgent.ts` |
| `/create_brief`, `/lead_capture`, `/product_info` | sales | `SalesAgent.ts` |
| `/memory_store`, `/memory_get`, `/memory_list` | memory | `MemoryAgent.ts` |
| `/research` | research | `ResearchAgent.ts` |
| `/market_summary` | market_summary | `MarketSummaryAgent.ts` |
| `/write_thread` | thread_writer | `ThreadWriterAgent.ts` |
| `/publish_telegram` | telegram_publisher | `TelegramPublisherAgent.ts` |
| `/daily_report` | daily_report | `DailyReportAgent.ts` |
| `/rag_search`, `/rag_ingest` | rag | `RAGAgent.ts` |
| `/queue_status`, `/approval_list`, `/debug_env`, `/approve_publish`, `/reject_publish` | ops | `OpsAgent.ts` |
| `/coach` | coach | `CoachAgent.ts` (admin DM only — Lửng Mật persona) |

---

### ResearchAgent

**Input payload:**
- `topic` (string) — default: `'gold XAUUSD news Fed inflation DXY dollar'`
- `limit` (number) — default: 5

**Logic:**
1. `ApifyClient.scrapeNews(topic, limit)` → `Article[]`
2. Ghép articles → `RAGStore.ingest({ title: 'Research: {topic}', source: 'apify', tags: [...] })`
3. Reply preview 3 title + `doc_id` + tag `_(mock: reason)_` nếu Apify mock

**next_actions:** `['/market_summary', '/write_thread']`

**meta:** `{ doc_id, article_count, topic, apifyMode, ... }`

---

### MarketSummaryAgent

**Input payload:**
- `tickers` (string[]) — default `['XAUUSD']`

**Logic:**
1. `ApifyClient.scrapeMarketData(tickers)`
   - Nếu mọi ticker ∈ `YAHOO_SYMBOL_MAP` → `scrapeYahooMarketData()` (Yahoo chart API)
   - `XAUUSD` → `GC=F`; `BTC` → `BTC-USD`; `SPY`, `AAPL`, … — xem `ApifyClient.ts`
2. Format `dataText` (giá, range, 5d candles)
3. `AnthropicClient.chat()` — system prompt tiếng Việt, analyst gold, **không** buy/sell recommendation
4. `RAGStore.ingest` kết hợp raw data + summary

**next_actions:** `['/write_thread', '/publish_telegram']`

---

### ThreadWriterAgent

**Input payload:**
- `topic` (string) — default `'AI and markets'`

**Logic:**
1. `RAGStore.search(topic, 3)` — context tối đa 3000 chars
2. `AnthropicClient.chat()` — system: 5-tweet thread, format `1/`, `2/`, ...
3. `ApprovalStore.create({ type: 'publish_telegram', content: threadText, status: 'pending' })`

**Reply:** hiển thị draft + `approval.id`

**next_actions:** `POST /approval/{id}/approve`, `/publish_telegram`

---

### TelegramPublisherAgent

**Input payload bắt buộc:**
- `approval_id` (string)

**Logic:**
1. `ApprovalStore.get(approval_id)` — hỗ trợ **UUID prefix** (unique prefix only)
2. `status === 'rejected'` → error
3. `status === 'pending'` → success nhưng reply hướng dẫn approve (chưa publish)
4. `status === 'approved'` → `TelegramClient.sendMessage(chatId, approval.content)`
   - `chatId` = `payload.chat_id` ?? `message.chat_id` ?? `ENV.TELEGRAM_CHAT_ID` ?? `'mock_chat'`

---

### DailyReportAgent

**Input payload (optional):**
- `topics` — default `['gold XAUUSD news Fed inflation DXY dollar']` (khớp cron research)
- `tickers` — default `['XAUUSD']`

**Logic:** Enqueue N jobs:
- Mỗi topic → `JobQueue.enqueue('research', { topic })`
- Một job `market_summary` với tickers
- Một job `write_thread` với `topic: topics[0]`

**Không chờ** job hoàn thành — trả về ngay danh sách `job_ids`.

---

### MemoryAgent

| Command | Payload | Logic |
|---------|---------|-------|
| `/memory_store` | `key` (required), `value` | `MemoryManager.set(key, value, { agent: ctx.user })` |
| `/memory_get` | `key` | L1 → L2 fallback |
| `/memory_list` | — | Union keys L1 + L2 |

---

### RAGAgent

| Command | Payload |
|---------|---------|
| `/rag_search` | `query` hoặc text sau command; `limit` default 5 |
| `/rag_ingest` | `title`, `content` required; `source`, `tags` optional |

---

### CoachAgent

**Command:** `/coach <câu hỏi>` — **chỉ** `chat_id === ADMIN_TELEGRAM_CHAT_ID` (`src/auth/isAdminChat.ts`).

**Persona:** `src/llm/personaLung.ts` (`withLungCoachPersona`) — Lửng Mật 🦡 coach Media OS phase/verify/handoff; docs `docs/lung-mat/SOUL.md`.

**Logic:**
1. Gate admin → từ chối nếu không khớp admin DM.
2. Câu hỏi từ `payload.text` / `payload.topic` / phần args sau `/coach`.
3. `AnthropicClient.chat` — max ~1200 tokens; mock khi `MOCK_LLM=1`.

**Khác Linh Cẩu:** `persona.ts` + few-shot cho MarketSummary/Ops; `/coach` không dùng `withPersona`.

---

### OpsAgent

| Command | Logic |
|---------|-------|
| `/queue_status` | Đếm job theo status + 5 job gần nhất |
| `/approval_list` | `payload.status` filter optional |
| `/debug_env` | Booleans only (`hasApifyToken`, `mockLlm`, `telegramConfigured`, `hasAdminChatId`, `supabaseConfigured`, `apifyActorId`) — **không** in secret; đồng bộ với `logEnvStatus()` startup |
| `/approve_publish` | Gọi `approvePublish()` skill |
| `/reject_publish` | Gọi `rejectPublish()` skill |

---

### SupportAgent & SalesAgent

- Pattern giống nhau: `Map<command, Skill>` từ constructor.
- `timed(() => skill.execute(payload))` + `addStep`.
- Skill không tìm thấy → success với message unknown command.

---

## 10. Hệ thống Skills (Support / Sales)

**Registry:** `src/skills/registry.ts`

### Support skills

| Class | Command | Mô tả ngắn |
|-------|---------|------------|
| HelpSkill | `/help` | List từ `COMMANDS` |
| ReportTodaySkill | `/report_today` | Báo cáo hệ thống nội dung |
| CheckErrorsSkill | `/check_errors` | Đọc `logs/agent.log` tìm ERROR |
| AuditPipelineSkill | `/audit_pipeline` | Checklist SOP pipeline |
| CheckPendingSkill | `/check_pending` | Pending approvals + jobs |

### Sales skills

| Class | Command |
|-------|---------|
| CreateBriefSkill | `/create_brief` |
| LeadCaptureSkill | `/lead_capture` |
| ProductInfoSkill | `/product_info` |

### Skill contract

```typescript
interface Skill {
  name: string;
  command: string;  // phải khớp RouterAgent COMMAND_ROUTES
  description: string;
  execute(payload): Promise<{ reply: string; next_actions: string[] }>;
}
```

### publishApproval (`src/skills/publishApproval.ts`)

Dùng bởi OpsAgent khi Telegram callback approve/reject:

- `approvePublish` → `approveAndPublish()` trong `src/publish/telegramPublish.ts`
- `rejectPublish` → `ApprovalStore.reject` only

---

## 11. Tích hợp bên ngoài & chế độ Mock

### Quy tắc mock chung

```
isMock() = !API_KEY || process.env.MOCK_LLM === '1'
```

| Client | Mock khi | Hành vi mock |
|--------|----------|--------------|
| **AnthropicClient** | no key hoặc MOCK_LLM | Template thread / market summary / generic |
| **ApifyClient** | no token hoặc MOCK_LLM | `mockArticles`, `mockMarketData` |
| **TelegramClient** | no token hoặc MOCK_LLM | Random `message_id`, log only |
| **TelegramReceiver** | MOCK_LLM=1 hoặc no token | **Không start** poll loop |

### ApifyClient (`src/integrations/ApifyClient.ts`)

**scrapeNews:**
- Actor: `apify/google-search-scraper`
- `runActor`: POST run → poll 2s × 45 (max ~90s) → fetch dataset
- `normalizeApifyItems`: hỗ trợ `organicResults[]` nested hoặc flat items
- Fallback mock khi: no token, mock flag, empty results, API error
- `lastDiagnostics` exposed qua `getLastDiagnostics()`

**scrapeMarketData:**
- Forex set → `scrapeForexData` (Yahoo chart API)
- Khác → Google search scrape + regex parse price (fragile)
- Lỗi → mock prices

**scrapeForexData (Yahoo):**
- `query1.finance.yahoo.com/v8/finance/chart/{symbol}`
- Params: `interval=1d`, `range=5d`
- Output: price, change%, day_high/low, `candles_5d[]`

### AnthropicClient

- Model default: `ENV.ANTHROPIC_MODEL` (`claude-haiku-4-5-20251001`)
- `max_tokens`: 2048
- Chỉ lấy block `type === 'text'`

---

## 12. Memory (L1 / L2 / L3)

### MemoryManager

```
set(key, value, { ttl_ms=15min, persist=true, agent })
  → L1.set (TTL in-memory)
  → if persist: L2Memory.set (file)

get(key)
  → L1 hit?
  → L2 hit? → warm L1
  → undefined

keys() → union L1 + L2 keys, sorted
```

### L1Memory (`src/memory/L1Memory.ts`)

- `Map` in-process
- Sweep mỗi 60s (timer `unref`)
- TTL epoch ms

### L2Memory (`src/memory/L2Memory.ts`)

- File: `logs/memory.json`
- Sync read/write (blocking fs)
- Optional `expires_at` ISO string

### L3 — Supabase (`src/memory/SupabaseMemory.ts`)

- **Chỉ** `logCommand`, `logAgentEvent` — **không** sync agent_memory table từ MemoryManager hiện tại
- Thiếu config → `console.warn` hoặc silent skip

---

## 13. RAG Store

**File:** `src/rag/RAGStore.ts`  
**Storage:** `logs/rag/documents.json`

### ingest(doc)

Thêm `id` (UUID), `ingested_at` (ISO).

### search(query, limit)

- Tokenize query lowercase by whitespace
- Score = tổng số lần token xuất hiện trong `title + content + tags` (regex global, case-insensitive)
- Filter `score > 0`, sort desc, slice limit
- **Không phải vector DB** — keyword frequency only

### Ai ghi RAG?

| Nguồn | Khi nào |
|-------|---------|
| ResearchAgent | Sau mỗi lần scrape |
| MarketSummaryAgent | Sau summary |
| RAGAgent `/rag_ingest` | Manual |
| POST `/ingest` | HTTP API |

---

## 14. Approval & Publish (Human-in-the-loop)

**File:** `src/approval/ApprovalStore.ts`  
**Storage:** `logs/approvals.json`

### ApprovalRequest schema

```typescript
{
  id: string;              // UUID
  trace_id: string;
  type: 'publish_telegram' | 'publish_other';
  content: string;         // nội dung sẽ publish
  agent: string;
  user: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}
```

### Prefix resolution

- `get`, `approve`, `reject` chấp nhận full UUID hoặc **unique prefix**
- Nhiều match → `AmbiguousPrefixError` (HTTP 400)

---

### Publish engine thống nhất (`src/publish/telegramPublish.ts`)

| Hàm | Mô tả |
|-----|--------|
| `publishApprovedContent(approval, chatId?)` | Gửi `approval.content` → `TELEGRAM_CHAT_ID` (hoặc override). Yêu cầu `status === 'approved'`. |
| `approveAndPublish(approvalId, reviewedBy?, chatId?)` | `ApprovalStore.approve` rồi gọi `publishApprovedContent`. |
| `resolvePublishChatId(override?)` | `payload.chat_id` → `ENV.TELEGRAM_CHAT_ID` → `mock_chat` nếu mock. |

**Callers:**

| Entry | Flow |
|-------|------|
| `TelegramPublisherAgent` | `publishApprovedContent` (pending → hướng dẫn approve trước) |
| `approvePublish` skill / `/approve_publish` | `approveAndPublish` |
| `POST /approval/:id/approve` | Chỉ approve; body `{ publish: true }` → `publishApprovedContent` sau approve |
| Scheduler DM | Nút Approve → callback → `/approve_publish` → `approveAndPublish` |

```
/write_thread → ApprovalStore (pending)
     ├─ POST /approval/:id/approve + { publish: true }  → approve + publish
     ├─ POST /approval/:id/approve → /publish_telegram    → hai bước
     └─ /approve_publish (Telegram DM / command)          → approveAndPublish

JobWorker research|market_summary → publishDraftToAdmin → nút approve → /approve_publish
```

---

## 15. Job Queue & Job Worker

### JobQueue (`logs/jobs.json`)

| Method | Behavior |
|--------|----------|
| `enqueue(type, payload)` | Append job `status: pending` |
| `dequeue()` | First pending → `running` |
| `update(id, partial)` | Merge fields |
| `list(status?)` | Filter optional |
| `prune(200)` | Giữ 200 job cuối (chưa gọi tự động trong worker) |

### JobWorker

- Poll interval: **5000ms**
- `busy` flag — không dequeue song song
- Handler không đăng ký → `failed` + error message
- Success → `status: done`, lưu `result`
- Throw → `status: failed`, lưu `error`

### Handlers đăng ký trong index.ts

| job.type | Handler |
|----------|---------|
| `research` | `research.process()` → nếu success + reply → `publishDraftToAdmin` |
| `market_summary` | tương tự research |
| `write_thread` | `threadWriter.process()` — **không** gửi admin DM |
| `daily_report` | `dailyReport.process()` — chỉ enqueue sub-jobs |

**Lưu ý:** `JobType` có `'publish'` nhưng **không có handler** đăng ký.

---

## 16. Cron Scheduler

**File:** `src/scheduler/CronScheduler.ts`  
**Storage:** `logs/schedules.json`

- `start()`: skip nếu `NODE_ENV === 'test'`
- `add()`: validate cron bằng `cron.validate()`
- `mount()`: mỗi schedule một `node-cron` task; update `last_run` khi fire
- Callback trong index: `JobQueue.enqueue(schedule.job_type, schedule.payload)`

### REST (`/schedule`)

- `GET /` — list
- `POST /` — create (name, cron, job_type, payload)
- `DELETE /:id` — remove + unmount

---

## 17. Execution Trace & Observability

### ExecutionContext

Tạo bởi `createContext({ user, source, project?, mock_llm?, command? })`:
- `trace_id`: UUID
- `steps[]`: mutable array

### TraceStep

Mỗi agent gọi `addStep(ctx, { agent, action, input?, output?, duration_ms })` — auto thêm `ts`.

### TraceRecord

`finalize(ctx, status, command)` → lưu `logs/traces/{trace_id}.json`

### FileLogger

- `logs/agent.log` — append sync
- Levels: info, error, command

### REST trace

- `GET /trace` — 20 trace_id gần nhất
- `GET /trace/:id` — full record

---

## 18. HTTP API

### Security

```
Middleware (sau cors + json):
  if path === '/health' → next()
  else if header['x-agent-secret'] !== ENV.AGENT_SHARED_SECRET → 401
```

### Endpoints

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| GET | `/health` | No | `{ status: 'OK', agent, timestamp }` |
| POST | `/command/command` | Yes | Body: `{ command, user?, source?, payload?, project? }` |
| POST | `/agent/command` | Yes | Alias backward compat |
| GET | `/trace`, `/trace/:id` | Yes | |
| POST | `/ingest` | Yes | `{ title, content, source?, tags? }` |
| GET | `/rag/search?q=&limit=` | Yes | |
| GET | `/rag/documents?limit=` | Yes | |
| GET | `/queue`, `/queue/:id` | Yes | |
| POST | `/queue/enqueue` | Yes | `{ type, payload? }` |
| GET | `/approval`, `/approval/:id` | Yes | |
| POST | `/approval/:id/approve` | Yes | Body optional `{ reviewed_by }` |
| POST | `/approval/:id/reject` | Yes | |
| GET | `/schedule` | Yes | |
| POST | `/schedule` | Yes | |
| DELETE | `/schedule/:id` | Yes | |

### Response command chuẩn

```json
{
  "status": "success|error|blocked",
  "reply": "markdown string",
  "next_actions": [],
  "agent": "AgentName",
  "trace_id": "uuid"
}
```

Supervisor còn trả `trace` object khi gọi trực tiếp (HTTP route strip và chỉ trả fields trên).

---

## 19. Telegram Integration

### TelegramClient

- `sendMessage` — parse_mode Markdown
- `sendMessageWithButtons` — inline_keyboard
- `answerCallbackQuery` — toast cho user
- `editMessageText` — cập nhật message sau approve/reject (bỏ keyboard implicit)

### TelegramReceiver

**Start conditions:** có `TELEGRAM_BOT_TOKEN` AND `MOCK_LLM !== '1'`

**Message handling:**
1. Chỉ text bắt đầu `/`
2. Strip bot suffix: `/research@MyBot` → `/research`
3. Args → `payload.topic` và `payload.text`
4. `processor.process(command, payload, { user: from.id, source: 'telegram' })`
5. Reply qua `TelegramClient.sendMessage(chatId, result.reply)`

**Callback handling:**
- `approve:{id}` → `/approve_publish` + `payload.approval_id`
- `reject:{id}` → `/reject_publish`
- Edit original message thêm tag `✅ APPROVED` hoặc `❌ REJECTED`

---

### Bot-to-Bot Communication

- Telegram cho phép Bot-to-Bot Communication Mode trong các cuộc trò chuyện riêng tư giữa bots và trong nhóm chat nếu bot được nhắc đến bằng `@otherbot` hoặc reply trực tiếp.
- Nếu dùng bot-to-bot để phối hợp `linhcau79_ok` với helper bot/admin bot, cần bật tính năng này cho cả sender và receiver trong `@BotFather`.
- `TelegramReceiver` đã xử lý `/command@MyBot` và có thể tiếp nhận lệnh bot gửi đến, nên hệ thống cơ bản đã tương thích với kịch bản bot-to-bot command.
- Quan trọng: phải có biện pháp chống vòng lặp và spam:
  - deduplicate repeated messages
  - rate limit replies mỗi bot
  - giới hạn độ sâu tương tác hoặc timeout cho mỗi chuỗi bot-to-bot
- Do dự án hoạt động chính trên Telegram, bot-to-bot là một khả năng hữu ích để mở rộng coordination, nhưng chỉ bật khi đã test và kiểm soát chặt chẽ.

---

## 20. Type Contracts (`src/types/index.ts`)

**Quy tắc:** File này **không import** từ `src/`. Mọi module import types từ đây.

### Các type quan trọng

- `AgentRole` — union 13 roles
- `SubAgent` — `{ name, role, process(message, ctx) }`
- `AgentResponse` — có optional `meta`
- `Job`, `JobType`, `JobStatus`
- `ApprovalRequest`
- `RAGDocument`, `RAGSearchResult`
- `Article`, `MarketData` (với `extra.candles_5d`)
- `RoutingDecision`, `SafetyDecision`

Khi thêm command mới: cập nhật **4 nơi**:
1. `src/types/index.ts` — nếu cần role mới
2. `src/config/commands.ts` — COMMANDS
3. `src/agents/RouterAgent.ts` — COMMAND_ROUTES
4. Agent implementation + E2E test case

---

## 21. Persistence — File vs Supabase

### File-based (always active)

| File | Nội dung |
|------|----------|
| `logs/agent.log` | Text logs |
| `logs/memory.json` | L2 memory |
| `logs/jobs.json` | Job queue |
| `logs/approvals.json` | Approval queue |
| `logs/rag/documents.json` | RAG docs |
| `logs/schedules.json` | Cron schedules |
| `logs/traces/*.json` | Per-request traces |

### Supabase (optional)

Schema: `db/schema.sql`

| Table | Dùng bởi |
|-------|----------|
| `command_logs` | SupervisorAgent sau mỗi command |
| `agent_events` | Mỗi trace step |
| `agent_memory` | **Schema có, code chưa sync L2→Supabase** |
| `approval_requests` | **Schema có, runtime dùng file** |
| `jobs`, `rag_documents`, `schedules` | **Schema có, runtime dùng file** |

→ Supabase hiện chủ yếu cho **audit/observability**, không phải source of truth runtime.

---

## 22. Biến môi trường

| Biến | Bắt buộc | Mô tả |
|------|----------|-------|
| `AGENT_SHARED_SECRET` | **Có** | API auth header |
| `PORT` | Không | Default 3000 |
| `NODE_ENV` | Không | `test` tắt cron seed |
| `MOCK_LLM` | Không | `1` = mock tất cả external + tắt TelegramReceiver |
| `SUPABASE_URL` | Không | |
| `SUPABASE_SERVICE_ROLE_KEY` | Không | |
| `ANTHROPIC_API_KEY` | Không | |
| `ANTHROPIC_MODEL` | Không | |
| `APIFY_API_TOKEN` hoặc `APIFY_TOKEN` | Không | |
| `TELEGRAM_BOT_TOKEN` | Không | |
| `TELEGRAM_CHAT_ID` | Không | Channel/group publish |
| `ADMIN_TELEGRAM_CHAT_ID` | Không | DM nhận draft scheduler |

Template: `.env.example`

---

## 23. Runtime G: → C: (`scripts/runtime.js`)

**Vấn đề:** Project có thể nằm trên Google Drive (`G:\...`) không có `node_modules` ổn định.

**Giải pháp:**
1. `robocopy` source → `C:\lungmat_agent` (exclude node_modules, dist, logs, .git, .env trong robocopy)
2. Copy `.env` riêng từ G: sang C:
3. Chạy `npx <command>` trong `C:\lungmat_agent`

**Lưu ý ApifyClient:** `resolveToken()` đọc `process.env` mỗi lần gọi (không chỉ ENV lúc module load) — tránh miss token khi .env copy muộn.

---

## 24. Testing

### E2E (`npm run test:e2e-local`)

- Port **3099** (không 3000)
- Spawn server với `MOCK_LLM=1` (typical)
- **39 test cases**: health, auth, mọi command agent, RAG, queue, approval flow, research mock tag, doc_id
- Output mong đợi: `HTTP 200, PASSED`

### Typecheck

`npm run typecheck` → `tsc --noEmit`

### DB scripts

| Script | Mục đích |
|--------|----------|
| `db:check` | Kiểm tra Supabase connection |
| `db:seed` | Seed data |
| `db:test-log` | Test insert logs |

---

## 25. Mở rộng hệ thống

### Thêm slash command mới

1. Implement logic trong agent mới hoặc skill
2. `RouterAgent.COMMAND_ROUTES[cmd] = role`
3. `config/commands.ts` entry
4. Đăng ký agent trong `index.ts` → `SupervisorAgent` constructor list
5. E2E case trong `scripts/e2e-local.ts`
6. Cập nhật **file architecture.md này**

### Thêm job type mới

1. Thêm vào `JobType` union trong types
2. `jobWorker.register('new_type', handler)` trong index.ts
3. Optional: schedule REST validation list

### Thêm integration

- Tạo `src/integrations/XClient.ts`
- Pattern: `isMock()`, real API, FileLogger diagnostics
- Agent gọi client, không gọi axios trực tiếp

### Chuyển file store → Supabase

- Thay `load/save` trong store tương ứng
- Giữ interface `ApprovalStore`, `JobQueue`, etc.
- Schema đã có sẵn trong `db/schema.sql`

---

## 26. Trạng thái phase & tài liệu liên quan

| Tài liệu | Nội dung |
|----------|----------|
| `PROJECT_STATUS.md` | **SSOT** trạng thái dự án |
| `docs/PHASE_STATUS.md` | Phase closed / GoClaw pilot active |
| `docs/NEXT_STEPS.md` | Redirect → GoClaw Alpha pilot |
| `docs/GOCLAW_ALPHA_PILOT_CHECKLIST.md` | Pilot checklist 1 trang |
| `docs/SOP_GoClaw_Zernio_PUBLISH.md` | Publish prod GoClaw + Zernio |
| `docs/goclaw-export/` | Skill paste GoClaw UI (Linh Cẩu, Alpha Writer, CSKH) |
| `docs/GOCLAW_RUNTIME_GUIDE.md` | Map repo ↔ GoClaw + MCP Cursor |
| `docs/XAUUSD_MEDIA_OS.md` | Constitution §2.5 topology |
| `docs/DEPLOY.md` | lungmat VPS — archive/reference |
| `docs/SOP_TYPEFULLY_HANDOFF.md` | Typefully legacy backup |

### Đã verify (production-adjacent)

- Telegram publish thật sau approval
- Apify real khi có `APIFY_API_TOKEN`
- Yahoo Finance cho XAUUSD market data

### Known gaps / technical debt

1. **RAG** keyword-only — chưa vector DB
3. **Router** chưa LLM intent classification
4. **Supabase tables** jobs/approvals/memory — schema without runtime sync
5. **HermesAgent** legacy dead code
6. **ToolRegistry** đăng ký trong index nhưng agents không gọi `tools.call()` trực tiếp
7. **Job type `publish`** — không có handler
8. Tickers ngoài `YAHOO_SYMBOL_MAP` vẫn dùng Google scrape / mock

---

## Phụ lục A — Sequence: Telegram user gửi `/research gold`

```
User → Telegram API
  → TelegramReceiver.handleUpdate
  → command="/research", payload={ topic: "gold", chat_id }
  → SupervisorAgent.process
      → RouterAgent → research
      → SafetyAgent → approved (low risk)
      → ResearchAgent
          → ApifyClient.scrapeNews
          → RAGStore.ingest
      → finalize trace, TraceStore.save
      → logCommand (async)
  → TelegramClient.sendMessage(chatId, reply)
```

---

## Phụ lục B — Checklist cho AI khi sửa bug

- [ ] Đọc `src/types/index.ts` trước
- [ ] Command có trong `RouterAgent` không?
- [ ] Mock mode: `MOCK_LLM=1` behavior có đúng không?
- [ ] Publish có đi qua approval đúng đường A/B không?
- [ ] File `logs/` có bị corrupt JSON không?
- [ ] E2E: chạy `npm run test:e2e-local`
- [ ] Cập nhật section liên quan trong **architecture.md**

---

*End of architecture document.*
