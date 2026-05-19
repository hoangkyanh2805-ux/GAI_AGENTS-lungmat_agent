# Implementation Roadmap — Phase 7D → 10

> Roadmap full đến "xong enterprise" (~5-6 tháng realistic).
> **Generated:** 2026-05-17 (Claude Code, Plan agent + 7 founder decisions).
> **Sources:** [PROJECT_STATUS.md](../PROJECT_STATUS.md) · [PHASE_8_PLAN.md](./PHASE_8_PLAN.md) · [ROADMAP.md](./ROADMAP.md) · [architecture.md](./architecture.md).

---

## 1. Decisions chốt 2026-05-17 (KHÔNG re-debate)

| # | Quyết định | Lựa chọn | Lý do |
|---|---|---|---|
| 1 | **Queue backend Phase 9.1** | **BullMQ + Redis** | Persist, retry/backoff built-in, dashboard sẵn. Redis = 1 container compose thêm. |
| 2 | **Multi-LLM fallback Phase 9.3** | **Anthropic → OpenAI gpt-4o-mini → Gemini cold backup** | Anthropic persona few-shot tune; OpenAI rẻ + latency comparable; Gemini cold. Voyage embedding độc lập. |
| 3 | **X / Threads API Phase 10.4/10.5** | **GIỮ Typefully cho v1** (DROP 10.4 + 10.5) | Typefully workflow smooth; X API v2 paid $100+/mo, Threads Graph rate-limited. Migrate khi >30 post/ngày × 3 brand. Tiết kiệm ~$1.2K/năm. |
| 4 | **VPS Phase 10.3** | **123host VPS** (`103.97.126.117`, AlmaLinux 8 Minimal, 2 CPU / 4 GB / 60 GB, SSH port `2018`) | Đã có sẵn. Domain `hoa-homes.com` ở inet.vn, subdomain `agent.hoa-homes.com` cho production. |
| 5 | **Monitoring Phase 10.6** | **Tự build `/coach metrics` + Supabase Studio SQL queries + TG alert** | Không dựng Prometheus/Grafana (tiết kiệm RAM/disk VPS 4GB). Reuse CoachAgent + ApprovalStore pattern. Setup ~3-5 ngày thay vì 1 tuần. |
| 6 | **Signal engine 9.5 audience** | **Internal sale team only** (separate `TELEGRAM_CHAT_ID_SIGNAL`) | Không public — tránh trading advice liability + scam regulation. Founder approve mỗi signal trước DM. |
| 7 | **Multi-step loop 9.6 cap** | **5 step + approval gate giữa step 2-3** | Reuse `ApprovalStore`. Chống infinite loop, giữ human-in-loop. |
| 8 | **Telegram mode + TLS (mới chốt)** | **Webhook + Cloudflare proxy + Origin Cert** | Bên kỹ thuật setup webhook → bắt buộc HTTPS. Cloudflare proxy free + DDoS + Origin Cert 15 năm. Đổi nameserver `hoa-homes.com` inet → CF. Thêm task **7D-5: Switch to webhook mode** (~0.5-1 ngày code). |

---

## 2. Resources có sẵn (2026-05-17)

### VPS production
- Provider: **123host** (Việt Nam)
- IP: **`103.97.126.117`**
- SSH: `ssh -p 2018 root@103.97.126.117` (port custom `2018`)
- OS: **AlmaLinux 8 Minimal 64-bit**
- Spec: 2 CPU / 4 GB RAM / 60 GB SSD
- Status: Active (uptime fresh)

