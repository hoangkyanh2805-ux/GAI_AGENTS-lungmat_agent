# Audit — marketmenow & openpost vs Alpha Media OS

> **Loại:** Review / fit-gap (cặp repo có X — so sánh BrightBean audit)  
> **Ngày:** 2026-05-22  
> **SSOT dự án:** `config/n8n/brands.json`, `alpha-content-writer` SKILL, `PILOT_ALPHA_AUDIT_STATUS.md`, brief [`alpha-github-content-engine-n8n-brief.md`](./briefs/alpha-github-content-engine-n8n-brief.md)

---

## Executive summary

| Repo | Verdict | Điểm Alpha | Vai trò đề xuất |
|------|---------|------------|-----------------|
| **[openpost](https://github.com/rodrgds/openpost)** | **Phụ — publish backup** | **~52/100** | Self-host scheduler X+Threads nếu **bỏ Zernio**; không thay Layer 1 |
| **[marketmenow](https://github.com/thearnavrustagi/marketmenow)** | **Không core Alpha** | **~38/100** | Tham khảo **capsule + repurpose** cho script; **thiếu Threads** |

**Chốt giữ nguyên pivot:** `Claude/SKILL → pack.json` → **n8n mỏng** → **Zernio cross_post** (P7 Done). Không thay bằng một trong hai repo làm stack chính M0.

---

## So sánh 3 repo (BrightBean + 2 repo này)

| Tiêu chí | BrightBean | **OpenPost** | **MarketMeNow** | Alpha hiện tại |
|----------|------------|--------------|-----------------|----------------|
| **X publish** | ❌ | ✅ OAuth 1.0a | ✅ (cookie/API) | ✅ Zernio |
| **Threads publish** | ✅ | ✅ Meta OAuth | ❌ **không có adapter** | ✅ Zernio |
| **Cross-post 1 lần** | ❌ | Compose đa nền (UI) | `post-capsule` từng nền | `posts_cross_post` |
| **AI sinh content** | ❌ | ❌ | ✅ Gemini/Vertex | Claude + SKILL |
| **Trading compliance** | ❌ | ❌ | YAML persona (custom) | SKILL + schema |
| **TG duyệt Founder** | ❌ | ❌ | Dashboard web | ✅ n8n/TG |
| **License** | AGPL | **MIT** | **MIT** | — |
| **Ops** | Nặng (5 container) | **Nhẹ** (1 binary + SQLite) | Nặng (PG + worker + Playwright) |
| **API cho n8n** | Webhook events | UI-first; **không REST public** rõ | CLI `mmn` + dashboard | Zernio HTTP |
| **Đã pilot** | ❌ | ❌ | ❌ | **✅ P7** |

---

## 1. OpenPost ([rodrgds/openpost](https://github.com/rodrgds/openpost))

### 1.1 Là gì

- **Typefully-like** self-host: viết một lần, **variant theo nền**, lên lịch, **thread nhiều post**.
- **Stack:** Go + SvelteKit + SQLite; single binary / Docker; **không** Postgres/Redis.
- **License:** MIT.
- **Platforms:** X, Threads, Mastodon, Bluesky, LinkedIn ([provider matrix](https://op.rgo.pt/providers/overview)).

### 1.2 Khớp Alpha

| Yêu cầu | OpenPost | Ghi chú |
|---------|----------|---------|
| X `@AlphaTrading79` | ✅ | Cần X Developer app OAuth 1.0a |
| Threads `@alphatrading.lab` | ✅ | Meta OAuth + **`OPENPOST_MEDIA_URL` public** (Meta fetch ảnh server-side) |
| `x_thread` 1–7 ≤280 | ✅ thread composer | Không map sẵn `pack.json` — import tay/API nội bộ |
| `threads_post` ≤500 | ✅ per-platform variant | Đúng mô hình “variant” |
| Compliance trading | ❌ | Tự enforce khi nhập / pre-validate script |
| Sinh XAUUSD | ❌ | Không LLM |
| TG approval | ❌ | Web workspace |
| Zernio đã setup | **Trùng vai trò** | Đổi = OAuth lại + mất cross_post API đã test |

### 1.3 Điểm mạnh (với dự án)

- **Đủ X + Threads** — pass gate mà BrightBean fail.
- **Nhẹ vận hành** — VPS nhỏ, backup SQLite; phù hợp “không thêm SaaS Buffer”.
- **Thread + schedule queue** survive restart — gần nhu cầu lên lịch 08:00 VN (sau khi Founder duyệt).
- **MIT** — fork custom compliance UI/plugin không vướng AGPL.

### 1.4 Điểm yếu / rủi ro

1. **Không giải bài “content engine”** — vẫn cần Claude/script + SKILL (Layer 1).
2. **Không Telegram** — Founder phải duyệt trên web hoặc giữ n8n chỉ cho TG → **2 UX**.
3. **Không thay Zernio rẻ về effort M0** — accountId, MCP, P7 post đã có; OpenPost = setup Meta app + X app + HTTPS media host.
4. **Automation n8n:** product hướng **UI composer**, không document REST public cho “POST pack.json → publish” — tích hợp n8n phải đọc source `backend/api` hoặc headless không khuyến khích.
5. **Video** partial — Alpha M0 JPG + `mediaId` Zernio ổn hơn.
6. **Chi phí X API** vẫn qua tài khoản bạn (giống Zernio pass-through) — không tiết kiệm rule “no URL in tweet”.

### 1.5 Kịch bản dùng OpenPost

| Kịch bản | Khả thi |
|----------|---------|
| Core thay Zernio + n8n publish | △ — được nếu chấp nhận web duyệt + OAuth |
| **Backup scheduler** sau TG OK | △ — copy paste hoặc future API |
| Layer 1 content | ❌ |

**Điểm weighted:** ~**52/100** (X+Threads + MIT + nhẹ; trừ no AI, no TG, Zernio sunk cost).

---

## 2. MarketMeNow ([thearnavrustagi/marketmenow](https://github.com/thearnavrustagi/marketmenow))

### 2.1 Là gì

- **“Marketing intern”** CLI + dashboard: **generate + publish** đa nền, **capsule** tái sử dụng, **repurpose** LLM sang format khác.
- **Stack:** Python 3.12 + uv, PostgreSQL (Docker), optional Playwright + Remotion (Reels).
- **License:** MIT.
- **AI mặc định:** Gemini (`GEMINI_API_KEY`) / Vertex — không Claude out-of-box.

### 2.2 Khớp Alpha

| Yêu cầu | MarketMeNow | Ghi chú |
|---------|-------------|---------|
| X threads | ✅ `mmn twitter thread --post` | Auth: **`TWITTER_AUTH_TOKEN` + `CT0` cookie** hoặc `mmn twitter login` — **không** cùng đường Zernio |
| **Threads** | ❌ **BLOCKER** | README + architecture chỉ: IG, X, Reddit, LinkedIn, YT, TikTok, Email — **không Threads** |
| Cross-post X+Threads 1 lệnh | ❌ | `repurpose-capsule --platform twitter` — không có `--platform threads` |
| `pack.json` schema | ❌ | Capsule riêng; map được nhưng custom |
| Compliance no signal | △ | `mmn project add` + persona YAML — phải viết rule trading |
| TG duyệt | ❌ | Dashboard approve/reject |
| Tiếng Việt XAUUSD | △ | Prompt YAML — không vault GoClaw |

### 2.3 Điểm mạnh (với dự án)

- **Tách generate / publish** rõ — `mmn twitter thread` + **repurpose-capsule** ≈ mẫu Layer 1 brief (thay vì AI trong n8n).
- **Capsule** — một lần sinh, đăng nhiều nền **không generate lại** (tư tưởng giống `pack.json`).
- **Sanitise pipeline** — strip em-dash / AI tells (có thể bổ sung compliance node).
- **MIT + adapters** — thêm Threads adapter về lý thuyết “zero core change” — **effort 1–2 tuần** + Meta OAuth.

### 2.4 Điểm yếu / rủi ro

1. **Không Threads** — fail 50% pilot Alpha (Threads `@alphatrading.lab`).
2. **X auth cookie** — dễ gãy, policy X; brand `@AlphaTrading79` nên dùng API chính thức (Zernio/OpenPost).
3. **Gemini ≠ stack Claude** — SKILL Alpha + Cowork đang Claude; đổi model = giọng + compliance retest.
4. **Nặng** — Postgres, Playwright, Reels (không cần cho Alpha JPG brief).
5. **Engagement automation** (`mmn twitter engage`) — **nguy hiểm** với brand trading (spam/reply bot); out of scope.
6. **Không thay Zernio** cho M0 — vẫn cần Threads path.

### 2.5 Kịch bản dùng MarketMeNow

| Kịch bản | Khả thi |
|----------|---------|
| Core Alpha M0 | ❌ (no Threads) |
| **Mẫu code** `alpha-generate-pack` + repurpose | ✅ đọc `repurpose-capsule`, capsule store |
| Sau khi tự viết Threads adapter | △ — ROI thấp vs Zernio |

**Điểm weighted:** ~**38/100** (mạnh AI workflow, fail Threads + auth + trùng Zernio).

---

## 3. Ma trận điểm (cùng trọng số BrightBean audit)

| Tiêu chí | Trọng số | OpenPost | MarketMeNow |
|----------|----------|----------|-------------|
| X + Threads publish | 25% | 9/10 | 4/10 (chỉ X) |
| Khớp Zernio / pilot | 20% | 4/10 | 3/10 |
| Content generate (trading) | 20% | 1/10 | 7/10 |
| Effort & ops | 15% | 8/10 | 4/10 |
| License | 10% | 9/10 | 9/10 |
| Approval (TG) | 10% | 2/10 | 3/10 |
| **Tổng** | 100% | **~52%** | **~38%** |

---

## 4. Khuyến nghị theo layer (kiến trúc đã chốt)

```text
Layer 1 (1 lần LLM):  SKILL Alpha / script pack.json
                      ← học MarketMeNow: capsule + repurpose (pattern only)
Layer 2 (orchestrate): n8n mỏng — TG Send and Wait, compliance Code
Layer 3 (publish):       Zernio cross_post  ← GIỮ (P7 Done)
                      ← OpenPost chỉ khi: bỏ Zernio + chấp nhận web duyệt
```

| Câu hỏi | Trả lời |
|---------|---------|
| Fork OpenPost cho M0? | **Không** trừ khi Founder quyết bỏ Zernio |
| Fork MarketMeNow cho M0? | **Không** — thiếu Threads; cookie X rủi ro |
| Repo nào copy pattern? | **MarketMeNow** (capsule/repurpose) + **postpilot** (content-as-code) |
| Repo nào thay scheduler? | **OpenPost** (nhẹ, MIT) > BrightBean |

---

## 5. So với postpilot (brief đã gợi ý)

| | postpilot | openpost | marketmenow |
|--|-----------|----------|-------------|
| X | △ Playwright | ✅ API | ✅ |
| Threads | ✅ | ✅ | ❌ |
| AI generate | ✅ script | ❌ | ✅ |
| Effort fork Alpha | Thấp | Trung (OAuth) | Cao (no Threads) |
| **Fit Alpha M0** | **Cao (L1)** | Trung (L3 backup) | Thấp (L1 idea only) |

---

## 6. Hành động doc

- Brief §3: sửa MarketMeNow **Threads → ❌**; OpenPost **→ Phụ / publish backup**.
- Không deploy thêm stack trước khi `pack.json` + n8n mỏng pass M0 §5.

---

## 7. Tham chiếu

- OpenPost providers: https://op.rgo.pt/providers/overview  
- MarketMeNow README: https://github.com/thearnavrustagi/marketmenow  
- BrightBean audit: [`ALPHA_BRIGHTBEAN_STUDIO_AUDIT.md`](./ALPHA_BRIGHTBEAN_STUDIO_AUDIT.md)  
- Pilot: [`PILOT_ALPHA_AUDIT_STATUS.md`](./PILOT_ALPHA_AUDIT_STATUS.md)
