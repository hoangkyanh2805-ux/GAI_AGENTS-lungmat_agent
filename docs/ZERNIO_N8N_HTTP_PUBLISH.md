# Zernio HTTP — n8n publish (Alpha M0)

> **SSOT thay placeholder** trong `workflows/alpha-m0*.json`  
> **P7 GoClaw** dùng MCP `posts_cross_post` — cùng logic, khác transport.

---

## Endpoint (đã xác nhận docs)

| Field | Giá trị |
|-------|--------|
| **Base URL** | `https://zernio.com/api/v1` (không dùng `https://api.zernio.com`) |
| **Create post** | `POST /posts` |
| **Full URL** | `https://zernio.com/api/v1/posts` |
| **Auth** | `Authorization: Bearer $ZERNIO_API_KEY` |

Ref: [Create post](https://docs.zernio.com/posts/create-post) · [API overview](https://docs.zernio.com/)

---

## n8n env

```text
ZERNIO_API_BASE=https://zernio.com/api/v1
ZERNIO_API_KEY=sk_...
```

Node URL expression:

```text
={{ ($env.ZERNIO_API_BASE || 'https://zernio.com/api/v1').replace(/\/$/, '') }}/posts
```

---

## Body Alpha cross-post (X + Threads)

P7 dùng tweet đầu cho X và `threads_post` riêng cho Threads. REST API dùng `platforms[]` + optional `customContent` per platform:

```json
{
  "content": "<x_thread[0] ≤280>",
  "publishNow": true,
  "platforms": [
    { "platform": "twitter", "accountId": "6a0c6dbd5e333c05299f1d12" },
    {
      "platform": "threads",
      "accountId": "6a0c28345e333c05299b981a",
      "customContent": "<threads_post ≤500>"
    }
  ],
  "mediaItems": []
}
```

Nếu có `media_id` từ Zernio Media (upload trước), thêm vào `mediaItems` theo [Upload Media](https://docs.zernio.com/) — thường `{ "type": "image", "url": "..." }` hoặc id field theo OpenAPI dashboard (verify 1 lần trên Postman).

**Không dùng** body cũ trong template:

```json
{
  "text": "...",
  "threadsText": "...",
  "platforms": ["twitter", "threads"],
  "accountIds": ["...", "..."],
  "status": "PUBLISHED"
}
```

---

## Verify nhanh (Founder)

```bash
curl -sS -X POST "https://zernio.com/api/v1/posts" \
  -H "Authorization: Bearer $ZERNIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test Alpha n8n — text only",
    "publishNow": true,
    "platforms": [
      {"platform": "twitter", "accountId": "6a0c6dbd5e333c05299f1d12"},
      {"platform": "threads", "accountId": "6a0c28345e333c05299b981a", "customContent": "Test Threads caption"}
    ]
  }'
```

Pass: HTTP 200/201 + `id` post trong response + dashboard Zernio có bài.

---

## Response parsing (n8n Merge Run)

```javascript
const z = $input.first().json;
const postId = z.id || z.post?.id || z.data?.id;
// platformPostUrl có thể nằm trong z.platforms[]
```

---

## Blocker POC — closed khi

- [ ] `curl` test pass
- [ ] n8n execution Zernio Publish node 2xx
- [ ] Dashboard `@AlphaTrading79` + `@alphatrading.lab` có post mới
