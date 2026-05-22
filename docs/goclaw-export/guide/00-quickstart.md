# 00 — Quickstart (5 phút first-win)

> **Cảnh báo trước khi bắt đầu:**
> ⚠️ Trước khi train nhiều, vào **Agents → `<agent-name>` → Mô hình & Ngân sách** đặt **Budget Monthly** (USD/tháng). Không đặt = vượt budget không kiểm soát, agent có thể bị chặn API.
>
> Khuyến nghị: Sonnet/Gemini Pro: 20-50 USD/tháng cho agent thường. Opus/reasoning: 100-300 USD.

---

## Mục tiêu file này

Sau **5 phút**, bạn có thể:
1. Login dashboard và mở agent của mình
2. Đẩy 1 file PDF/Word/Markdown lên Vault
3. Chat với agent để verify nó đọc được file đó
4. **Quyết định** train tiếp theo cách nào (Vault / Memory / KG / File context / Skill)

---

## 5 phút first-win

### Bước 1. Login dashboard (30 giây)

Mở browser → `https://<your-vps>` → đăng nhập.

Sau login, sidebar trái có 11 menu nhóm theo 4 cụm:
- **CORE** — Overview, Chat, Agents, Agent Link & Team
- **CONVERSATIONS** — Sessions, Pending Messages, Contacts
- **CONNECTIVITY** — Channels, Nodes
- **CAPABILITIES** — Skills, Built-in Tools, MCP Servers, TTS, Cron, Hooks
- **DATA** — Memory, Vault, Knowledge Graph

### Bước 2. Mở agent của bạn (30 giây)

Sidebar → **Agents** → click `<agent-name>` trong list.

