# 03 — Tạo Skill mới

> **Cảnh báo trước khi bắt đầu:**
> ⚠️ Tên slug của skill **không sửa được sau upload**. Đặt sai phải xóa upload lại — mất history version.

---

## Tổng quan: 2 path tạo skill

| | **Path A — Tự viết + upload ZIP** | **Path B — Nhờ agent tự tạo** |
|---|---|---|
| Cần biết | YAML + Markdown + (tùy) Python | Chỉ cần biết mô tả nghiệp vụ bằng tiếng Việt |
| Thời gian | 30 phút – 2 giờ (1 skill) | 5-15 phút (1 skill) |
| Chất lượng | Cao nếu biết viết. Có toàn quyền tinh chỉnh | Tốt cho skill đơn giản. Skill phức tạp có thể cần Path A |
| Tools cần | File editor, ZIP tool | Skill `skill-creator` đã gắn vào agent |
| Khi nào dùng | Có file SKILL.md sẵn / copy từ chỗ khác / cần script Python phức tạp | Mô tả nghiệp vụ bằng lời → để agent sinh code |

---

## Path A — Tự viết + Upload ZIP

### Bước 1. Chuẩn bị file SKILL.md

File `SKILL.md` là "sách hướng dẫn" agent đọc khi cần dùng skill. **Bắt buộc** có YAML frontmatter ở đầu file:

```markdown
---
name: ten-skill-cua-ban
description: Use this skill whenever the user wants to <mô tả ngắn>. Trigger contexts include <ví dụ 1>, <ví dụ 2>, <ví dụ 3>.
license: Proprietary
---

# Hướng dẫn xử lý <chủ đề>

## Khi nào dùng
- Trường hợp A
- Trường hợp B

## Các bước thực hiện
1. ...
2. ...
3. ...

## Ví dụ
...
```

**Quy tắc viết description:**
- Bắt đầu bằng **"Use this skill whenever..."** — hệ thống dùng BM25 search dựa vô đây
- Description **"pushy"** (đẩy mạnh): kể trigger cụ thể, ví dụ, tên file/extension
- Tránh mô tả mơ hồ: ❌ "Data processing skill" ✅ "Process CSV files. Use whenever user uploads .csv, mentions tables, asks to extract from spreadsheets"

### Bước 2. (Tùy chọn) Thêm scripts/references

Cấu trúc thư mục skill đầy đủ:
```
ten-skill-cua-ban/
├── SKILL.md              ← BẮT BUỘC, ở thư mục gốc
├── scripts/              ← (tùy chọn) script Python/JS
│   ├── extract.py
│   └── requirements.txt  ← khai báo dep Python
├── references/           ← (tùy chọn) doc loaded khi cần
│   └── api-spec.md
└── assets/               ← (tùy chọn) file mẫu
    └── template.xlsx
```

### Bước 3. Tạo file ZIP đúng format

⚠️ **PITFALL phổ biến nhất:** ZIP có folder bọc bên ngoài.

❌ **SAI** (folder bọc — SKILL.md không ở root):
```
ten-skill.zip
└── ten-skill/             ← folder bọc, sai
    ├── SKILL.md
    └── scripts/
```

✅ **ĐÚNG** (zip thẳng nội dung):
```
ten-skill.zip
├── SKILL.md               ← ngay root
└── scripts/
```

**Cách zip đúng trên Windows:**
1. Mở folder skill (vào TRONG folder)
2. `Ctrl + A` chọn tất cả file/folder bên trong
3. Chuột phải → **Compress to ZIP**
4. **KHÔNG** click chuột phải lên folder skill rồi compress (cách này tạo folder bọc)

**Cách zip đúng trên Mac/Linux:**
```bash
cd ten-skill
zip -r ../ten-skill.zip .
```

### Bước 4. Upload qua Dashboard

1. Menu **Skills** → tab **Custom**
2. Drop file `.zip` vào dropzone (hoặc click chọn file)
3. Hệ thống validate → nếu OK → skill xuất hiện trong list

**Giới hạn:**
- Max **20MB / file ZIP**
- Max **50 skill / 1 ZIP** (multi-skill ZIP)

### Bước 5. Cấu hình skill sau upload

| Trường | Sửa được? | Ghi chú |
|---|---|---|
| **Tên (slug)** | ❌ KHÔNG | Đặt đúng từ đầu, sai phải xóa upload lại |
| **Mô tả** | ✅ | Bấm bút chì cột Actions. Phải bắt đầu *"Use this skill whenever..."* |
| **Hiển thị (Visibility)** | ✅ | Click badge cột Hiển thị: `Riêng tư` / `Nội bộ` (default an toàn) / `Công khai` |
| **Tags** | ✅ | Lọc theo domain (vd `bds`, `finance`) |
| **Toggle Active** | ✅ | Cột Actions toggle bật/tắt |

