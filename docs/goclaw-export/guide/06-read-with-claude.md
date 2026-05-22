# 06 — Đọc tài liệu này bằng Claude

> Thay vì scroll đọc 6 file MD lần lượt, bạn có thể "**trò chuyện**" với bộ tài liệu — hỏi Claude câu cụ thể, Claude tự đọc đúng file/đoạn liên quan trả lời.

Có 4 cách dùng. Chọn cách phù hợp tùy bạn đang dùng tool nào.

---

## Cách 1 — Claude Code (recommended cho người đã quen CLI)

**Khi nào dùng:** đã có Claude Code trên máy, hay vừa code vừa hỏi GoClaw.

### Setup (5 phút, 1 lần duy nhất)

1. **Tải bộ tài liệu** về 1 folder local, vd:
   ```
   ~/goclaw-docs/
   ├── README.md
   ├── 00-quickstart.md
   ├── 01-train-agent-dashboard.md
   ├── 02-train-agent-via-claude.md
   ├── 03-create-skill.md
   ├── 04-troubleshooting.md
   ├── 05-glossary.md
   └── 06-read-with-claude.md
   ```

2. **Mở Claude Code** trong folder đó:
   ```bash
   cd ~/goclaw-docs
   claude
   ```

3. **Tạo file `CLAUDE.md`** trong folder (Claude Code tự đọc file này mỗi session):
   ```markdown
   # GoClaw Train Guide

   Folder này chứa hướng dẫn chi tiết cách train agent GoClaw qua dashboard
   và qua Claude Code. Khi user hỏi về:
   - Cách đút tài liệu/PDF/note → đọc 01-train-agent-dashboard.md
   - Cách dùng API/CLI → đọc 02-train-agent-via-claude.md
   - Tạo skill mới → đọc 03-create-skill.md
   - Lỗi gặp phải → đọc 04-troubleshooting.md
   - Thuật ngữ không rõ → đọc 05-glossary.md

   Trả lời ngắn gọn, chỉ trích đoạn liên quan, kèm link file:line nếu có.
   ```

### Sử dụng

Hỏi Claude trực tiếp:

```
Cho tôi biết cách upload PDF vào Vault thế nào?
```

Claude sẽ đọc `01-train-agent-dashboard.md` rồi trả lời 3 bước + link doc.

```
Skill ZIP của tôi báo lỗi "phải chứa SKILL.md ở thư mục gốc". Fix sao?
```

Claude sẽ đọc `04-troubleshooting.md` case 11, trả lời cách zip đúng.

```
Tóm tắt 5 cách "đút kiến thức" cho agent
```

Claude sẽ đọc `05-glossary.md` + `01-train-agent-dashboard.md`, tóm tắt bảng so sánh.

---

## Cách 2 — Claude Desktop với Filesystem MCP

**Khi nào dùng:** dùng Claude Desktop (app), thích chat với UI thay vì CLI.

### Setup

