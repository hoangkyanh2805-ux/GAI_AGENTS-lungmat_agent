# SOP — GoClaw + Zernio publish (X + Threads + YouTube)

> **Scope:** 3 flagship brands — **Alpha**, **Raymond**, **VIP 10X**.  
> **Kênh:** X, Threads, YouTube (Shorts). **Không** Facebook trong scope hiện tại.  
> **Runtime production:** [GoClaw](https://goclaw.sh/) `agent.hoa-homes.com`  
> **Publish X/Threads:** [Zernio CLI](https://zernio.com/agents) (`@zernio/cli` trên GoClaw Nodes)  
> **Nguồn persona/schema:** repo `lungmat-agent` — export Skill từ `docs/goclaw-export/`

**Pilot:** Alpha only — [`GOCLAW_ALPHA_PILOT_CHECKLIST.md`](./GOCLAW_ALPHA_PILOT_CHECKLIST.md)  
**Handoff Cowork:** [`briefs/goclaw-alpha-pilot-cowork-brief.md`](./briefs/goclaw-alpha-pilot-cowork-brief.md)

**Cập nhật:** 2026-05-19

---

## 1. Luồng hàng ngày (GoClaw-primary)

```text
GoClaw Cron (08/13/19h VN)
    → Brand Writer agent (Skill từ repo)
    → Web search + Vault retrieve
    → JSON content pack + gpt-image-2 (thumbnail + post image)
    → Admin Telegram: draft + ảnh preview — CHỜ DUYỆT

Founder: "OK đăng" / "duyệt"

    → Zernio CLI: media:upload + posts:create
    → X + Threads live (text + ảnh)

YouTube (MVP):
    → Copy shorts_script + thumbnail từ pack
    → Quay Shorts 45–60s → YouTube Studio upload
```

**Không dùng** n8n cho cron content pilot. **Typefully** = backup tay nếu Zernio fail (Phase 7C legacy).

---

## 2. Content pack JSON (schema — từ `ContentAgent.ts`)

| Field | Kênh | Publish qua |
|-------|------|-------------|
| `x_thread` | X | Zernio `--platforms twitter` |
| `threads_post` | Threads | Zernio `--platforms threads` |
| `telegram_brief` | Telegram (optional) | GoClaw Channel |
| `youtube_pack.shorts_script` | YouTube | Studio (tay) |
| `youtube_pack.title/description/tags` | YouTube metadata | Zernio hoặc Studio |
| thumbnail + post image | X/Threads/ YT thumb | gpt-image-2 → Zernio `--media` |

---

## 3. Zernio trên GoClaw (setup 1 lần)

1. [zernio.com](https://zernio.com) → API key → connect X + Threads per brand
2. GoClaw → **Nodes** → npm `@zernio/cli`
3. Env: `ZERNIO_API_KEY`
   - Lưu ý: không viết sai thành `ZERNOP_API_KEY`
4. Ghi `accountId` từ `zernio accounts list`

**Publish sau duyệt (agent hoặc manual):**

```bash
zernio media:upload ./post-image.png
zernio posts:create \
  --text "1/ Thread opener..." \
  --platforms twitter,threads \
  --accounts <accountId> \
  --media <mediaId>
```

**Phí X API (pass-through):** ~$0.015/post; **có URL trong tweet ~$0.20** — tránh link trong X, CTA ở Threads/bio. Set spend cap trên Zernio dashboard.

---

## 4. Ảnh (gpt-image-2)

Repo: `src/integrations/ImageClient.ts` + `buildImagePrompt()`.

| Ảnh | Size | Dùng cho |
|-----|------|----------|
| Thumbnail | 1536×1024 | YouTube thumb, X header image |
| Post | 1024×1024 | X/Threads feed |

GoClaw: OpenAI provider + image tool. Skill agent: tạo ảnh **sau** JSON pack, **trước** gửi admin duyệt.

---

## 5. Cron (3 brand — sau pilot Alpha)

| Job | Giờ VN | Agent |
|-----|--------|-------|
| `daily_alpha` | 08:00 | Alpha Content Writer |
| `daily_raymond` | 13:00 | Raymond Content Writer |
| `daily_vip10x` | 19:00 | VIP10X Content Writer |

Prompt mẫu: xem `docs/goclaw-export/alpha-content-writer-skill.md`.

---

## 6. Guardrails (compliance)

- Không auto-post Zernio nếu chưa admin OK
- Không buy/sell cụ thể, không "chắc ăn", không lot size
- Vault foundation = Shared; sales chat raw **không** upload Shared
- Không paste API key vào chat — revoke nếu lộ

---

## 7. Legacy stack (lungmat Phase 7C)

Vẫn valid cho dev/test local:

- `POST /command` → `/content alpha topic` → admin 4 nút → Typefully copy

Chi tiết: [`SOP_TYPEFULLY_HANDOFF.md`](./SOP_TYPEFULLY_HANDOFF.md)

---

## 8. Verify pilot Alpha

| # | Pass khi |
|---|----------|
| 1 | Vault 38 docs + 4 smoke câu |
| 2 | Agent sinh JSON đủ field + 2 ảnh |
| 3 | Admin OK → Zernio post X+Threads có ảnh |
| 4 | Cron 08:00 next run đúng timezone VN |
| 5 | (Optional) 1 Shorts Studio từ cùng pack |

---

*Tài liệu liên quan: [`XAUUSD_MEDIA_OS.md`](./XAUUSD_MEDIA_OS.md) §2.5 · [`PROJECT_STATUS.md`](../PROJECT_STATUS.md)*
