#!/usr/bin/env bash
# vps-setup.sh — Lungmat Agent VPS bootstrap (AlmaLinux 8 Minimal)
#
# Idempotent — safe to re-run. Run as root on a fresh VPS.
# See docs/PRODUCTION_DEPLOY.md for full deploy walkthrough.
#
# Usage:
#   ssh -p 2018 root@<VPS_IP>
#   git clone <REPO_URL> /opt/lungmat-agent
#   bash /opt/lungmat-agent/scripts/vps-setup.sh

set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
    echo "ERROR: run as root (sudo bash $0)"
    exit 1
fi

echo "==> [1/5] System update + base tools..."
dnf update -y
dnf install -y dnf-plugins-core wget curl git openssl tar jq

echo "==> [2/5] Docker install (if missing)..."
if ! command -v docker &>/dev/null; then
    dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable --now docker
else
    echo "    Docker already installed: $(docker --version)"
fi
docker --version
docker compose version

echo "==> [3/5] Firewall config (firewalld)..."
systemctl enable --now firewalld
firewall-cmd --permanent --add-port=2018/tcp || true
firewall-cmd --permanent --add-service=http || true
firewall-cmd --permanent --add-service=https || true
firewall-cmd --permanent --remove-service=ssh || true
firewall-cmd --reload
firewall-cmd --list-all

echo "==> [4/5] Caddy install (if missing)..."
if ! command -v caddy &>/dev/null; then
    dnf install -y 'dnf-command(copr)'
    # COPR enable is interactive by default — pipe 'y'
    yes | dnf copr enable @caddy/caddy || true
    dnf install -y caddy
    systemctl enable caddy
else
    echo "    Caddy already installed: $(caddy version)"
fi

mkdir -p /etc/ssl/cloudflare
chmod 700 /etc/ssl/cloudflare

mkdir -p /var/log/caddy
chown caddy:caddy /var/log/caddy

cat <<'EOF'

    -- Caddy + TLS next steps (manual):
    -- 1. Upload Cloudflare Origin Cert:
    --      scp -P 2018 cert.pem cert.key root@<VPS_IP>:/etc/ssl/cloudflare/
    --      chmod 644 /etc/ssl/cloudflare/cert.pem
    --      chmod 600 /etc/ssl/cloudflare/cert.key
    -- 2. Copy Caddyfile from repo to /etc/caddy/Caddyfile:
    --      cp /opt/lungmat-agent/infra/caddy/Caddyfile /etc/caddy/Caddyfile
    -- 3. Validate + restart:
    --      caddy validate --config /etc/caddy/Caddyfile
    --      systemctl restart caddy
    --      systemctl status caddy

EOF

echo "==> [5/5] Create non-root user 'lungmat' (if missing)..."
if ! id -u lungmat &>/dev/null; then
    useradd -m -s /bin/bash -G wheel,docker lungmat
    mkdir -p /home/lungmat/.ssh
    chmod 700 /home/lungmat/.ssh
    chown -R lungmat:lungmat /home/lungmat/.ssh

    # Passwordless sudo for wheel group (optional but standard for ops boxes)
    if [[ ! -f /etc/sudoers.d/wheel-nopasswd ]]; then
        echo "%wheel ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/wheel-nopasswd
        chmod 440 /etc/sudoers.d/wheel-nopasswd
    fi

    cat <<'EOF'

    -- User 'lungmat' created. Manual next steps:
    -- 1. Add ops SSH pubkey:
    --      echo "<PUBKEY>" >> /home/lungmat/.ssh/authorized_keys
    --      chmod 600 /home/lungmat/.ssh/authorized_keys
    --      chown lungmat:lungmat /home/lungmat/.ssh/authorized_keys
    -- 2. Disable SSH password auth:
    --      sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
    --      systemctl restart sshd
    -- 3. Test from ops machine: ssh -p 2018 lungmat@<VPS_IP>

EOF
else
    echo "    User 'lungmat' already exists."
    # Ensure docker group membership (in case docker was installed after user)
    usermod -aG docker lungmat || true
fi

echo "==> Bootstrap done. Next manual steps (see docs/PRODUCTION_DEPLOY.md):"
echo "    1. Upload Cloudflare Origin Cert -> /etc/ssl/cloudflare/"
echo "    2. Deploy Caddyfile -> /etc/caddy/Caddyfile; systemctl restart caddy"
echo "    3. su - lungmat; cd ~; git clone <REPO_URL> lungmat-agent"
echo "    4. cd lungmat-agent; cp .env.example .env; edit values; chmod 600 .env"
echo "    5. docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
echo "    6. Smoke test: curl https://agent.hoa-homes.com/health"
