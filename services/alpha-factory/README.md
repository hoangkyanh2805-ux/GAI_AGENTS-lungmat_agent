# Alpha Factory (Layer 1)

Python: RSS → Claude Haiku → `pack.json` → POST n8n webhook `content-ready`.

**Hướng dẫn đầy đủ:** [`docs/ALPHA_FACTORY_SETUP_GUIDE.md`](../../docs/ALPHA_FACTORY_SETUP_GUIDE.md)

## Quick start

```powershell
cd services/alpha-factory
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# Điền ANTHROPIC_API_KEY; N8N_WEBHOOK_URL sau khi Active n8n workflow
python main.py --dry-run
python main.py
```

## Files

| File | Vai trò |
|------|---------|
| `main.py` | CLI + webhook POST |
| `fetcher.py` | RSS / NewsAPI headlines |
| `packer.py` | Anthropic Haiku → pack |
| `validator.py` | Compliance |
| `prompts/alpha_writer.md` | System prompt |

n8n: `workflows/alpha-m0.webhook-intake.json` (import, không dùng template có Claude Writer).
