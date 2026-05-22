# 11 — Menu: Knowledge Graph

Menu **Knowledge Graph** hiển thị mạng lưới entity và relation được tự động extract từ Memory.

---

## 11.1 Knowledge Graph Là Gì

**Knowledge Graph (KG)** = mạng lưới **Entity** (khái niệm/đối tượng) và **Relation** (mối quan hệ) được tự động xây dựng từ Memory documents.

**Vấn đề KG giải quyết:**
- Memory: tìm "tài liệu về Alpha" → trả về chunk text
- KG: hỏi "Alpha liên quan đến ai?" → traversal graph → trả về entities kết nối

**Khi nào KG hữu ích:**
- Câu hỏi quan hệ: "Ai quản lý chiến dịch XAUUSD?"
- Câu hỏi ảnh hưởng: "X thay đổi thì ảnh hưởng đến Y không?"
- Truy vết: "Agent Alpha có skills gì và dùng trong channel nào?"
- Discovery: "Những entity nào liên quan đến media operations?"

**KG không thay thế Memory hay Vault** — là lớp bổ sung giúp agent reason về quan hệ.

---

## 11.2 Entities

**Entity** = node trong graph — đại diện cho 1 đối tượng, khái niệm cụ thể.

**Properties của Entity:**
- `name`: tên chính (VD: "Alpha Trader")
- `type`: loại entity (Person, Organization, Product, Concept, Event, Location, Technology, ...)
- `description`: mô tả ngắn
- `aliases`: tên khác (VD: ["Alpha", "Linh Cẩu Alpha"])
- `source_memory_ids`: danh sách memory document đã extract entity này
- `confidence`: điểm tin cậy của extraction (0.0–1.0)

**Default entity types:**
```
Person, Organization, Product, Concept, Event, Location, Technology, Document,
Strategy, Persona, Campaign, TradingInstrument, Channel, Tool
```

Admin có thể thêm custom types trong Built-in Tools → Knowledge Graph settings.

---

## 11.3 Relations

**Relation** = edge có hướng giữa 2 entity.

**Structure:**
```
Entity A --[relation_type]--> Entity B
```

**Ví dụ relations:**
```
Alpha Trader  --[is_persona_in]-->  XAUUSD Media OS
Anh Ky        --[manages]-->        Alpha Trader
Alpha Trader  --[uses_channel]-->   Telegram Group VIP10X
SOUL.md       --[defines]-->        Alpha Trader
```

**Default relation types:**
```
is_a, part_of, related_to, created_by, used_in, located_in,
owns, manages, is_persona_in, uses_channel, defines, depends_on,
works_with, reports_to, produces, consumes
```

**Properties của Relation:**
- `type`: loại relation
- `source_entity_id`
- `target_entity_id`
- `weight`: độ mạnh quan hệ (0.0–1.0)
- `evidence`: đoạn text gốc từ memory document

---

## 11.4 Auto-Extraction

Khi agent write memory (nếu bật auto-extract):

1. Memory document được lưu
2. GoClaw gọi extraction LLM với prompt:
   ```
   Phân tích text sau, extract:
   - Entities: {name, type, description}
   - Relations: {entity_a, relation_type, entity_b}
   Output dưới dạng JSON theo schema sau: ...
   ```
3. LLM trả về JSON structured
4. GoClaw parse và lưu vào KG database

**Yêu cầu LLM:**
- Phải hỗ trợ **structured JSON output** (function calling / tool use / json_mode)
- Khuyến nghị: `gpt-4o-mini` (nhanh, rẻ, structured output tốt)
- Không dùng: model cũ, local model chưa có structured output

**Config trong Built-in Tools → Knowledge Graph:**
```yaml
extraction_model: gpt-4o-mini
auto_extract_on_memory_write: true
entity_types_allowlist: [Person, Organization, Concept, Persona, Campaign]
relation_types_allowlist: [manages, is_persona_in, uses, creates, related_to]
min_confidence: 0.7   # bỏ qua extraction dưới 70% confidence
```

---

## 11.5 Manual Edit