1. **Cài Claude Desktop** từ [claude.com/download](https://claude.com/download)
2. **Setup Filesystem MCP Server** — config Claude Desktop trỏ đến folder bộ tài liệu:
   - Mở Claude Desktop → Settings → Developer → Edit Config
   - Thêm MCP server filesystem:
     ```json
     {
       "mcpServers": {
         "goclaw-docs": {
           "command": "npx",
           "args": [
             "-y",
             "@modelcontextprotocol/server-filesystem",
             "/path/to/goclaw-docs"
           ]
         }
       }
     }
     ```
   - Restart Claude Desktop
3. Trong chat, Claude tự thấy folder → đọc + trả lời được

### Sử dụng

Y hệt Cách 1 — chỉ khác là thao tác qua app GUI thay vì CLI.

---

## Cách 3 — Claude.ai (web, không cần cài gì)

**Khi nào dùng:** không muốn cài tool gì, muốn chat browser thuần.

### Setup (3 phút)

1. Mở [claude.ai](https://claude.ai), đăng nhập
2. Sidebar → **Projects** → **+ New Project**
3. Đặt tên: "GoClaw Train Guide"
4. Trong Project, tab **Knowledge** → drag-drop **7 file `.md`** vào (giới hạn vài chục MB, đủ chỗ)
5. Tab **Custom Instructions** (tùy chọn) — paste:
   ```
   Bạn là trợ lý GoClaw. Folder Knowledge chứa hướng dẫn chi tiết
   train agent. Trả lời câu hỏi của user dựa trên tài liệu này, kèm
   tên file đã tham khảo. Trả lời tiếng Việt, ngắn gọn.
   ```

### Sử dụng

Mở chat trong Project → hỏi trực tiếp:

```
Bộ lọc skill per-group hoạt động thế nào?
```

Claude.ai tự search Knowledge, trả lời + cite file `03-create-skill.md`.

**Ưu điểm Cách 3:**
- Zero install
- Có thể share Project với đồng nghiệp (cùng truy cập)
- Lịch sử chat lưu trên cloud

**Nhược điểm:**
- Cần Claude Pro để có Projects (free tier giới hạn)
- Phải upload lại file mỗi khi tài liệu update

---

## Cách 4 — Đút thẳng vào Vault của agent (meta!)

**Khi nào dùng:** đã có agent GoClaw chạy rồi, muốn agent **tự** trả lời câu hỏi về cách dùng GoClaw.

### Setup (10 phút)

1. Vào dashboard → menu **Vault** → bấm **Tải lên Kho Tri Thức**
2. **Đích đến:** chọn `Chia sẻ` (toàn workspace) hoặc `Agent` (riêng 1 agent)
3. **Loại:** chọn `Ngữ cảnh` (background tài liệu nền)
4. Drop **7 file `.md`** → bấm Tải lên
5. Đợi enrichment (vài phút)

### Sử dụng

Chat với agent (vd qua Telegram/Web Chat):

```
User: Em ơi cho anh hỏi cách upload skill ZIP đúng cách
Agent: [tự gọi vault_search] Dạ anh, theo tài liệu, ZIP phải có
       SKILL.md ở thư mục gốc, KHÔNG bọc folder. Cách zip đúng trên
       Windows: vào trong folder → Ctrl+A → chuột phải → Compress...
```

**Ưu điểm Cách 4 (best of both):**
- Vừa **demo** Vault hoạt động thế nào
- Vừa **làm tài liệu sống** — cập nhật MD trong Vault là agent biết ngay
- Khách hỏi câu mới, agent trả ngay (không cần ai trực)

**Nhược điểm:**
- Cần agent đã setup xong (provider/model/tools đầy đủ)
- Câu trả lời phụ thuộc chất lượng model — Gemma 31B có thể trả thiếu, Sonnet/Pro chính xác hơn

---

## So sánh 4 cách

| | Claude Code | Claude Desktop | Claude.ai | Vault agent |
|---|---|---|---|---|
| Cài đặt | Cần CLI | Cần app | Không cần | Cần agent |
| Trả phí | Free tier OK | Free tier OK | Pro để có Projects | Tùy provider model |
| Update tài liệu | Sửa MD local | Sửa MD local | Re-upload | Sửa file trong Vault |
| Chia sẻ team | Phải gửi folder | Phải gửi folder | Share Project link | Mọi user của agent |
| Trả lời tốt nhất | Sonnet 4 default | Sonnet 4 default | Sonnet 4 default | Tùy model agent |
| Use case | Dev, ops | Manager non-CLI | Đọc nhanh, share team | Demo Vault + automation |

**Khuyến nghị:**
- Bạn (admin) → **Cách 1 hoặc 2** để tra cứu hằng ngày
- Team của bạn → **Cách 3** (share Project)
- Khách hàng cuối / member group → **Cách 4** (hỏi agent trực tiếp)

---

## Prompt mẫu hiệu quả

Khi dùng bất kỳ cách nào, các prompt sau cho kết quả tốt:

### Tra cứu nhanh

```
Tóm tắt cách <X> trong tài liệu, dưới 100 từ
```

### Khi gặp lỗi

```
Tôi đang gặp lỗi: "<paste error message>".
Tài liệu có hướng dẫn fix không? Trích đoạn liên quan + cite file.
```

### So sánh

```
Memory với Vault khác nhau ở chỗ nào? Khi nào dùng cái nào?
```

### Step-by-step

```
Hướng dẫn từng bước cách <X>, từ login dashboard đến verify xong.
```

### Decision support

```
Tôi muốn agent <làm gì cụ thể>. Theo tài liệu, dùng cách nào (Vault /
Memory / KG / File context / Skill)? Vì sao?
```

---

## Đào sâu

- **Train agent thực sự (không phải đọc tài liệu)** → [02 — Train via Claude](02-train-agent-via-claude.md)
- **Glossary thuật ngữ** → [05 — Glossary](05-glossary.md)
