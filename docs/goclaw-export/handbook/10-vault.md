# 10 — Menu: Vault

Menu **Vault** là kho tài liệu tham chiếu — admin upload, agent search khi cần.

---

## 10.1 Vault Là Gì

**Vault** = kho lưu trữ tài liệu lớn, được index để agent tìm kiếm semantic khi cần.

**Khác Memory:**
- Vault: tài liệu "bên ngoài" do admin upload → agent đọc khi cần
- Memory: kiến thức agent tự học/ghi nhận → agent nhớ lâu dài

**Dùng Vault khi:**
- Upload tài liệu PDF, Word, Excel, PowerPoint
- Tài liệu > 100KB (Memory có giới hạn)
- Cần share tài liệu cho nhiều agent
- Tài liệu có cấu trúc phức tạp (bảng, hình)

---

## 10.2 7 DocTypes Hỗ Trợ

| DocType | Extension | Cách xử lý |
|---------|-----------|------------|
| **Markdown** | `.md` | Native — tốt nhất, giữ nguyên format |
| **PDF** | `.pdf` | Extract text (bỏ layout, hình ảnh) — scan-only PDF không support |
| **Word** | `.docx` | Extract text + heading structure |
| **Excel** | `.xlsx`, `.csv` | Convert table → text dạng Markdown table |
| **PowerPoint** | `.pptx` | Extract text từ mỗi slide |
| **TXT** | `.txt` | Plain text trực tiếp |
| **HTML** | `.html`, `.htm` | Strip HTML tags, giữ text content |

**Khuyến nghị format:**
- Markdown tốt nhất: cấu trúc rõ ràng, agent đọc tốt nhất
- PDF: chỉ dùng khi không có format khác — text extract có thể sai dấu, ngắt dòng lộn
- Excel: convert về Markdown table trước khi upload nếu có thể

**File không support:**
- Ảnh đơn thuần (JPG, PNG) — trừ khi dùng OCR tool riêng
- Video, Audio
- Binary executables
- File zip (phải extract trước)

---

## 10.3 3 Scopes

| Scope | Ai thấy | Dùng cho |
|-------|---------|----------|
| **Agent** | Chỉ agent được assign | Tài liệu riêng của agent đó |
| **Shared** | Tất cả agent trong tenant | SOP chung, brand guideline, kiến thức nền |
| **Workspace** | Tất cả user (kể cả user thường) | Tài liệu công khai nội bộ, FAQ |

**Chọn scope đúng:**
- Internal SOP → Shared (agent đọc, user không cần)
- FAQ khách hàng → Workspace (user cũng có thể query)
- Tài liệu bí mật của agent X → Agent scope, assign cho X

---

## 10.4 Upload Document

**Qua UI:**
1. Sidebar → **Vault**
2. Header → **Tải lên Kho Tri Thức**
3. **Đích đến**: chọn scope (Agent / Shared / Workspace)
   - Nếu scope = Agent: chọn agent cụ thể
4. **Loại**: Tài liệu (mặc định)
5. Kéo thả file vào dropzone hoặc click chọn file
6. Bấm **Tải lên**

**Giới hạn file:**
- PDF: tối đa 50MB
- Office (DOCX, XLSX, PPTX): tối đa 10MB
- TXT, MD, HTML: tối đa 5MB

**Processing time:**
- File nhỏ (< 1MB): 10–30 giây
- File lớn (PDF nhiều trang, XLSX lớn): 1–5 phút
- Trong thời gian xử lý: status = `processing` → không search được

**Upload nhiều file:**
- Chọn nhiều file cùng lúc (multi-select)
- GoClaw xử lý queue tuần tự

---

## 10.5 Wikilinks

**Wikilinks** = link nội bộ giữa documents trong Vault: `[[document-slug]]`

**Cách dùng trong Markdown:**
```markdown
Xem thêm quy trình tại [[sop-onboarding]] và [[brand-guidelines]].
```

**Agent traverse wikilink:**
- Khi agent đọc document có wikilink → tự động fetch document được link tới
- Tối đa 2 cấp traverse (tránh loop)
- Mở rộng context tự nhiên không cần user chỉ định

**Tạo slug:**
- Slug = tên file không có extension, lowercase, dấu cách → dấu gạch ngang
- VD: file `SOP Onboarding Khách Hàng.md` → slug: `sop-onboarding-khach-hang`

**Support wikilinks:** Markdown, TXT.
PDF, DOCX không support wikilink (text được extract dạng plain).

---

## 10.6 Workspace Sync

Tự động đồng bộ Vault với thư mục **Google Drive**.

**Cài đặt:**
1. Vault → **Sync** → **Kết nối Google Drive**
2. OAuth Google → cấp quyền
3. Chọn thư mục Drive để sync
4. Chọn scope Vault nhận (Shared / Agent)
5. Bật auto-sync