**Thêm entity thủ công:**
1. KG → tab **Entities** → **+ Thêm Entity**
2. Điền: Name, Type, Description, Aliases
3. Bấm Lưu

**Sửa entity:**
- Click entity → Edit → sửa fields → Lưu

**Thêm relation thủ công:**
1. KG → tab **Relations** → **+ Thêm Relation**
2. Chọn Source Entity, Relation Type, Target Entity
3. Điền weight (0.0–1.0)
4. Bấm Lưu

**Sửa relation:**
- Click relation → Edit type hoặc weight

---

## 11.6 Deduplication

Khi extract entities, có thể xuất hiện entity trùng lặp với tên khác nhau:
- "Anh Ky" và "Hoang Ky Anh" và "KyAnh" — cùng 1 người

**Auto-deduplication:**
- GoClaw tự merge entity có tên quá giống nhau (fuzzy match, threshold > 90% similarity)
- Merge giữ entity có nhiều relation hơn làm master

**Manual merge:**
1. KG → chọn 2 entity → click **Merge**
2. Chọn **Master record** (entity giữ lại)
3. Confirm → tất cả relation của entity bị merge chuyển sang master
4. Duplicate entity bị xóa

**Unmerge:**
- Hiện chưa support — cần thêm 2 entity mới nếu merge sai

---

## 11.7 Query Knowledge Graph

**Qua UI (Dashboard):**
1. KG → tab **Graph** → visualizer đồ thị
2. Tìm entity theo tên
3. Click entity → xem nodes kết nối
4. Expand: click relation → xem entity đích → tiếp tục traverse

**Qua built-in tool `kg_query`:**
Agent gọi:
```
kg_query(entity="Alpha Trader", depth=2, relation_types=["manages", "is_persona_in"])
→ trả về: subgraph liên quan đến "Alpha Trader" với 2 hop, chỉ qua relations chỉ định
```

**Query examples:**
```python
# Tìm tất cả personas trong project
kg_query(entity_type="Persona")

# Tìm người quản lý Alpha
kg_query(entity="Alpha Trader", relation_type="managed_by", direction="incoming")

# Tìm entity trong 2 hop từ XAUUSD Media OS
kg_query(entity="XAUUSD Media OS", depth=2)
```

**GraphQL API (nâng cao):**
```graphql
query {
  entity(name: "Alpha Trader") {
    id
    type
    relations(depth: 2) {
      type
      target {
        name
        type
      }
    }
  }
}
```

---

## 11.8 KG vs Memory vs Vault

| | Knowledge Graph | Memory | Vault |
|--|-----------------|--------|-------|
| **Cấu trúc dữ liệu** | Graph (nodes + edges) | Documents (text) | Documents (files) |
| **Câu hỏi phù hợp** | "X quan hệ với Y như thế nào?" | "Tôi biết gì về X?" | "Tài liệu về X là gì?" |
| **Query method** | Entity traversal, GraphQL | Cosine similarity (semantic) | Cosine similarity (semantic) |
| **Tự động build** | Từ Memory (auto-extract) | Agent write + Admin | Admin upload |
| **Cập nhật khi** | Memory thay đổi | Agent học được gì mới | Admin upload file mới |
| **Giới hạn** | Chất lượng phụ thuộc LLM extraction | Size < 100KB/doc | Size < 50MB/file |
| **Dùng cho** | Quan hệ phức tạp, reasoning | Kiến thức ngữ nghĩa | Tài liệu tham chiếu lớn |

**Pattern kết hợp:**
```
User: "Tất cả agent nào liên quan đến chiến dịch XAUUSD?"
  → Agent gọi: kg_query(entity="XAUUSD Media OS", relation_types=["part_of", "manages"])
  → Nhận: [Alpha Trader, Raymond, VIP10X Agent, Analytics Agent]

User: "SOUL.md của Alpha đang định nghĩa gì?"
  → kg_query tìm relation: SOUL.md --[defines]--> Alpha Trader
  → memory_search(query="SOUL.md Alpha Trader") → tìm memory có nội dung file
  → vault_search(query="SOUL.md Alpha") → tìm file thật trong Vault
```