### Domain
- Registrar: **inet.vn**
- Apex: **`hoa-homes.com`**
- Production subdomain: **`agent.hoa-homes.com`** (cho webhook + HTTP API)
- Nameserver: hiện inet — sẽ chuyển sang **Cloudflare** (decision #8)

### TLS strategy (decision #8)
- **Cloudflare proxy + Origin Cert** (free, 15 năm). Workflow:
  1. Đăng ký tài khoản Cloudflare free
  2. Add site `hoa-homes.com` vào CF
  3. Đổi nameserver bên inet sang CF nameserver (2 NS records CF cấp)
  4. Tạo DNS A record `agent` → `103.97.126.117`, **proxy ON** (icon cam)
  5. CF dashboard → SSL/TLS → Origin Server → Create Origin Certificate (15 năm)
  6. Lưu cert + key vào VPS `/etc/ssl/cloudflare/` (Caddy/Nginx load)
  7. SSL/TLS mode: **Full (Strict)** để CF verify origin cert
- Browser ↔ Cloudflare: TLS auto (Universal SSL)
- Cloudflare ↔ VPS: TLS với Origin Cert (15 năm không phải renew)

### Setup checklist 10.3 (founder + Claude Code)
- [ ] Đăng ký Cloudflare free, add `hoa-homes.com`
- [ ] Đổi nameserver inet → CF (propagate 1-24h)
- [ ] DNS A record `agent.hoa-homes.com` → `103.97.126.117` proxy ON
- [ ] Tạo Origin Cert 15 năm trên CF dashboard
- [ ] SSH vào VPS: `ssh -p 2018 root@103.97.126.117`
- [ ] Tạo user non-root (security), SSH key auth, disable password login
- [ ] `dnf install` Docker + Docker Compose plugin (AlmaLinux 8)
- [ ] Firewall (firewalld): mở port 2018 (SSH), 80, 443. Đóng còn lại
- [ ] Cài Caddy hoặc Nginx, mount Origin Cert
- [ ] Tạo Telegram bot mới (BotFather → `/newbot`)
- [ ] Set bot privacy mode: `/setprivacy` → **Enable**
- [ ] `setWebhook` API call với secret token (sau khi 7D-5 code merge + deploy)

### API keys cần tạo (theo phase)
- **Phase 8A:** Voyage AI API key (signup voyageai.com) — embedding
- **Phase 9.3:** OpenAI API key (`gpt-4o-mini` access), Gemini API key (Google AI Studio)
- **Phase 10.8:** Typefully API key (đã có optional, dùng cho engagement stats)

---

## 3. Executive summary

Critical path: Track B `/coach` verify → 7D-1 (cron) parallel 7D-2 (disable market_summary cron) → Phase 8 sequential 8A → 8B → 8C → Phase 9 (6 sub-task) → Phase 10 (7 sub-task sau khi DROP 10.4/10.5). **Realistic total ETA ~5-6 tháng**. Biggest risk: Phase 9 multi-LLM persona drift (Linh Cẩu tune cho Anthropic). Mitigation: test fallback với 10 gold prompt trước khi enable production.

---

## 4. Phase 7D (1-2 ngày)

### Sub-tasks

| ID | Task | Files | Owner | Verify |
|---|---|---|---|---|
| 7D-1 | Seed 3 cron `daily_content_<brand>` (alpha `0 1 * * *` / raymond `0 6 * * *` / vip10x `0 12 * * *` UTC = 8/13/19 VN); thêm `'content'` vào `JobType`; register handler `content` trong `JobWorker`; graceful skip khi chat ID empty | [src/index.ts](../src/index.ts) seed block §161-173 + `jobWorker.register('content', ...)`; [src/types/index.ts](../src/types/index.ts) `JobType += 'content'`; [src/config/brands.ts](../src/config/brands.ts) helper `resolveBrandChatId(brand): string \| null` | **Claude Code** | Restart → `logs/schedules.json` 3 row `daily_content_*`. Force tick raymond → log "graceful skip publish, chat_id empty"; alpha → admin DM 4 buttons |
| 7D-2 | Disable seed `daily_market_summary_morning` + `_evening` DM admin (giữ schedule table, set `enabled:false` — Lego philosophy) | [src/index.ts](../src/index.ts):161-173 | **Cursor** | `logs/schedules.json` 2 row market_summary `enabled:false`. Sau 24h admin không nhận DM |
| 7D-3 | ⏸️ DROP per Q2 (Lego) | — | — | — |
| 7D-4 | Docs post-merge | [docs/PHASE_STATUS.md](./PHASE_STATUS.md), [docs/architecture.md](./architecture.md) §15 Job Queue + §16 Cron, [docs/ai-worklog/INDEX.md](./ai-worklog/INDEX.md) | **Cursor** | Founder confirm render đúng |
| 7D-5 | **Switch to webhook mode** — thêm route `POST /telegram/webhook` (đọc body + dispatch tới `SupervisorAgent`); disable `TelegramReceiver` khi `TELEGRAM_MODE=webhook`; gọi `setWebhook(<url>, <secret>)` khi bot start; verify header `X-Telegram-Bot-Api-Secret-Token`; `.env` thêm `TELEGRAM_MODE`, `TELEGRAM_WEBHOOK_URL=https://agent.hoa-homes.com/telegram/webhook`, `TELEGRAM_WEBHOOK_SECRET` | `src/routes/telegramWebhook.ts` (mới), [src/integrations/TelegramReceiver.ts](../src/integrations/TelegramReceiver.ts) (skip when mode=webhook), [src/index.ts](../src/index.ts) (mount route + `setWebhook` call), [src/config/env.ts](../src/config/env.ts) (thêm 3 ENV), [.env.example](../.env.example) | **Claude Code** | `curl -X POST https://agent.hoa-homes.com/telegram/webhook` với secret header → 200; gửi `/debug_env` qua TG bot → admin DM phản hồi |

### Critical path 7D

1. Founder hoàn Track B verify (`/coach` admin + non-admin reject) — unblock code.
2. Claude Code 7D-1 PR atomic (types + brands helper + JobWorker register + seed).
3. Cursor 7D-2 PR đồng thời (independent region trong `src/index.ts`).
4. Founder restart `npm run dev` + 24h smoke → confirm alpha pack DM 8:00 VN.
5. Cursor 7D-4 docs.

### Risk 7D

- **`ContentAgent.process` expect parse từ slash text** — Job payload `{brand, topic}` cần wrap. Mitigation: handler synthesize `message.content = '/content <brand> <topic>'` + payload (pattern `makeMessage()` ở `src/index.ts:111`).
- **Race 3 cron fire trùng** — đã có `busy` lock trong [src/queue/JobWorker.ts:9,42](../src/queue/JobWorker.ts).

---

## 5. Phase 8 (~3 sprint, ~6 tuần)

Chi tiết: [PHASE_8_PLAN.md](./PHASE_8_PLAN.md) — không re-plan.

| Sub-phase | Scope | ETA | Owner | Dependencies |
|---|---|---|---|---|
| **8A Vector Foundation** | VoyageClient + migration pgvector + RAGStoreV2 drop-in + ENV + RAGAgent swap | ~2 tuần | Claude Code (8A-1/2/3) + Cursor (8A-4/5) | Supabase setup + Voyage key |
| **8B Content Archive** | Hook ingest on approve + backfill script + `/memory_recall` | ~1 tuần | Cursor | 8A done |
| **8C Entity + Stitching** | Migration entities + EntityResolver + ContextStitcher + ContentAgent prepend + `/coach lịch sử` | ~2-3 tuần | Cursor (8C-1/2/3) + Claude Code (8C-4/5) | 8B done, corpus ≥5 doc |

### Dependencies Phase 8

- 7D đóng (cron feeding pipeline)
- Track B `/coach` verified
- Supabase project + schema applied ([DEPLOY_SUPABASE.md](./DEPLOY_SUPABASE.md)) — **P3 task song song trước 8A**, 10-15 phút self-serve
- Voyage AI key

### Risk Phase 8

- Voyage rate limit / outage → RAGStoreV2 fallback `RAG_BACKEND=file` (đã chốt)
- `agent_events` schema gap → đã fix 2026-05-17 trong [SUPABASE_SCHEMA.sql](./SUPABASE_SCHEMA.sql)
- Embedding cost: ~$0.02 lifetime cho corpus 5 doc/ngày × 1 năm — không lo

---

## 6. Phase 9 — Autonomous Ops (~6-8 tuần)

### Sub-tasks

| Sub-task | Files mới | Files sửa | Owner | ETA | Verify |
|---|---|---|---|---|---|
| **9.1 BullMQ + Redis migration** | `src/queue/BullJobQueue.ts`, `src/queue/BullJobWorker.ts`, `supabase/migrations/0003_phase9_job_audit.sql`, `scripts/migrate-jobs-to-bull.ts` | `src/index.ts` (swap behind `QUEUE_BACKEND=bull\|file`), `src/types/index.ts` (+`Job.attempts`, `Job.next_retry_at`), `docker-compose.yml` (+Redis service) | Claude Code | 1.5 tuần | Force-fail 1 job → DB `attempts:3` → DLQ; admin DM alert |
| **9.2 Retry + dead-letter** | `src/queue/RetryPolicy.ts` (exponential 1m/5m/30m) | `src/queue/BullJobWorker.ts` (catch → retry/DLQ), `src/agents/CoachAgent.ts` (+`/coach dead_letter`) | Claude Code | 0.5 tuần | Mock failure → 3 retries → DLQ → `/coach dead_letter` list |
| **9.3 Multi-LLM adapter** | `src/llm/LLMClient.ts` interface, `src/integrations/OpenAIClient.ts`, `src/integrations/GeminiClient.ts`, `src/llm/FallbackChain.ts` | `src/integrations/AnthropicClient.ts` (implement `LLMClient`), 7 agent dùng `LLMClient` thay `AnthropicClient` direct, `src/config/env.ts` (+`OPENAI_API_KEY`, `GEMINI_API_KEY`, `LLM_FALLBACK_ORDER=anthropic,openai,gemini`) | Cursor | 1.5 tuần | Mock anthropic 429 → tự fallback OpenAI; trace step log `provider:'openai', reason:'anthropic_429'` |
| **9.4 Monitoring `/coach`** | `src/monitoring/MetricsCollector.ts`, `supabase/migrations/0004_phase9_metrics_views.sql` (view aggregate `command_logs` + `agent_events`) | `src/agents/CoachAgent.ts` (+`/coach metrics`, `/coach errors`, `/coach health`), [docs/MONITORING.md](./MONITORING.md) | Cursor | 1 tuần | `/coach metrics` → 24h job success/fail; `/coach errors` → recent failures; `/coach health` deep check |
| **9.5 Signal engine** | `src/agents/SignalAgent.ts`, `src/signal/SignalRules.ts` (EMA cross, RSI divergence on Yahoo data), `src/signal/SignalFormatter.ts` | `src/agents/RouterAgent.ts` (+`/signal`), `src/types/index.ts` (+`'signal'` role + JobType), seed cron `signal_scan` mỗi 15min session Á/Âu/Mỹ, `.env.example` (+`TELEGRAM_CHAT_ID_SIGNAL`) | Claude Code | 1.5 tuần | Force trigger → DM sale team channel (entry/SL/TP + ContextStitcher 8C historical thread "tương tự ngày XXX") |
| **9.6 Multi-step agent loop** | `src/orchestration/AgentLoop.ts` (max 5 step: plan→act→observe→reflect→act), `src/orchestration/StepPlanner.ts`, `src/orchestration/Checkpoint.ts` (approval giữa step 2-3) | `src/agents/SupervisorAgent.ts` (delegate khi `intent==='multi_step'`), `src/types/index.ts` (+`LoopState`) | Cursor | 1.5 tuần | `/research_then_content alpha liquidity` → loop research→context→content→approval→publish. Hard stop step 5. |

### Dependencies Phase 9

- Phase 8 đóng (RAGStoreV2 + EntityResolver + ContextStitcher cần cho 9.5 signal context)
- Redis container trong docker-compose (mới 9.1)

### Risk Phase 9

- **Queue migration backward compat:** `logs/jobs.json` legacy có pending. Mitigation: `scripts/migrate-jobs-to-bull.ts` đọc file → enqueue BullMQ một lần.
- **Multi-LLM persona drift:** Linh Cẩu few-shot tune Claude. Mitigation: test fallback path với 10 gold prompt; nếu drift → giữ Anthropic-only cho user-facing, fallback chỉ internal job (research, daily_report).
- **Signal engine liability:** ngầm thành "advice". Mitigation: output prepend disclaimer; signal CHỈ sale team internal, không public.

---

## 7. Phase 10 — Production Deployment (~4-6 tuần, sau drop 10.4/10.5)

### Sub-tasks

| Sub-task | Files mới | Files sửa | Owner | ETA | Verify |
|---|---|---|---|---|---|
| **10.1 Docker prod hardening** | `docker/healthcheck.sh` | `Dockerfile` (+`USER node`, distroless variant optional), `docker-compose.prod.yml` (split prod/dev override), `.dockerignore` review | Cursor | 0.5 tuần | Image <200MB; `docker scan` 0 critical CVE; non-root user |
| **10.2 CI/CD deploy** | `.github/workflows/deploy.yml` (push ghcr.io + SSH deploy VPS), `.github/workflows/release.yml` (semver tag) | `.github/workflows/ci.yml` (+`npm audit`, smoke test post-build hit `/health`) | Claude Code | 0.5 tuần | Tag `v1.1.0` → image push ghcr → VPS pull + restart 5 phút; rollback `docker compose pull <prev>` |
| **10.3 VPS deploy + Caddy + Cloudflare** | `infra/caddy/Caddyfile` (reverse proxy + CF Origin Cert mount), `infra/firewalld.sh` (firewall rule AlmaLinux 8), [docs/PRODUCTION_DEPLOY.md](./PRODUCTION_DEPLOY.md) (step-by-step setup `103.97.126.117`) | `docker-compose.prod.yml` (+Caddy service), `.env.production.example` (Cloudflare paths) | Founder + Claude Code | 1 tuần | `https://agent.hoa-homes.com/health` 200; CF proxy ON; Origin Cert valid 15 năm. VPS `103.97.126.117` AlmaLinux 8 — `dnf install docker docker-compose-plugin`, firewall mở 2018/80/443 |
| ~~10.4 X API direct~~ | DROP | — | — | — | Decision #3 — giữ Typefully |
| ~~10.5 Threads API direct~~ | DROP | — | — | — | — |
| **10.6 Monitoring `/coach` deep** | `src/monitoring/AlertManager.ts`, `src/monitoring/HealthCheck.ts` (deep: DB ping, Voyage ping, Anthropic ping) | `src/routes/health.ts` (deep mode `?deep=1`), `src/index.ts` (cron `health_check` 5min → admin TG alert nếu 3 consecutive fail) | Cursor | 1 tuần | Force kill Supabase → trong 15 phút admin TG: "🚨 Supabase down 3/3 check" |
| **10.7 Failover runbook + drill** | [docs/RUNBOOK_INCIDENT.md](./RUNBOOK_INCIDENT.md) (manual runbook) | Fallback chain đã có từ 9.3 (Anthropic) + 8A (Supabase) | Founder + Cursor | 0.5 tuần | Drill: cắt Voyage → RAG file fallback; cắt Anthropic → LLM fallback OpenAI. Audit log đầy đủ. |
| **10.8 Analytics engagement** | `src/analytics/EngagementCollector.ts` (poll TG reactions + Typefully `/drafts` stats), `supabase/migrations/0005_phase10_engagement.sql` (table `content_metrics`), [docs/ANALYTICS.md](./ANALYTICS.md) | `src/agents/CoachAgent.ts` (+`/coach report tuần` — top pack by engagement; entity_link recommend) | Claude Code | 1 tuần | Sau 7 ngày live: `/coach report tuần` ra top 5 pack reactions; recommend "topic này engage cao, viết variant" |
| **10.9 Worker pool scaling** | `src/queue/WorkerPool.ts` (BullMQ concurrency `WORKER_CONCURRENCY=N`), [docs/SCALING.md](./SCALING.md) | `docker-compose.prod.yml` (`replicas: 2` worker service tách app), `src/index.ts` (worker mode flag `ROLE=worker\|web\|both`) | Cursor | 0.5-1 tuần | Compose `--scale worker=3` → 3 worker pull queue song song; web không seed cron (chỉ ROLE=web) |

### Dependencies Phase 10

- Phase 9 stable (queue + multi-LLM + monitoring foundation)
- Domain name + Cloudflare DNS (founder setup)
- VPS đã có sẵn (`srv-h0mck.server.tld`)
- 7 ngày traffic real sau go-live trước build 10.8 (cần data measure)

### Risk Phase 10

- **VPS VN TLS cert workaround:** Provider VN có thể không support Let's Encrypt native. Mitigation: Cloudflare proxy ON + Origin Certificate (15 năm, free) thay vì Let's Encrypt.
- **Scaling worker race:** BullMQ handle distributed lock — nhưng cron seed cần single-instance. Mitigation: `ROLE=web` flag, chỉ web mount CronScheduler; worker không seed.
- **Founder bandwidth 10.3:** Cần DNS + Cloudflare + SSH. Mitigation: schedule task đầu Phase 10, parallel với 10.1/10.2.

---

## 8. Cross-phase critical path

```
[Track B verify Founder] → [7D-1 Claude Code + 7D-2 Cursor parallel] → [7D-4 docs Cursor]
                                          ↓
                  [Supabase basic setup P3, parallel any time]
                                          ↓
                  [Voyage API key + 8A Vector Foundation]
                                          ↓
                          [8B Content Archive]
                                          ↓
                  [8C Entity + Context Stitching]
                                          ↓
[Phase 9: 9.1 BullMQ + 9.2 retry → 9.3 multi-LLM (parallel) → 9.4 monitor → 9.5 signal → 9.6 loop]
                                          ↓
[Phase 10: 10.1 Docker + 10.2 CI/CD → 10.3 VPS (parallel) → 10.6/10.7/10.8/10.9 (parallel)]
```

## 9. Total ETA + risk matrix

| Phase | Optimistic | Realistic | Pessimistic |
|---|---|---|---|
| 7D | 1 ngày | 2 ngày | 5 ngày (block Track B verify) |
| 8 | 4 tuần | 6 tuần | 10 tuần (Voyage outage / schema redo) |
| 9 | 6 tuần | 8 tuần | 14 tuần (queue migration backward compat) |
| 10 | 4 tuần | 6 tuần | 10 tuần (VPS VN TLS / domain issue) |
| **Total** | **~14 tuần (3.5 tháng)** | **~5-6 tháng** | **~9-10 tháng** |

## 10. Recommendation triển khai trước tiên

**5 task song song tuần này (2026-05-17 → 2026-05-24):**

1. **Founder verify Track B** (`/coach` admin DM + non-admin reject) — 5 phút action, unblock 7D code.
2. **Founder setup Supabase basic** theo [DEPLOY_SUPABASE.md](./DEPLOY_SUPABASE.md) (10-15 phút, P3) — pre-arm Phase 8A.
3. **Founder setup Cloudflare** — đăng ký free, add `hoa-homes.com`, đổi nameserver inet → CF, tạo Origin Cert (~45 phút). DNS propagate 1-24h, làm ngay để khi 7D-5 deploy là sẵn.
4. **Claude Code mở 7D-1 PR** ngay khi (1) pass — atomic `src/index.ts` + `src/types/index.ts` + `src/config/brands.ts`. Cursor 7D-2 PR đồng thời (independent region).
5. **Claude Code mở 7D-5 PR (webhook switch)** — sau khi 7D-1 merge. Route `POST /telegram/webhook` + ENV + skip long-poll khi `TELEGRAM_MODE=webhook`. Chưa enable production cho đến khi VPS deploy 10.3 ready (test local trước bằng ngrok hoặc giữ long-poll cho dev).

**Sau 7D merge + 24h smoke pass:**
- Kích hoạt **Phase 8A** với Claude Code (8A-1/2/3 Voyage + migration + RAGStoreV2) + Cursor (8A-4/5 env + swap).
- 8B + 8C sequential, không re-plan ([PHASE_8_PLAN.md](./PHASE_8_PLAN.md) đủ chi tiết).

**Phase 9-10 long horizon:**
- 9.1 BullMQ + 9.2 retry trước khi mở 9.3 multi-LLM (queue stable trước fan-out provider).
- 10.3 VPS deploy trước 10.6/10.8 (cần traffic real để measure).

---

## 11. Critical files cho implementation (Plan agent reference)

```
src/index.ts                      # 7D-1 seed cron, 10.9 worker mode flag
src/queue/JobWorker.ts            # 7D-1 register handler 'content', 9.1 swap BullMQ
src/queue/JobQueue.ts             # 9.1 swap BullMQ
src/types/index.ts                # 7D-1 JobType += 'content', 9.1 Job.attempts
src/config/brands.ts              # 7D-1 resolveBrandChatId() helper
src/agents/ContentAgent.ts        # 7D-1 callable từ Job payload, 8C ContextStitcher prepend
src/agents/CoachAgent.ts          # 8C lịch sử, 9.2 /coach dead_letter, 9.4 metrics, 10.8 report tuần
src/integrations/AnthropicClient.ts  # 9.3 implement LLMClient interface
docker-compose.yml                # 9.1 Redis, 10.1 prod override, 10.9 worker replicas
.env.example                      # 8A Voyage, 9.3 OpenAI/Gemini, 9.5 SIGNAL chat, 10.3 production
```

---

*Owner roadmap: Founder + Claude Code + Cursor. Cập nhật mỗi phase kết thúc. Source 7 decision không re-debate ở §1.*
