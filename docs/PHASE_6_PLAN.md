# Phase 6 — Production Hardening (Kế hoạch)

> **Mục tiêu Phase 6:** Agent chạy ổn định 24/7, deploy lặp lại được, CI bắt lỗi trước khi merge, secrets an toàn.  
> **Không bắt buộc** vector DB, Threads/X, hay sync toàn bộ Supabase — để Phase 7–8.

**Liên quan:** [NEXT_STEPS.md](./NEXT_STEPS.md) (verify live trước) · [architecture.md](./architecture.md) · [ROADMAP.md](./ROADMAP.md)

**Cập nhật:** 2026-05-15

---

## 1. Nên làm gì trước — verify hay Phase 6 code?

| Thứ tự | Việc | Lý do |
|--------|------|--------|
| **1** | **Verify live** ([NEXT_STEPS.md §1](./NEXT_STEPS.md)) | Miễn phí (trừ API); tránh deploy pipeline cho hệ thống chưa chạy đúng Telegram/cron |
| **2** | **Host 24/7 tối thiểu** (PC nhà hoặc VPS rẻ) | Cron + DM admin cần process luôn bật |
| **3** | **Docker + GitHub Actions** | Khi verify xong; tiện deploy và PR không phá build |

**Kết luận:** Không chọn “chỉ SOP” *hoặc* “chỉ Docker” — **verify trước (đã có SOP + NEXT_STEPS)**, rồi **Phase 6 = VPS/Docker + CI**. Bổ sung SOP chi tiết chỉ cần khi verify phát hiện gap; hiện SOP §6.1 / §9 đã đủ cho bước đầu.

---

## 2. Thiết bị / hạ tầng cần gì?

### 2.1 Tối thiểu (dev + test live)

| Hạng mục | Cần? | Ghi chú |
|----------|------|---------|
| PC/laptop (Windows) | Có | Đã dùng — `npm run dev`, Google Drive sync G: |
| Node.js 20 LTS | Có | Cài local; runtime.js copy sang `C:\lungmat_agent` |
| Internet ổn định | Có | Gọi Telegram, Yahoo, Apify, Anthropic |
| Telegram account + BotFather | Có | Miễn phí |
| Channel/group Telegram | Có | Miễn phí |

**Không bắt buộc:** server riêng, domain, Docker — nếu chỉ test ban ngày trên máy bật `npm run dev`.

### 2.2 Production (cron 24/7 — khuyến nghị)

| Hạng mục | Cần? | Ghi chú |
|----------|------|---------|
| **VPS hoặc cloud VM** 1 vCPU, 1–2 GB RAM | **Có** | Ubuntu 22.04; chạy `node dist/index.js` hoặc Docker |
| Hoặc PC nhà bật 24/7 | Thay thế | Điện + mạng; IP đổi nếu không có static |
| Reverse proxy (optional) | Không bắt buộc | Agent chủ yếu **outbound** (Telegram long-poll, API). Không cần public URL nếu không gọi HTTP từ ngoài |
| Domain + HTTPS | Không bắt buộc | Chỉ cần nếu webhook Telegram hoặc API public; hiện dùng **long-polling** |
| GitHub repo | Có (đã có) | CI + backup code |

**Spec tối thiểu đủ cho lungmat-agent:**

- CPU: 1 vCPU  
- RAM: 512 MB–1 GB (Node + logs; 1 GB an toàn hơn)  
- Disk: 10–20 GB  
- OS: Linux x64 (deploy) hoặc Windows (dev)

---

## 3. Chi phí ước tính (tham khảo)

Giá thay đổi theo nhà cung cấp và tỷ giá — dùng làm **ngân sách tư duy**, không báo giá cố định.

### 3.1 Hạ tầng (host agent 24/7)

