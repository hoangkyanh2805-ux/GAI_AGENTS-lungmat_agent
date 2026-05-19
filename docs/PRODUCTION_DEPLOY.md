# Production Deploy — `agent.hoa-homes.com`

> **Target VPS:** `103.97.126.117` (123host AlmaLinux 8 Minimal, 2 CPU / 4 GB / 60 GB).
> **Subdomain:** `agent.hoa-homes.com` (DNS A record qua Cloudflare proxy).
> **Telegram:** webhook mode (`POST /telegram/webhook` qua HTTPS).
> **Reverse proxy:** Caddy + Cloudflare Origin Cert (15 năm).
>
> SOP này dành cho **bên kỹ thuật self-serve** — không cần biết repo. Bổ sung cho:
> - [DEPLOY.md](./DEPLOY.md) — guide chung (Docker, .env, systemd).
> - [DEPLOY_SUPABASE.md](./DEPLOY_SUPABASE.md) — setup Supabase L3 (optional v1, required Phase 8A).
> - [IMPLEMENTATION_ROADMAP.md §2](./IMPLEMENTATION_ROADMAP.md) — resources + decisions.
> - [architecture.md](./architecture.md) — overview tổng quan.

---

## 0. Prerequisites (founder phải có trước khi bàn giao ops)

- [x] Cloudflare account, add zone `hoa-homes.com`
- [x] Đổi nameserver inet → Cloudflare, đã propagate
- [x] DNS A record `agent` → `103.97.126.117`, **proxy ON** (icon cam)
- [x] Origin Cert 15 năm (download `cert.pem` + `cert.key` từ CF dashboard → SSL/TLS → Origin Server)
- [ ] Telegram bot token (mới hoặc reuse — đưa cho ops qua kênh secure)
- [ ] Admin Telegram chat ID (founder DM bot `/debug_env` để lấy)
- [ ] Anthropic API key (`console.anthropic.com`)
- [ ] Repo URL (HTTPS hoặc SSH deploy key)

⚠️ **KHÔNG commit** `cert.key`, `.env`, hoặc bất kỳ token nào lên Git.

---

## 1. SSH initial setup (~5 phút)

VPS đã có SSH custom port `2018`. Login root lần đầu, tạo user non-root để chạy app.

```bash
# Từ máy local
ssh -p 2018 root@103.97.126.117

# Trên VPS — tạo user 'lungmat' (wheel để sudo, docker để chạy compose không cần sudo)
useradd -m -s /bin/bash -G wheel lungmat
passwd lungmat   # đặt password tạm (sẽ disable password auth dưới)

# Cho phép wheel group sudo không cần password (optional, tiện ops)
echo "%wheel ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/wheel-nopasswd
chmod 440 /etc/sudoers.d/wheel-nopasswd

# Setup SSH key cho user lungmat
mkdir -p /home/lungmat/.ssh
chmod 700 /home/lungmat/.ssh
# Paste pubkey từ máy ops vào dòng dưới (ed25519 hoặc rsa)
echo "<PASTE_OPS_PUBKEY_HERE>" >> /home/lungmat/.ssh/authorized_keys
chmod 600 /home/lungmat/.ssh/authorized_keys
chown -R lungmat:lungmat /home/lungmat/.ssh

# Disable password login (chỉ key auth)
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
systemctl restart sshd
```

Test từ máy ops:

```bash
ssh -p 2018 lungmat@103.97.126.117   # phải vào không cần password
```

---

## 2. System update + Docker (~10 phút)

```bash
# Từ root hoặc sudo
dnf update -y
dnf install -y dnf-plugins-core wget curl git openssl tar

# Docker official repo (CentOS/RHEL compatible với AlmaLinux 8)
dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable --now docker

# Cho user lungmat chạy docker không sudo
usermod -aG docker lungmat

# Verify
docker --version              # Docker version 24+ hoặc mới hơn
docker compose version        # Docker Compose v2.x
```

⚠️ User `lungmat` phải logout/login lại để group `docker` có hiệu lực.

---

## 3. Firewall (firewalld) — mở `2018/80/443` only (~5 phút)

AlmaLinux 8 dùng `firewalld` (không phải `ufw`). VPS chỉ expose:

| Port | Purpose |
|------|---------|
| 2018/tcp | SSH custom |
| 80/tcp | HTTP (redirect → HTTPS) |
| 443/tcp | HTTPS (Caddy → Cloudflare) |

```bash
systemctl enable --now firewalld

# Mở port cần thiết
firewall-cmd --permanent --add-port=2018/tcp
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https

# Đóng SSH port mặc định (22) vì đã dùng custom 2018
firewall-cmd --permanent --remove-service=ssh

# Reload + verify
firewall-cmd --reload
firewall-cmd --list-all
```

**Expect output:** `services: http https`, `ports: 2018/tcp`.

