# social-media-agent-lungmat — Alpha F0

Fork hooks cho [langchain-ai/social-media-agent](https://github.com/langchain-ai/social-media-agent).

## F0 đã có trong repo

| # | Task | Path |
|---|------|------|
| 1 | Persona inject | `LUNGMAT_PERSONA_PATH` → `src/agents/generate-post/prompts/index.ts` |
| 2 | Webhook-only (no X/LI) | `LUNGMAT_WEBHOOK_ONLY=true` → `upload-post`, `auth-socials` |
| 3 | Pack + POST n8n | `src/lungmat/schedule-lungmat.ts` (Haiku → `alpha-content-pack`) |
| 4 | Telegram notify | `src/lungmat/telegram.ts` (thay Slack schedule message) |
| 5 | CLI URL graph | `yarn generate_post:alpha [url]` |
| 6 | CLI pack only | `yarn lungmat:pack` / `--dry-run` |
| 7 | Cron 08:00 VN | `oss-forks/scripts/alpha-cron-08vn.ps1` |

## Setup

```bash
cd oss-forks/social-media-agent-lungmat
cp ../.env.alpha.example .env
# ANTHROPIC_API_KEY, FIRECRAWL_API_KEY, N8N_WEBHOOK_URL, TELEGRAM_*, LUNGMAT_*
yarn install
```

**Windows (không cần `yarn` global):** repo trên Google Drive hay lỗi `yarn install` EPERM → copy folder sang `C:\dev\social-media-agent-lungmat` rồi `yarn install`, hoặc dùng `npx` như dưới.

## Run

**A — Pack CLI (không chạy graph — cùng prompt `alpha_writer.md`):**

```bash
npx tsx scripts/lungmat-pack-cli.ts --dry-run
npx tsx scripts/lungmat-pack-cli.ts
```

**B — LangGraph dev (graph `generate_post`, Studio):**

```powershell
# Terminal 1 — giữ chạy
powershell -ExecutionPolicy Bypass -File oss-forks\scripts\langgraph-dev.ps1
# Studio: https://smith.langchain.com/studio?baseUrl=http://localhost:54367
```

```bash
# Terminal 2 — cần FIRECRAWL_API_KEY
npx tsx scripts/generate-post-alpha.ts "https://www.fxstreet.com/news/..."
```

Hoặc: `yarn langgraph:in_mem:up` nếu `yarn install` đã xong.

Agent Inbox: https://dev.agentinbox.ai/ — graph `generate_post`, port `54367`.

Human approve post → `schedulePost` → Haiku pack → POST n8n → TG notify.

## Output

POST `N8N_WEBHOOK_URL` body `{ brand, run_id, pack }` — schema [`config/n8n/schemas/alpha-content-pack.schema.json`](../../config/n8n/schemas/alpha-content-pack.schema.json).

n8n: `workflows/alpha-m0.webhook-intake.json` (Writer OFF) → TG duyệt → Zernio.

## Done criteria

- [ ] `yarn lungmat:pack` → n8n 200 → TG preview workflow
- [ ] `OK đăng` → Zernio Published
- [ ] Cron 08:00 VN (`alpha-cron-08vn.ps1`)

## Song song Python POC

[`services/alpha-factory`](../../services/alpha-factory) — RSS batch, cùng schema. Dùng khi chưa cần FireCrawl URL.
