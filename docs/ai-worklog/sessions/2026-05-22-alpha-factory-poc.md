# Session — Alpha factory POC (Layer 1 + webhook n8n)

> **Date:** 2026-05-22  
> **Agent:** Cowork / Founder  
> **Status:** **POC built** — E2E publish blocked on Zernio HTTP placeholder (fixed in repo doc)

---

## Kết quả

### Layer 1 — `services/alpha-factory/` (Python)

| File | Vai trò |
|------|---------|
| `fetcher.py` | RSS FXStreet, Yahoo Gold, Investing + NewsAPI; filter XAUUSD; dedup |
| `packer.py` | 1× Claude Haiku 4.5 → `pack.json` |
| `validator.py` | Compliance (≤280, no URL, no signal) |
| `main.py` | `python main.py` / `--dry-run` → POST `N8N_WEBHOOK_URL` |
| `prompts/alpha_writer.md` | Persona + schema + 5 rules |

**Không** LangChain fork cho POC — path Python nhẹ hơn F0 (align catalog “ai-twitter-bot rank #6” pattern + Haiku pack).

### Layer 2 — `workflows/alpha-m0.webhook-intake.json`

- Webhook `content-ready` → **Map Intake** (re-validate compliance)
- **Không** Claude Writer node
- TG Preview → Wait Approval → Zernio → Sheet → TG Success
- Context: `$('Map Intake').first().json` xuyên chain

### Test

```bash
cd services/alpha-factory
cp .env.example .env
pip install -r requirements.txt
python main.py --dry-run
python main.py
```

---

## Blocker

| # | Issue | Fix |
|---|-------|-----|
| B1 | Zernio URL/body placeholder `/v1/posts` + `text`/`accountIds` | [`ZERNIO_N8N_HTTP_PUBLISH.md`](../../ZERNIO_N8N_HTTP_PUBLISH.md) + workflow patch |

---

## M0 done criteria (còn)

- [ ] `curl` Zernio REST pass
- [ ] `python main.py` → n8n → TG preview
- [ ] `OK đăng` + optional mediaId → Published trên dashboard
- [x] Commit + push GitHub (`f43e758`, `1162031` trên `main`) — 2026-05-22

---

## Links

- **[`ALPHA_FACTORY_SETUP_GUIDE.md`](../../ALPHA_FACTORY_SETUP_GUIDE.md)** — hướng dẫn từng bước (mở file này trước)
- [`ZERNIO_N8N_HTTP_PUBLISH.md`](../../ZERNIO_N8N_HTTP_PUBLISH.md)
- [`ALPHA_OSS_CONTENT_FACTORY_CATALOG.md`](../../ALPHA_OSS_CONTENT_FACTORY_CATALOG.md)
- [`PILOT_ALPHA_AUDIT_STATUS.md`](../../PILOT_ALPHA_AUDIT_STATUS.md)
