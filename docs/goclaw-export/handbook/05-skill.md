# 05 — Menu: Skill

Menu **Skills** quản lý "sách hướng dẫn" mà agent đọc và làm theo để thực thi các tác vụ chuyên biệt.

---

## 5.1 Skill Là Gì

**Skill** = tài liệu hướng dẫn (Markdown) mô tả cách agent thực hiện 1 tác vụ cụ thể.

**Phân biệt với các loại khác:**

| | Skill | Built-in Tool | Memory |
|--|-------|--------------|--------|
| Bản chất | Text hướng dẫn | Code thật (function) | Kiến thức dữ liệu |
| Agent làm gì | Đọc và làm theo | Gọi function, nhận kết quả | Search, đọc fact |
| Ví dụ | "Cách viết post LinkedIn 5 bước" | `web_search()` trả về kết quả | "Alpha thích format ngắn gọn" |
| Tạo bởi | Admin/Operator (hoặc agent tự tạo) | GoClaw dev team | Agent + Admin |

**Khi nào dùng Skill:**
- Dạy agent quy trình có nhiều bước
- Chuẩn hóa cách agent xử lý 1 loại request
- Cấp năng lực đặc thù không có trong built-in tools

---

## 5.2 Tab Core Skills

Skill tích hợp sẵn trong GoClaw — admin bật/tắt nhưng không sửa được nội dung.

**Core skills phổ biến:**

| Skill | Tác vụ |
|-------|--------|
| `skill-creator` | Giúp agent tự tạo skill mới qua chat |
| `pdf-reader` | Đọc và phân tích file PDF |
| `excel-writer` | Tạo file Excel từ data |
| `web-scraper` | Cào nội dung từ URL |
| `image-analyzer` | Phân tích ảnh (dùng LLM multimodal) |
| `code-runner` | Giải thích và chạy đoạn code |
| `data-formatter` | Convert JSON/CSV/YAML |
| `report-generator` | Tạo báo cáo có cấu trúc |

**Cách bật Core skill:**
- Admin → Skills → tab Core → toggle ON skill cần dùng

---

## 5.3 Tab Custom Skills

Skill do admin/operator tạo hoặc upload.

**Hiển thị:**
- List custom skills: tên, version, author, visibility, date
- Nút: Edit, Delete, Export ZIP, Duplicate

**Thao tác:**
- **Tạo mới**: click **+ Tạo Skill** → mở editor SKILL.md
- **Edit**: click skill → sửa nội dung trong Markdown editor
- **Xem history**: version changelog của skill
- **Export ZIP**: tải về để backup hoặc share

---

## 5.4 Upload Skill Qua ZIP

**Cấu trúc ZIP chuẩn:**
```
my-skill-name.zip
├── SKILL.md          <- BẮT BUỘC
├── scripts/          <- tùy chọn (python/node scripts)
│   └── helper.py
└── references/       <- tùy chọn (tài liệu tham chiếu)
    └── examples.md
```

**SKILL.md — YAML frontmatter bắt buộc:**
```yaml
---
name: my-skill-name
description: Mô tả ngắn gọn skill làm gì
version: 1.0.0
license: MIT
author: your-name
tags: [productivity, content, analysis]
dependencies:
  python: ["pandas", "openpyxl"]  # nếu cần
  node: []
---

# My Skill

## Mục đích
Skill này dùng để...

## Cách dùng
Khi user yêu cầu..., agent sẽ:
1. Bước 1...
2. Bước 2...

## Ví dụ
User: "Tạo báo cáo doanh thu tháng 5"
Agent: [thực hiện các bước 1, 2, 3 như trên]
```

**Upload:**
Skills → **Tải lên** → chọn file `.zip` → Validate → Lưu.

---

## 5.5 Validation Khi Upload ZIP

GoClaw tự động kiểm tra trước khi chấp nhận:

| Check | Pass | Fail |
|-------|------|------|
| SKILL.md tồn tại | ✓ | Lỗi: "SKILL.md not found" |
| YAML frontmatter hợp lệ | ✓ | Lỗi: "Invalid frontmatter" |
| `name` field có giá trị | ✓ | Lỗi: "name is required" |
| `version` theo semver | ✓ | Warning (không block) |
| Không có file `.env` | ✓ | Lỗi: "Security: .env file detected" |
| Không có binary executable | ✓ | Lỗi: "Binary file not allowed" |
| Tổng size ≤ 10MB | ✓ | Lỗi: "File too large" |
| `name` chưa tồn tại trong tenant | ✓ | Hỏi: "Overwrite existing skill?" |

---

## 5.6 Visibility Skill

| Visibility | Ai thấy | Ai dùng |
|------------|---------|---------|
| **Private** | Admin + Operator | Chỉ agent được assign thủ công |
| **Public** | Tất cả trong tenant | Tất cả agent trong tenant |