Tab default mở là **Agent**. Cuộn xem:
- **Persona** — tóm tắt chuyên môn (text này LLM thực sự đọc)
- **Mô hình & Ngân sách** — provider/model/context window/**Budget Monthly**
- **Skills** + **Pinned Skills**

⚠️ **Đặt Budget Monthly NGAY nếu chưa có** — không thì làm gì cũng risk.

### Bước 3. Upload 1 file vào Vault (2 phút)

Sidebar → **Vault**.

1. Header → bấm **Tải lên Kho Tri Thức**
2. **Đích đến**: chọn radio **`Agent`** → combobox chọn `<agent-name>`
3. **Loại**: chọn `Tài liệu` (default cho mọi doc)
4. Drop 1 file `.pdf` / `.md` / `.docx` / `.txt` vào dropzone
5. Bấm **Tải lên**

Đợi 30 giây – 1 phút để hệ thống lập chỉ mục.

### Bước 4. Verify (1 phút)

Vào **Vault** → bấm **🔍 Tìm kiếm** → gõ câu hỏi liên quan **nội dung file vừa upload**.

Vd file là báo cáo tài chính Q1 → search "doanh thu Q1 bao nhiêu". Phải có kết quả với:
- **Score > 0.5** (càng cao càng đúng)
- **Đường dẫn** trỏ tới file vừa upload
- **Chunk text** chứa thông tin liên quan

### Bước 5. Chat với agent (1 phút)

Sidebar → **Chat** → mở cuộc chat với `<agent-name>`.

Hỏi câu liên quan file vừa upload. Agent phải:
1. **Tự gọi** `vault_search` (sẽ thấy tool call trong UI)
2. Trả lời dựa trên content file vừa đút

Nếu agent **không** dùng `vault_search` → kiểm tra:
- Built-in Tool **Bộ nhớ** có bật `vault_search` chưa? (Built-in Tools menu)
- Vault doc có **scope đúng** không? Cá nhân chỉ user đó thấy, Chia sẻ thì cả workspace thấy

---

## Decision tree — Train tiếp theo cách nào?

```
                    Tôi muốn agent...
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   ĐỌC ĐƯỢC          NHỚ ĐƯỢC          LÀM ĐƯỢC
   (tài liệu)         (note/fact)       (thao tác)
        │                 │                 │
        ▼                 ▼                 ▼
  ─────────────    ──────────────    ─────────────
  File >1 trang?   Cần share team?   Có file SKILL
       │                 │            sẵn / biết viết?
   ┌───┴───┐         ┌───┴───┐            │
   ▼       ▼         ▼       ▼        ┌───┴────┐
  CÓ      KHÔNG     CÓ      KHÔNG     ▼        ▼
   │       │         │       │       CÓ      KHÔNG
   ▼       ▼         ▼       ▼        │        │
 VAULT   MEMORY    VAULT   MEMORY     ▼        ▼
                                    PATH A   PATH B
                                  (upload   (chat agent
                                   ZIP)     skill-creator)

         Tôi muốn agent có...
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
   QUAN HỆ                  TÍNH CÁCH
   (entity-relation)        (cách trả lời)
        │                       │
        ▼                       ▼
  KNOWLEDGE GRAPH         FILE CONTEXT
  (auto từ Memory)        (SOUL.md /
                           IDENTITY.md)
```

### Bảng quyết định nhanh

| Tôi muốn... | Cách | Section |
|---|---|---|
| Agent đọc được nhiều tài liệu (PDF/Word) | **Vault** | [01 §A](01-train-agent-dashboard.md#a-vault--kho-tài-liệu-chia-sẻ) |
| Agent nhớ ghi chú ngắn về user/khách | **Memory** | [01 §B](01-train-agent-dashboard.md#b-memory--bộ-nhớ-dài-hạn) |
| Hỏi câu quan hệ phức tạp ("ai mua X làm ở Y?") | **Knowledge Graph** | [01 §C](01-train-agent-dashboard.md#c-knowledge-graph--bản-đồ-quan-hệ) |
| Đổi xưng hô / phong cách / vai trò agent | **File context (SOUL.md)** | [01 §D](01-train-agent-dashboard.md#d-file-context--tính-cách-agent) |
| Cấp năng lực dùng skill có sẵn (pdf/docx/xlsx) | **Skill — bật + gắn** | [01 §E](01-train-agent-dashboard.md#e-skill--cấp-năng-lực-có-sẵn) |
| Tạo skill mới | **Skill — Path A hoặc B** | [03 — Tạo Skill](03-create-skill.md) |
| Bulk import 50+ file từ máy local | **Claude Code workflow** | [02 — Train via Claude](02-train-agent-via-claude.md) |
| Tự động hóa update Vault định kỳ | **Cron + Claude Code** | [02 — Train via Claude §Prompt 5](02-train-agent-via-claude.md#prompt-5--lập-lịch-cron-đọc-file-định-kỳ) |

---

## 5 nguyên tắc vàng (đọc 1 lần, áp dụng mãi)

1. **Đặt Budget Monthly trước khi train**. Không thì train bao nhiêu cũng vô ích — bị chặn API.

2. **Vault cho file lớn / share team. Memory cho note ngắn / per-agent.** Đừng nhầm chỗ — sai = search không ra hoặc nhiễu.

3. **Sửa file context (SOUL.md/IDENTITY.md/USER.md) → tạo session mới.** Session đang chạy đã cache system prompt — không thấy thay đổi.

4. **Skill cần làm cả 3 tầng**: Bật toàn cục → Cài deps → Gắn vào agent. Quên 1 tầng = không xài được.

5. **Test sau mỗi train** — search/chat thử ngay. Sửa sai sớm = đỡ phải đào lại.

---

## Khi nào ngừng đọc Quickstart, đào tài liệu nào?

| Tình huống | Đọc tiếp |
|---|---|
| Tôi đã làm xong 5 phút, muốn train nhiều cách hơn qua dashboard | [01 — Train Dashboard](01-train-agent-dashboard.md) |
| Tôi muốn dùng Claude Code để bulk import / tự động hóa | [02 — Train via Claude](02-train-agent-via-claude.md) |
| Tôi muốn tạo skill cho agent (chưa có sẵn) | [03 — Tạo Skill](03-create-skill.md) |
| Tôi vừa bị lỗi gì đó (search không ra, agent quên, upload fail) | [04 — Troubleshooting](04-troubleshooting.md) |
| Tôi không hiểu thuật ngữ (Memory vs Vault vs KG vs ...) | [05 — Glossary](05-glossary.md) |
