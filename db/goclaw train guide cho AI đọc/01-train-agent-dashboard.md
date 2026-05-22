# 01 — Train Agent qua Dashboard

> **Cảnh báo trước khi bắt đầu:**
> ⚠️ Luôn đặt **Budget Monthly** cho agent (menu Agent → Mô hình & Ngân sách) trước khi cấp nhiều skill/memory. Nếu không, vượt budget → agent bị chặn API tới đầu tháng sau.

---

## Tổng quan: 5 cách "đút kiến thức" cho agent

| Mục | Phù hợp khi | Section |
|---|---|---|
| **A. Vault** — Kho tài liệu chia sẻ | Có file PDF/Word/CSV/MD muốn agent đọc được | [§A](#a-vault--kho-tài-liệu-chia-sẻ) |
| **B. Memory** — Bộ nhớ riêng agent | Note ngắn, fact riêng cho agent nhớ qua nhiều cuộc chat | [§B](#b-memory--bộ-nhớ-dài-hạn) |
| **C. Knowledge Graph** — Bản đồ quan hệ | Câu hỏi quan hệ ("khách nào mua X và làm ở Y?") | [§C](#c-knowledge-graph--bản-đồ-quan-hệ) |
| **D. File context** — Tính cách agent | Đổi cách xưng hô, vai trò, phong cách trả lời | [§D](#d-file-context--tính-cách-agent) |
| **E. Skill (cài sẵn)** — Cấp năng lực có sẵn | Bật cho agent dùng skill `pdf`, `docx`, `xlsx`, `pptx` (có sẵn) | [§E](#e-skill--cấp-năng-lực-có-sẵn) |

> **Tạo skill MỚI** (tự viết hoặc nhờ agent tự tạo) → xem [03 — Tạo Skill](03-create-skill.md).
>
> **Phân biệt 5 thứ trên** nếu chưa rõ → xem [05 — Glossary](05-glossary.md).

---

## A. Vault — Kho tài liệu chia sẻ

### Khi nào dùng
- Có **file PDF, Word, Excel, Markdown, CSV, JSON** muốn agent đọc/tham chiếu
- Tài liệu **dùng chung** cho team hoặc cho 1 nhóm user
- Cần **wikilinks** giữa các tài liệu (link `[[doc-khac]]`)

### Khi nào KHÔNG dùng
- Note ngắn 1-2 câu → dùng **Memory**
- File chứa thông tin nhạy cảm chỉ cho 1 user → dùng scope **Cá nhân** (KHÔNG để scope Chia sẻ)

### TL;DR 3 bước
1. Vào menu **Vault** → bấm **Tải lên Kho Tri Thức**
2. Chọn **Phạm vi** (Cá nhân / Nhóm / Chia sẻ) + **Loại** (Tài liệu / Ngữ cảnh / Ghi chú / ...)
3. Drop file → bấm **Tải lên** → đợi **Lập chỉ mục**

### Step-by-step

**Bước 1.** Menu **Vault** → header có **5 nút action**:
- `+ Tạo mới` — tạo doc mới (gõ markdown trực tiếp)
- `Tải lên Kho Tri Thức` — bulk upload file
- `🔍 Tìm kiếm` — hybrid search (semantic + keyword)
- `Quét lại workspace` — sync folder workspace agent → vault
- `🔄 Refresh`

**Bước 2.** Bấm **Tải lên Kho Tri Thức**. Form gồm:

| Trường | Ý nghĩa |
|---|---|
| **Đích đến** | Radio 3 lựa chọn: `Chia sẻ` (toàn workspace) / `Agent` (chọn 1 agent) / `Nhóm` (chọn 1 team) |
| **Loại** | 7 loại: `Ngữ cảnh` (background, brand voice) / `Bộ nhớ` / `Ghi chú` / `Kỹ năng` / `Giai thoại` / `Media` / `Tài liệu` (default) |
| **Dropzone** | Kéo thả nhiều file. Chấp nhận: `.md`, `.txt`, `.json`, `.yaml`, `.csv`, `.pdf`, `.docx`, ... |

**Bước 3.** Sau khi chọn file, hệ thống hiện "File (N)" + danh sách → bấm **Tải lên**.

**Bước 4.** Hệ thống tự **lập chỉ mục** (chia chunk + sinh embedding). Quá trình này có thể mất 30 giây – vài phút tùy số file.

### Verify

Vào menu **Vault** → bấm **🔍 Tìm kiếm** → gõ câu hỏi liên quan tài liệu vừa upload (vd "chính sách hoàn trả?"). Phải có kết quả trả về với score > 0.5 và đường dẫn doc đúng.

Nếu trả 0 kết quả → kiểm tra trạng thái lập chỉ mục:
- Mở doc đó → tab **Đoạn trích (Chunks)** → nếu thấy 🟡 "Chưa nhúng" → đợi thêm hoặc bấm **Re-index**

### Pitfalls

- **Đừng để file >100MB / nhiều file 1 lúc** — quét bị cắt ("đạt giới hạn"), một số file không được index
- **Đặt path có tổ chức**: `policies/refund.md`, `products/specs/laptop.md` — khó tìm hơn nhiều khi tất cả nằm root
- **Loại đúng**: `Note` ≠ `Skill` ≠ `Context` — đặt sai → bộ lọc không tìm ra
- **Doc 1 chủ đề** thay vì doc 10K từ ôm đồm → embedding chính xác hơn
- **Xóa doc cũ/sai định kỳ** — agent "nhớ" thông tin lỗi thời (giá cũ, policy đã đổi) sẽ trả lời sai

---

## B. Memory — Bộ nhớ dài hạn

### Khi nào dùng
- Note **ngắn** (1-2 đoạn) muốn agent nhớ qua nhiều cuộc chat
- Fact riêng của 1 user (sở thích, lịch sử, ngữ cảnh cá nhân)
- Thông tin **chỉ thuộc 1 agent**, không cần share team

### Khi nào KHÔNG dùng
- Tài liệu nhiều trang → dùng **Vault**
- Thông tin cần wikilinks/cross-reference → dùng **Vault**

### TL;DR 3 bước
1. Vào menu **Memory** → bấm **+ Tạo**
2. Điền `Đường dẫn` (vd `notes/khach-hang-abc.md`) + nội dung markdown + chọn `Agent` + `Phạm vi`
3. **BẬT** "Tự động lập chỉ mục sau khi tạo" → Lưu

### Step-by-step

**Bước 1.** Menu **Memory** → tab **Tài liệu** (default).

**Bước 2.** Header có **4 nút**:
- `🔍 Tìm kiếm` — semantic search dialog
- `+ Tạo` — tạo doc mới
- `Lập chỉ mục tất cả` — re-index toàn bộ memory
- `🔄 Refresh`

**Bước 3.** Bấm **+ Tạo**. Form gồm:

| Trường | Required | Ghi chú |
|---|---|---|
| Đường dẫn | ✓ | File path style. Vd `notes/project-overview.md`, `customers/abc-corp.md` |
| Nội dung | ✓ | Markdown |
| Agent | ✓ | Chọn `<agent-name>` |
| Phạm vi | — | `Toàn cục` (cho mọi user của agent) / `Cá nhân` (chọn user/group cụ thể) |
| **Tự động lập chỉ mục** | — | **BẬT** — nếu không thì doc chưa search được |

**Bước 4.** Lưu → đợi 10-30 giây để embedding sinh xong.

### Verify

Bấm **🔍 Tìm kiếm** → gõ câu hỏi tự nhiên liên quan nội dung vừa ghi. Mỗi kết quả hiện chunk text + score "tương đồng" (0-1) + đường dẫn document.

Score >0.5 = tốt. <0.35 = có thể không match.

### Pitfalls

- ⚠️ **KHÔNG để PII/password ở scope Toàn cục** — số CMND, mật khẩu, token... chỉ để scope **Cá nhân**
- **Path có tổ chức**: `notes/strategy.md`, `customers/abc-corp.md`, `meetings/2026-Q2.md` — dễ filter, dễ xóa hàng loạt
- **Doc dài → chia nhỏ**: 1 doc nên dưới ~3000 ký tự cho 1 chủ đề. Doc 10K từ về mọi thứ → embedding kém
- **Re-index sau khi đổi embedding model** — bấm **Lập chỉ mục tất cả** ở header
- Agent **"quên"** (search không thấy) → hạ **Min Score** từ 0.35 → 0.25 trong Memory settings (xem [04 — Troubleshooting](04-troubleshooting.md))

---

## C. Knowledge Graph — Bản đồ quan hệ

### Khi nào dùng
- Cần trả lời câu hỏi **quan hệ**: "Khách nào mua laptop và làm ở TechCorp?", "Dự án X có ai phụ trách?"
- Có nhiều **thực thể** (người, công ty, sản phẩm, địa điểm, sự kiện) liên quan đến nhau
- Đã có nhiều memory document và muốn trích xuất quan hệ tự động

### Khi nào KHÔNG dùng
- Chỉ cần text search đơn giản → dùng **Vault** hoặc **Memory**
- Dữ liệu < 10 entities — KG overkill

### TL;DR 3 bước
1. Bật **auto-extract** trong Built-in Tools → Knowledge Graph Settings
2. Memory mới ghi sẽ tự sinh entity + relation
3. Vào menu **Knowledge Graph** → chọn agent → xem Bảng/Đồ thị + chạy **Gộp trùng** định kỳ

### Step-by-step

**Bước 1 — Bật auto-extract:**
- Vào menu **Built-in Tools** → tìm **Knowledge Graph Settings**
- Bật toggle **"Tự động trích xuất khi ghi bộ nhớ"**
- Đặt **Độ tin cậy tối thiểu** = `0.7` đến `0.8` (entity dưới ngưỡng bị loại — quá thấp = nhiễu, quá cao = bỏ sót)
- Chọn **Provider trích xuất** + **Model** có hỗ trợ structured JSON output (vd `gemini-2.5-pro`, `claude-sonnet-4`)

**Bước 2 — Trích xuất thủ công** (khi không muốn đợi auto):
- Menu **Knowledge Graph** → chọn agent → bấm **Trích xuất**
- Paste transcript/note/text vào textarea
- Chọn Provider + Model + Agent ID → **Trích xuất**

**Bước 3 — Xem KG:**
- Menu **Knowledge Graph** → chọn `<agent-name>`
- Stats: "Thực thể: N" + "Quan hệ: N"
- 2 tab: **Bảng** (dễ scan, filter) / **Đồ thị** (visualization node-edge, kéo zoom)

**Bước 4 — Gộp trùng** (định kỳ mỗi tuần):
- Bấm **Gộp trùng** → dialog hiện "{N} ứng viên" — cặp entity giống nhau + score
- **Gộp** (hợp nhất) hoặc **Bỏ qua** (vd 2 người trùng tên nhưng khác)

### Verify

Click 1 entity bất kỳ → xem **Quan hệ** + nút **Duyệt** (depth 1-2 bước). Đồ thị hiện đúng các quan hệ kỳ vọng (vd Lan → works_at → TechCorp).

### Pitfalls

- **Min confidence quá thấp (0.5)** → KG nhiễu, trả lời sai
- **Min confidence quá cao (0.95)** → bỏ sót thực thể quan trọng
- **Traverse 1-2 bước là đủ** — 3+ bước thường rộng quá, kết quả nhiễu
- **Gộp trùng định kỳ** — KG nhiều dễ trùng (vd "Lan", "Lan Nguyen", "Nguyen Lan" cùng người)
- ⚠️ **PII trong KG**: tên/email/phone bị lưu thành entity. Khi user yêu cầu xóa → phải xóa entity + relation thủ công (GDPR)

---

## D. File context — Tính cách agent

> **Lưu ý quan trọng:** sau khi sửa file context, **PHẢI tạo session mới** để thấy thay đổi. Session đang active đã cache system prompt.

### Khi nào dùng
- Đổi **cách xưng hô** ("anh/chị" thành "bạn", "tôi" thành "em")
- Đổi **vai trò** (trợ lý chung → chuyên viên BĐS / kế toán / CSKH)
- Đổi **phong cách trả lời** (ngắn gọn vs chi tiết, có emoji vs không)

### Khi nào KHÔNG dùng
- Cần đút **dữ liệu** (báo cáo, FAQ) → dùng **Vault** hoặc **Memory**
- Cần thêm **năng lực mới** (làm Excel, parse PDF) → tạo **Skill**

### TL;DR 3 bước
1. Vào **Agents** → chọn `<agent-name>` → tab **Tệp**
2. Sửa file (`SOUL.md` cho tính cách, `IDENTITY.md` cho vai trò) → **Lưu**
3. **Tạo session mới** (xóa cuộc chat cũ hoặc mở channel mới)

### 4 file context — vai trò

| File | Vai trò | Khi sửa |
|---|---|---|
| **`SOUL.md`** | Linh hồn, tính cách cốt lõi | Đổi phong cách, mood, ngôn ngữ chính |
| **`IDENTITY.md`** | Danh tính, vai trò chuyên môn | Đổi từ trợ lý chung sang chuyên viên cụ thể |
| **`USER.md`** | Thông tin về user (per-user, chỉ Predefined agent) | Lưu sở thích/ngữ cảnh user. Sửa **per user** |
| **`HEARTBEAT.md`** | Checklist agent đọc mỗi lần check-in | Khi cấu hình Heartbeat (chạy chủ động định kỳ) |

> Có thể tạo file custom thêm nếu cần. File `BOOTSTRAP.md` đặc biệt — xem [04 — Troubleshooting](04-troubleshooting.md#bootstrap-trap).

### Step-by-step

**Bước 1.** Menu **Agents** → click `<agent-name>` → tab **Tệp**.

**Bước 2.** Click file muốn sửa (vd `SOUL.md`) → editor markdown mở ra.

**Bước 3.** Sửa nội dung. Mẫu `SOUL.md` đơn giản:
```markdown
# Linh hồn

Tôi là <agent-name>, trợ lý chuyên về <lĩnh vực>.

Phong cách:
- Trả lời ngắn gọn, súc tích
- Xưng hô: "em" với người dùng "anh/chị"
- Không dùng emoji trừ khi user dùng trước
- Nếu không chắc, nói thẳng "em chưa rõ" thay vì đoán
```

**Bước 4.** Lưu. Có nút **System Prompt Preview** ngay trong tab Tệp — dùng để xem system prompt thực tế sau khi sửa.

**Bước 5. ⚠️ TẠO SESSION MỚI:**
- Web Chat: bấm **+ New Chat**
- Telegram/Zalo/...: chat từ user khác hoặc xóa session hiện tại trong menu Session

### Verify

Trong session mới, hỏi agent câu test phong cách (vd "Giới thiệu bản thân?"). Output phải khớp `SOUL.md`/`IDENTITY.md` mới.

Nếu vẫn ra phong cách cũ → 99% là chưa tạo session mới.

### Pitfalls

- ⚠️ **Không tạo session mới = không thấy thay đổi** — đây là pitfall lớn nhất
- **Predefined agent có nút "Regenerate Bootstrap Files"** — tái tạo SOUL/IDENTITY/USER khi đổi preset. Cẩn thận: ghi đè file đang có
- **`USER.md` trống + `BOOTSTRAP.md` tồn tại** → agent kẹt onboarding mode (chỉ dùng `write_file`). Xem [04 — Troubleshooting](04-troubleshooting.md)

---

## E. Skill — Cấp năng lực có sẵn

> Section này chỉ về **bật/gắn skill có sẵn** cho agent. **Tạo skill MỚI** → xem [03 — Tạo Skill](03-create-skill.md).

### Khi nào dùng
- Agent cần đọc/ghi file `.pdf`, `.docx`, `.xlsx`, `.pptx`
- Agent cần dùng skill custom đã upload trước đó

### TL;DR 3 bước (3 tầng — phải làm cả 3)

```
Tầng 1: Skill có trong "kho" (toàn cục)  → Menu Skills → toggle Active
Tầng 2: Cài deps nếu thiếu                → Panel Missing Dependencies → Install
Tầng 3: Phát skill cho agent              → Menu Agents → tab Agent → Skills → tick
```

Không làm cả 3 tầng → agent vẫn không gọi được skill.

### Step-by-step

**Tầng 1 — Bật skill toàn cục:**
1. Menu **Skills** → tab **Core (5)** (5 skill hệ thống) hoặc **Custom** (skill upload)
2. Toggle ở cột **Actions** → trạng thái `Active`

**Tầng 2 — Cài Missing Dependencies (nếu có):**
- Header trang Skills hiện panel **Missing Dependencies** với danh sách dep (vd `pip:lxml`, `npm:lodash`)
- Bấm **Install Dependencies** (cài hết) hoặc **Install** từng cái
- Sau khi cài xong → bấm **Rescan Deps** ở header

> ⚠️ Nếu cài fail hàng loạt → container thiếu Python/Node runtime. Vào menu **Packages** cài runtime trong container trước. Không phải lỗi do dep.

**Tầng 3 — Gắn skill cho agent:**
1. Menu **Agents** → click `<agent-name>` → tab **Agent**
2. Cuộn xuống phần **Skills** → tick các skill cần
3. Phần **Pinned Skills** (tối đa 10) — ghim skill **dùng thường xuyên** vào system prompt (agent thấy ngay, không cần `skill_search`)
4. **Lưu**

### Pinned Skills vs Skills List — chọn đúng

| | Skills List | Pinned Skills |
|---|---|---|
| Số lượng | Không giới hạn | Max **10** |
| Cách agent thấy | Phải gọi `skill_search` mới tìm ra | Nhúng thẳng vào system prompt — thấy ngay |
| Token | 0 thêm vào prompt | +vài trăm token/skill |
| Dùng khi | Skill ít gọi, kho nhiều skill | Skill **dùng mỗi cuộc chat** (vd format response, persona) |

**Khuyên:** ghim **3-5 skill cốt lõi** nhất, còn lại để Skills List.

### Verify

Mở chat với agent, prompt khớp description skill (vd "Đọc file `report.pdf` này giúp em" cho skill `pdf`). Agent phải tự nhận skill và xử lý.

Nếu agent không gọi → kiểm tra:
1. Skill toggle Active toàn cục? (Skills page)
2. Missing deps đã Install hết? (panel deps)
3. Skill đã tick trong Skills List của agent? (Agent → tab Agent)

### Pitfalls

- **Quên 1 trong 3 tầng** → agent không gọi được. Pitfall phổ biến nhất
- **Pinned quá nhiều skill** (>10 đầy) → token system prompt phình to, đắt tiền không cần thiết
- **Visibility Custom Skill = Riêng tư** → agent không thấy. Đổi sang **Nội bộ**
- **Skill mới upload chưa Rescan Deps** → trạng thái vẫn `Missing deps` dù đã Install. Bấm Rescan ở header

---

## Bảng tóm tắt cho người vội

| Tôi muốn... | Section | Ghi chú |
|---|---|---|
| Đẩy 1 file PDF cho agent đọc | §A Vault | Loại = `Tài liệu`, Phạm vi = `Chia sẻ` |
| Ghi note "khách hàng X thích trả lời ngắn" | §B Memory | Phạm vi = `Cá nhân` (per-user) |
| Hỏi câu quan hệ ("khách nào mua sản phẩm Y?") | §C Knowledge Graph | Bật auto-extract trước |
| Đổi cách xưng hô của agent | §D `SOUL.md` | Nhớ tạo session mới |
| Đổi vai trò agent (trợ lý → CSKH) | §D `IDENTITY.md` | Nhớ tạo session mới |
| Cấp cho agent dùng skill `pdf`, `docx` | §E | Làm cả 3 tầng (toàn cục + deps + agent grant) |
| Tạo skill **mới** | [03 — Tạo Skill](03-create-skill.md) | 2 path: viết tay ZIP hoặc nhờ agent tự tạo |

---

## Đào sâu

- **Train qua Claude Code** (CLI + API thay vì click) → [02 — Train via Claude](02-train-agent-via-claude.md)
- **Tạo Skill mới** → [03 — Tạo Skill](03-create-skill.md)
- **Lỗi thường gặp** → [04 — Troubleshooting](04-troubleshooting.md)
- **Glossary thuật ngữ** → [05 — Glossary](05-glossary.md)