| Phương án | Ước tính / tháng | Ghi chú |
|-----------|-------------------|---------|
| PC nhà + điện | ~50k–150k VND điện (tuỳ máy) | Không phí VPS; cron phụ thuộc máy không sleep |
| VPS budget (Vultr, DigitalOcean, Contabo, …) | ~$4–8 USD (~100k–200k VND) | 1 GB RAM, đủ Node |
| Oracle Cloud free tier | **$0** | 2 VM ARM free (có thể đủ); setup phức tạp hơn |
| Railway / Render free | $0–5 USD | Free tier có giới hạn sleep — **không phù hợp cron 24/7** nếu bị sleep |
| AWS/GCP/Azure micro | ~$5–15 USD | Ổn nếu đã quen ecosystem |

**Khuyến nghị:** VPS ~$5/tháng hoặc Oracle free nếu chấp nhận cấu hình; tránh PaaS free sleep cho cron.

### 3.2 API & dịch vụ (theo usage)

| Dịch vụ | Bắt buộc? | Ước tính | Ghi chú |
|---------|-----------|----------|---------|
| **Telegram Bot API** | Có (publish) | **$0** | Miễn phí |
| **Yahoo Finance** (chart) | Có (XAUUSD) | **$0** | Không official SLA; có thể rate-limit |
| **Anthropic** (Claude) | Tuỳ chọn | ~$1–20+/tháng | `market_summary`, `write_thread`; Haiku rẻ; tắt nếu chỉ cron research không LLM reply |
| **Apify** | Tuỳ chọn | Free tier + pay per run | Research; có mock fallback |
| **Supabase** | Tuỳ chọn | **$0** (free tier) | Chỉ audit logs; runtime không bắt buộc |
| **GitHub** (repo + Actions) | Khuyến nghị | **$0** (public/private free minutes) | CI typecheck + e2e vài phút/PR đủ free |

### 3.3 Tổng kịch bản

| Kịch bản | Host | API | ~Tổng/tháng |
|----------|------|-----|-------------|
| **Tối thiểu** | PC nhà 24/7 | Chỉ Telegram + Yahoo, `MOCK_LLM=1` test | ~0 USD API |
| **Live content (vàng)** | VPS $5 | Anthropic Haiku nhẹ + Apify ít run | **~$5–15 USD** |
| **Full automation** | VPS $5–8 | Anthropic + Apify thường xuyên + Supabase free | **~$15–40 USD** |

**Thiết bị phần cứng mua thêm:** không cần — dùng máy hiện có + VPS ảo.

---

## 4. Deliverables Phase 6 (trong repo)

### 4.1 Ưu tiên cao

| # | Deliverable | Mục đích |
|---|-------------|----------|
| P6-1 | `Dockerfile` + `.dockerignore` | Build image Node 20, `npm run build`, `CMD node dist/index.js` |
| P6-2 | `docker-compose.yml` | App + mount `logs/`, env từ file |
| P6-3 | `.github/workflows/ci.yml` | `typecheck` + `test:e2e-local` (`MOCK_LLM=1`) trên push/PR |
| P6-4 | `docs/DEPLOY.md` | SSH VPS, pull, compose up, rotate logs |
| P6-5 | Secrets | Document: không commit `.env`; GitHub Secrets cho CI nếu cần |

### 4.2 Ưu tiên trung bình

| # | Deliverable | Mục đích |
|---|-------------|----------|
| P6-6 | `systemd` hoặc `pm2` example | Restart khi crash (nếu không Docker) |
| P6-7 | Healthcheck Docker | `GET /health` |
| P6-8 | E2E case `approve` + `publish: true` | Khóa unified publish |
| P6-9 | Log rotation gợi ý | `logs/agent.log` không phình vô hạn |

### 4.3 Để sau (không Phase 6)

- Webhook Telegram (cần HTTPS public URL)
- Kubernetes / multi-region
- Sync Supabase jobs/approvals
- Monitoring Datadog/Sentry (có thể thêm 1 dòng health ping sau)

---

## 5. GitHub Actions — phạm vi đề xuất

```yaml
# Kích hoạt: push + pull_request → main
jobs:
  ci:
    - checkout
  - setup-node 20
  - npm ci
  - npm run typecheck
  - MOCK_LLM=1 npm run test:e2e-local
```

