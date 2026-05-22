# Digitop Agency Framework — Áp dụng XAUUSD Media OS

> **Nguồn:** [Digitop — Agency use case](https://digitop.ai/use-cases/agency/) (Duy · GoClaw.sh)  
> **Liên quan:** GoClaw `agent.hoa-homes.com` · 3 brand Alpha / Raymond / VIP10X · [`AGENT_ROSTER_AUDIT.md`](./AGENT_ROSTER_AUDIT.md)

**Cập nhật:** 2026-05-19

---

## 1. Bài Digitop nói gì? (tóm tắt cho Founder)

### Vấn đề agency VN (bạn không mắc hết — nhưng 3 brand cũng bị)

| Triệu chứng Digitop | Có trong dự án này? |
|---------------------|---------------------|
| Mỗi người một ChatGPT → **3 giọng khác nhau** | ⚠️ Rủi ro nếu không có Style Bible |
| Guideline nằm trong đầu / Google Doc cũ | ✅ Đang fix bằng **Vault 38 docs** + persona Skill |
| CD duyệt 50–70 draft/ngày | ✅ **Founder = CD** — 1 admin duyệt trên Telegram |
| Kiến thức senior nghỉ → mất | ✅ Vault + repo `personas/*.ts` |
| Không có “bộ não chung” | 🔄 GoClaw Vault + Skill export |

**Ẩn dụ:** Bạn không phải agency 50 người — nhưng vận hành **3 brand** giống agency mini: cùng một “studio” (Founder), cần **một não**, không phải 3 ChatGPT rời.

---

## 2. Framework 4 tầng Digitop → map dự án

```text
Digitop Agency          →    XAUUSD Media OS (bạn)
─────────────────────────────────────────────────────
Tầng 1 Knowledge        →    GoClaw Vault + docs/vault-seed/
Tầng 2 Intelligence     →    Web search + macro (thiếu scoring)
Tầng 3 Creative         →    3 Brand Writer + gpt-image-2 + Zernio
Tầng 4 QC               →    Compliance gate + Founder duyệt TG
Hạ tầng multi-tenant    →    3 brand tách Skill (Alpha/Raymond/VIP10X)
```

### Tầng 1 — Bộ não kiến thức (Knowledge)

| Digitop | Bạn đã có / cần |
|---------|-----------------|
| Style Bible từng vertical | **3 persona** (`alpha`, `raymond`, `vip10x`) + Vault folders |
| Tone, taboo, case study | `docs/vault-seed/` + `XAUUSD_MEDIA_OS.md` guardrails |
| Senior nghỉ không mất | Repo + GoClaw Vault upload |

**Việc làm:**

- [ ] Upload đủ **38 vault docs** (đang pilot)
- [ ] Thêm **Brand Style Bible** ngắn mỗi brand (1 file/tầng GoClaw `Team` hoặc `Agent` — không Shared giữa brand)
- [ ] Taboo list trading: không buy/sell, không “chắc ăn”, không lot size

### Tầng 2 — Tai mắt (Intelligence)

| Digitop | Bạn đã có / cần |
|---------|-----------------|
| Quét 200 nguồn → 20 topic | Apify/Yahoo trong lungmat; GoClaw **web search** trong Writer |
| Scoring + brand-fit | ❌ **Thiếu** — chưa có agent chấm điểm topic |
| Theo dõi đối thủ | ❌ Optional P2 |

**Việc làm (P2 — không block pilot Alpha):**

- [ ] **Topic Scout** (GoClaw Cron sáng): “XAUUSD Fed DXY gold” → 5 headline + gợi ý topic cho 3 brand
- [ ] Founder chọn 1 topic/brand — không auto 20 bài

**Không cần:** tool social listening riêng lúc MVP — web search + macro brief đủ.

### Tầng 3 — Xưởng sáng tạo (Creative)

| Digitop agent | Map Media OS |
|---------------|--------------|
| Idea Director | Gộp vào **Brand Writer** prompt (angle trong JSON pack) |
| Copy Factory | **Alpha/Raymond/VIP10X Writer** + `ContentAgent` schema |
| Design Brief | `thumbnail_brief` + gpt-image-2 |
| 2 mode Community vs Client | **3 brand** = 3 mode cố định (institutional / mentor / momentum) |

**Việc làm (P0–P1):**

- [x] Schema pack: TG + X + Threads + YouTube (`ContentAgent.ts`)
- [ ] GoClaw **3 Writer agents** + Cron 08/13/19h
- [ ] Zernio publish sau duyệt

### Tầng 4 — QC (Kiểm soát chất lượng)

| Digitop | Bạn đã có / cần |
|---------|-----------------|
| QC agent viral + brand-fit score | ❌ → **Compliance gate** trong Skill (rule-based, đủ MVP) |
| CD 50 draft → 10–15 đã QC | **Founder duyệt 1 lần** trên Telegram trước Zernio |
| Report weekly auto | ❌ P3 — không ưu tiên |

**Việc làm (P0):**

- [ ] Thêm **Compliance checklist** vào mỗi brand Skill (5 dòng trước publish)
- [ ] Không auto-post Zernio nếu chưa “OK đăng”

---

## 3. Hạ tầng Digitop yêu cầu — GoClaw đã cover phần nào

| Yêu cầu Digitop | GoClaw / dự án |
|-----------------|----------------|
| Workspace tách từng khách | **3 agent** tách persona (không lẫn Alpha vào Raymond) |
| Data cách ly | Vault tag + Skill riêng; **không** mix sales chat vào Shared |
| Phân quyền role | Admin DM vs public Linh Cẩu |
| Audit log | GoClaw activity (kiểm tra UI) |
| Multi-model | GoClaw provider (Claude, Gemini, OpenAI…) |
| MCP / Sheets / Drive | P3 — Zernio đủ cho X/Threads pilot |
| AgentBrain “AI-Safe” | Vault scope: foundation = Shared; brand case = Team/Agent |

**Cảnh báo bài Digitop:** OpenClaw “Agents of Chaos” — data brand A lộ sang brand B.  
**Cách tránh:** 3 Skill riêng · không dùng chung một agent “viết hết” · compliance trước publish.

---

## 4. Agent cần thêm (sau khi đọc Digitop + audit cũ)

Gộp với [`AGENT_ROSTER_AUDIT.md`](./AGENT_ROSTER_AUDIT.md):

| Ưu tiên | Agent / layer | Tầng Digitop | Nền tảng |
|---------|---------------|--------------|----------|
| **P0** | Alpha/Raymond/VIP **Writer** | Creative | GoClaw |
| **P0** | **Compliance gate** (trong Skill) | QC | GoClaw |
| **P0** | **Publish orchestrator** (Zernio bước cuối) | QC + Creative | GoClaw |
| **P1** | **Topic Scout** (cron sáng) | Intelligence | GoClaw |
| **P1** | **Brand Style Bible** (3 file ngắn) | Knowledge | Vault |
| **P2** | **Lửng Mật Coach** | — (founder ops) | GoClaw admin |
| **P2** | QC score tự động (viral/brand-fit) | QC | Chỉ khi volume lớn |
| **—** | EngineerKit planner/tester | — | Claude Code dev repo |

**Không cần (agency 50 người nhưng bạn solo):**

- CEO Digest agent hàng ngày  
- Report weekly auto cho 10 khách  
- Design Brief agent riêng (đã gộp thumbnail_brief)  
- Copy Factory tách khỏi Writer (trùng schema)

---

## 5. So sánh: trước Digitop vs sau khi áp dụng

| | Trước (lungmat + Typefully + n8n) | Sau (Digitop mindset + GoClaw) |
|---|----------------------------------|------------------------------|
| Não chung | RAG keyword yếu, persona trong code | **Vault + Skill** |
| 3 brand voice | 1 ContentAgent + persona switch | **3 agent GoClaw** |
| Duyệt | 4 nút lungmat | Telegram + compliance |
| Publish | Paste Typefully | **Zernio** sau OK |
| Scale founder | Founder = mọi bước | Cron + agent; Founder chỉ duyệt |

---

## 6. Plan 3 tuần (Digitop-inspired, solo founder)

### Tuần 1 — Knowledge + Creative (P0)

| Ngày | Việc |
|------|------|
| 1–2 | Vault 38 docs + smoke test |
| 3–4 | Alpha Writer Skill + compliance + Zernio E2E |
| 5 | Brand Style Bible Alpha (1 trang: tone, taboo, CTA) |

### Tuần 2 — Scale 3 brand (P1)

| Ngày | Việc |
|------|------|
| 1–2 | Raymond + VIP10X Skill + Cron 13h/19h |
| 3 | Topic Scout cron 07:30 (optional) |
| 4–5 | 3 ngày publish ổn → điều chỉnh prompt |

### Tuần 3 — Hardening (P2)

| Việc |
|------|
| Lửng Mật Coach trên GoClaw (nếu cần) |
| EngineerKit: export Skill + E2E (nếu đã mua) |
| Cập nhật `AGENT_ROSTER_AUDIT` + PROJECT_STATUS |

---

## 7. Digitop vs EngineerKit vs Zernio — ai làm gì

```text
Digitop (tư duy)     →  Thiết kế 4 tầng + multi-brand isolation
GoClaw (hạ tầng)     →  Vault, agents, cron, Telegram
Zernio (publish)     →  X + Threads (+ YT meta)
EngineerKit ($99)    →  Dev repo (Skill, test, docs) — KHÔNG thay GoClaw
lungmat-agent        →  Source code + legacy dev test
```

---

## 8. Tư duy 4 câu (Digitop) — áp dụng hàng ngày

1. **AI không phải tool cá nhân** — một GoClaw, ba brand Skill, một Vault.  
2. **Kiến thức hệ thống hóa** — vault-seed + persona trong repo, không chỉ trong đầu Founder.  
3. **Quy trình thiết kế** — Cron → draft → compliance → Founder OK → Zernio.  
4. **Cách ly brand** — không dùng insight VIP10X trong bài Alpha; sales data không Shared Vault.

---

## 9. Kết luận

Bài Digitop **xác nhận đúng hướng** bạn đang làm với GoClaw + Zernio + Vault — đó là “agency mini” 3 brand với **bộ não chung** thay vì 3 ChatGPT rời.

**Thiếu so với framework Digitop (ưu tiên thêm):**

1. Compliance gate (QC layer đơn giản)  
2. Brand Style Bible 3 file  
3. Topic Scout (Intelligence — P2)  
4. Tách hẳn 3 Writer agent (Creative isolation)

**Không cần:** full agency stack 17 agent Digitop marketing — scale theo volume thật sau 2 tuần publish ổn.

---

**Telegram 1:1 khách (sales CSKH):** xem riêng [`DIGITOP_REALESTATE_1TO1_APPLICATION.md`](./DIGITOP_REALESTATE_1TO1_APPLICATION.md) — không gộp vào Linh Cẩu.

*Tham chiếu: [digitop.ai/use-cases/agency](https://digitop.ai/use-cases/agency/) · [digitop.ai/use-cases/real-estate](https://digitop.ai/use-cases/real-estate/) · GoClaw [goclaw.sh](https://goclaw.sh/)*
