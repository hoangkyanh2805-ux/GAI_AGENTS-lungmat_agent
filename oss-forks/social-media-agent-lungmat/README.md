# social-media-agent-lungmat

Fork workspace cho [langchain-ai/social-media-agent](https://github.com/langchain-ai/social-media-agent).

## Clone (lần đầu)

```bash
git clone https://github.com/langchain-ai/social-media-agent.git .
cp ../.env.alpha.example .env
yarn install
```

## F0 Alpha (đã commit hooks)

Sau `git clone` upstream, giữ/merge `src/lungmat/` và các patch trong repo.

**Hướng dẫn đầy đủ:** [`README.lungmat.md`](./README.lungmat.md)

```bash
yarn lungmat:pack              # Haiku → n8n (không LangGraph)
yarn generate_post:alpha URL   # graph + HITL → n8n
```

## Run (upstream)

```bash
yarn langgraph:in_mem:up
yarn generate_post:alpha
```

Agent Inbox: https://dev.agentinbox.ai/ — graph `generate_post`, URL `http://localhost:54367`

## Output

POST `N8N_WEBHOOK_URL` — schema [`config/n8n/schemas/alpha-content-pack.schema.json`](../../config/n8n/schemas/alpha-content-pack.schema.json).
