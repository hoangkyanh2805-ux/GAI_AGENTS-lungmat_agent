# SOP — Typefully handoff (Phase 7C)

> **Scope:** X + Threads cho 3 flagship brands. **Không** dùng Typefully cho YouTube.

## 1. Luồng hàng ngày

```text
/content <brand> <topic>
    → Bot tạo pack (TG + X + Threads + YouTube script)
    → Admin DM: nút ✅ TG / ✅ X / ✅ Threads
    → TG approve → publish vào TELEGRAM_CHAT_ID_<BRAND>
    → X approve → copy text → Typefully social set → schedule
    → Threads approve → paste post vào Typefully (linked account)
    → YouTube: copy shorts_script → YouTube Studio (không qua bot)
```

## 2. Social sets (brands.json)

| Brand | Typefully set | X handle |
|-------|---------------|----------|
| alpha | `AlphaTradingLab_Elite` | `@AlphaTrading79` |
| raymond | _(thêm vào brands.json khi có)_ | |
| vip10x | _(thêm vào brands.json khi có)_ | |

## 3. Sau khi bấm ✅ X → Typefully

1. Bot trả DM: full thread text + tên social set.
2. Mở [Typefully](https://typefully.com) → đúng **social set** của brand.
3. Paste `x_thread` → chỉnh line breaks / media nếu cần.
4. Schedule theo lịch brand (xem [XAUUSD_MEDIA_OS.md](./XAUUSD_MEDIA_OS.md)).
5. Threads: paste `threads_post` (cùng pack hoặc approve riêng nút Threads).

## 4. API (tuỳ chọn)

```env
TYPEFULLY_API_KEY=
```

- Có key: `TypefullyClient.createDraft()` thử tạo draft khi approve X (fail → vẫn copy manual).
- Không key: chỉ `typefully_copy_ready: true` trong `meta` + text trong reply.

## 5. n8n (template)

Workflow gợi ý:

1. **Cron** 07:00 VN → HTTP POST `/command/command` với `command: /content`, `payload: { brand, topic }`.
2. **Wait** webhook hoặc poll `GET /approval?status=pending`.
3. **Human** approve trên Telegram (khuyến nghị) — hoặc automation chỉ cho staging.
4. **Không** auto-post X từ n8n trừ khi product đổi sang X API.

Chi tiết payload: xem `docs/architecture.md` § ContentAgent.

## 6. Verify

```text
/content alpha test narrative
→ Admin DM có 4 nút (TG, X, Threads, Reject TG)
→ Bấm ✅ X → reply có "Typefully" + thread text
→ Bấm ✅ TG → message trên channel Alpha
```

---

*Cập nhật cùng Phase 7B/7C trong repo.*
