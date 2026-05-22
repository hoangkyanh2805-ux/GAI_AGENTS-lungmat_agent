# social-media-agent-lungmat

Fork workspace cho [langchain-ai/social-media-agent](https://github.com/langchain-ai/social-media-agent).

## Clone (lần đầu)

```bash
git clone https://github.com/langchain-ai/social-media-agent.git .
cp ../.env.alpha.example .env
yarn install
```

## Customize (F0)

Xem [`docs/oss-forks/langchain-social-agent-audit.md`](../../docs/oss-forks/langchain-social-agent-audit.md) §3.

1. Prompts ← `../prompts/alpha-persona.md`
2. Telegram thay Slack
3. `webhook-out` → `alpha-content-pack.json`
4. Không gọi Twitter/LinkedIn publish API

## Run

```bash
yarn langgraph:in_mem:up
yarn generate_post
```

Agent Inbox: https://dev.agentinbox.ai/ — graph `generate_post`, URL `http://localhost:54367`

## Output

POST `N8N_WEBHOOK_URL` — schema [`config/n8n/schemas/alpha-content-pack.schema.json`](../../config/n8n/schemas/alpha-content-pack.schema.json).
