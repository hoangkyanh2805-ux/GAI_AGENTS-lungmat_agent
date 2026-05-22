# 09 — Menu: Memory

Menu **Memory** quản lý bộ nhớ dài hạn của agent — lưu ngoài context window, có thể search semantic.

---

## 9.1 Memory Là Gì

**Memory** = bộ nhớ dài hạn của agent, được lưu dưới dạng documents có thể tìm kiếm bằng ngôn ngữ tự nhiên (semantic search).

**Không phải context window:**
- Context window: "bộ nhớ ngắn hạn" — chứa lịch sử chat hiện tại, bị xóa khi reset session
- Memory: "bộ nhớ dài hạn" — giữ lại kể cả sau khi reset session

**Cách hoạt động:**
1. Agent (hoặc admin) write document vào Memory
2. GoClaw tạo embedding cho document (chuyển text → vector)
3. Khi user hỏi → agent gọi `memory_search` với query
4. Hệ thống tính cosine similarity → trả về documents liên quan nhất
5. Agent đọc documents đó và dùng để trả lời

**Khác Vault ở điểm:**
- Memory: agent tự ghi (qua `memory_write` tool) — kiến thức agent tự học
- Vault: admin upload (tài liệu bên ngoài đưa vào cho agent dùng)

---

## 9.2 Tạo Memory Document

**Cách 1 — Qua Dashboard UI:**
1. Sidebar → **Memory**
2. Click **+ Thêm document**
3. Điền: Title, Content (Markdown), Scope
4. Bấm **Lưu** → hệ thống tự tạo embedding

**Cách 2 — Agent tự ghi (qua chat):**
Chat với agent: `"Nhớ rằng khách hàng Anh Tuấn ở TP.HCM, thích nhận báo cáo lúc 8 sáng"`
Agent gọi: `memory_write(title="Khách hàng: Anh Tuấn", content="...", scope="personal")`

**Cách 3 — API:**
```bash
curl -X POST https://<your-vps>/api/v1/memory \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "my-agent",
    "title": "SOP Báo cáo sáng",
    "content": "Mỗi sáng 8:00 gửi tóm tắt XAUUSD...",
    "scope": "global"
  }'
```

---

## 9.3 Scope Memory

| Scope | Ai đọc được | Ai ghi được | Dùng cho |
|-------|------------|------------|---------|
| **Cá nhân (Personal)** | Chỉ user đó + agent | Agent (khi user đó đang chat) + Admin | Preferences, PII, ghi chú riêng |
| **Toàn cục (Global)** | Tất cả user của agent | Agent (bất kỳ session) + Admin | SOP chung, kiến thức tổ chức, brand guidelines |

**Ví dụ phân scope đúng:**

| Nội dung | Scope đúng |
|----------|-----------|
| "Anh Tuấn thích nhận tin lúc 8 sáng" | Personal (của Anh Tuấn) |
| "SOP quy trình onboarding khách hàng" | Global |
| "Anh Nam có số điện thoại 0912..." | Personal (của Anh Nam) |
| "XAUUSD trend tuần này là bullish" | Global |
| "Password API key của Anh Tuấn là..." | **KHÔNG NÊN LƯU Ở ĐÂY** |

> **CẢNH BÁO**: Không để PII nhạy cảm (password, CCCD, tài khoản ngân hàng) ở scope **Toàn cục** — tất cả user của agent đều đọc được.

---

## 9.4 Semantic Search

**Search bằng ngôn ngữ tự nhiên** — không cần gõ đúng từ khóa:

Ví dụ:
- Query: `"thói quen của khách hàng VIP"`
- Sẽ tìm được document: `"Anh Tuấn là khách hàng lớn, thường xuyên..."` — dù không có từ "thói quen" và "VIP"

**Embedding model:**
- GoClaw dùng embedding model (VD: `text-embedding-3-small` của OpenAI, hoặc model tương đương)
- Mỗi chunk được vector hóa và lưu vào vector database

**Top-K results:**
- Default: trả về top 5 documents liên quan nhất
- Có thể cấu hình: `k=10` nếu cần nhiều hơn

**Similarity threshold:**
- Default: chỉ trả về kết quả có cosine similarity > 0.7
- Kết quả < 0.7 bị lọc bỏ (để tránh false positive)
- Admin có thể adjust threshold: Agent → Memory → Settings

