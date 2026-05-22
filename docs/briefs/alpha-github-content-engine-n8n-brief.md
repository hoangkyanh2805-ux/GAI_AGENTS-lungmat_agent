# Brief — GitHub content engine + n8n mỏng (Alpha X / Threads)

> **Giao cho:** Claude Code · Codex · Claude Cowork (research + PoC + doc)  
> **Không giao:** n8n canvas làm AI Agent loop (đốt token mỗi tin Telegram)  
> **Owner:** Founder  
> **Generated:** 2026-05-22

---

## Copy-paste mở session

```text
Đọc docs/briefs/alpha-github-content-engine-n8n-brief.md (brief này) trước.

Nhiệm vụ: khảo sát GitHub repo phù hợp X+Threads content (trading/XAUUSD),
chọn 1–2 repo fork/custom, thiết kế kiến trúc "Content OFF n8n + n8n orchestration",
PoC Alpha pack.json → Telegram duyệt → Zernio. Không build AI Agent trong n8n.

Đọc thêm: docs/MEDIA_PIPELINE_N8N_M0.md, config/n8n/brands.json,
docs/goclaw-export/skills/alpha-content-writer/SKILL.md.

Trả lời: bảng repo (top 5), đề xuất 1 kiến trúc chốt, 3 bước PoC tuần này.
Không paste API key. Không commit secret.
```

---

## 1. Vì sao đổi hướng (1 đoạn)

Pilot n8n #11138 fork: **mỗi tin Telegram = execution mới = Claude chạy lại** (~2–3 lần LLM/bài).  
Compliance rule 4 (tweet >280 / URL) hay fail. Popup Execute vs Active gây nhầm.

**Chốt:** **Sinh content ngoài n8n** (CLI / repo / Claude Code 1 lần) → **n8n chỉ** validate file, Telegram duyệt, Zernio HTTP, Sheet.

GoClaw Alpha publish **freeze**. Linh Cẩu giữ trên GoClaw.

---

## 2. Mục tiêu (done when)

| # | Deliverable |
|---|-------------|
| R1 | Bảng **≥5 repo GitHub** đánh giá (license, X+Threads, self-host, trading fit, AI tách rời publish) |
| R2 | **1 kiến trúc chốt** (sơ đồ + vai từng layer) |
| R3 | **PoC:** 1 lần chạy tạo `pack.json` hợp schema → TG duyệt → Zernio Published |
| R4 | Doc `docs/ALPHA_CONTENT_ENGINE_ARCHITECTURE.md` (hoặc cập nhật MEDIA_PIPELINE) |
| R5 | n8n workflow **mỏng** (không node AI Agent / Anthropic HTTP) — export JSON |

**Out of scope:** FB/Instagram, GoClaw Orchestrator, Raymond/VIP M1, tích hợp SalesMartly.

---

## 3. OSS catalog + template audit (2026-05-22)

- **Top 12 GitHub + mix-and-match stack:** [`ALPHA_OSS_CONTENT_FACTORY_CATALOG.md`](../ALPHA_OSS_CONTENT_FACTORY_CATALOG.md)  
- **4 nguồn (LC agent, n8n 3066/2950, gist):** [`ALPHA_TEMPLATE_SOURCES_AUDIT.md`](../ALPHA_TEMPLATE_SOURCES_AUDIT.md)  
- **Fork POC Alpha:** [`oss-fork-alpha-content-factory.md`](./oss-fork-alpha-content-factory.md)

| Nguồn | Verdict |
|-------|---------|
| langchain-ai/social-media-agent | Layer 1 custom (~58/100) |
| n8n #3066 | Fork strip AI (~48/100) |
| n8n #2950, Gist omergocmen | Reject |
| `workflows/alpha-m0.template.json` | Layer 2 chốt (~78/100) |

---

## 3b. Repo GitHub — shortlist khảo sát (2026-05)

> Agent **clone + đọc README** — không chọn chỉ từ tên. Ưu tiên **MIT/Apache**, self-host, X+Threads, tách **generate** vs **publish**.