**Đặt visibility:**
Skills → chọn skill → **Visibility** → Private / Public.

> **Cảnh báo**: không set skill là Public trừ khi đã kiểm định kỹ nội dung. Skill Public có thể bị tất cả agent dùng — bao gồm cả agent user thông thường.

**Skill nguy hiểm** (chỉ giữ Private và chỉ assign cho admin agent):
- Bất kỳ skill có thể viết file, chạy command
- Skill-creator (tạo skill mới)
- Database manipulation skills

---

## 5.7 Gắn Skill Vào Agent (3 Tầng Bắt Buộc)

> Đây là lỗi phổ biến nhất khi dùng Skill. Phải làm ĐỦ 3 tầng.

**Tầng 1 — Bật toàn cục:**
```
Admin → Settings → Skills → [skill name] → toggle ON (globally enabled)
```

**Tầng 2 — Cài dependencies (nếu skill cần):**
```
Admin → Skills → [skill name] → tab Dependencies → Install
```
Với skill cần Python packages:
```bash
# GoClaw tự chạy bên trong container
pip install pandas openpyxl
```

**Tầng 3 — Gắn vào agent:**
```
Agents → [agent name] → tab Kỹ năng → + Thêm Skill → chọn [skill name] → toggle ON
```

**Kiểm tra:**
- Chat với agent: "Bạn có skill [tên skill] không?"
- Nếu agent biết → Tầng 3 ok
- Nếu agent không biết skill tồn tại → kiểm tra Tầng 1
- Nếu agent biết nhưng fail khi dùng → kiểm tra Tầng 2 (dependencies)

**Bảng debug:**

| Triệu chứng | Nguyên nhân | Fix |
|-------------|-------------|-----|
| Agent không biết skill này | Tầng 1 chưa bật hoặc Tầng 3 chưa gắn | Check cả 2 |
| Agent dùng skill nhưng bị lỗi deps | Tầng 2 chưa cài | Install dependencies |
| Agent biết nhưng không trigger | Skill description không match intent | Sửa description trong SKILL.md |

---

## 5.8 Tạo Skill Qua Chat (Path B)

Thay vì viết SKILL.md và upload ZIP, có thể chat với agent để tạo skill.

**Điều kiện:**
- Agent phải có skill `skill-creator` (Core skill) được bật và gắn
- Bật built-in tools: `skill_search`, `use_skill`, `publish_skill`

**Quy trình:**
1. Chat với agent: `"Tạo skill để [mô tả tác vụ] với format [mô tả format]"`
2. Agent phân tích yêu cầu, draft `SKILL.md`
3. Agent hỏi confirm: "Bạn có muốn publish skill này không?"
4. User reply: "Có" / hoặc request chỉnh sửa
5. Agent publish → skill xuất hiện trong Custom Skills với visibility = Private

**Ví dụ chat:**
```
User: Tạo skill để phân tích sentiment của bình luận Facebook, 
      output là JSON với fields: sentiment, score, key_phrases

Agent: [Tạo SKILL.md]
       ...
       Tôi đã tạo skill "facebook-sentiment-analyzer" v1.0.0.
       Bạn có muốn tôi publish không?

User: Có, publish đi

Agent: Đã publish. Skill xuất hiện trong Custom Skills.
       Bạn cần gắn vào agent nào?
```

---

## 5.9 Skill Search Và Sử Dụng

**Cách agent tìm và dùng skill:**

1. User gửi request
2. Agent gọi built-in tool `skill_search` với query = intent của user
3. `skill_search` tìm skill phù hợp (embedding search trên SKILL.md)
4. Agent đọc SKILL.md phù hợp nhất
5. Agent thực hiện theo hướng dẫn trong SKILL.md
6. Có thể gọi `use_skill` để track usage

**Built-in tools cần bật:**
- `skill_search` — tìm skill phù hợp
- `use_skill` — đánh dấu đang dùng skill (tracking + context)
- `publish_skill` — để agent có thể publish skill mới (chỉ agent có skill-creator)

**Cải thiện match rate:**
- Viết `description` trong SKILL.md thật rõ ràng và đặc thù
- Thêm `tags` liên quan
- Ví dụ trong SKILL.md càng nhiều càng tốt

---

## 5.10 Export Và Chia Sẻ Skill

**Export:**
Skills → chọn skill → **Export ZIP** → tải về file `.zip`.

**Chia sẻ với tenant khác:**
- Gửi file ZIP → admin tenant nhận upload qua Skills → Tải lên
- Skill name phải unique trong tenant nhận

**Backup:**
- Export định kỳ tất cả Custom Skills
- Lưu vào git repo hoặc Google Drive

**Community marketplace (roadmap):**
- GoClaw đang phát triển marketplace chia sẻ skill công khai
- Dự kiến: submit skill → review → publish lên marketplace
- Download skill từ marketplace về tenant của mình