**Hành vi:**
- File mới trong Drive → tự động upload vào Vault
- File sửa trong Drive → Vault re-index version mới
- File xóa trong Drive → Vault soft-delete
- Sync interval: 15 phút (configurable)

**Giới hạn:**
- Chỉ sync file types GoClaw support (PDF, DOCX, XLSX, MD, TXT)
- Google Docs/Sheets/Slides: export sang DOCX/XLSX tự động trước khi index
- Cần OAuth token còn valid — rotate khi hết hạn

---

## 10.7 Vault Search

**Cách agent search:**
Agent gọi built-in tool `vault_search`:
```
vault_search(query="quy trình onboarding khách hàng", scope="shared", top_k=5)
→ trả về: [{title, content_chunk, score, doc_id}, ...]
```

**Filter options:**
- `scope`: Agent / Shared / Workspace / All
- `doc_type`: MD / PDF / DOCX / XLSX / all
- `agent_id`: chỉ lấy doc của agent đó
- `date_range`: lọc theo ngày upload
- `tags`: lọc theo tag

**Cải thiện kết quả search:**
- Viết `description` đầy đủ khi upload (mô tả nội dung tài liệu)
- Thêm tags liên quan
- Đặt title rõ ràng (VD: `SOP Onboarding Khách Hàng 2026` tốt hơn `doc1.pdf`)
- Dùng Markdown header (`##`, `###`) để chunk có ý nghĩa

---

## 10.8 Re-index

Re-embed document → cập nhật vector representation.

**Khi nào cần re-index:**
- Nội dung document thay đổi (edit)
- Embedding model thay đổi (upgrade)
- Kết quả search bị sai / không tìm ra

**Trigger thủ công:**
Vault → click document → **Re-index** → đợi processing.

**Auto re-index:**
- Khi upload file mới: tự động
- Khi edit document qua UI: tự động
- Khi sync từ Google Drive: tự động

---

## 10.9 Metadata Document

Mỗi Vault document có metadata:

| Field | Mô tả |
|-------|-------|
| Title | Tên hiển thị (khác với tên file) |
| Description | Mô tả nội dung — dùng khi search |
| Tags | Mảng tag: `["sop", "onboarding", "2026"]` |
| Author | Người upload |
| Created at | Thời điểm upload |
| Updated at | Thời điểm sửa gần nhất |
| Assigned agents | Danh sách agent được phép đọc |
| Scope | Agent / Shared / Workspace |
| DocType | MD / PDF / DOCX / ... |
| File size | Kích thước file gốc |
| Chunk count | Số chunks sau khi split |

---

## 10.10 Vault Trong Linh Cẩu / Media OS

Các tài liệu nên upload vào Vault scope **Shared** để tất cả agent trong Media OS đọc được:

| File | Mô tả | Cập nhật khi |
|------|-------|-------------|
| `PHASE_STATUS.md` | Phase hiện tại của dự án | Khi chuyển phase |
| `NEXT_STEPS.md` | Việc cần làm tiếp theo | Hàng ngày/tuần |
| `PLAYBOOK.md` | SOP vận hành toàn bộ | Khi quy trình thay đổi |
| `GOCLAW_RUNTIME_GUIDE.md` | Runtime map agents & channels | Khi thêm agent/channel |
| `XAUUSD_MEDIA_OS.md` | Context chiến lược XAUUSD | Khi chiến lược thay đổi |
| `PROJECT_STATUS.md` | SSOT tổng thể project | Mỗi khi có update lớn |

**Quy trình cập nhật Vault khi doc thay đổi:**
1. Sửa file trong git repo
2. Upload lên Vault (overwrite) hoặc sync qua Google Drive
3. Click Re-index để đảm bảo embedding mới nhất
4. Test: search bằng câu hỏi liên quan → verify kết quả đúng

---

## 10.11 Version History

GoClaw giữ N version cũ của mỗi Vault document (config theo tenant, mặc định 5 version).

**Xem version history:**
Vault → click document → tab **Lịch sử** → list versions với timestamp và author.

**Rollback:**
- Click version cũ → **Restore** → document trở về nội dung version đó
- Embedding được re-created tự động

**Diff:**
- Chọn 2 version → **So sánh** → xem diff dạng Git diff

---

## 10.12 Delete Document

**Soft delete (mặc định):**
- Document ẩn khỏi search results
- Vẫn còn trong DB 30 ngày → có thể restore
- Embedding bị deactivate (không dùng trong search)

**Hard delete:**
- Vault → document → **Xóa vĩnh viễn** → confirm
- Xóa khỏi DB + xóa embedding khỏi vector DB
- Không khôi phục được

**Restore sau soft delete:**
Vault → filter **Deleted** → tìm document → **Restore** → document hiển thị lại trong 30 ngày.
