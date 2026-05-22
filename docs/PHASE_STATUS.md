# Phase Status — XAUUSD Media OS

> **SSOT tổng thể:** [`PROJECT_STATUS.md`](../PROJECT_STATUS.md)  
> **Cập nhật:** 2026-05-19

---

## Closed (code + verify live 2026-05-16)

| Phase | Status |
|-------|--------|
| 1–5A | Done — runtime, E2E 39/39, Telegram publish, Apify research |
| 5B | Done — Yahoo, publish unify, SOP |
| 6 macro | Done — MarketSummary 6 sections verify live |
| 6 Docker/CI | Done in repo — `Dockerfile`, `.github/workflows/ci.yml` |
| 7A `/content` | Done — ContentAgent, 3 brand personas, youtube_pack |
| 7B multi-approve | Done — TG / X / Threads approval buttons |
| 7C Typefully handoff | Done — **legacy path**; production pivot → Zernio (below) |

---

## Active — GoClaw + Zernio pilot (2026-05-19)

**Quyết định:** Production content pipeline chuyển sang **GoClaw runtime** + **Zernio publish** (X + Threads + YouTube script).  
**Repo lungmat-agent** = nguồn persona, JSON schema, vault seed, `ImageClient` gpt-image-2 — **không** VPS prod cho content cron.

| Workstream | Status | Doc |
|------------|--------|-----|
| GoClaw Alpha pilot | **In progress** (Cowork) | [`GOCLAW_ALPHA_PILOT_CHECKLIST.md`](./GOCLAW_ALPHA_PILOT_CHECKLIST.md) |
| Vault 38 docs upload | Partial (Founder uploading) | [`vault-seed/README.md`](./vault-seed/README.md) |
| Zernio CLI on GoClaw | In progress | [`SOP_GoClaw_Zernio_PUBLISH.md`](./SOP_GoClaw_Zernio_PUBLISH.md) |
| Alpha Writer Skill | Ready in repo | [`goclaw-export/alpha-content-writer-skill.md`](./goclaw-export/alpha-content-writer-skill.md) |
| gpt-image-2 in ContentAgent | Done in repo | `src/integrations/ImageClient.ts` |
| Raymond / VIP10X Skill | Pending after Alpha pass | clone from `personas/raymond.ts`, `vip10x.ts` |

---

## Paused / Re-scope

| Phase | Status | Note |
|-------|--------|------|
| 7D cron + webhook (lungmat VPS) | **Paused** | Code in `src/index.ts`; GoClaw Cron thay prod |
| 8 Knowledge & Memory (pgvector) | **Re-scope** | GoClaw Vault + Memory |
| 9 Autonomous Ops | Backlog | |
| 10 lungmat VPS deploy | **Archive** | GoClaw `agent.hoa-homes.com` = runtime |
| n8n media pipeline M0 (Alpha) | **Active** | [`MEDIA_PIPELINE_N8N_M0.md`](./MEDIA_PIPELINE_N8N_M0.md) · GoClaw Alpha publish **frozen** |
| Typefully auto-publish | **Legacy backup** | Zernio primary for X/Threads |

---

## Pending verify

| Item | Owner |
|------|-------|
| `/coach` admin + non-admin | lungmat local / Cowork |
| GoClaw Vault smoke 4 câu | Cowork + Founder |
| E2E Alpha: draft → OK → Zernio post | Cowork |

---

## Next (sau Alpha pilot pass)

1. Export Skill Raymond + VIP10X → GoClaw agents
2. Cron 13:00 / 19:00 VN
3. Optional: bridge lungmat `/content` dev test ↔ GoClaw Skill sync
4. SalesMartly: mount route nếu urgent (`SALESMARTLY_ENABLED=0` default)

---

## References

- Constitution: [`XAUUSD_MEDIA_OS.md`](./XAUUSD_MEDIA_OS.md)
- Architecture (lungmat code): [`architecture.md`](./architecture.md)
- AI worklog: [`ai-worklog/INDEX.md`](./ai-worklog/INDEX.md)
