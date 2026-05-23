# oss-forks — LungMat content factory (Layer 1)

> **Winner (Layer 1 core):** [langchain-ai/social-media-agent](https://github.com/langchain-ai/social-media-agent) → clone vào `social-media-agent-lungmat/`  
> **SSOT:** [`docs/ALPHA_OSS_CONTENT_FACTORY_CATALOG.md`](../docs/ALPHA_OSS_CONTENT_FACTORY_CATALOG.md) · [`docs/oss-forks/langchain-social-agent-audit.md`](../docs/oss-forks/langchain-social-agent-audit.md)

## Cấu trúc

| Path | Vai trò | Phase |
|------|---------|-------|
| [`social-media-agent-lungmat/`](./social-media-agent-lungmat/) | Core factory — Alpha (POC) | F0 |
| `social-media-agent-raymond/` | Clone brand 2 | F1 |
| `social-media-agent-vip10x/` | Clone + TradingAgents feed | F2 |
| `social-media-agent-linhcau/` | Edu / digest tone | F1 |
| [`fin-thread-feeder/`](./fin-thread-feeder/) | RSS/news → URL queue | F3 |
| [`prompts/alpha-persona.md`](./prompts/alpha-persona.md) | Persona distill (inject vào LC prompts) | F0 |
| [`.env.alpha.example`](./.env.alpha.example) | Env mẫu Alpha | F0 |

## F0 hooks (2026-05-23)

`social-media-agent-lungmat/src/lungmat/` — persona, webhook-only, Haiku pack → n8n, Telegram notify.  
Chi tiết: [`social-media-agent-lungmat/README.lungmat.md`](./social-media-agent-lungmat/README.lungmat.md)

## Clone (F0)

```bash
cd oss-forks/social-media-agent-lungmat
git clone https://github.com/langchain-ai/social-media-agent.git .
cp ../.env.alpha.example .env
yarn install && yarn langgraph:in_mem:up
```

## Output contract

POST `N8N_WEBHOOK_URL` với body `alpha-content-pack` — xem [`config/n8n/schemas/alpha-content-pack.schema.json`](../config/n8n/schemas/alpha-content-pack.schema.json).

**Không** publish X/LinkedIn trực tiếp từ factory sau fork — n8n + Zernio.
