# Phase 8 — Knowledge & Memory Expansion

> **Pivot:** Persistent knowledge organization cho XAUUSD AI Media OS — vector DB, semantic retrieval, long-term memory, entity tracking.
> **Source:** [ROADMAP.md §Phase 8](./ROADMAP.md) — scope chốt **2026-05-17**.
>
> **Đọc trước:** [architecture.md §12 Memory + §13 RAG + §21 Persistence](./architecture.md) · [PHASE_7_PLAN.md](./PHASE_7_PLAN.md) · [PROJECT_STATUS.md](../PROJECT_STATUS.md) · [DEPLOY_SUPABASE.md](./DEPLOY_SUPABASE.md)
>
> **Tiền điều kiện:** Phase 7D (cron 3 brand) đóng. Track A + Track B `/coach` verified.

---

## 1. Mục tiêu

Mỗi agent (Content / MarketSummary / Coach) có thể **truy hồi context lịch sử** — content packs đã publish, market summary 30 ngày, approval history — qua **semantic search** thay vì keyword-count.

Brand / topic / persona / trace trở thành **first-class entity** trong DB; ContentAgent prompt tự động ghép context "what we said about this topic before" → giảm lặp wording, tăng coherence cross-session.

**Pivot kỹ thuật:** RAGStore `src/rag/RAGStore.ts` hiện tại = file JSON + regex keyword count → thay bằng pgvector (Supabase) + Voyage AI embedding.

---

## 2. Audit trạng thái hiện tại (2026-05-17)

| Component | File | Trạng thái |
|---|---|---|
| L1/L2 Memory | [src/memory/MemoryManager.ts](../src/memory/MemoryManager.ts), [L1Memory.ts](../src/memory/L1Memory.ts), [L2Memory.ts](../src/memory/L2Memory.ts) | ✅ TTL cache + file backup. Reuse nguyên — vector layer thêm cạnh |
| Supabase L3 | [src/memory/SupabaseMemory.ts](../src/memory/SupabaseMemory.ts) | ✅ Optional client (`command_logs`, `agent_events`). **Extend schema** cho `rag_documents` + `entities` |
| RAG store v1 | [src/rag/RAGStore.ts](../src/rag/RAGStore.ts) | ⚠️ File-based, keyword regex count. Wrap thành v2 vector |
| RAGAgent | [src/agents/RAGAgent.ts](../src/agents/RAGAgent.ts) | ✅ `/rag_search` `/rag_ingest` — reuse shell, swap backend |
| MemoryAgent | [src/agents/MemoryAgent.ts](../src/agents/MemoryAgent.ts) | ✅ Add `/memory_recall <topic>` semantic |
| ApprovalStore | [src/approval/ApprovalStore.ts](../src/approval/ApprovalStore.ts) | ✅ `logs/approvals.json` — backfill source |
| ContentAgent output | [src/agents/ContentAgent.ts](../src/agents/ContentAgent.ts) + [contentApprovals.ts](../src/content/contentApprovals.ts) | ⚠️ Pack JSON discarded sau approval — cần auto-archive |
| Embeddings | — | ❌ Chưa có. `.env` chưa có `VOYAGE_API_KEY` |
| Entity tracking | — | ❌ Chưa có schema |
| Context stitching | — | ❌ Agent stateless |

---

## 3. Quyết định chốt (2026-05-17)

| # | Quyết định | Lý do |
|---|---|---|
| 1 | **Embedding provider = Voyage AI** (`voyage-3-lite`, 512-dim) | Anthropic-owned (acquired 2024) — hợp stack Anthropic SDK hiện tại. Rẻ ($0.02/1M tokens). Chất lượng top-tier benchmark. |
| 2 | **Supabase = REQUIRED** khi `RAG_BACKEND=supabase` (default), **fallback file-based** khi `RAG_BACKEND=file` hoặc Supabase env empty | Smooth dev local; prod bắt buộc Supabase |
| 3 | Phase 8 scope = **chỉ Knowledge & Memory** | VPS/multi-LLM/signal engine đẩy về Phase 9 (Autonomous Ops) + Phase 10 (Production Deployment) theo [ROADMAP.md](./ROADMAP.md). Reconcile lại [PROJECT_STATUS.md §Phase 8+](../PROJECT_STATUS.md) |
| 4 | **KHÔNG** re-ranker, **KHÔNG** hybrid BM25+vector cho v1 | Corpus dự kiến <10K doc — pure cosine đủ. Defer optimization. |

---

## 4. Deliverables — chia 3 sub-phase

### 8A — Vector Foundation (~1 sprint)

**Goal:** Thay `RAGStore` keyword bằng pgvector semantic search; embedding pipeline production.

