# 01 — Menu: Agent

Menu **Agents** là trung tâm quản trị của GoClaw. Mỗi agent có 15+ tab cấu hình.

---

## 1.1 Tạo Agent Mới

Sidebar → **Agents** → nút **Tạo Agent** (hoặc **+ New Agent**).

**Các trường bắt buộc:**

| Trường | Mô tả | Lưu ý |
|--------|-------|-------|
| Name | Tên hiển thị | Có thể đổi sau |
| Slug (agent-key) | Định danh duy nhất, dùng trong API | **Không thể đổi sau khi tạo** |
| Description | Mô tả ngắn chuyên môn | LLM đọc khi routing |
| Type | Open hoặc Predefined | **Không thể đổi sau khi tạo** |
| Provider / Model | LLM ban đầu | Có thể đổi sau |

**Open vs Predefined:**
- **Open**: mỗi user có 1 session riêng, private. Dùng cho chatbot tư vấn 1:1.
- **Predefined**: tất cả user chung 1 session (shared state). Bắt buộc để tham gia Teams. Dùng cho workflow tự động, agent có state chung.

> Chọn type cẩn thận — không đổi được sau khi tạo.

---

## 1.2 Tab Tổng Quan

Hiển thị trạng thái sức khỏe và thống kê agent.

**Heartbeat status:**
- `online` — agent đang hoạt động bình thường
- `degraded` — có lỗi nhưng vẫn chạy được (thường do LLM provider chậm)
- `offline` — agent không phản hồi

**Thống kê:**
- Session count: số session đang active
- Message count (24h / 7d / 30d): lượng tin nhắn
- Average response time: thời gian phản hồi trung bình

**Quick actions:**
- **Test chat**: mở chat trực tiếp với agent trong dashboard
- **Edit**: chuyển sang tab Cấu hình

---

## 1.3 Tab Mô Hình & Ngân Sách

Cấu hình LLM provider, model, và giới hạn chi phí.

**Provider & Model:**
- Chọn provider từ danh sách (20+ provider)
- Chọn model trong provider đó
- Có thể cấu hình **fallback model**: nếu primary hết budget hoặc lỗi → tự động chuyển sang fallback

**Budget Monthly:**
- Đặt giới hạn chi phí mỗi tháng (VND hoặc USD)
- Khi vượt ngưỡng: agent tự chuyển sang fallback model (nếu có) hoặc từ chối request
- **BẮT BUỘC đặt trước khi train nhiều** — không đặt = vượt budget không kiểm soát

**Token limits:**
- Max input tokens: giới hạn context mỗi request
- Max output tokens: giới hạn độ dài response
- Nên set max output = 2048 cho chat thông thường, tăng lên 8192 cho task phân tích dài

**Temperature & Sampling:**
- Temperature (0.0–2.0): 0 = deterministic, 1.0 = creative, >1.0 = rất random
- Top-p (0.0–1.0): nucleus sampling
- Khuyến nghị chat thường: temperature=0.7, top_p=0.9

---

## 1.4 Tab File Context

File context là nội dung **luôn luôn** được đưa vào đầu system prompt mỗi khi gọi LLM — khác với Memory và Vault (chỉ đưa vào khi agent search thấy).

**3 file chuẩn:**

| File | Vai trò | Thay đổi thường? |
|------|---------|----------------|
| `SOUL.md` | Tính cách cốt lõi: xưng hô, phong cách, giá trị | Hiếm khi |
| `IDENTITY.md` | Vai trò, chuyên môn, lĩnh vực agent | Đôi khi |
| `USER.md` | Thông tin về người dùng mặc định (cho Open agent) | Thường |

**Cách sửa:**
1. Mở tab File context
2. Click vào file (hoặc **Upload** nếu chưa có)
3. Sửa nội dung trong editor Markdown
4. Bấm **Lưu**

> **QUAN TRỌNG**: Sau khi sửa SOUL.md / IDENTITY.md → **phải tạo session mới** mới có hiệu lực. Session đang chạy đã cache system prompt cũ — sửa xong mà không reset session sẽ không thấy thay đổi.

**Ví dụ SOUL.md tối giản:**
```markdown
---
name: Alpha Trader
version: 2.0
---

Tôi là Alpha — chuyên gia phân tích vàng (XAUUSD).
Phong cách: thẳng thắn, số liệu cụ thể, không rào đón.
Xưng: Tôi. Gọi user: bạn (DM) / anh/chị (group).
Ngôn ngữ: Tiếng Việt ưu tiên.
```

---

## 1.5 Tab Kỹ Năng (Skills)

Danh sách skill đã gắn vào agent này.