**Chi phí:** $0 trong free tier cho repo cá nhân/nhỏ.  
**Không chạy trên CI:** Apify/Telegram thật (giữ e2e mock).

**Secrets CI (optional):** thường **không cần** cho e2e mock; chỉ cần nếu thêm integration test thật (không khuyến nghị trên public CI).

---

## 6. Docker — phạm vi đề xuất

```dockerfile
# Ý tưởng — implement ở task P6-1
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Lưu ý project:**

- Dev hiện dùng `scripts/runtime.js` (G: → C:) — **chỉ Windows dev**; production Linux dùng Docker trực tiếp trong repo.
- Volume: `./logs` để giữ queue/approvals/RAG giữa restart.
- `.env` mount: `env_file: .env` trong compose — **không** bake secret vào image.

---

## 7. Checklist triển khai Phase 6

### Giai đoạn A — Verify (tuần 1)

- [ ] [NEXT_STEPS.md §1](./NEXT_STEPS.md) hoàn thành  
- [ ] PHASE_STATUS: 5B → DONE  

### Giai đoạn B — Host 24/7 (tuần 1–2)

- [ ] Chọn VPS hoặc PC 24/7  
- [ ] Cài Node 20 hoặc Docker trên host  
- [ ] Copy `.env` production (`MOCK_LLM=0`, secrets mạnh)  
- [ ] `npm run build && npm run start` hoặc `docker compose up -d`  
- [ ] Xác nhận cron + DM admin sau 24h  

### Giai đoạn C — Repo hardening (tuần 2–3)

- [x] P6-1 … P6-3 (Docker + CI) — `Dockerfile`, `docker-compose.yml`, `.github/workflows/ci.yml`  
- [x] P6-4 [DEPLOY.md](./DEPLOY.md)  
- [x] P6-8 E2E `approve` + `publish: true`  
- [ ] PR merge → CI xanh trên GitHub  

### Giai đoạn D — Vận hành (liên tục)

- [ ] Theo dõi `/check_errors`, disk `logs/`  
- [ ] Rotate/regenerate `AGENT_SHARED_SECRET` nếu lộ  
- [ ] Theo dõi bill Anthropic/Apify  

---

## 8. Rủi ro & giảm thiểu

| Rủi ro | Giảm thiểu |
|--------|------------|
| VPS hết RAM | 1 GB RAM; `JobQueue.prune`; giới hạn log |
| Yahoo/Apify đổi API | Mock fallback đã có; alert khi `_(mock)_` trong reply |
| Secret lộ trên GitHub | `.gitignore` `.env`; GitHub secret scanning |
| Cron duplicate khi scale 2 instance | **Chỉ 1 instance** chạy scheduler (Phase 6 không scale ngang) |
| Máy Windows sleep | Dùng VPS Linux cho production |

---

## 9. Trả lời nhanh câu hỏi

**Có cần mua server vật lý không?**  
→ Không. VPS ảo hoặc PC hiện có là đủ.

**Có cần domain không?**  
→ Không, với long-polling Telegram và không expose API public.

**Docker có bắt buộc không?**  
→ Không. Có thể `pm2` + Node trên VPS. Docker giúp deploy lặp lại — nên làm ở Phase 6 nhưng không chặn go-live.

**GitHub Actions có tốn tiền không?**  
→ Thường $0 cho repo nhỏ (vài trăm phút CI/tháng).

**Chi phí cố định tối thiểu để chạy vàng + Telegram thật?**  
→ ~**$5/tháng VPS** + **~$0–10/tháng LLM** tuỳ số lần `market_summary` / `write_thread` (có thể giảm bằng cách chỉ cron research + admin approve nội dung ngắn).

---

## 10. Bước tiếp theo (hành động)

1. Anh **verify live** theo [NEXT_STEPS.md](./NEXT_STEPS.md).  
2. Chọn host: VPS ~$5 hoặc PC 24/7.  
3. Bảo tôi implement **P6-1 → P6-3** (Dockerfile + compose + GitHub Actions) trong repo.  

Khi sẵn sàng implement code Phase 6, nhắn: *"làm P6 Docker + CI"*.
