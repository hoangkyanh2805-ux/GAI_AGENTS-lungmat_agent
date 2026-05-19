# Deploy — Supabase (Lungmat Agent)

> SOP setup Supabase project làm L3 storage cho agent.
> **Bổ sung cho [DEPLOY.md](./DEPLOY.md)** — VPS/Docker là host app, Supabase là Postgres database.
>
> **Lưu ý:** Supabase trong repo hiện tại = **optional observability** (`command_logs` + `agent_events`). Agent vẫn chạy bình thường nếu Supabase unset. Phase 8 sẽ promote lên **required** cho vector RAG — xem [PHASE_8_PLAN.md](./PHASE_8_PLAN.md).

---

## 1. Khi nào cần làm bước này

| Tình huống | Cần Supabase? |
|---|---|
| Local dev — `MOCK_LLM=1` | ❌ Không |
| Local dev — real LLM, single dev | ⚠️ Optional (debug command history) |
| VPS production | ✅ Recommended (audit trail xuyên restart) |
| **Phase 8A trở đi** (vector RAG) | ✅ **Required** |

---

## 2. Tạo Supabase project

1. https://supabase.com → Sign in → **New project**
2. Region: **Singapore** (gần VN nhất, latency thấp) hoặc **Tokyo**
3. Database password: tạo strong + lưu vault — agent KHÔNG dùng trực tiếp nhưng cần để query Studio
4. Plan: **Free tier** đủ cho audit log + Phase 8 corpus <500K rows (500 MB DB, 5 GB egress/tháng)

| Free tier limit | Khi nào nâng Pro $25/mo |
|---|---|
| 500 MB DB | Phase 8 corpus >10K doc (mỗi doc ~50KB pack JSON + embedding) |
| 2 GB egress | Cron 3 brand × 30 ngày × query nhiều → vẫn rộng |
| 50K MAU auth | Không dùng auth feature |
| 1 GB file storage | Không dùng |

---

## 3. Apply schema

### 3a. Qua SQL Editor (UI — recommend lần đầu)

1. Supabase dashboard → **SQL Editor** → **New query**
2. Paste toàn bộ [docs/SUPABASE_SCHEMA.sql](./SUPABASE_SCHEMA.sql) → **Run**
3. Verify: **Table editor** → thấy `command_logs` + `agent_events` với schema đúng

### 3b. Qua psql (nếu prefer CLI)

```bash
# Lấy connection string từ Settings → Database → Connection string → URI
psql "postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres" \
  -f docs/SUPABASE_SCHEMA.sql
```

### 3c. Phase 8 migrations (làm SAU khi 8A code xong)

```sql
-- Khi 8A-2 thật chạy:
-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Apply migrations theo PHASE_8_PLAN
\i supabase/migrations/0001_phase8_documents.sql
\i supabase/migrations/0002_phase8_entities.sql
```

**Hiện tại KHÔNG chạy** — migration file chưa tồn tại.

---

## 4. Lấy credentials

Supabase dashboard → **Project Settings** → **API**:

| Field | Dùng cho |
|---|---|
| `Project URL` | `SUPABASE_URL` trong `.env` |
| `service_role` key | `SUPABASE_SERVICE_ROLE_KEY` (server-side, bypass RLS) |
| `anon` key | KHÔNG dùng — repo này server-only |

⚠️ **service_role key bypass RLS** — chỉ để server, **không** lộ ra client/frontend.

---

## 5. Set env vars

### 5a. Local dev

```env
# .env
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...   # service_role JWT
```

Restart `npm run dev` (nodemon không watch `.env`).

### 5b. VPS Docker

`.env` trên VPS — `docker-compose.yml` đã mount qua `env_file`. Sau khi cập nhật:

```bash
docker compose down
docker compose up -d
docker compose logs -f agent | grep -i supabase
```

### 5c. systemd

`EnvironmentFile=/home/ubuntu/lungmat-agent/.env` đã có trong [DEPLOY.md §6](./DEPLOY.md). `sudo systemctl restart lungmat-agent`.

---

## 6. Smoke test

### 6a. Gửi 1 command qua Telegram

Trên admin DM:

```text
/debug_env
```

### 6b. Verify Supabase Studio

**Table editor** → `command_logs` → thấy row mới:

```sql
SELECT command, user_name, source, status, created_at
FROM command_logs
ORDER BY created_at DESC
LIMIT 5;
```

Expected:

| command | user_name | source | status | created_at |
|---|---|---|---|---|
| `/debug_env` | `<telegram_user>` | `telegram` | `success` | `<recent>` |

### 6c. Check agent_events (per-step trace)