---

## 9.5 Chunks

Document dài được tự động chia nhỏ thành **chunks** để tăng độ chính xác search.

**Config mặc định:**
- Chunk size: 512 tokens mỗi chunk
- Overlap: 64 tokens (để không mất ngữ cảnh ở ranh giới)

**Ví dụ:**
Document 2000 token → chia thành:
- Chunk 1: token 0–512
- Chunk 2: token 448–960 (overlap 64 từ chunk 1)
- Chunk 3: token 896–1408
- Chunk 4: token 1344–1856
- Chunk 5: token 1792–2000

**Search trả về chunks, không phải toàn document:**
- Agent nhận về chunk liên quan nhất
- Nếu cần toàn document: agent gọi `memory_read(doc_id=...)` để lấy full text

---

## 9.6 Quản Lý Memory

**Xem list:**
Sidebar → **Memory** → list documents với: title, scope, agent, size, created at, last accessed.

**Filter:**
- Theo agent
- Theo scope (Personal / Global)
- Theo date range
- Search full-text

**Edit:**
- Click document → sửa nội dung → Lưu
- Embedding tự động re-created sau khi edit (mất 10–30 giây)

**Delete:**
- Click icon thùng rác → confirm
- Xóa cả embedding trong vector DB

**Export:**
- Memory → **Export** → tải về JSON
- Format: array of `{id, title, content, scope, created_at, metadata}`

---

## 9.7 Memory vs Vault vs File Context

| | Memory | Vault | File context |
|--|--------|-------|-------------|
| **Ai đọc** | Agent (qua semantic search) | Agent (qua semantic search) | Agent (mọi request, toàn bộ) |
| **Ai ghi** | Agent + Admin | Chỉ Admin | Chỉ Admin |
| **Cách truy cập** | memory_search → top-K chunks | vault_search → top-K chunks | Tự động vào system prompt |
| **Scope** | Personal / Global | Agent / Shared / Workspace | Per-agent (1 bộ file) |
| **Cập nhật khi** | Agent học được gì mới | Admin có tài liệu mới | Muốn đổi persona/role agent |
| **Ví dụ** | "Khách Anh Tuấn thích X" | "Báo cáo thị trường tháng 5.pdf" | SOUL.md: "Tôi là Alpha..." |
| **Sau khi thay** | Có hiệu lực ngay | Có hiệu lực ngay (sau re-index) | Phải tạo session mới |

---

## 9.8 Memory Trong Knowledge Graph

Khi bật **auto-extract** trong Built-in Tools → Knowledge Graph:

1. Agent write memory document
2. GoClaw tự động gọi extraction LLM
3. LLM extract entities (Person, Organization, Concept...) và relations
4. Entities + relations được lưu vào Knowledge Graph
5. Knowledge Graph dần dần build up từ nhiều memory documents

**Ví dụ extraction:**
```
Memory: "Alpha là persona chính trong chiến dịch XAUUSD, 
         chuyên phân tích kỹ thuật, do Anh Ky quản lý"

Entities:
  - Alpha (type: Persona)
  - XAUUSD Media OS (type: Campaign)
  - Anh Ky (type: Person)

Relations:
  - Alpha → [is_persona_in] → XAUUSD Media OS
  - Anh Ky → [manages] → Alpha
```

Sau nhiều lần extract → KG có đủ context để trả lời: "Ai quản lý persona Alpha?"

---

## 9.9 Giới Hạn Memory

| Giới hạn | Mặc định | Ghi chú |
|----------|---------|---------|
| Max document size | 100KB (plain text) | Vượt → upload lên Vault thay |
| Max documents per agent | Xem config tenant | Liên hệ admin để tăng |
| Embedding cost | Tính theo token embedding | Dùng model embedding rẻ (text-embedding-3-small) |
| Search latency | 50–200ms | Tăng khi có nhiều documents |
| Chunk size | 512 tokens | Có thể config (256–2048) |

**Khi vượt giới hạn document size:**
- Upload lên Vault thay (Vault support file lớn hơn, up to 50MB)
- Chia nhỏ document thành nhiều memory documents nhỏ hơn
