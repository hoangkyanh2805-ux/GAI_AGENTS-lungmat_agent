# Scale Multi-Brand Architecture Notes

> **Trang thai:** Architecture decision draft - ap dung khi scale tu Alpha sang nhieu brand.  
> **Cap nhat:** 2026-05-22  
> **Quyet dinh de xuat moi:** n8n = Alpha media production agent, GoClaw = community/admin bots, Zernio = publish/API layer.

---

## 1. Ket luan ngan

Dung kien truc moi theo huong:

```text
Founder / Cron / Telegram
       |
       v
n8n production agent
       |
       v
Claude Sonnet API
       |
       v
Zernio publish layer
       |
       v
X + Threads + Telegram channels
```

Khong dung GoClaw cho Alpha Writer/Media Orchestrator nua khi scale. n8n se goi Claude Sonnet truc tiep bang system prompt port tu `alpha-content-writer/SKILL.md`, sau do xu ly Telegram approval, Zernio publish va Sheet log. GoClaw giu vai tro bot hoi dap/conversational luon-online: Linh Cau va Lung Mat Coach.

---

## 1b. Decision update - tach GoClaw khoi Alpha media production

Y tuong moi:

```text
n8n:
  AI Agent (Claude Sonnet) -> sinh content Alpha/Raymond/VIP10X
  Cron -> Telegram duyet -> Zernio publish -> Sheet log

GoClaw:
  Linh Cau - edu/vault/community
  Lung Mat Coach - admin ops
```

Danh gia: **hop ly va nen lam**.

| Viec | GoClaw | n8n |
|------|--------|-----|
| Bot tra loi cong dong 24/7 | Tot | Khong phu hop |
| Chat/vault/conversational | Tot | Trung binh |
| Cron content theo lich | Lam duoc nhung cong kenh | Tot |
| Telegram approval gate | Lam duoc | Tot |
| Zernio publish + retry + log | Hay loi neu de agent tu lam | Tot |
| Multi-brand loop | Cong kenh trong GoClaw Team Router | Rat hop |

Ket luan: **khong can Media OS Orchestrator/Team Router cho Alpha production**. Neu van giu Orchestrator, chi dung nhu UI/idea router, khong publish.

---

## 2. Danh gia luong de xuat

```text
HTTP webhook (n8n call GoClaw agent.execute hoac qua TG bot)
       v
n8n
  - Cron 08:00 VN per brand
  - brands.json config
  - Drive watcher /chart/{brand}/today.png
  - Telegram CDN upload -> permanent URL
  - Approval gate: auto-trust tier vs human-review tier
  - Fan-out: Zernio cross_post + TG broadcast
  - Logging Google Sheet
       v
Zernio
  - 10 Profiles
  - 20 accounts
  - MCP/API publish
       v
10 X + 10 Threads + 10 Telegram channels
```

### Diem manh

- Scale duoc 10 brand ma khong can clone 10 skill rieng.
- n8n xu ly duoc viec lap lai tot hon GoClaw: cron, loop, retry, logging, branch condition.
- brands.json lam SSOT cho persona, accountId, schedule, approval tier.
- GoClaw agent bot giam tai: chi nhan task ro rang, tra content package.
- Zernio giu vai tro publish API, phu hop multi-account/multi-platform.

### Rui ro can chan

- Neu n8n goi thang GoClaw web chat thi de bi lac session. Nen dung endpoint/API/agent.execute neu co, hoac Telegram bot channel theo session ro.
- Khong de GoClaw dung `exec/bash` de publish. Publish nen do n8n goi Zernio API/MCP truc tiep.
- Anh qua Telegram CDN/Drive phai thanh URL/bytes upload duoc len Zernio, khong de agent tu `cp/find/curl` lung tung.
- Google Sheet chi lam logging ban dau. Khi >1000 posts/thang nen chuyen DB/Postgres.
- Auto-trust tier chi dung voi brand/rule da on dinh. Brand moi van human-review.

---

## 3. Kien truc moi de build

### 3.1 n8n la Alpha media production agent

n8n chiu trach nhiem:

- Cron 08:00 theo `Asia/Ho_Chi_Minh`.
- Doc `brands.json`.
- Lay chart/media moi tu Drive hoac folder/CDN.
- Goi Claude Sonnet API truc tiep de sinh content package.
- Gui preview qua Telegram admin.
- Cho `OK dang` hoac auto-approve neu brand thuoc auto-trust.
- Upload media len Zernio neu can.
- Goi Zernio publish.
- Log ket qua vao Google Sheet.

### 3.2 GoClaw la community/admin bot layer

GoClaw chiu trach nhiem:

- `Linh Cau`: edu/vault/community, khong publish.
- `Lung Mat Coach`: admin ops, status, checklist, huong dan Founder.

Khong can GoClaw cho:

- Alpha Content Writer production.
- Media OS Team Router.
- Zernio publish.
- Cron media.
- Sheet log.

Neu can giu `Alpha Content Writer` tren GoClaw thi chi dung lam sandbox/test chat, khong lam production path.

### 3.3 Claude system prompt trong n8n

n8n AI Agent node dung system prompt port tu `docs/goclaw-export/skills/alpha-content-writer/SKILL.md`.

Output bat buoc la JSON sach:

```json
{
  "brand": "alpha-trading-lab",
  "status": "preview",
  "data_status": "verified|unverified",
  "compliance": "PASS",
  "x": {
    "text": "Tweet <=280 chars",
    "thread": []
  },
  "threads": {
    "text": "Threads <=500 chars"
  },
  "telegram": {
    "brief": "Admin preview"
  },
  "media": {
    "source": "drive|telegram|zernio",
    "url": "",
    "media_id": ""
  }
}
```

