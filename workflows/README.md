# n8n workflows

## M0 = 1 workflow (đủ)

| Workflow | File | Chọn |
|----------|------|------|
| M0 — **Webhook intake (khuyến nghị)** | [`alpha-m0.webhook-intake.json`](./alpha-m0.webhook-intake.json) | Factory POST `content-ready` — **không LLM** |
| M0 — Claude HTTP + Wait (legacy) | [`alpha-m0.template.json`](./alpha-m0.template.json) | Có Writer node — tốn token |
| M0 — fork [n8n #11138](https://n8n.io/workflows/11138) TG loop | [`alpha-m0-11138-telegram.template.json`](./alpha-m0-11138-telegram.template.json) | **Không dùng** — AI loop |
| GDrive list ảnh | canvas cũ / Flow A doc | Tuỳ chọn |

**Chỉ import 1 file.** Fork doc: [`docs/N8N_TEMPLATE_11138_FORK.md`](../docs/N8N_TEMPLATE_11138_FORK.md)

**Một trang setup:** [`docs/N8N_ALPHA_ONE_SHOT.md`](../docs/N8N_ALPHA_ONE_SHOT.md) · **Phase:** [`docs/N8N_ALPHA_PHASES_CHECKLIST.md`](../docs/N8N_ALPHA_PHASES_CHECKLIST.md)

---

## Import (chỉ instance mới)

1. **⋯ → Import from File** → `alpha-m0.template.json`
2. **Không** điền key trong node — xem **Điền key** bên dưới

## Điền key (một lần)

**Settings → Variables** (4 biến):

- `ANTHROPIC_API_KEY`
- `ZERNIO_API_KEY`
- `ZERNIO_API_BASE` = `https://zernio.com/api/v1` (xem [`docs/ZERNIO_N8N_HTTP_PUBLISH.md`](../docs/ZERNIO_N8N_HTTP_PUBLISH.md))
- `N8N_TELEGRAM_ADMIN_CHAT_ID`

**Credentials:** Telegram Bot → 2 node Telegram.

Chi tiết: [`docs/N8N_ALPHA_KEYS_SETUP.md`](../docs/N8N_ALPHA_KEYS_SETUP.md)

## Test

**Manual Trigger** · Cron/Sheet **disabled** · Wait resume:

```json
{ "approved": true, "media_id": "PASTE_ZERNIO_MEDIA_ID", "reply_text": "OK đăng" }
```

## Export backup (sau test OK)

**⋯ → Download** → `alpha-m0.live.json` (local, không commit secret).

**Doc:** [`docs/MEDIA_PIPELINE_N8N_M0.md`](../docs/MEDIA_PIPELINE_N8N_M0.md) · [`config/n8n/brands.json`](../config/n8n/brands.json)
