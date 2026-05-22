# n8n Media pipeline config

| File | Mục đích |
|------|----------|
| [`brands.json`](./brands.json) | Alpha / Raymond / VIP — Zernio IDs, cron, Telegram, output paths |
| [`prompts/alpha-writer-system.md`](./prompts/alpha-writer-system.md) | System prompt M0 (merge với SKILL) |
| [`schemas/alpha-content-pack.schema.json`](./schemas/alpha-content-pack.schema.json) | Output Writer agent |
| [`schemas/alpha-run.schema.json`](./schemas/alpha-run.schema.json) | Full run (all stages) |
| [`examples/alpha-run.example.json`](./examples/alpha-run.example.json) | Mẫu file JSON tổng |

**Doc:** [`docs/MEDIA_PIPELINE_N8N_M0.md`](../docs/MEDIA_PIPELINE_N8N_M0.md)  
**Checklist Flow A (GDrive canvas):** [`docs/N8N_ALPHA_FLOW_A_GDRIVE.md`](../docs/N8N_ALPHA_FLOW_A_GDRIVE.md)  
**Checklist Flow B (Claude + Zernio):** [`docs/N8N_ALPHA_FLOW_B_CLAUDE_ZERNIO.md`](../docs/N8N_ALPHA_FLOW_B_CLAUDE_ZERNIO.md)  
**Chia 5 khối (infographic n8n):** [`docs/N8N_CHIA_DE_TRI_ALPHA.md`](../docs/N8N_CHIA_DE_TRI_ALPHA.md)  
**Workflow import (Flow B):** [`workflows/alpha-m0.template.json`](../../workflows/alpha-m0.template.json)

Import `brands.json` trong n8n bằng **Read Binary File** hoặc **Set** node (load at workflow start). Template M0 đang hardcode Alpha IDs trong node **Init Config** — đồng bộ với `brands.json` khi đổi account.
