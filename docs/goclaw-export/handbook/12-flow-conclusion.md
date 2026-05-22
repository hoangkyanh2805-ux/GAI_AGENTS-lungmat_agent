# 12 — Flow Diagram & Kết Luận

---

## Flow: Quyết Định Dùng Tool Nào

Khi agent cần xử lý 1 request, dùng flow sau để chọn đúng công cụ:

```
User gửi message → Agent cần gì?
│
├── Cần biết QUAN HỆ giữa các entity?
│   └── → Knowledge Graph (kg_query)
│       Câu hỏi: "ai quản lý X?", "X liên quan đến Y không?"
│
├── Cần TÀI LIỆU cụ thể (SOP, guideline, report)?
│   └── → Vault search (vault_search)
│       Câu hỏi: "quy trình onboarding là gì?", "báo cáo tháng 5 nội dung gì?"
│
├── Cần NHỚ THÔNG TIN dài hạn về user/context?
│   ├── Của riêng user đó? → Memory scope Personal
│   └── Kiến thức chung cho mọi user? → Memory scope Global
│
├── Cần NĂNG LỰC MỚI (làm được tác vụ chưa có)?
│   ├── Đã có built-in tool phù hợp? → Bật Built-in Tool
│   ├── Cần viết logic phức tạp? → Tạo Skill (SKILL.md)
│   └── Cần kết nối hệ thống ngoài? → Tạo MCP Server
│
├── Cần THAY ĐỔI TÍNH CÁCH / PERSONA agent?
│   └── → File context (sửa SOUL.md / IDENTITY.md)
│       Nhớ: tạo session mới sau khi sửa!
│
├── Cần chạy TỰ ĐỘNG theo lịch?
│   └── → Cron Job
│       Nhớ: set timezone Asia/Ho_Chi_Minh
│
└── Cần NHIỀU AGENT phối hợp?
    ├── Pipeline tuần tự? → Team type Sequential
    ├── Song song? → Team type Parallel
    └── Phân loại intent → đúng agent? → Team type Router / Agent Link
```

---

## Flow: Quyết Định Scope Khi Lưu Thông Tin

```
Tôi muốn lưu thông tin này vào đâu?
│
├── Là FILE LỚN (> 100KB)?
│   └── → Vault
│       ├── Cho agent cụ thể? → scope: Agent
│       ├── Cho tất cả agent? → scope: Shared
│       └── Cho cả user? → scope: Workspace
│
├── Là GHI CHÚ NGẮN / FACT / KIẾN THỨC?
│   └── → Memory
│       ├── Của riêng user đó? → scope: Personal
│       └── Dùng chung? → scope: Global
│
└── Là TÍNH CÁCH / PHONG CÁCH AGENT?
    └── → File context
        ├── Cốt lõi không đổi → SOUL.md
        ├── Vai trò/chuyên môn → IDENTITY.md
        └── Thông tin user mặc định → USER.md
```

---

## Nguyên Tắc 3 Không

> Luôn áp dụng — không có exception.

**1. Không gắn skill nguy hiểm vào agent public**
- `exec`, `skill-creator`, database tools, `file_write` → chỉ dành cho admin agent
- Agent public (Telegram bot, Web Chat) không được có exec access
- Rule: nếu skill có thể write file hoặc chạy code → Private + chỉ assign cho admin agent

**2. Không để secret/token ở Memory scope Global**
- API key, password, OAuth token → đặt trong `.env` hoặc secret store của GoClaw
- Memory scope Global = tất cả user của agent đọc được → không lưu credential ở đây
- Dùng GoClaw Secret Store: Admin → Settings → Secrets → lưu với key `SECRET_NAME` → dùng trong MCP/Cron env

**3. Không bỏ qua Budget Monthly**
- Set giới hạn cho MỖI agent trước khi train nhiều
- Agent không có budget = vượt quota không kiểm soát → bị chặn API cuối tháng, mất continuity
- Quy tắc: tạo agent mới → đặt budget ngay trong bước setup

---

## Nguyên Tắc 3 Có

> Luôn làm — không bỏ qua.

**1. Có timezone cron = `Asia/Ho_Chi_Minh`**
- Mọi cron job cho thị trường VN đều phải set timezone này
- Default UTC lệch 7 tiếng — `0 8 * * *` UTC = 15:00 VN
- Kiểm tra: crontab.guru + note "VN time = UTC+7"

**2. Có session mới sau khi sửa file context**
- Sửa SOUL.md / IDENTITY.md / USER.md → **bắt buộc reset session** mới thấy thay đổi
- Session cũ đã cache system prompt cũ → không bao giờ thấy update
- Quy trình: sửa file context → Agents → Sessions → Reset All → test