### 3.4 Zernio la publish layer

Zernio chiu trach nhiem:

- Quan ly profile/account.
- Upload media.
- Publish/schedule X, Threads va cac kenh khac sau nay.
- Tra postId/status/url.

Khong dung Zernio CLI trong GoClaw agent. Production nen dung Zernio HTTP API truc tiep tu n8n. MCP chi dung khi chat agent can tool.

---

## 4. brands.json SSOT

```json
{
  "brands": [
    {
      "id": "alpha-trading-lab",
      "name": "Alpha Trading Lab",
      "persona": "institutional gold, smart money, Vietnamese",
      "timezone": "Asia/Ho_Chi_Minh",
      "schedule": "0 8 * * *",
      "approval_tier": "human-review",
      "telegram_admin_chat_id": "",
      "telegram_channel_id": "",
      "zernio_profile_id": "",
      "accounts": {
        "x": "6a0c6dbd5e333c05299f1d12",
        "threads": "6a0c28345e333c05299b981a"
      },
      "rules": {
        "x_max_chars": 280,
        "threads_max_chars": 500,
        "no_trade_signal": true,
        "require_source_timestamp": true
      }
    }
  ]
}
```

---

## 5. Zernio vs Buffer vs Typefully

| Tool | Hop voi | Diem manh | Gioi han voi kien truc nay |
|------|---------|-----------|----------------------------|
| **Zernio** | API-first, AI agents, multi-brand automation | MCP/API/CLI, multi-platform, profile/account model, webhook/SDK | Can quan ly API/MCP dung cach; X cost can cap |
| **Buffer** | Team marketing muon UI de len lich, lich content de nhin | De dung, calendar tot, per-channel pricing, nhieu kenh | API/automation khong phai core agent-first; kho lam workflow AI phuc tap bang Zernio |
| **Typefully** | X/Threads/LinkedIn creator workflow, thread writing | Editor thread manh, API v2 co draft/schedule/media | Hop creator/editor hon production orchestration 10 brand |

### Quyet dinh

- **Core publish layer:** Zernio.
- **Fallback UI/manual:** Buffer neu team MKT can calendar UI de keo tha, duyet bang mat.
- **Creator/editor rieng:** Typefully neu chien luoc tap trung X threads/LinkedIn va can editor manh.

Voi bai toan 10 brand x 10 X + 10 Threads + Telegram + AI agents, Zernio phu hop nhat vi la API/MCP-first. Buffer/Typefully phu hop lam UI phu hoac fallback, khong nen lam core automation.

---

## 6. Build phases

### M0 - Alpha only harden

- Tam dung GoClaw Alpha Writer production.
- Port `alpha-content-writer/SKILL.md` thanh n8n AI Agent system prompt.
- n8n flow single brand: Cron -> Claude -> Telegram approval -> Zernio HTTP API -> Sheet log.
- Pass khi 3 ngay lien tiep post dung X/Threads/Telegram.

### M1 - Multi-brand config

- Tao `brands.json`.
- n8n loop brands.
- Moi brand co accountId, persona, schedule, approval tier.
- Pass khi 2 brand chay cung workflow.

### M2 - Media pipeline

- Drive watcher `/chart/{brand}/today.png`.
- Telegram/Drive media -> Zernio mediaId.
- Pass khi post co anh khong dung exec trong GoClaw.

### M3 - Trust tiers

- `human-review`: can OK dang.
- `auto-trust`: tu publish neu compliance PASS va data verified.
- `blocked`: chi draft, khong publish.

### M4 - Analytics

- Google Sheet log ban dau.
- Sau do Postgres/dashboard neu volume lon.

---

## 7. Hard rules

- GoClaw khong nam tren production path cua Alpha media publish.
- GoClaw Orchestrator khong goi `exec`, `bash`, `cp`, `find`, `zernio auth`, `zernio accounts`.
- Publish khong xay ra neu chua co `OK dang` hoac brand khong thuoc `auto-trust`.
- AccountId lay tu `brands.json`, khong hardcode trong skill khi scale 2+ brand.
- Moi post log: brand, platform, accountId, mediaId, postId, status, URL, timestamp, error.
- Content market co so lieu phai co source + timestamp.
- X khong qua 280 ky tu; Threads khong qua 500 ky tu trong pilot.

---

## 8. Viec phai lam lai khi chuyen sang n8n agent rieng

| Hang muc | Viec |
|----------|------|
| `SKILL.md Alpha Writer` | Port thanh system prompt trong n8n AI Agent node |
| Vault 38 docs | Ban dau nhung phan cot loi vao prompt; sau do dung Supabase/Pinecone/vector retrieval |
| Zernio publish | Goi HTTP API truc tiep tu n8n, khong MCP/CLI trong GoClaw |
| Telegram approval | n8n Telegram trigger/node: nhan `OK dang` -> publish |
| Media/anh | Founder gui `mediaId` hoac n8n upload media len Zernio |
| Logging | Google Sheet 1 row/post |
| GoClaw | Giu Linh Cau + Lung Mat Coach, khong dung Alpha Writer production |

Thu tu de xuat:

1. Khong lam them Alpha Writer production tren GoClaw.
2. Cai n8n cloud/VPS.
3. Tao workflow M0: Cron -> Claude -> Telegram -> Zernio -> Sheet.
4. Pass M0 3 ngay.
5. Sau do moi scale brands.json va trust tiers.
