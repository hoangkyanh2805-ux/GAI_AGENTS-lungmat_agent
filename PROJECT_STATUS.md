# PROJECT REPORT - XAUUSD AI Media OS / LungMat Agent

> Single Source of Truth cho Founder, Cowork, Cursor, Claude Code va cac AI session tiep theo.
> Moi session nen doc file nay dau tien, cap nhat cuoi session neu co thay doi trang thai.

**Last updated:** 2026-05-19 (session audit — doc + codebase sync)
**Repo:** `GAI_AGENTS-lungmat_agent` / `lungmat-agent`
**Stack hien tai:** Node 20 + TypeScript + Express + Telegram + Anthropic + Apify + Yahoo + ForexFactory + Supabase optional
**Pivot moi nhat:** GoClaw platform da deploy tren `agent.hoa-homes.com`, nen Phase 8/9/10 can re-scope, khong build trung nhung module GoClaw da co.

**Repo hygiene:** Nhieu file Media OS (Phase 7, Docker/CI, vault-seed, SalesMartly, Coach) van **chua commit** tren git (untracked / modified). Can Founder/Cursor commit theo batch truoc khi CI tren GitHub chay day du.

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
- SalesMartly Hybrid: SOP + route + client skeleton — **chua mount** vao Express, dispatch/human notify con TODO.

Quyet dinh quan trong nhat sau pivot GoClaw: **giu `lungmat-agent` lam primary cho XAUUSD Media OS**, dung GoClaw lam experiment/reference trong 30 ngay, tru khi Founder chot duong migrate khac.

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
| Phase 7C Typefully handoff | Done | Done 2026-05-16 | Closed |
| Phase 7D cron + webhook | **Done in repo** (7D-1 schedules, 7D-5 webhook route) | Not required for GoClaw-primary path | **Paused deploy** — dung neu Founder mo lai lungmat-agent VPS |
| Lung Mat `/coach` | Done | Pending retest | Needs Founder/Cowork verify |
| Phase 8 Knowledge & Memory | Plan done | Not started | Re-scope; GoClaw overlaps |
| GoClaw Vault Seed | 38 docs in repo | Upload count needs confirm | Continue upload/test on GoClaw |
| SalesMartly Hybrid | SOP + route file + client (partial) | Not tested | Mount + wire dispatch |
| Production Deploy (Caddy/VPS) | Docs + `infra/caddy`, compose prod | GoClaw deployed | Archive/reference for lungmat-agent |

---

## 3. What Changed Recently

### 2026-05-19 — Status audit (session nay)

Doi chieu codebase vs report:

| Hang muc | Thuc te trong repo |
|----------|-------------------|
| Phase 7D | `src/index.ts`: cron `daily_content_*` + job `content`; `createTelegramWebhookRouter`, `TELEGRAM_MODE` webhook/longpoll |
| SalesMartly | `SalesMartlyPayload` trong `SalesMartlyClient.ts`; `routePayload` + intent switch co; **khong** `app.use(createSalesMartlyRouter())` trong `index.ts` |
| SalesMartly TODO | `dispatchToAgent`, `notifyHumanHandler` chi log — chua goi Supervisor/Telegram |
| Coach | `CoachAgent` + `isAdminChat` — san sang verify |
| Vault seed | 38 file `.md` (khong tinh README) duoi `docs/vault-seed/` |
| Git | Nhieu path untracked — can commit de khoa CI/history |

### 2026-05-19 — SalesMartly Hybrid (truoc do)

Created/updated:

- `docs/SOP_SalesMartly_Hybrid.md`
- `src/integrations/SalesMartlyClient.ts` (gom `SalesMartlyPayload`)
- `src/routes/salesmartly.ts`
- `src/config/env.ts`: `SALESMARTLY_ENABLED`, `SALESMARTLY_WEBHOOK_SECRET`

Pending:

- Mount `createSalesMartlyRouter()` trong `src/index.ts` (va whitelist public path neu can).
- Implement `dispatchToAgent()` → Supervisor/command path.
- Implement `notifyHumanHandler()` → Telegram admin DM hoac queue.
- Test webhook secret, ACK 200, intent routing, human handoff.
- Mac dinh `SALESMARTLY_ENABLED=0` cho den khi test pass.

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

4. **SalesMartly** — quyet dinh urgency
   - Urgent: mount router + wire dispatch.
   - Khong urgent: giu `SALESMARTLY_ENABLED=0`.

### B. Should Do Next

1. **Roadmap sau GoClaw pivot**
   - Danh dau Phase 8/9/10 + 7D deploy trong `docs/IMPLEMENTATION_ROADMAP.md` la reference/re-scope.
   - `docs/PHASE_STATUS.md` va `docs/NEXT_STEPS.md` **lac phien ban** (van ghi Phase 6 chua bat dau) — nen sync hoac tro PROJECT_STATUS lam SSOT.

2. **Content publishing**
   - Raymond DWH v2: publish-ready (`docs/content-drafts/dwh-pack-raymond.md`).
   - Alpha DWH: can fix (`dwh-pack-alpha.md`).
   - VIP10X: rewrite hoac skip topic hien tai.

3. **Apify 401** — non-blocker; kiem token + credits.

### C. Later

1. Reconcile lungmat-agent vs GoClaw (primary / hybrid / migrate) sau 30 ngay.
2. Phase 8 thay the: adapter lungmat-agent ↔ GoClaw Vault/Memory neu co API.

---

## 5. Decisions Locked

- Brands: Alpha / Raymond / VIP 10X.
- Telegram = bot/channel workflow.
- X + Threads = Typefully handoff, khong auto-post.
- `/content` = entry chinh Media OS content.
- `/coach` = admin-only Lung Mat coach (khong phai Linh Cau runtime).
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
| `PROJECT_STATUS.md` | **SSOT** trang thai du an (file nay) |
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
| `src/routes/salesmartly.ts` | Webhook route (chua mount) |
| `src/integrations/SalesMartlyClient.ts` | Client + `SalesMartlyPayload` |
| `src/agents/CoachAgent.ts` | `/coach` admin coach |
| `src/llm/personaLung.ts` | Lung Mat system prompt |

---

## 8. Next Session Prompt

```text
Doc PROJECT_STATUS.md truoc.
Uu tien:
1. Verify /coach admin + non-admin neu chua lam.
2. Confirm GoClaw Vault 38 docs uploaded + 4 smoke prompts.
3. SalesMartly (neu lam): app.use(createSalesMartlyRouter()) trong index.ts; wire dispatchToAgent + notifyHumanHandler; SALESMARTLY_ENABLED=0 mac dinh.
4. Phase 7D: code da co — chi deploy lungmat-agent VPS neu Founder chot; khong trung build GoClaw.
5. Commit/push batch untracked neu Founder dong y — de CI chay.
6. Cap nhat report cuoi session.
```

---

## 9. Done Definition For Current Loop

Loop dong khi:

- `/coach` pass admin + non-admin live verify.
- GoClaw Vault 38 docs uploaded + 4 smoke prompts pass.
- Founder quyet SalesMartly: skeleton vs active.
- Roadmap docs phan biet ro lungmat-agent vs GoClaw (tranh duplicate).
- (Tuy chon) Media OS batch committed + CI green tren GitHub.
