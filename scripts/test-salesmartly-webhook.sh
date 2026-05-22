#!/usr/bin/env bash
# Test POST /salesmartly/webhook — HOT_LEAD → ADMIN_TELEGRAM_CHAT_ID
# Usage:
#   export SALESMARTLY_WEBHOOK_SECRET=your-secret
#   export ADMIN_TELEGRAM_CHAT_ID=...
#   export TELEGRAM_BOT_TOKEN=...
#   ./scripts/test-salesmartly-webhook.sh
#   ./scripts/test-salesmartly-webhook.sh http://localhost:3000

set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
SECRET="${SALESMARTLY_WEBHOOK_SECRET:?Set SALESMARTLY_WEBHOOK_SECRET}"

if [[ -z "${SALESMARTLY_ENABLED:-}" ]]; then
  echo "Note: set SALESMARTLY_ENABLED=1 in .env and restart server"
fi

PAYLOAD=$(cat <<EOF
{
  "secret": "${SECRET}",
  "conversation_id": "test-sm-$(date +%s)",
  "channel": "telegram",
  "intent": "HOT_LEAD",
  "topic": "Test webhook from script",
  "notes": "Founder test — giá VIP Alpha",
  "customer": {
    "name": "Test User",
    "phone": "+84900000000"
  },
  "metadata": {
    "brand": "alpha",
    "source": "test-script"
  }
}
EOF
)

echo "POST ${BASE_URL}/salesmartly/webhook"
HTTP_CODE=$(curl -s -o /tmp/sm-webhook-resp.txt -w "%{http_code}" \
  -X POST "${BASE_URL}/salesmartly/webhook" \
  -H "Content-Type: application/json" \
  -d "${PAYLOAD}")

echo "HTTP ${HTTP_CODE}"
cat /tmp/sm-webhook-resp.txt
echo ""

if [[ "${HTTP_CODE}" == "200" ]]; then
  echo "OK — check admin Telegram for HOT_LEAD message"
else
  echo "FAIL — check server logs (503 = SALESMARTLY_ENABLED=0, 401 = bad secret)"
  exit 1
fi