| Repo | Stars≈ | X | Threads | Generate | Publish | Trading fit | Ghi chú |
|------|--------|---|---------|----------|---------|-------------|---------|
| [rodrgds/openpost](https://github.com/rodrgds/openpost) | ~256 | ✅ | ✅ | ❌ | ✅ scheduler | Trung bình | **Phụ ~52/100** — [`ALPHA_MARKETMENOW_OPENPOST_AUDIT.md`](../ALPHA_MARKETMENOW_OPENPOST_AUDIT.md); backup publish nếu bỏ Zernio |
| [brightbeanxyz/brightbean-studio](https://github.com/brightbeanxyz/brightbean-studio) | ~1.7k | ❌ **no X** | ✅ | UI compose | ✅ | Thấp | **Rejected** — audit [`ALPHA_BRIGHTBEAN_STUDIO_AUDIT.md`](../ALPHA_BRIGHTBEAN_STUDIO_AUDIT.md) |
| [stukenov/postpilot](https://github.com/stukenov/postpilot) | mới | △ Playwright | ✅ | ✅ script OpenRouter | ✅ CLI | **Cao** | **content-as-code** — mẫu Layer 1 |
| [thearnavrustagi/marketmenow](https://github.com/thearnavrustagi/marketmenow) | ? | ✅ | ❌ **no Threads** | ✅ CLI `mmn` | ✅ cookie X | Thấp | **Rejected core ~38/100** — học capsule/repurpose; audit cùng OpenPost |
| [mean-weasel/bullhorn](https://github.com/mean-weasel/bullhorn) | ? | ✅ | ❌ | ✅ UI/MCP | schedule | Thấp | **MCP + Claude Code** — draft/scheduling, không Threads |
| [tanultt/ccpost](https://github.com/tanultt/ccpost) | ? | ✅ thread | ❌ | ✅ CLI | copy only | Thấp | Dev-session → X; không trading persona |
| [Kensuke-sam/twitter-cli-bot](https://github.com/Kensuke-sam/twitter-cli-bot) | ? | ✅ | ❌ | ✅ URL/topic CLI | twitter-cli | Trung bình | Article→thread; có thể wrap headline feed |

**Không dùng làm core Alpha:** MAKORA / aSentrX / Sukuna (trading **execution** bot, không content marketing).

### Gợi ý chọn (cập nhật re-rank)

| Vai trò | Repo ưu tiên | Lý do |
|---------|--------------|-------|
| **A — Content factory** | **langchain-ai/social-media-agent** | Winner — LangGraph + Claude + HITL + FireCrawl |
| **B — Publish** | Giữ **Zernio HTTP** | P7 Done |
| **C — Orchestration** | `alpha-m0.template.json` | n8n mỏng webhook |
| Feeder (F3) | fin-thread / Horizon | URL → LC agent |

---

## 4. Kiến trúc chốt (đề xuất)

```text
┌─────────────────────────────────────────────────────────┐
│ LAYER 1 — Content Engine (OFF n8n, 1 lần LLM/bài)      │
│  Input: topic / headlines / Drive brief                  │
│  Tool: Claude Code + alpha-content-writer SKILL          │
│        hoặc fork postpilot generator script              │
│  Output: pack.json (schema alpha-content-pack)           │
│          + optional mediaId (Zernio Media, tay M0)       │
└───────────────────────────┬─────────────────────────────┘
                            │ file / webhook
                            ▼
┌─────────────────────────────────────────────────────────┐
│ LAYER 2 — n8n Orchestrator (NO Anthropic nodes)          │
│  Trigger: Cron 08:00 VN hoặc webhook "pack ready"         │
│  Nodes: Read file → Code compliance → IF                 │
│         → Telegram Send and Wait (1 execution duyệt)      │
│         → Zernio Publish HTTP → Sheet append               │
└─────────────────────────────────────────────────────────┘
```

**Token rule:** Claude chỉ chạy ở Layer 1. n8n **Code node** compliance (miễn phí).

---

## 5. Phân công agent

| Agent | Việc |
|-------|------|
| **Claude Code / Codex** | Clone 1–2 repo; PoC generator; script `scripts/alpha-generate-pack.ts`; compliance tests; n8n workflow mỏng |
| **Cowork** | Dẫn Founder chọn repo; chạy PoC; tick checklist; không sửa n8n tay |
| **Cursor** | Review PR; sync `docs/`, `config/n8n/schemas/` |
| **n8n** | Chỉ Founder: credentials, Active, test TG |

---

## 6. PoC tuần này (3 bước)

### Bước 1 — Generate OFF n8n (1 lần Claude)

```bash
# Ví dụ — implement trong repo
npm run alpha:pack -- --topic "XAUUSD brief Fed DXY"
# → output/alpha/2026-05-22/alpha-xxx.pack.json
```

Pass: schema `config/n8n/schemas/alpha-content-pack.schema.json`, compliance PASS (≤280, no signal).

### Bước 2 — n8n mỏng

Workflow mới: `Alpha Orchestrator v2` (không AI Agent, không Telegram Trigger loop):

1. **Webhook** hoặc **Manual** nhận `{ runId, packPath, mediaId }`
2. **Read Binary/File** hoặc HTTP GET pack
3. **Code** compliance (copy từ template)
4. **Telegram Send and Wait** — 1 lần duyệt
5. **Zernio Publish**
6. **Google Sheet** (optional)

### Bước 3 — Founder test

1 lần end-to-end: pack có sẵn → TG `OK đăng` + mediaId → Zernio Published.

---

## 7. Custom Alpha (bắt buộc khi fork repo)

| Hạng mục | Alpha rule |
|----------|------------|
| Persona | Institutional XAUUSD — SKILL SSOT |
| Compliance | No signal, no entry/SL/TP, tweet ≤280, threads ≤500, no URL in tweet |
| Platforms | X `@AlphaTrading79` + Threads `@alphatrading.lab` |
| Publish | Zernio accountIds trong `config/n8n/brands.json` |
| Media | Drive `01_ready_jpg/full` → Zernio mediaId (M0 manual) |

---

## 8. Đánh giá repo (template — agent điền sau khi clone)

| Tiêu chí | Trọng số |
|----------|----------|
| License (MIT/Apache > AGPL) | 20% |
| X + Threads publish path | 25% |
| Tách generate / publish | 25% |
| Self-host / Docker | 15% |
| Effort fork (ngày) | 15% |

Điền sheet trong `docs/ALPHA_GITHUB_REPO_EVAL.md` (agent tạo khi research).

---

## 9. Freeze / retire

| Retire | Thay bằng |
|--------|-----------|
| n8n `alpha-m0-11138-telegram` AI Agent loop | Orchestrator v2 |
| GoClaw Alpha Writer publish | Layer 1 script |
| Mỗi tin TG trigger full Claude | 1 pack / 1 lần generate |

---

## 10. Liên kết repo hiện tại

| Doc | |
|-----|--|
| n8n M0 (cũ) | [`docs/MEDIA_PIPELINE_N8N_M0.md`](../MEDIA_PIPELINE_N8N_M0.md) |
| SKILL Alpha | [`docs/goclaw-export/skills/alpha-content-writer/SKILL.md`](../goclaw-export/skills/alpha-content-writer/SKILL.md) |
| brands.json | [`config/n8n/brands.json`](../../config/n8n/brands.json) |
| Zernio IDs | [`docs/PILOT_ALPHA_AUDIT_STATUS.md`](../PILOT_ALPHA_AUDIT_STATUS.md) |

---

## 11. Báo cáo cuối (template agent)

```markdown
## Alpha GitHub + n8n v2 — báo cáo
- Repo chọn: ...
- Fork URL / branch: ...
- PoC pack path: ...
- Zernio post id: ...
- Token Claude lần generate: ~$...
- Blocker: ...
- Đề xuất tuần sau: ...
```
