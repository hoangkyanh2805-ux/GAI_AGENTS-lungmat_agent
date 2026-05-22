# 03 — Menu: Session

Menu **Sessions** quản lý các luồng hội thoại (conversation threads) giữa user và agent.

---

## 3.1 Session Là Gì

**Session** = 1 luồng hội thoại liên tục giữa 1 user (hoặc nhóm) và 1 agent.

Session lưu trữ:
- Chat history (toàn bộ tin nhắn trao đổi)
- Context window hiện tại (phần đang được đưa vào LLM)
- State của agent trong cuộc hội thoại này

**Behavior theo agent type:**

| Agent type | Session behavior |
|------------|----------------|
| **Open** | Mỗi user tạo 1 session riêng, private — user A không thấy session của user B |
| **Predefined** | Tất cả user chung 1 session — user A và B cùng đọc cùng context |

> **Hậu quả của Predefined**: nếu user A reset session → user B cũng mất context. Cần thỏa thuận rõ trong team.

---

## 3.2 Context Bar (Thanh Context)

Hiển thị ở đầu chat UI — cho thấy token đã dùng trong session này.

**Màu sắc:**
- Xanh lá: bình thường (< 70% context window)
- Vàng cam: gần đầy (70–90%) — cân nhắc reset hoặc summarize
- Đỏ: overflow hoặc rất gần giới hạn (> 90%) — agent có thể quên thông tin đầu session

**Thông tin hiển thị:**
```
[===========>          ] 4,521 / 8,192 tokens (55%)
```

**Xử lý khi gần đầy:**
- Tự động (nếu bật): context strategy `summarize` → agent tóm tắt message cũ thành 1 đoạn ngắn
- Thủ công: user hoặc admin reset session
- Không xử lý: agent bắt đầu "quên" thông tin đầu cuộc hội thoại (rolling window cutoff)

---

## 3.3 Reset Session

Reset xóa chat history nhưng **giữ lại** file context (SOUL.md, IDENTITY.md, USER.md).

**Cách reset:**
- Trong chat UI: nút **Reset** (icon vòng tròn)
- Lệnh chat: `/reset`
- Dashboard: Sessions → click session → **Reset**

**Khi nào dùng reset:**
- Agent "bị dính" context cũ (nhớ sai thông tin từ session dài)
- Bắt đầu chủ đề hoàn toàn mới không liên quan
- Sau khi update SOUL.md / IDENTITY.md (bắt buộc)
- Agent bị confused vì session quá dài

**Sau khi reset:**
- Chat history = rỗng
- File context (SOUL.md etc.) vẫn load bình thường
- Memory và Vault documents vẫn giữ nguyên và có thể search được

---

## 3.4 Delete Session

Delete xóa cả chat history lẫn session state — hard delete, không khôi phục.

**Cách delete:**
- Dashboard: Sessions → click session → **Xóa** → confirm

**Khác với Reset:**
| | Reset | Delete |
|--|-------|--------|
| Chat history | Xóa | Xóa |
| Session state/metadata | Xóa | Xóa |
| Session ID | Mới (tạo session mới) | Không còn |
| Khôi phục | Không | Không |
| Memory / Vault | Giữ nguyên | Giữ nguyên |

---

## 3.5 Auto-Refresh Session

Tự động reset session sau một khoảng thời gian không hoạt động.

**Cài đặt:**
- Agent → Advanced → **Auto-refresh session**
- Interval: số giờ không có message → tự reset
- Ví dụ: 24h → session không có message trong 24h → tự reset

**Mục đích:**
- Tránh context drift dài hạn (agent "nhớ" sai thông tin cũ từ tuần trước)
- Đảm bảo session luôn "tươi"

**Lưu ý**: Auto-refresh không xóa Memory — chỉ reset chat history. Kiến thức agent đã học vẫn còn trong Memory.

---

## 3.6 Session Metadata

Mỗi session có các metadata:

| Field | Mô tả |
|-------|-------|
| Session ID | UUID duy nhất, ví dụ: `sess_01h8x...` |
| Agent | Agent đang pair với session |
| Created at | Thời điểm tạo session lần đầu |
| Last active | Lần cuối có message |
| User ID | Owner của session (với Open agent) |
| Channel source | Telegram / Discord / Web Chat / etc. |
| Message count | Tổng số message trong session |
| Token count | Tổng token đã consume |

---