| ID | Task | File mới / sửa | Pass khi |
|---|---|---|---|
| 8A-1 | Embedding client | `src/integrations/VoyageClient.ts` (model `voyage-3-lite`, output 512-dim float32) | Unit test `embed("test")` return `number[512]` |
| 8A-2 | Supabase schema | `supabase/migrations/0001_phase8_documents.sql` — extension `vector`; table `rag_documents (id uuid pk, title text, content text, source text, tags text[], brand text, embedding vector(512), ingested_at timestamptz)` + ivfflat index | `select count(*) from rag_documents` qua Studio |
| 8A-3 | RAGStore v2 | `src/rag/RAGStoreV2.ts` — interface drop-in: `ingest()` gọi Voyage embed → insert Supabase; `search()` embed query → `rpc('match_documents')` top-k cosine. Fallback file-based nếu Supabase unset | `/rag_ingest` + `/rag_search` cùng query khác wording vẫn match |
| 8A-4 | Env vars | [src/config/env.ts](../src/config/env.ts) + `.env.example` — thêm `VOYAGE_API_KEY`, `EMBEDDING_MODEL=voyage-3-lite`, `RAG_BACKEND=supabase\|file` | `/debug_env` show `hasVoyageKey:true` |
| 8A-5 | RAGAgent swap | [src/agents/RAGAgent.ts:2](../src/agents/RAGAgent.ts#L2) — import `RAGStoreV2`. Keep v1 export cho rollback | `npm run e2e:local` pass |

**Done when:** `/rag_search liquidity sweep XAUUSD` trả document gần nghĩa (không cần keyword exact). `npx tsc --noEmit` pass.

### 8B — Content Archive (~0.5 sprint)

**Goal:** Mọi `ContentPack` + `MarketSummary` tự động ingest vào RAGStoreV2 với embedding — build corpus cho 8C.

| ID | Task | File sửa | Pass khi |
|---|---|---|---|
| 8B-1 | Hook on approve | [src/content/contentApprovals.ts](../src/content/contentApprovals.ts) — khi approval status APPROVED (TG/X/Threads), fire-and-forget `RAGStoreV2.ingest({title: brand+topic, content: rendered_pack, source: 'content_approved', tags: [brand, platform], brand})` | Approve `/content alpha foo` → `select * from rag_documents where source='content_approved'` có row |
| 8B-2 | Hook market_summary | [src/agents/MarketSummaryAgent.ts](../src/agents/MarketSummaryAgent.ts) — auto-ingest summary cuối run với `source: 'market_summary'`, tags `[date, session]` | `/market_summary` xong → DB có record mới |
| 8B-3 | Backfill script | `scripts/backfill-rag.ts` đọc `logs/approvals.json` (approved only) + ingest vào RAGStoreV2 + `npm run backfill:rag` | `count(rag_documents)` trước/sau tăng |
| 8B-4 | Memory recall command | [src/agents/MemoryAgent.ts](../src/agents/MemoryAgent.ts) — `/memory_recall <topic>` gọi `RAGStoreV2.search()` filter brand từ ctx; format giọng Lửng/Linh Cẩu | `/memory_recall liquidity sweep` admin DM trả 3-5 pack lịch sử |

**Done when:** Sau 1 ngày live, `select count(*) from rag_documents` ≥ 5. `/memory_recall` admin DM hoạt động.

### 8C — Entity Tracking + Context Stitching (~1 sprint)

**Goal:** Brand/topic/persona/trace = first-class entity; ContentAgent input có lịch sử tự động.

| ID | Task | File mới / sửa | Pass khi |
|---|---|---|---|
| 8C-1 | Entity schema | `supabase/migrations/0002_phase8_entities.sql` — table `entities (id uuid pk, type text check (type in ('brand','topic','persona','trace')), name text, slug text unique, first_seen timestamptz, metadata jsonb)` + `entity_links (entity_id, document_id, relation, created_at)` | Migration apply không lỗi |
| 8C-2 | Entity resolver | `src/knowledge/EntityResolver.ts` — `resolve(type, name)` upsert; `link(entity_id, document_id, relation)`. Hook trong 8B-1/8B-2 tạo links `brand → doc`, `topic → doc` | Sau 1 content run, `select * from entities` có brand + topic |
| 8C-3 | Context stitcher | `src/knowledge/ContextStitcher.ts` — `buildContext({brand, topic, lookback_days=30, k=3})` return markdown 3 đoạn. Reuse `RAGStoreV2.search()` + filter entity links | Unit test: 5 doc Alpha+liquidity → `buildContext` trả ≥1 |
| 8C-4 | Hook ContentAgent | [src/agents/ContentAgent.ts](../src/agents/ContentAgent.ts) — prepend `ContextStitcher.buildContext()` vào LLM prompt **trước** persona block. Flag `CONTEXT_STITCH=on\|off` cho rollback | `/content alpha liquidity sweep` lần 2 → pack không lặp wording lần 1 |
| 8C-5 | Coach lịch sử | [src/agents/CoachAgent.ts](../src/agents/CoachAgent.ts) — `/coach lịch sử <brand> tuần này` gọi `EntityResolver` + list document liên kết, format Lửng 🦡 | `/coach lịch sử alpha` admin DM ra list 5-10 pack |

**Done when:** Pack lần 2 cùng topic có variation từ context (founder visual check). `/coach lịch sử <brand>` trả list. Entity table ≥10 rows sau 1 tuần live.

---

## 5. Reusable đã có (không build lại)

- [src/memory/MemoryManager.ts](../src/memory/MemoryManager.ts) — L1/L2 KV cho EntityResolver cache hot
- [src/memory/SupabaseMemory.ts:7-15](../src/memory/SupabaseMemory.ts#L7) — `getClient()` lazy singleton pattern (copy cho RAGStoreV2)
- [src/approval/ApprovalStore.ts](../src/approval/ApprovalStore.ts) — backfill source 8B-3
- [src/trace/ExecutionTrace.ts](../src/trace/ExecutionTrace.ts) — `addStep()` cho EntityResolver telemetry
- [src/integrations/AnthropicClient.ts](../src/integrations/AnthropicClient.ts) — wrapper pattern copy cho VoyageClient
- [src/agents/RouterAgent.ts](../src/agents/RouterAgent.ts) — `/rag_*` `/memory_*` đã route, không thêm

---

## 6. Out-of-scope (KHÔNG làm Phase 8)

- VPS deploy / Docker prod → Phase 10 Production Deployment
- Multi-LLM fallback OpenAI/Gemini → Phase 9 Autonomous Ops
- Signal engine sale team → separate product, không thuộc Knowledge & Memory
- X/Threads API trực tiếp → Phase 7 đã chốt Typefully manual
- Re-ranker model (overkill <10K doc)
- Hybrid BM25 + vector (defer v3 nếu cần)

---

## 7. Files mới (tổng kết)

```
src/integrations/VoyageClient.ts               # 8A-1
src/rag/RAGStoreV2.ts                          # 8A-3
src/knowledge/EntityResolver.ts                # 8C-2
src/knowledge/ContextStitcher.ts               # 8C-3
supabase/migrations/0001_phase8_documents.sql  # 8A-2
supabase/migrations/0002_phase8_entities.sql   # 8C-1
scripts/backfill-rag.ts                        # 8B-3
```

## Files sửa

```
src/config/env.ts                       # +VOYAGE_API_KEY, +EMBEDDING_MODEL, +RAG_BACKEND
.env.example                            # mirror
src/agents/RAGAgent.ts                  # swap import
src/agents/MemoryAgent.ts               # +/memory_recall
src/agents/ContentAgent.ts              # prepend ContextStitcher
src/agents/MarketSummaryAgent.ts        # +auto ingest hook
src/agents/CoachAgent.ts                # +/coach lịch sử
src/content/contentApprovals.ts         # +ingest on approve
package.json                            # +backfill:rag script
docs/architecture.md                    # +§14 EntityResolver, +§15 ContextStitcher
docs/PHASE_STATUS.md                    # +Phase 8 row
```

---

## 8. Verification (E2E khi cả 3 sub-phase done)

```powershell
# 1. Migration
supabase migration up

# 2. Backfill
npm run backfill:rag

# 3. Server up — log: hasVoyageKey:true, ragBackend:supabase
npm run dev

# 4. Semantic search (admin Telegram DM)
/rag_search XAU breakout strategy
# Expected: top-3 doc dù không khớp keyword exact

# 5. Content stitch
/content alpha liquidity sweep XAUUSD       # → approve → auto-ingest
/content alpha liquidity sweep XAUUSD       # lần 2 có variation, context prepended

# 6. Memory recall
/memory_recall liquidity                    # list pack approved brand current

# 7. Entity audit
/coach lịch sử alpha tuần này              # Lửng 🦡 reply 5-10 pack title+ngày

# 8. DB sanity (Supabase Studio)
select count(*) from rag_documents;         # ≥ corpus size
select count(*) from entities;              # ≥ 3 brand + topics
select count(*) from entity_links;          # ≥ rag_documents * 2

# 9. Type + E2E
npx tsc --noEmit
npm run e2e:local
```

**Pass criteria:** 9/9 step OK + founder visual confirm pack lần 2 có variation từ context stitching.

---

## 9. Role allocation đề xuất (tham khảo)

| Sub-phase | Owner | Verify |
|---|---|---|
| 8A Vector Foundation | Cursor / Claude Code | Cowork live check `/rag_search` |
| 8B Content Archive | Cursor | Cowork live check DB count |
| 8C Entity + Context | Cursor (8C-1/2/3) + Claude Code (8C-4/5) | Founder visual + Cowork |

Cập nhật [PROJECT_STATUS.md](../PROJECT_STATUS.md) khi mỗi sub-phase đóng. Worklog vào [docs/ai-worklog/INDEX.md](./ai-worklog/INDEX.md).

---

*Cập nhật khi 8A bắt đầu hoặc scope thay đổi.*
