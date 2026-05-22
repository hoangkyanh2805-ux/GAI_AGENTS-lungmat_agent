# Audit — brightbean-studio vs Alpha Media OS

> **Loại:** Review / fit-gap (không phải triển khai)  
> **Ngày:** 2026-05-22  
> **Repo:** [brightbeanxyz/brightbean-studio](https://github.com/brightbeanxyz/brightbean-studio) (~1.7k ⭐, AGPL-3.0)  
> **SSOT dự án:** `config/n8n/brands.json`, `alpha-content-writer` SKILL, `MEDIA_PIPELINE_N8N_M0.md`, `PILOT_ALPHA_AUDIT_STATUS.md`

---

## Executive summary

| Verdict | **Không chọn làm core Alpha M0** |
|---------|----------------------------------|
| Lý do chính | **Không hỗ trợ X/Twitter** (loại trừ có chủ đích trong spec); pilot Alpha = **X + Threads cross-post** qua Zernio |
| Có thể dùng phụ | Chỉ nếu tách brand chỉ Threads + chấp nhận AGPL + vận hành stack Django nặng — **không khớp** roadmap hiện tại |

**Điểm tổng (100):** **32/100** — Threads/calendar/approval tốt cho agency đa nền; **fail blocker** trên X và trên kiến trúc đã chốt (Zernio + pack.json + n8n mỏng).

---

## 1. BrightBean Studio là gì

- **Loại:** SMS (social media management) self-host — thay Buffer/Sendible, **không** content AI engine.
- **Stack:** Django 5 + PostgreSQL + Celery worker + Tailwind; Docker 5 container (prod).
- **License:** **AGPL-3.0** — fork/deploy network service có nghĩa vụ share source nếu modify + serve users.
- **Publish:** First-party OAuth từng nền (Meta, Google, LinkedIn, …) — **không** aggregator, **không** Zernio.

---

## 2. So khớp yêu cầu Alpha (bắt buộc)

| Yêu cầu Alpha | Dự án hiện tại | BrightBean | Khớp? |
|---------------|----------------|------------|-------|
| Publish **X** `@AlphaTrading79` | Zernio `6a0c6dbd…` · P7 Done | **Không** — spec: *"X/Twitter explicitly excluded"* · [Issue #19](https://github.com/brightbeanxyz/brightbean-studio/issues/19) open | **BLOCKER** |
| Publish **Threads** `@alphatrading.lab` | Zernio `6a0c2834…` | ✅ Meta Threads API | Một phần |
| **Cross-post** 1 lần X+Threads | `posts_cross_post` Zernio | Composer per-platform; không Zernio | Không |
| **x_thread** 1–7 tweet ≤280 | `alpha-content-pack.schema.json` | Không X → không thread X | **BLOCKER** |
| **threads_post** ≤500 | SKILL + schema | Caption editor Threads | Có thể tay |
| **Compliance** no signal, no URL tweet | Code node n8n / SKILL | Không có rule trading | Phải custom |
| **Sinh content** XAUUSD persona | Claude + SKILL (1 lần) | Rich composer UI, **không LLM** | Không thay Layer 1 |
| **Duyệt Founder** Telegram | `@alpha79_bot`, chat `-1003878310992` | Email + web approval + client portal | Khác kênh |
| **Media** Drive → Zernio mediaId | M0 manual | Media library S3/local | Khác pipeline |
| **Orchestration** n8n mỏng | Pivot brief 2026-05-22 | Webhook events có — vẫn cần stack riêng | Trùng vai trò nặng |
| **GoClaw freeze** Alpha publish | Đã chốt | Thêm app Django song song | Phức tạp vận hành |

---

## 3. Điểm mạnh (nếu bỏ qua Alpha)

| Khía cạnh | Đánh giá |
|-----------|----------|
| **Threads + 10 nền** | Calendar, queue, retry, audit log 90 ngày — tốt cho agency |
| **Approval workflow** | internal + client, magic link — thay email client tốt hơn TG cho agency |
| **Self-host / no seat limit** | Tiết kiệm $100–300/tháng SaaS nếu nhiều workspace |
| **Webhook notifications** | Có thể nối n8n *sau* publish — không thay TG duyệt đầu |
| **Maturity** | ~1.7k ⭐, Docker/Railway/Heroku, doc platform credentials đầy đủ |

---

## 4. Điểm yếu / rủi ro với dự án

### 4.1 Blocker sản phẩm

1. **Không X/Twitter** — Alpha M0 và P7 đã publish X+Threads qua Zernio; đổi BrightBean = mất nửa kênh hoặc giữ **2 stack** (Zernio cho X + BrightBean cho Threads) → ops gấp đôi, token Meta riêng.
2. **Không thay Zernio** — Đã trả công setup accountId, MCP, cross_post; BrightBean yêu cầu **Meta developer app** + OAuth Threads (và FB nếu IG) — trùng công việc, khác credential store.
3. **Không sinh content trading** — Composer thủ công; không `pack.json`, không vault XAUUSD, không cron 08:00 brief.

### 4.2 License & IP

- **AGPL-3.0:** Deploy VPS cho team/agency → thường phải public fork nếu distribute modified version as network service.
- **Alpha SKILL** `license: Proprietary` — nhúng logic compliance vào BrightBean fork = xung đột pháp lý cần luật sư / tách module MIT riêng.

### 4.3 Vận hành (ops audit)

| Hạng mục | BrightBean prod | Stack Alpha đã có |
|----------|-----------------|---------------------|
| Runtime | Django + Postgres + worker + Caddy | n8n cloud + Zernio SaaS + (optional) script |
| First deploy | Docker build 60–90s; S3 bắt buộc trên Heroku/Railway | Đã có workflow |
| Bảo trì | Migrate Django, Tailwind, platform API breaking | SKILL + brands.json |
| Founder UX | Web dashboard | Telegram + GoClaw (đã quen) |

**Ước lượng effort fork usable:** 2–4 tuần (OAuth Meta, map post model, compliance plugin, **vẫn thiếu X**).

### 4.4 Trùng / conflict kiến trúc pivot

Brief [`alpha-github-content-engine-n8n-brief.md`](./briefs/alpha-github-content-engine-n8n-brief.md) chốt:

```text
Layer 1: Claude/script → pack.json (OFF n8n)
Layer 2: n8n → TG → Zernio
```

BrightBean là **Layer 2+3 gộp** (UI + schedule + publish) — **không giảm token Claude** (vì không có AI); cũng **không rút gọn** n8n nếu vẫn cần TG + Zernio cho X.

---

## 5. Ma trận điểm (weighted)

| Tiêu chí | Trọng số | Điểm /10 | Ghi chú |
|----------|----------|----------|---------|
| X + Threads publish | 25% | **2** | Chỉ Threads |
| Khớp Zernio / pilot Done | 20% | **1** | Phải bỏ hoặc dual stack |
| Content generate (trading) | 20% | **1** | Không AI |
| Effort & ops | 15% | **3** | Stack nặng |
| License | 10% | **4** | AGPL |
| Approval / calendar | 10% | **8** | Tốt nhưng không TG |
| **Tổng** | 100% | **~3.2/10** | |

---

## 6. Kịch bản nếu vẫn muốn dùng

| Kịch bản | Khả thi | Ghi chú |
|----------|---------|---------|
| **A — Core thay n8n+Zernio** | ❌ | Thiếu X |
| **B — Chỉ schedule Threads** | △ | X vẫn Zernio; 2 hệ thống, Founder duyệt 2 chỗ |
| **C — Agency Digitop (3 brand, nhiều FB/IG)** | △ | Khớp BrightBean hơn Alpha; vẫn không X trading |
| **D — Webhook → n8n** sau post | ✅ nhẹ | Chỉ log Sheet; không giải content gen |

**Khuyến nghị:** Giữ **postpilot pattern / alpha-generate-pack** + **Zernio** + **n8n mỏng**. Xem **openpost** chỉ khi bỏ Zernio hoàn toàn.

---

## 7. So sánh nhanh với shortlist brief

| | BrightBean | postpilot | openpost | Zernio (hiện tại) |
|--|------------|-----------|----------|-------------------|
| X | ❌ | △ | ✅ | ✅ |
| Threads | ✅ | ✅ | ✅ | ✅ |
| AI content | ❌ | ✅ script | ❌ | ❌ (external) |
| Trading compliance | ❌ | custom | custom | custom SKILL |
| AGPL | ✅ | check | MIT? | SaaS |
| Đã pilot | ❌ | ❌ | ❌ | **✅ P7** |

---

## 8. Kết luận audit

1. **BrightBean-studio không pass gate Alpha M0** vì thiếu **X/Twitter** — đây là kênh chính của `@AlphaTrading79`, không phải nice-to-have.
2. **Không giải bài toán token n8n** — không có LLM; vấn đề token nằm ở Layer 1 (đã có hướng brief).
3. **Không thay thế Zernio** đã Done — chi phí chuyển > lợi ích calendar.
4. **Cân nhắc lại** khi: (a) BrightBean merge Issue #19 X API, (b) Digitop agency cần 10+ nền FB/IG/LinkedIn, (c) bỏ Zernio và chấp nhận OAuth trực tiếp + AGPL compliance.

**Hành động đề xuất:** Không fork BrightBean cho Alpha pilot; ghi vào [`alpha-github-content-engine-n8n-brief.md`](./briefs/alpha-github-content-engine-n8n-brief.md) §3 cột "Audit" = **Rejected — no X**.

---

## 9. Tham chiếu

- Feature spec (no X): `development_specs/feature-spec-social-media-management-v2.md` trên repo
- Issue X: https://github.com/brightbeanxyz/brightbean-studio/issues/19
- Pilot status: [`PILOT_ALPHA_AUDIT_STATUS.md`](./PILOT_ALPHA_AUDIT_STATUS.md)