**3. Có audit trail cho mọi tác vụ quan trọng**
- Team task: xem Audit Log trong Team tab
- Cron run: xem Run History trong Cron
- MCP call: xem MCP Server Logs
- Dùng để debug khi agent làm sai, không cần guessing

---

## Quick Reference: Ai Làm Gì

| Tôi muốn... | Đi đâu | Làm gì |
|-------------|--------|--------|
| Upload PDF/Word cho agent đọc | Vault → Tải lên | Chọn scope, upload file |
| Dạy agent nhớ 1 fact cụ thể | Memory → Thêm document | Nhập text, chọn scope |
| Đổi tính cách agent | Agent → File context → SOUL.md | Sửa → Lưu → **Reset session** |
| Cấp năng lực mới cho agent | Skill (3 tầng) hoặc Built-in Tool | Xem `05-skill.md §5.7` |
| Kết nối tool ngoài (Drive, Notion...) | MCP Servers → Tạo mới | Chọn transport, điền config |
| Tự động hóa task định kỳ | Cron → Tạo | Chọn type, điền expression + timezone |
| Nhiều agent cộng tác | Team → Tạo | Chọn type, thêm member (Predefined) |
| Debug agent quên thông tin | Session → Debug → Raw Context | Xem đang gửi gì lên LLM |
| Debug agent không search được | Vault/Memory → Search test | Kiểm tra scope, re-index nếu cần |
| Ngừng agent nhận message | Channel → Unpair | Agent không nhận message mới |
| Xem agent đang làm gì | Sessions → view session | Xem real-time context + tool calls |

---

## Checklist Triển Khai Agent Mới

Khi tạo 1 agent mới cho production, đảm bảo:

**Bước 1 — Cấu hình cơ bản:**
- [ ] Chọn type đúng (Open / Predefined)
- [ ] Đặt Budget Monthly
- [ ] Chọn primary model + fallback model
- [ ] Viết SOUL.md (tính cách) + IDENTITY.md (chuyên môn)

**Bước 2 — Kiến thức:**
- [ ] Upload tài liệu cần thiết vào Vault (scope đúng)
- [ ] Thêm memory documents cho kiến thức nền (nếu cần)
- [ ] Bật Built-in Tools cần thiết (vault_search, memory_search, web_search...)

**Bước 3 — Năng lực:**
- [ ] Gắn Skills cần thiết (3 tầng)
- [ ] Grant MCP Servers nếu cần tool ngoài

**Bước 4 — Kết nối:**
- [ ] Tạo Channel (Telegram/Discord/...) + điền credentials
- [ ] Pair Channel với Agent
- [ ] Test kết nối

**Bước 5 — Test:**
- [ ] Chat thử qua Dashboard (sandbox)
- [ ] Test vault_search có tìm ra doc không
- [ ] Test tính cách agent đúng SOUL.md chưa
- [ ] Test 1 use case thực tế end-to-end

**Bước 6 — Automation (nếu cần):**
- [ ] Tạo Cron Job (nhớ timezone)
- [ ] Test run cron thủ công lần đầu
- [ ] Verify channel delivery nhận đúng

**Bước 7 — Team (nếu cần):**
- [ ] Agent là Predefined? (bắt buộc)
- [ ] Tạo Team, thêm agent vào member
- [ ] Test task flow end-to-end

---

## Glossary Nhanh

| Thuật ngữ | Nghĩa ngắn |
|-----------|-----------|
| Agent | AI bot với config, kiến thức, kết nối riêng |
| Open agent | Mỗi user 1 session riêng |
| Predefined agent | Tất cả user chung 1 session |
| Session | Luồng hội thoại, lưu context history |
| Channel | Kết nối đến nền tảng nhắn tin (Telegram, Discord...) |
| Vault | Kho tài liệu lớn (admin upload) |
| Memory | Bộ nhớ dài hạn (agent tự ghi) |
| File context | SOUL.md / IDENTITY.md — luôn vào system prompt |
| Skill | Hướng dẫn làm gì (Markdown doc) |
| Built-in Tool | Function thật (code) agent gọi được |
| MCP Server | Tool ngoài theo chuẩn Model Context Protocol |
| Cron | Tác vụ tự động theo lịch |
| Team | Nhóm agent cộng tác |
| Agent Link | Kết nối trực tiếp 2 agent |
| Knowledge Graph | Mạng entity-relation tự extract từ Memory |
| Tenant | Workspace/tổ chức, cách ly hoàn toàn với nhau |
| Scope | Phạm vi truy cập: Personal/Global/Agent/Shared/Workspace |

---

*Xem thêm tài liệu train agent tại: `docs/goclaw-export/guide/CLAUDE.md`*