⚠️ Cẩn thận — nếu chưa test 2018 work trước khi remove `ssh` service, có thể lock chính mình out.

---

## 4. Caddy install + Cloudflare Origin Cert (~5 phút)

Caddy là reverse proxy, listen `:443` (Cloudflare ↔ VPS) và `:80` (redirect HTTPS).

```bash
# Install Caddy từ COPR repo (community AlmaLinux 8)
dnf install -y 'dnf-command(copr)'
dnf copr enable -y @caddy/caddy
dnf install -y caddy
systemctl enable caddy

# Tạo thư mục chứa Origin Cert
mkdir -p /etc/ssl/cloudflare
chmod 700 /etc/ssl/cloudflare
```

Upload `cert.pem` + `cert.key` (từ Cloudflare dashboard) vào `/etc/ssl/cloudflare/`:

```bash
# Từ máy local (rsync hoặc scp)
scp -P 2018 cert.pem cert.key lungmat@103.97.126.117:/tmp/

# Trên VPS (sudo)
mv /tmp/cert.pem /etc/ssl/cloudflare/cert.pem
mv /tmp/cert.key /etc/ssl/cloudflare/cert.key
chmod 644 /etc/ssl/cloudflare/cert.pem
chmod 600 /etc/ssl/cloudflare/cert.key
chown root:root /etc/ssl/cloudflare/cert.*
```