```sql
SELECT trace_id, agent, action, duration_ms, created_at
FROM agent_events
ORDER BY created_at DESC
LIMIT 20;
```

Expected: Hàng từ `RouterAgent`, `OpsAgent` (hoặc agent xử lý `/debug_env`) — mỗi step 1 row.

### 6d. Nếu KHÔNG có row

| Triệu chứng | Fix |
|---|---|
| `[WARN] Supabase not configured` trong log | `SUPABASE_URL` hoặc `SUPABASE_SERVICE_ROLE_KEY` empty / typo |
| `command_logs insert: ...` error | Schema chưa apply, hoặc key sai permission. Re-run `SUPABASE_SCHEMA.sql` |
| Server start fail | Check `npm install` đã có `@supabase/supabase-js` (đã có trong `package.json`) |
| Row nhưng `status: failed` | Agent error — check log app, không phải vấn đề Supabase |

---

## 7. Production hardening (trước go-live thật)

### 7a. Re-enable RLS

Schema hiện disable RLS cho dev nhanh. Trước expose internet:

```sql
ALTER TABLE command_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_events ENABLE ROW LEVEL SECURITY;

-- Policy: chỉ service_role insert/select
CREATE POLICY "service_role_full_access" ON command_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON agent_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);
```

Service role key bypass RLS sẵn → agent vẫn ghi được. Block anon key & user JWT.

### 7b. Backup

Supabase Free: daily backup 7 ngày tự động. Pro: 30 ngày + Point-in-Time Recovery.

Export thủ công định kỳ:

```bash
# Settings → Database → Connection string
pg_dump "$SUPABASE_DB_URL" -t command_logs -t agent_events > backup-$(date +%F).sql
```

### 7c. Monitor

Dashboard → **Reports** → DB size, request count. Alert khi:
- DB >400 MB (chuẩn bị Pro upgrade)
- API request >40K/day (Free tier limit là 50K/month — sẽ vượt cron 3 brand × 24h × 7 ngày)

---

## 8. Phase 8 preparation checklist

Khi nào start Phase 8A:

- [ ] Phase 7D đóng (cron 3 brand hoạt động, Track A + B verified)
- [ ] Supabase project đã setup (mục 2–6 ở trên)
- [ ] Đã add `VOYAGE_API_KEY` vào `.env` (Voyage AI signup: https://www.voyageai.com)
- [ ] Free tier embedding budget OK: `voyage-3-lite` = $0.02/1M tokens; corpus 500 pack × 2K token = 1M tokens = $0.02 → free tier $50 credit dư
- [ ] Pro plan sẵn sàng khi corpus >10K doc

---

## 9. FAQ

**Q: Có cần Supabase mới chạy được agent không?**
A: Không. `SupabaseMemory.ts` fire-and-forget; missing env → silent skip. Agent chạy như bình thường, chỉ mất audit trail xuyên restart.

**Q: Tại sao service_role key chứ không phải anon?**
A: Agent là server-side, cần bypass RLS để ghi. Anon key dành cho frontend client với RLS enforced.

**Q: Phase 8A khi nào REQUIRED Supabase?**
A: Khi `RAG_BACKEND=supabase` (default sau 8A merge). Fallback `RAG_BACKEND=file` cho dev không Supabase.

**Q: Có thể host app trên Supabase không (Edge Functions)?**
A: Không. App này là Express server long-running + Telegram long-poll. Cần VPS/Docker (theo [DEPLOY.md](./DEPLOY.md)). Supabase chỉ là database.

**Q: Free tier 500 MB đủ cho project này?**
A: `command_logs` ~200 bytes/row × 100 command/ngày × 365 = ~7 MB/năm. `agent_events` ~500 bytes/row × 10 step/command × 100/ngày × 365 = ~180 MB/năm. Phase 8 `rag_documents` lớn nhất (~50KB/pack với embedding) — 500 pack ≈ 25 MB. Tổng ~250 MB sau 1 năm → free tier đủ.

---

## 10. Checklist go-live Supabase

- [ ] Project tạo, region Singapore/Tokyo
- [ ] `docs/SUPABASE_SCHEMA.sql` applied
- [ ] `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` trong `.env` production
- [ ] Restart app, log không có `[WARN] Supabase not configured`
- [ ] Smoke test `/debug_env` → row trong `command_logs`
- [ ] RLS re-enabled (mục 7a) trước khi VPS expose
- [ ] Backup strategy (Pro auto hoặc cron `pg_dump`)
- [ ] Monitor dashboard bookmarked

---

*Cập nhật khi Phase 8A merge — thêm bước `CREATE EXTENSION vector` + migration `0001_phase8_documents.sql`.*
