# Next Steps — XAUUSD Media OS

> **SSOT:** [`PROJECT_STATUS.md`](../PROJECT_STATUS.md)  
> **Cập nhật:** 2026-05-19 — pivot GoClaw + Zernio

---

## Ưu tiên #1 — GoClaw Alpha pilot (Cowork)

Làm theo checklist 1 trang:

**[`docs/GOCLAW_ALPHA_PILOT_CHECKLIST.md`](./GOCLAW_ALPHA_PILOT_CHECKLIST.md)**

Handoff Claude Cowork: [`docs/briefs/goclaw-alpha-pilot-cowork-brief.md`](./briefs/goclaw-alpha-pilot-cowork-brief.md)

| Bước | Việc |
|------|------|
| P1 | Vault 38 docs → GoClaw |
| P2 | Zernio connect X `@AlphaTrading79` + Threads |
| P3 | `@zernio/cli` trên GoClaw Nodes |
| P4 | OpenAI gpt-image-2 provider |
| P5 | Agent Alpha Writer + Skill paste |
| P6 | Cron 08:00 VN |
| P7 | E2E: draft → OK → Zernio post + ảnh |

SOP publish: [`SOP_GoClaw_Zernio_PUBLISH.md`](./SOP_GoClaw_Zernio_PUBLISH.md)

---

## Ưu tiên #2 — Verify lungmat (local dev)

| Việc | Doc |
|------|-----|
| `/coach` admin + non-admin | [`VERIFY_LIVE_TELEGRAM.md`](./VERIFY_LIVE_TELEGRAM.md) |
| `/content alpha` regression (optional) | [`SOP_TYPEFULLY_HANDOFF.md`](./SOP_TYPEFULLY_HANDOFF.md) |

---

## Không làm trong pilot

- n8n cron → `/content`
- lungmat VPS production deploy (Phase 7D prod)
- Phase 8 pgvector trên lungmat
- Facebook / Genio CLI
- Auto-post không duyệt admin

---

## Sau pilot Alpha pass

1. Clone Skill → Raymond (13:00) + VIP10X (19:00)
2. Cập nhật `PROJECT_STATUS` + worklog
3. Quyết SalesMartly wire-up hay giữ skeleton

---

## Trạng thái phase (tóm tắt)

Xem chi tiết: [`PHASE_STATUS.md`](./PHASE_STATUS.md)

| Phase | Trạng thái |
|-------|------------|
| 1–7C lungmat | Closed (verify live) |
| GoClaw + Zernio pilot | **Active** |
| 7D lungmat VPS | Paused |
| 8–10 | Re-scope / archive |