**Nội dung hiển thị:**
- Tên skill, version, mô tả
- Toggle bật/tắt từng skill
- Thứ tự ưu tiên (drag để sắp xếp) — khi nhiều skill match cùng query, skill ưu tiên cao hơn được dùng trước

**Thao tác:**
- **Gắn skill mới**: click **+ Thêm Skill** → chọn từ danh sách skill đã cài
- **Tắt skill**: toggle OFF — skill vẫn gắn nhưng agent không dùng
- **Gỡ skill**: click icon xóa

> Nhắc lại: gắn skill vào agent chỉ là Tầng 3. Cần đảm bảo đã làm đủ 3 tầng — xem `05-skill.md §5.7`.

---

## 1.6 Tab Built-in Tools

14 danh mục tool tích hợp sẵn trong GoClaw (code thật, không phải text guide).

**Cách dùng:**
- Bật/tắt từng tool category
- Expand category → bật/tắt tool cụ thể
- Một số tool có nút **Cấu hình** (VD: TTS chọn voice, web search chọn provider)

**Các category quan trọng:**
- `memory` — memory_read, memory_write, memory_search
- `vault` — vault_search
- `web` — web_search, web_fetch
- `skill` — skill_search, use_skill, publish_skill
- `scheduling` — cron_create, cron_list, cron_delete
- `exec` — chạy shell (nguy hiểm — chỉ admin)

Xem chi tiết đầy đủ: `06-builtin-tools.md`.

---

## 1.7 Tab MCP

MCP Server gắn vào agent này (Model Context Protocol — tool ngoài).

**Hiển thị:**
- Danh sách MCP server đã grant cho agent
- Status: connected / error / disconnected
- Danh sách tool từ mỗi server

**Thao tác:**
- **Grant server mới**: click **+ Grant MCP Server** → chọn server đã tạo trong Menu 7
- **Thu hồi quyền**: click **Revoke**
- **Test tool**: click tool → điền params → **Run**

Xem chi tiết cách tạo MCP server: `07-mcp.md`.

---

## 1.8 Tab Cron

Cron job của agent này.

**Hiển thị:**
- Danh sách cron: tên, loại (Every/Cron/Once), trạng thái, lần chạy gần nhất, lần chạy tiếp theo
- Quick button: tạo cron mới, pause/resume, run ngay

**Tạo nhanh cron từ tab này:**
1. Click **+ Tạo Cron**
2. Chọn loại: Every / Cron expression / Once
3. Điền message gửi cho agent và channel delivery
4. Bấm **Lưu**

Xem chi tiết cron: `08-cron.md`.

---

## 1.9 Tab Memory

Documents trong bộ nhớ dài hạn của agent.

**Hiển thị:**
- List documents (title, scope, created at, size)
- Filter theo scope: Cá nhân / Toàn cục
- Nút **Tìm kiếm** — semantic search trong memory

**Thao tác:**
- **Thêm document**: click **+ Thêm** → nhập title + nội dung + chọn scope
- **Sửa**: click vào document → edit inline
- **Xóa**: click icon thùng rác
- **Export**: tải toàn bộ memory dưới dạng JSON

Scope:
- **Cá nhân (Personal)**: chỉ user đó và agent thấy
- **Toàn cục (Global)**: tất cả user của agent đều thấy

Xem chi tiết: `09-memory.md`.

---

## 1.10 Tab Vault

Documents trong Vault được assign cho agent này.

**Hiển thị:**
- List documents theo scope: Agent / Shared / Workspace
- Filter theo DocType: MD, PDF, DOCX, XLSX, ...
- Search button

**Thao tác:**
- **Upload mới**: kéo thả file hoặc click **Tải lên**
- **Assign từ Shared Vault**: link document từ Shared → agent này
- **Re-index**: trigger re-embedding thủ công
- **Xóa**: soft delete (ẩn 30 ngày) hoặc hard delete

Xem chi tiết: `10-vault.md`.

---

## 1.11 Tab Knowledge Graph

Knowledge Graph của agent — mạng entity và relation.

**Hiển thị:**
- Entity list với type và số relation
- Graph visualization (click entity → xem connected entities)
- Relation list

**Thao tác:**
- **Trigger re-extraction**: force extract lại entities từ toàn bộ memory
- **Add entity thủ công**: click **+ Entity**
- **Edit relation**: click relation → sửa type hoặc direction
- **Merge duplicates**: chọn 2 entity → **Merge** → chọn master

> Cần LLM hỗ trợ structured JSON output để auto-extract. Xem `11-knowledge-graph.md`.

---

## 1.12 Tab Nhóm (Groups)

Quản lý các nhóm Telegram / Discord mà agent này đang tham gia.