## 3.7 Xem Lịch Sử Session

Sidebar → **Sessions** → list tất cả session.

**Tìm kiếm:**
- Filter theo: agent, user, channel, date range, status
- Tìm theo nội dung message (full-text search trong history)

**Export log:**
- Chọn session → **Export** → JSON hoặc CSV
- Format JSON: mảng messages với role (user/assistant/tool), content, timestamp
- Dùng để phân tích chất lượng phản hồi, debug lỗi

---

## 3.8 Session Trong Telegram / Discord

**Telegram:**
- DM (Direct Message): mỗi `chat_id` = 1 session riêng với agent
- Group: mỗi `group_id` + agent = 1 session chung cho tất cả thành viên group
- Channel (broadcast): không có session — agent chỉ post, không nhận reply

**Discord:**
- DM: mỗi `user_id` = 1 session riêng
- Server channel: mỗi `channel_id` + agent = 1 session chung
- Thread: tùy config — có thể tạo 1 session per thread

**Hệ quả group session:**
- Nếu 10 người trong cùng group nhắn cùng bot → cùng 1 session
- Người sau đọc được context của người trước
- Reset session ảnh hưởng tất cả thành viên group

---

## 3.9 Session Context Strategy

Cài đặt tại: Agent → Advanced → **Context window strategy**.

**3 chiến lược:**

| Strategy | Mô tả | Token cost | Phù hợp |
|----------|-------|-----------|---------|
| `rolling_window` | Giữ N message gần nhất, cắt message cũ hơn | Thấp và cố định | Chat nhanh, không cần nhớ lâu |
| `summarize` | Khi gần đầy: LLM tóm tắt message cũ → nén lại | Trung bình | Chat dài, cần nhớ key points |
| `full_history` | Giữ tất cả message từ đầu đến cuối | Cao, tăng dần | Task phân tích toàn bộ lịch sử |

**Config rolling_window:**
```
window_size: 20   # giữ 20 message gần nhất
```

**Config summarize:**
```
summarize_threshold: 0.8    # bắt đầu summarize khi đạt 80% context
summary_model: gpt-4o-mini  # dùng model nhỏ để tóm tắt (tiết kiệm)
```

---

## 3.10 Debug Session

Khi agent trả lời sai / quên thông tin, dùng Debug để hiểu nguyên nhân.

**Cách debug:**
1. Sessions → click session → **Debug**
2. Xem tab **Raw Context**: exact prompt đang gửi lên LLM
3. Xem tab **Tool Calls**: danh sách tool đã gọi và kết quả
4. Xem tab **Memory Queries**: câu query semantic search và kết quả trả về

**Các nguyên nhân thường gặp:**

| Triệu chứng | Nguyên nhân | Fix |
|-------------|-------------|-----|
| Agent quên thông tin đầu session | Rolling window cắt mất | Tăng window_size hoặc dùng summarize |
| Agent không tìm được trong Vault | Vault doc không index đúng | Re-index, kiểm tra scope |
| Agent không nhớ fact đã nói | Memory scope sai | Kiểm tra memory_write scope |
| Agent trả lời không đúng persona | SOUL.md chưa load | Reset session sau khi sửa SOUL.md |

---

## 3.11 Session Isolation

**Agent isolation:**
- Agent A không thể đọc session của Agent B
- Không có API nào cross-read session giữa 2 agent

**Tenant isolation:**
- Tenant A không thể thấy session của Tenant B
- Session data được partition theo tenant_id ở database level

**User isolation (Open agent):**
- User A không thể xem session của User B với cùng agent
- Chỉ Admin mới có thể xem tất cả sessions qua Dashboard

---

## 3.12 Bulk Session Management

**Reset tất cả session của 1 agent:**
- Agents → chọn agent → tab Sessions → **Reset All**
- Useful khi: cập nhật SOUL.md lớn, muốn tất cả user bắt đầu fresh

**Delete tất cả session (hard):**
- Agents → tab Sessions → **Delete All** → confirm
- Cẩn thận: không khôi phục được

**Export toàn bộ session data:**
- Sessions → Filter theo agent → **Export All** → JSON
- Dùng để: backup, phân tích, migrate sang hệ thống khác

**Giới hạn:**
- Bulk operations có thể chậm nếu có nhiều session (> 1000)
- Thực hiện ngoài giờ cao điểm để tránh ảnh hưởng user đang chat