### Bước 6. Cài Missing Dependencies (nếu có)

Nếu skill có `scripts/requirements.txt` (Python) hoặc `package.json` (Node):
- Header trang Skills hiện panel **Missing Dependencies**
- Bấm **Install Dependencies** (cài hết) hoặc **Install** từng cái
- Sau cài xong → **Rescan Deps**

### Bước 7. Gắn skill cho agent

(Đã hướng dẫn ở [01 §E](01-train-agent-dashboard.md#e-skill--cấp-năng-lực-có-sẵn))

Tóm tắt: **Agents** → `<agent-name>` → tab **Agent** → phần **Skills** → tick → Lưu.

### Verify Path A

Chat với agent, prompt khớp description skill. Vd skill `pdf-vietnamese-invoice` description "Use this skill whenever user wants to extract data from Vietnamese invoice PDFs":

User: *"Đọc file hóa đơn này giúp em: invoice.pdf"*
→ Agent phải tự gọi skill và trả về data có cấu trúc.

---

## Path B — Nhờ agent tự tạo qua chat

### Điều kiện tiên quyết

Agent `<agent-name>` phải có đủ:

| Thứ | Cấu hình ở đâu |
|---|---|
| **1. Skill `skill-creator`** trong Skills List (lý tưởng: Pinned) | **Agents** → `<agent-name>` → tab **Agent** → phần **Skills** → tick `skill-creator` |
| **2. Tools `skill_search`, `use_skill`, `publish_skill`, `skill_manage`** đã bật | **Built-in Tools** → danh mục **Skill** → toggle ON cả 4 |
| **3. Tools file system** (`write_file`, `edit`, `read_file`, `list_files`) | **Built-in Tools** → danh mục **Hệ thống tệp** → toggle ON |
| **4. Tool `exec`** | **Built-in Tools** → danh mục **Thời gian chạy** → toggle ON. Cần để agent test script Python |
| **5. Sandbox** (khuyến nghị) | **Agents** → `<agent-name>` → ⚙️ Nâng cao → **Sandbox** mode = `non-main` |

### Workflow agent sẽ làm (10 bước eval-driven)

Agent đọc skill `skill-creator` → tự thực hiện:

1. **Capture Intent** — Hỏi user: skill này làm gì? Trigger khi nào? Output cấu trúc thế nào?
2. **Research** — Tìm best practices, tham khảo skill có sẵn
3. **Plan** — Xác định scripts/references/assets cần
4. **Initialize** — Chạy `scripts/init_skill.py <name>` tạo skeleton
5. **Write** — Sinh `SKILL.md` + scripts vào workspace
6. **Test & Evaluate** — Chạy eval suite, grade outputs
7. **Optimize Description** — Tối ưu trigger với AI
8. **Publish** — Gọi tool `publish_skill(path)` → tự đăng ký vào DB hệ thống
9. **Package** (tùy chọn) — Đóng ZIP để export
10. **Iterate** — Lặp từ feedback

### Step-by-step

**Bước 1.** Mở chat với `<agent-name>` (Web Chat hoặc channel đã pair).

**Bước 2.** Prompt mẫu:

```
Em ơi tạo cho anh skill mới làm <việc cụ thể>.

Yêu cầu:
- Trigger khi user nói: "<từ khóa 1>", "<từ khóa 2>"
- Input: <loại file/text/data>
- Output: <kết quả mong muốn>
- Giới hạn: <nếu có>

Em chạy đầy đủ 10 bước eval-driven nha — viết SKILL.md, viết script
nếu cần, test, optimize description, rồi publish vào hệ thống.
Sau khi publish, báo lại slug skill để anh kiểm tra.
```

**Bước 3.** Agent sẽ hỏi lại các câu để hiểu rõ. Trả lời cụ thể.

**Bước 4.** Đợi agent chạy workflow (5-15 phút tùy skill phức tạp).

**Bước 5.** Agent báo "đã publish skill `<slug>`, anh kiểm tra ở **Skills → tab Custom**".

### Verify Path B

1. Vào menu **Skills** → tab **Custom** → tìm skill mới có slug agent báo
2. Click vào → kiểm tra `SKILL.md` content có đúng yêu cầu không
3. Test chat với agent prompt khớp description skill mới
4. Nếu không hoạt động đúng → bảo agent **iterate** (sửa lại):
   ```
   Skill <slug> chưa đúng ở chỗ <X>. Em sửa lại và publish version mới nha.
   ```

### Khi nào Path B fail

- Model agent **quá nhỏ/yếu** → không hoàn thành 10 bước eval. Cách khắc phục:
  - Bật **Subagents** + **Model Override** (Sonnet/Pro) ở Nâng cao agent
  - Hoặc tạo agent riêng chuyên tạo skill, cấu hình model mạnh + skill `skill-creator`
- Skill phức tạp (cần parse format đặc thù, gọi API ngoài) → có thể Path A nhanh hơn

### Pitfalls Path B

- **Slug trùng skill hệ thống** (`pdf`/`docx`/`xlsx`/`pptx`/`skill-creator`) → publish fail. Đặt tên khác
- **Agent không có quyền `exec`** → không test được script → publish bừa, skill chạy lỗi sau
- **`skill-creator` chưa được gắn vào agent** → agent nói "tôi không biết tạo skill thế nào". Quay về điều kiện tiên quyết

---

## SKILL.md format chuẩn — chi tiết

### YAML frontmatter (bắt buộc)

```yaml
---
name: <slug-skill>           # bắt buộc, lowercase, dash-separated, không số đầu
description: Use this skill whenever <mô tả "pushy">  # bắt buộc, ≤1024 ký tự, BM25 search dựa vô đây
license: <license>           # bắt buộc, vd "Proprietary", "MIT", "Complete terms in LICENSE.txt"
metadata:                    # tùy chọn
  author: <tên/email>
  version: "1.0.0"
---
```

### Body markdown (bắt buộc)

- **<300 dòng** SKILL.md (giới hạn để agent load nhanh)
- **Imperative form**: "Để xử lý X, làm Y" thay vì "Bạn nên làm Y"
- **Numbered workflow steps** rõ ràng
- **Concrete examples**: lệnh, code, API call cụ thể

### Resources tùy chọn

| Folder | Mục đích | Giới hạn |
|---|---|---|
| `scripts/` | Code thực thi (Python/JS/Bash) | Không giới hạn — chạy không cần load |
| `references/` | Doc chi tiết loaded khi cần | <300 dòng/file |
| `agents/` | Eval agent templates | — |
| `assets/` | File mẫu (template, sample data) | — |

---

## Per-group skill filter (Channel)

> Use case: Agent chạy trên Telegram group. Muốn member group **không** dùng được skill `skill-creator` (chỉ admin DM riêng mới dùng).

### Cấu hình

1. Menu **Channel** → click channel của agent → tab **Nhóm**
2. Bấm **Thêm nhóm** → nhập **ID nhóm** (vd `-100123456` cho Telegram, `*` wildcard cho mọi group)
3. Trong nhóm vừa thêm có field **"Bộ lọc skill"**:
   - **Trống** = kế thừa từ Skills List của agent (default)
   - **Tick chọn** = chỉ skill được tick mới gọi được trong group này

### Ví dụ cấu hình an toàn

- **Group** (open cho team): tick `pdf`, `docx`, `xlsx`, `pptx` (4 skill xử lý file thông thường). **KHÔNG** tick `skill-creator`
- **DM riêng admin**: không filter (full skill, có cả `skill-creator`)

### Verify

Trong group: bảo agent "tạo skill mới abc". Agent phải reply không có quyền hoặc không tìm thấy skill-creator.

Trong DM: bảo agent câu tương tự — agent phải chạy workflow tạo skill.

---

## Pitfalls tổng hợp

### Khi upload ZIP
- ZIP có folder bọc → SKILL.md không ở root → bị từ chối
- Slug trùng skill hệ thống (`pdf`/`docx`/`xlsx`/`pptx`/`skill-creator`) → bị từ chối
- File >20MB hoặc >50 skill/ZIP → bị từ chối
- Thiếu YAML frontmatter / thiếu `name` → bị từ chối

### Sau upload
- Đặt sai slug → phải **xóa upload lại** (slug không sửa được)
- Description viết không "pushy" → agent không tìm thấy skill khi cần
- Visibility = `Riêng tư` → agent không thấy. Đổi `Nội bộ`
- Quên Install Missing Deps → skill báo lỗi runtime khi gọi

### Khi gắn vào agent
- Quên 1 trong 3 tầng (toàn cục + deps + agent grant) — xem [01 §E](01-train-agent-dashboard.md#e-skill--cấp-năng-lực-có-sẵn)
- Pinned >10 skill — không cho phép, hoặc nếu cho thì system prompt phình to

### Khi tạo qua agent (Path B)
- Agent yếu → không hoàn thành 10 bước
- Sandbox tắt + tool `exec` tắt → agent không test được script
- Skill cần dep Python ngoài stdlib → agent phải kèm `requirements.txt` trong skill folder

---

## Đào sâu

- **Cài skill có sẵn cho agent** (không tạo mới) → [01 §E](01-train-agent-dashboard.md#e-skill--cấp-năng-lực-có-sẵn)
- **Lỗi thường gặp** → [04 — Troubleshooting](04-troubleshooting.md)
- **Train qua Claude Code** (gồm prompt mẫu tạo skill từ CLI) → [02 — Train via Claude](02-train-agent-via-claude.md)
- **Glossary** → [05 — Glossary](05-glossary.md)
