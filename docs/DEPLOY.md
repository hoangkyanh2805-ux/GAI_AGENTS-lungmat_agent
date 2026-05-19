# Deploy — Lungmat Agent (VPS + Docker)

> Phase 6 production guide. Verify live trước: [NEXT_STEPS.md](./NEXT_STEPS.md).  
> Chi phí / spec VPS: [PHASE_6_PLAN.md](./PHASE_6_PLAN.md).  
> **Supabase (optional L3 storage):** [DEPLOY_SUPABASE.md](./DEPLOY_SUPABASE.md) — bắt buộc khi Phase 8A trở đi.

---

## 1. Yêu cầu VPS

| | |
|--|--|
| OS | Ubuntu 22.04 LTS (khuyến nghị) |
| RAM | ≥ 1 GB |
| CPU | 1 vCPU |
| Disk | ≥ 10 GB |
| Phần mềm | Docker Engine 24+ và Docker Compose v2 |

```bash
# Ubuntu — cài Docker (official)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# logout/login lại
```

---

## 2. Chuẩn bị project trên VPS

```bash
git clone <YOUR_REPO_URL> lungmat-agent
cd lungmat-agent
cp .env.example .env
nano .env   # điền secrets — xem NEXT_STEPS.md
```

### `.env` bắt buộc (production)

```env
PORT=3000
AGENT_SHARED_SECRET=<random-long-secret>
NODE_ENV=production
MOCK_LLM=0

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
ADMIN_TELEGRAM_CHAT_ID=

ANTHROPIC_API_KEY=
APIFY_API_TOKEN=

# Supabase L3 storage — recommend cho VPS production (audit trail xuyên restart)
# Phase 8A trở đi: REQUIRED cho vector RAG (pgvector)
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Không** commit `.env` lên Git.

---

## 2.5. Setup Supabase database (recommend cho VPS)

> Detail SOP: [DEPLOY_SUPABASE.md](./DEPLOY_SUPABASE.md).
> Optional cho Phase 1-7; **required từ Phase 8A** (vector RAG).

Quick setup (3 bước, ~10 phút):

1. **Tạo project** — https://supabase.com → New project → region Singapore/Tokyo → Free tier.
2. **Apply schema** — Dashboard → **SQL Editor** → paste toàn bộ [SUPABASE_SCHEMA.sql](./SUPABASE_SCHEMA.sql) → Run. Verify Table editor có `command_logs` + `agent_events`.
3. **Lấy credentials** — Project Settings → API → copy `Project URL` + `service_role` key vào `.env` (block ở §2 trên).

⚠️ **service_role key bypass RLS** — chỉ để server, không lộ frontend.

**Phase 8A sau này thêm:**

```sql
-- Khi 8A merge:
CREATE EXTENSION IF NOT EXISTS vector;
\i supabase/migrations/0001_phase8_documents.sql
\i supabase/migrations/0002_phase8_entities.sql
```

Hardening (RLS, backup, monitor) trước khi expose internet: [DEPLOY_SUPABASE.md §7](./DEPLOY_SUPABASE.md).

---

## 3. Chạy bằng Docker Compose

```bash
docker compose build
docker compose up -d
docker compose ps
docker compose logs -f agent
```

### Kiểm tra

```bash
curl -s http://localhost:3000/health
# {"status":"OK",...}
```

Từ máy khác (nếu mở firewall):

```bash
curl -s -H "x-agent-secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"command":"/debug_env","user":"ops","source":"deploy","payload":{}}' \
  http://VPS_IP:3000/command/command
```

### Cập nhật version

```bash
git pull
docker compose build --no-cache
docker compose up -d
```

---

## 4. Dữ liệu runtime (`logs/`)

Volume mount `./logs:/app/logs` giữ:

- `jobs.json`, `approvals.json`, `rag/`, `traces/`, `schedules.json`, `agent.log`

Backup định kỳ:

```bash
tar -czf lungmat-logs-$(date +%F).tar.gz logs/
```

### Log rotation (gợi ý)

```bash
# /etc/logrotate.d/lungmat-agent
/path/to/lungmat-agent/logs/agent.log {
  weekly
  rotate 4
  compress
  missingok
  notifempty
  copytruncate
}
```

---

## 5. Firewall

Agent chủ yếu **outbound** (Telegram long-poll, Yahoo, Apify, Anthropic).

| Cần mở | Khi nào |
|--------|---------|
| Inbound TCP 3000 | Chỉ nếu gọi HTTP API từ ngoài; có thể **đóng** nếu chỉ dùng Telegram |
| Outbound 443 | Luôn cần |

```bash
sudo ufw allow OpenSSH
# optional:
# sudo ufw allow 3000/tcp
sudo ufw enable
```

---

## 6. Chạy không Docker (Node trực tiếp)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
cd lungmat-agent
npm ci
npm run build:ci
npm run start:ci
```

### systemd example

`/etc/systemd/system/lungmat-agent.service`:

```ini
[Unit]
Description=Lungmat Agent
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/lungmat-agent
EnvironmentFile=/home/ubuntu/lungmat-agent/.env
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now lungmat-agent
sudo journalctl -u lungmat-agent -f
```

---

## 7. CI (GitHub Actions)

Workflow: `.github/workflows/ci.yml`

- `typecheck:ci` + `test:e2e:ci` (MOCK_LLM=1)
- `docker build` trên mỗi push/PR

Local giống CI:

```bash
npm ci
npm run typecheck:ci
MOCK_LLM=1 AGENT_SHARED_SECRET=dev_secret_lungmat_ci npm run test:e2e:ci
```

---

## 8. Windows dev vs Linux production

| Môi trường | Lệnh |
|------------|------|
| Windows (G: drive) | `npm run dev` → `scripts/runtime.js` sync sang `C:\lungmat_agent` |
| Linux VPS / Docker | `docker compose up` hoặc `npm run build:ci && npm run start:ci` |

---

## 9. Troubleshooting

| Vấn đề | Xử lý |
|--------|--------|
| Container restart loop | `docker compose logs agent` — thường thiếu `AGENT_SHARED_SECRET` |
| Cron không chạy | Một instance duy nhất; `NODE_ENV` không phải `test` |
| Không DM admin | `ADMIN_TELEGRAM_CHAT_ID` + `hasAdminChatId` trong `/debug_env` |
| Healthcheck fail | Đợi 20s sau start; kiểm tra port 3000 trong container |

---

## 10. Checklist go-live VPS

- [ ] `.env` production (`MOCK_LLM=0`)
- [ ] Supabase project setup (§2.5) — schema apply, env vars set
- [ ] `docker compose up -d` healthy
- [ ] `/health` OK
- [ ] `/debug_env` → `hasAdminChatId: true`, log không có `[WARN] Supabase not configured`
- [ ] Supabase `command_logs` có row sau `/debug_env` (smoke test L3)
- [ ] Một vòng publish thật (SOP / NEXT_STEPS)
- [ ] Sau 24h: cron + DM admin hoạt động, `agent_events` đếm tăng
- [ ] RLS re-enabled trước khi expose port 3000 ra internet ([DEPLOY_SUPABASE.md §7a](./DEPLOY_SUPABASE.md))

### Sau khi Phase 8A merge

- [ ] `CREATE EXTENSION vector` + migration `0001/0002_phase8_*.sql`
- [ ] `VOYAGE_API_KEY` set
- [ ] `/rag_search` semantic test pass
