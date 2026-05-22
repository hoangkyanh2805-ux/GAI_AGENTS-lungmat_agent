# Fork n8n #11138 → Alpha M0

**Gốc:** [Generate AI photos with Gemini & auto-post… #11138](https://n8n.io/workflows/11138-generate-ai-photos-with-gemini-and-auto-post-to-fb-instagram-and-x-with-approval/)

**File import:** [`workflows/alpha-m0-11138-telegram.template.json`](../workflows/alpha-m0-11138-telegram.template.json)

---

## So sánh 2 template trong repo

| | `alpha-m0.template.json` | `alpha-m0-11138-telegram.template.json` |
|---|--------------------------|----------------------------------------|
| Nguồn | Repo M0 gốc | Fork #11138 |
| Writer | HTTP Claude | **AI Agent** + Claude Sonnet + Memory |
| Telegram | Preview + Wait webhook | **Send and Wait** (giống #11138) |
| Trigger | Manual + Cron | + **Telegram Trigger** |
| Ảnh | `mediaId` tay | `mediaId` tay (bỏ Gemini) |
| Publish | Zernio HTTP | Zernio HTTP |

Chọn **một** workflow trên n8n — không import cả hai.

---

## Đã bỏ (so với #11138)

- Gemini `Generate an image`
- Google Drive upload/download ảnh AI
- Blotato (FB, Instagram, X)
- Vòng chờ status FB/IG/X
- OpenAI Whisper / voice branch (có thể thêm M1)

## Giữ / đổi

| #11138 | Alpha |
|--------|-------|
| AI Agent + approval loop | **AI Agent Content** + Alpha JSON |
| OpenAI Chat Model | **Claude Sonnet** (Anthropic credential) |
| Send message and wait | **Send and wait approval** + `mediaId` |
| Blotato publish | **Zernio Publish** HTTP |
| Save Prompt Sheet | **Google Sheet Log** `alpha_publish_log` |
| — | **Parse Pack + Compliance** (≤280, ≤500, no signal) |
| — | `brands.json` accountIds trong **Bootstrap** |

**Account IDs (hardcoded trong Bootstrap — sync `config/n8n/brands.json`):**

- X: `6a0c6dbd5e333c05299f1d12`
- Threads: `6a0c28345e333c05299b981a`

---

## Import

1. n8n → **Import from File** → `alpha-m0-11138-telegram.template.json`
2. **Điền key + chạy thử:** [`N8N_RUN_11138_CHECKLIST.md`](./N8N_RUN_11138_CHECKLIST.md) ← từng bước, checklist run
3. Variables: [`N8N_ALPHA_KEYS_SETUP.md`](./N8N_ALPHA_KEYS_SETUP.md)
4. **Activate** workflow nếu dùng Telegram Trigger
5. Sửa **Zernio Publish** URL/body theo API thật

## Cách dùng

**Telegram:** Gửi bot ý tưởng → AI đề xuất → reply sửa hoặc `OK`/`approved` → JSON pack → TG hỏi **OK đăng + mediaId** → Zernio.

**Manual/Cron:** Chạy không cần tin nhắn — dùng `topic` mặc định trong Bootstrap.

**Không GoClaw** — chỉ n8n + Zernio + Telegram.

---

## Phase checklist

[`N8N_ALPHA_PHASES_CHECKLIST.md`](./N8N_ALPHA_PHASES_CHECKLIST.md) — Phase 2 key → Phase 3 test.
