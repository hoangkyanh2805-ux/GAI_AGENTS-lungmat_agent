# Task — Publish Alpha via Zernio MCP only (GoClaw chat)

> **Chạy trong:** GoClaw → **Alpha Content Writer** (không phải Cursor).  
> **Điều kiện:** MCP `zernio` Enabled + granted · model không 429.  
> **Cập nhật:** 2026-05-20

---

## Account IDs (đã xác nhận)

| Platform | Handle | accountId |
|----------|--------|-----------|
| X / Twitter | `@AlphaTrading79` | `6a0c28345e333c05299b981a` |
| Threads | `@alphatrading.lab` | `6a0c6dbd5e333c05299f1d12` |

---

## Prompt copy — dán vào chat Alpha

Thay `<<<PASTE_APPROVED_X_THREAD_OR_POST>>>` bằng nội dung đã duyệt (plain text, không JSON wrapper).

```text
TASK: Publish Alpha Trading Lab post to X/Twitter + Threads via Zernio MCP only.

Rules:
- Không dùng CLI. Không exec/shell. Không skill_search.
- Chỉ Zernio MCP tools (prefix mcp_zernio__ hoặc tên tool trong trace).

Account IDs:
- Twitter: 6a0c28345e333c05299b981a (@AlphaTrading79)
- Threads: 6a0c6dbd5e333c05299f1d12 (@alphatrading.lab)

1) Final text (approved):
<<<PASTE_APPROVED_X_THREAD_OR_POST>>>

2) Image (optional):
- Gọi media_generate_upload_link nếu có.
- Prompt ảnh: "A minimalist, high-end institutional financial concept art. A dark, moody professional trading environment with a sleek gold-toned digital market chart floating in the center. The chart shows a sharp liquidity sweep candle wick movement. Subtle, clean aesthetic, dark background with soft gold ambient lighting, professional, cinematic, hyper-realistic, 1:1 aspect ratio."
- Nếu cần URL upload: báo Founder mở link upload trong browser, confirm "done", rồi media_check_upload_status.
- Nếu media tool fail: báo rõ "Zernio MCP media tool not available or failed" — hỏi Founder có đăng text-only không.

3) Publish (MCP only):
- Ưu tiên posts_cross_post hoặc posts_publish_now với publish_now=true.
- platforms: twitter, threads
- account_ids: 6a0c28345e333c05299b981a, 6a0c6dbd5e333c05299f1d12
- media_urls hoặc media id nếu có từ bước 2

4) Return:
- X post URL
- Threads post URL
- Zernio post id + status
- media id/url đã dùng (nếu có)
```

---

## Tool names (Zernio MCP — tham chiếu)

GoClaw có thể expose dạng `mcp_zernio__posts_cross_post` (xem trace sau khi gọi).

| Bước | Tool Zernio MCP |
|------|-----------------|
| List accounts (verify) | `accounts_list` |
| Upload ảnh | `media_generate_upload_link` → user upload → `media_check_upload_status` |
| Đăng đa kênh | `posts_cross_post` hoặc `posts_create` + `posts_publish_now` |

**Không** dùng: `exec`, `zernio` CLI, `skill_search`.

---

## Lưu ý media

Zernio MCP **không** tạo ảnh từ prompt trực tiếp như DALL·E. Flow ảnh:

1. `media_generate_upload_link` → Founder mở URL → upload file (ảnh từ designer hoặc file local).
2. Lấy URL/media từ `media_check_upload_status`.
3. Gắn vào `posts_*` qua `media_urls`.

Nếu cần ảnh AI: tạo ngoài (P4 / designer) → upload qua link trên.

---

## Sau khi publish thành công

Điền [`PILOT_ALPHA_AUDIT_STATUS.md`](../PILOT_ALPHA_AUDIT_STATUS.md) § P7 evidence:

- Ngày E2E pass
- URL post X
- Threads verified ☑
- Tick **A2** Done nếu cả hai kênh live