**Hiển thị:**
- List group: platform, group_id, group name, member count
- Per-group settings riêng

**Per-group settings:**
- **Bộ lọc skill**: chỉ cho phép skill X, Y trong group này (block skill nguy hiểm)
- **Bộ lọc tool**: block exec tool, database tools
- **Reply trigger**: tag bot / keyword trigger / tất cả tin nhắn
- **Welcome message** riêng cho nhóm
- **Rate limit** per user per group

**Use case quan trọng**: cùng 1 agent có thể dùng `exec` tool trong DM với admin, nhưng block `exec` trong group production — dùng Per-group filter để đạt điều này.

---

## 1.13 Tab Phiên (Sessions)

Danh sách sessions của agent.

**Hiển thị:**
- Session list: session_id, user, channel, last active, message count, status
- Filter: theo user, theo channel, theo date range
- Status: active / idle / expired

**Thao tác:**
- **View session**: click → xem toàn bộ chat history và context hiện tại
- **Reset session**: xóa chat history, giữ nguyên file context (SOUL.md, etc.) → tạo session mới với context sạch
- **Delete session**: xóa cả history lẫn state — hard delete
- **Debug session**: xem raw context (exact prompt gửi lên LLM)
- **Export**: tải log session dưới dạng JSON/CSV

---

## 1.14 Tab Kênh (Channels)

Danh sách channel đã pair với agent này.

**Hiển thị:**
- Channel list: platform, tên bot, status, số message (24h)
- Status: connected (xanh) / error (đỏ) / pending (vàng)

**Thao tác:**
- **Pair channel mới**: click **+ Pair** → chọn channel đã tạo (hoặc tạo mới)
- **Unpair**: ngắt kết nối agent-channel (channel credentials vẫn còn)
- **Test**: gửi test message để verify kết nối
- **View error log**: xem chi tiết lỗi webhook

---

## 1.15 Tab Nâng Cao (Advanced)

Cài đặt kỹ thuật nâng cao.

**System prompt override:**
- Ghi đè system prompt mặc định (override toàn bộ file context)
- Dùng khi cần kiểm soát chính xác 100% system prompt
- **Cảnh báo**: override này thay thế toàn bộ SOUL.md / IDENTITY.md — không kết hợp cùng

**Context window strategy:**
- `rolling_window`: giữ N message cuối, cắt message cũ
- `summarize`: tóm tắt message cũ bằng LLM khi gần đầy context
- `full_history`: giữ tất cả (tốn token, dùng cho task phân tích dài hạn)

**Debug mode:**
- Bật: agent in ra tool calls, reasoning steps trong response
- Tắt: production mode, output sạch cho user

**Sandbox settings:**
- Xem §1.16

---

## 1.16 Sandbox Mode

Chế độ test agent an toàn, không ảnh hưởng production.

**Bật sandbox:**
- Agent → Advanced → **Sandbox mode: ON**
- Hoặc dùng **Test Chat** button (tự động vào sandbox)

**Hành vi trong sandbox:**
- Mock external calls (không gọi API thật — webhook, CRM, payment)
- Simulate tool responses (exec, messaging)
- Cost không tính vào budget thật (dùng quota sandbox riêng)
- Sessions sandbox không xuất hiện trong production session list

**Dùng khi:**
- Test skill mới trước khi deploy
- Debug lỗi agent
- Demo cho khách hàng

---

## 1.17 Agent Versioning

Snapshot và rollback cấu hình agent.

**Tạo snapshot:**
- Agent → Advanced → **Tạo Snapshot** → đặt tên (VD: `v1.2-before-rebrand`)
- Snapshot lưu: model config, file context, skills list, built-in tools config

**Rollback:**
- Xem danh sách snapshots → click **Restore**
- Cần confirm vì sẽ ghi đè cấu hình hiện tại

**Lưu ý:**
- Snapshot không lưu: Memory documents, Vault documents, session history
- Chỉ lưu cấu hình agent (config as code)

---

## 1.18 Xóa Agent

**Soft delete (mặc định):**
- Agent ẩn khỏi list, không phản hồi message mới
- Giữ trong DB 30 ngày — có thể restore
- Sessions, Memory, Vault docs của agent vẫn còn

**Hard delete:**
- Xóa vĩnh viễn agent + tất cả config
- Sessions liên quan bị orphan (mất reference đến agent)
- Channel pairs tự động unpair
- Memory và Vault docs **không** tự xóa — cần xóa thủ công nếu cần

**Trước khi xóa, kiểm tra:**
1. Agent có đang trong Team không? → Remove khỏi team trước
2. Channel pair nào đang dùng? → Unpair hoặc pair sang agent khác
3. Cron job nào đang chạy? → Disable cron trước