Copy `Caddyfile` từ repo (xem [§5](#5-caddyfile-config)) vào `/etc/caddy/Caddyfile`:

```bash
# Sau khi clone repo (§6) — copy từ infra/caddy/Caddyfile
cp /home/lungmat/lungmat-agent/infra/caddy/Caddyfile /etc/caddy/Caddyfile

# Validate config
caddy validate --config /etc/caddy/Caddyfile

# Mkdir log dir
mkdir -p /var/log/caddy
chown caddy:caddy /var/log/caddy

systemctl restart caddy
systemctl status caddy   # active (running)
```

---

## 5. Caddyfile config

File canonical: [`infra/caddy/Caddyfile`](../infra/caddy/Caddyfile) trong repo.

Highlights:

- `tls /etc/ssl/cloudflare/cert.pem /etc/ssl/cloudflare/cert.key` — explicit Origin Cert path.
- `auto_https off` — KHÔNG để Caddy tự xin Let's Encrypt (Cloudflare đã handle browser TLS).
- `handle` blocks giới hạn route được proxy: `/health`, `/telegram/webhook`, `/approval/*`, `/agent/*`, `/command/*`. Mọi route khác → `404`.
- Header `X-Telegram-Bot-Api-Secret-Token` passthrough cho webhook verify.
- Access log JSON tại `/var/log/caddy/access.log`.

Nếu prefer Nginx, tham khảo [IMPLEMENTATION_ROADMAP.md §1 decision #8](./IMPLEMENTATION_ROADMAP.md) — Caddy được đề xuất vì config gọn (~30 dòng vs Nginx ~80 dòng) và auto reload không downtime.

---

## 6. Clone repo + setup `.env` (~10 phút)

```bash
# Switch sang user lungmat
su - lungmat
cd ~

# Clone repo (thay <REPO_URL>)
git clone <REPO_URL> lungmat-agent
cd lungmat-agent

# Copy template + edit
cp .env.example .env
chmod 600 .env
nano .env   # điền values theo bảng dưới
```

### `.env` production — required values

| Var | Value / nguồn |
|---|---|
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `MOCK_LLM` | `0` |
| `AGENT_SHARED_SECRET` | `openssl rand -hex 32` (random 64-char hex) |
| `TELEGRAM_BOT_TOKEN` | Từ BotFather |
| `ADMIN_TELEGRAM_CHAT_ID` | Founder DM bot `/debug_env`, copy `chatId` từ reply |
| `TELEGRAM_CHAT_ID_ALPHA` | Channel ID brand Alpha (numeric, có thể âm) |
| `TELEGRAM_CHAT_ID_RAYMOND` | Empty nếu chưa có brand Raymond |
| `TELEGRAM_CHAT_ID_VIP10X` | Empty nếu chưa có brand VIP10x |
| `ANTHROPIC_API_KEY` | `console.anthropic.com` → API Keys |
| `APIFY_API_TOKEN` | Optional — scraping news |
| `TYPEFULLY_API_KEY` | Optional — X/Threads handoff (xem [SOP_TYPEFULLY_HANDOFF.md](./SOP_TYPEFULLY_HANDOFF.md)) |
| `SUPABASE_URL` | Optional v1, required Phase 8A (xem [DEPLOY_SUPABASE.md](./DEPLOY_SUPABASE.md)) |
| `SUPABASE_SERVICE_ROLE_KEY` | Cùng nguồn Supabase |
| `TELEGRAM_MODE` | `webhook` |
| `TELEGRAM_WEBHOOK_URL` | `https://agent.hoa-homes.com/telegram/webhook` |
| `TELEGRAM_WEBHOOK_SECRET` | `openssl rand -hex 32` (random 64-char hex) — DÙNG ĐỂ Telegram verify origin |

⚠️ `TELEGRAM_WEBHOOK_SECRET` phải khớp giữa app (gọi `setWebhook`) và header `X-Telegram-Bot-Api-Secret-Token` Telegram gửi. App tự handle khi `TELEGRAM_MODE=webhook` — chỉ cần set var.

---

## 7. Docker compose up (~5 phút)

Repo có 2 compose file:

- `docker-compose.yml` — base (dev + prod chung).
- `docker-compose.prod.yml` — override production (bind `127.0.0.1:3000`, restart policy, log rotation, healthcheck tighter).

```bash
cd ~/lungmat-agent

# Build (lần đầu ~3-5 phút)
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Up detached
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verify
docker compose ps
# Expect: lungmat-agent  Up (healthy)
```

**Log check:**

```bash
docker compose logs -f agent
```

Tìm các dòng:

- `[env] mockLlm: false, hasAdminChatId: true, telegram_mode: webhook`
- `[7D-5] setWebhook OK → https://agent.hoa-homes.com/telegram/webhook`
- `Listening on :3000`

Nếu thấy `[WARN] Supabase not configured` mà bạn chưa set Supabase — bình thường (Phase v1 optional). Phase 8A trở đi: phải set.

---

## 8. Telegram webhook activation (~1 phút)

App tự gọi `setWebhook` khi start với `TELEGRAM_MODE=webhook`. Manual verify:

```bash
TOKEN=<TELEGRAM_BOT_TOKEN>
curl -s "https://api.telegram.org/bot${TOKEN}/getWebhookInfo" | jq
```

**Expect:**

```json
{
  "ok": true,
  "result": {
    "url": "https://agent.hoa-homes.com/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "max_connections": 40,
    "ip_address": "<CLOUDFLARE_IP>"
  }
}
```

Nếu `last_error_message` xuất hiện — xem [§12 Troubleshooting](#12-troubleshooting).

---

## 9. Smoke test (~5 phút)

### 9a. Health endpoint qua Cloudflare

```bash
curl -s https://agent.hoa-homes.com/health
# Expect: {"status":"OK", ...}
```

### 9b. Telegram bot DM (làm từ admin Telegram account)

| Lệnh | Expect |
|---|---|
| `/debug_env` | Reply trong vài giây — JSON env summary, `hasAdminChatId: true`, `telegram_mode: webhook` |
| `/market_summary` | Reply ~10-20s — 6 sections (Macro, Price, Liquidity, Technical, News, Outlook) |
| `/content alpha XAUUSD test` | Reply: "Draft generated → forwarded admin DM". Admin DM nhận 4 buttons (Telegram / X / Threads / Reject) |

Nếu bot không reply: check log `docker compose logs -f agent` — thường lỗi token hoặc webhook URL sai.

### 9c. HTTP API (optional, từ external)

```bash
curl -s -H "x-agent-secret: $AGENT_SHARED_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"command":"/debug_env","user":"ops","source":"smoke","payload":{}}' \
  https://agent.hoa-homes.com/command/command
```

Expect `200` với JSON output.

---

## 10. Update + rollback (post-go-live)

### Update (zero-downtime cho 1 container)

```bash
cd ~/lungmat-agent
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker compose logs -f agent   # verify healthy
```

Docker compose graceful: build image mới → stop old → start new (~5-10s gap). Để zero-downtime thật cần 2+ container + load balancer (Phase 10.9 worker pool scaling).

### Rollback

```bash
git log --oneline -10              # tìm commit/tag trước
git checkout <PREV_TAG_OR_SHA>
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Hoặc giữ image cũ: `docker images` → `docker compose ... up -d --no-build` với image tag cũ.

---

## 11. Backup

### Daily cron (gợi ý)

```bash
# Crontab user lungmat: crontab -e
0 3 * * * cd /home/lungmat/lungmat-agent && tar -czf /home/lungmat/backups/lungmat-$(date +\%F).tar.gz logs/ .env /etc/caddy/Caddyfile /etc/ssl/cloudflare/ 2>&1 | logger -t lungmat-backup
```

### Push lên S3 / Drive (optional)

Tham khảo [DEPLOY.md §4](./DEPLOY.md). Hoặc dùng `rclone` push lên Google Drive / B2.

### Retention

- Daily backup giữ 7 ngày local + 30 ngày remote.
- `logs/jobs.json`, `logs/approvals.json` quan trọng nhất (audit trail).
- Phase 8A trở đi: Supabase tự backup database (xem [DEPLOY_SUPABASE.md §7](./DEPLOY_SUPABASE.md)).

---

## 12. Troubleshooting

| Vấn đề | Nguyên nhân thường gặp | Xử lý |
|---|---|---|
| Container restart loop | Thiếu env (thường `AGENT_SHARED_SECRET` / `TELEGRAM_BOT_TOKEN`) | `docker compose logs agent` — đọc 50 dòng cuối |
| Caddy không bắt cert | Permission `cert.key` sai | `ls -l /etc/ssl/cloudflare/` — `cert.key` phải `600 root:root` |
| `caddy validate` fail | Syntax Caddyfile sai | Compare với `infra/caddy/Caddyfile` trong repo |
| Webhook 401 / `Unauthorized` | `TELEGRAM_WEBHOOK_SECRET` không khớp giữa `setWebhook` và header verify | Restart container — app re-call `setWebhook` với secret hiện tại trong `.env` |
| Cloudflare 521 Origin Down | VPS service stopped HOẶC firewall 443 đóng | `systemctl status caddy`, `firewall-cmd --list-all`, `curl -k https://localhost:443/health` từ VPS |
| Cloudflare 525 SSL handshake fail | Origin Cert expire / sai zone | Check `openssl x509 -in /etc/ssl/cloudflare/cert.pem -noout -dates` và CN khớp `*.hoa-homes.com` |
| `getWebhookInfo` có `last_error_message` | Cloudflare block, cert mismatch, hoặc app 5xx | Đọc error message cụ thể — thường là `SSL error` hoặc `connection timed out` |
| Bot DM không reply mà log có `[WEBHOOK] received` | App nhận được nhưng router lỗi | `docker compose logs agent --tail=200` — tìm stacktrace |
| Bot DM không reply, log KHÔNG có `[WEBHOOK]` | Webhook URL chưa active hoặc Telegram chưa gọi tới | `curl getWebhookInfo` verify; check `pending_update_count` |
| `/market_summary` timeout | Anthropic key sai hoặc rate limit | Verify `ANTHROPIC_API_KEY` valid, check log có `[anthropic] 429` |

Nếu vẫn stuck: lưu output `docker compose logs agent --tail=500 > /tmp/log.txt` + `systemctl status caddy` + `curl getWebhookInfo` và escalate.

---

## 13. Checklist go-live

### Infrastructure
- [ ] SSH non-root user `lungmat` setup, password auth disabled
- [ ] Docker Engine 24+ + Compose v2 installed
- [ ] Firewall: chỉ mở `2018/80/443`, đóng SSH default 22
- [ ] Caddy installed, `systemctl enable caddy`
- [ ] Origin Cert mounted `/etc/ssl/cloudflare/` (`cert.key` chmod 600)
- [ ] `caddy validate` pass, `systemctl status caddy` active

### Application
- [ ] Repo cloned vào `/home/lungmat/lungmat-agent`
- [ ] `.env` filled production values, `chmod 600`
- [ ] `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d` healthy
- [ ] `docker compose ps` → `Up (healthy)`

### Telegram + smoke test
- [ ] `curl https://agent.hoa-homes.com/health` → `200 {"status":"OK"}`
- [ ] Log có `[7D-5] setWebhook OK`
- [ ] `getWebhookInfo` URL đúng, `pending_update_count: 0`, không có `last_error_message`
- [ ] `/debug_env` DM bot → reply, `hasAdminChatId: true`
- [ ] `/market_summary` DM bot → reply 6 sections
- [ ] `/content alpha XAUUSD test` → admin DM 4 buttons (Telegram / X / Threads / Reject)

### Post go-live (24h)
- [ ] Cron summary chạy đúng giờ (xem `logs/agent.log`)
- [ ] Caddy access log có request từ Cloudflare IPs (`/var/log/caddy/access.log`)
- [ ] Daily backup cron chạy thành công
- [ ] (Nếu enable Supabase) `command_logs` có row tăng theo lệnh

### Sau khi Phase 8A merge
- [ ] Supabase setup: [DEPLOY_SUPABASE.md §3c](./DEPLOY_SUPABASE.md) — `CREATE EXTENSION vector` + migrations
- [ ] `VOYAGE_API_KEY` set
- [ ] `/rag_search` semantic test pass

---

## Phụ lục — Quick reference commands

```bash
# Service status
systemctl status caddy docker
docker compose ps

# Logs
docker compose logs -f agent
tail -f /var/log/caddy/access.log
journalctl -u caddy -f

# Restart
docker compose restart agent
systemctl restart caddy

# Webhook info
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo" | jq

# Force re-register webhook (manual)
curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -d "url=https://agent.hoa-homes.com/telegram/webhook" \
  -d "secret_token=$TELEGRAM_WEBHOOK_SECRET"

# Tear down everything (DANGER)
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```
