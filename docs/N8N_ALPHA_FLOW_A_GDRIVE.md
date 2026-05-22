# Flow A — Alpha n8n (GDrive trên canvas)

> **Khi nào:** Workflow đã import trên n8n — nhánh **ảnh từ Google Drive** → Router → Telegram / X → Wait → log.  
> **Mục tiêu A:** Chạy **1 vòng Manual** ổn: lấy ảnh ready từ Drive → Founder thấy preview → có `mediaId` hoặc file chọn được → không lỗi credential.  
> **Sau khi pass A:** chuyển [`N8N_ALPHA_FLOW_B_CLAUDE_ZERNIO.md`](./N8N_ALPHA_FLOW_B_CLAUDE_ZERNIO.md).

**SSOT config:** [`config/n8n/brands.json`](../config/n8n/brands.json) · **Ảnh / Drive:** [`A5_MEDIA_FLOWS_RUNBOOK.md`](./A5_MEDIA_FLOWS_RUNBOOK.md)

---

## 1. Sơ đồ (canvas hiện tại)

```text
[Manual Trigger]     [Cron — TẮT đến khi pass A]
        │
        ▼
  InitConfig ──► GetFiles (Code) ──► Check GDrive ──► ParseFiles (Code)
        │
        ▼
  Router (X vs Threads / Telegram)
    ├─► Telegram (Action)
    └─► X (Post)          ← M0: TẮT hoặc bypass nếu chỉ test Drive+TG
        │
        ▼
  Wait ──► Parse Account ──► Check Status ──► Record Post ──► [Sheets — TẮT]
```

**Flow A không bắt buộc Claude.** Nội dung chữ có thể nhập tay / copy brief tạm trong Code node — Writer nằm ở Flow B.

---

## 2. Chuẩn bị (trước khi Execute)

### 2.1 Google Drive

| # | Việc | Done |
|---|------|------|
| A1 | Folder pilot: `1IW_UN4hnezRWvF3RSNMmaUXcf9pdzwbv` — [link Drive](https://drive.google.com/drive/folders/1IW_UN4hnezRWvF3RSNMmaUXcf9pdzwbv) | [ ] |
| A2 | Có ≥1 file JPG trong `01_ready_jpg/full/` (đã chạy script chuẩn hóa hoặc kéo tay) | [ ] |
| A3 | File **share** *Anyone with the link* → Viewer (nếu node tải bytes qua URL) | [ ] |
| A4 | OAuth Google trong n8n: account có quyền **Editor/Viewer** folder trên | [ ] |

### 2.2 n8n credentials & env

| # | Việc | Done |
|---|------|------|
| A5 | Node **Check GDrive** — gắn credential, không còn viền đỏ | [ ] |
| A6 | **InitConfig:** `driveFolderId`, `readySubfolder` khớp `brands.json` | [ ] |
| A7 | `N8N_TELEGRAM_ADMIN_CHAT_ID` = chat Founder (số, không @username) | [ ] |
| A8 | Telegram bot credential trên node **Telegram** | [ ] |
| A9 | **Cron** và **Google Sheets** vẫn **disabled** | [ ] |

### 2.3 Zernio (ảnh — thủ công M0)

| # | Việc | Done |
|---|------|------|
| A10 | Upload 1 ảnh test lên **Zernio → Media** → copy `mediaId` (ghi Notepad) | [ ] |
| A11 | **Không** bật node **X (Post)** API trực tiếp nếu pilot đăng qua Zernio (tránh trùng Threads) | [ ] |

---

## 3. Cấu hình từng node (gợi ý)

### InitConfig

```json
{
  "brand": "alpha",
  "drive_folder_id": "1IW_UN4hnezRWvF3RSNMmaUXcf9pdzwbv",
  "drive_ready_path": "01_ready_jpg/full",
  "zernio_account_ids": [
    "6a0c6dbd5e333c05299f1d12",
    "6a0c28345e333c05299b981a"
  ]
}
```

### Check GDrive

- Operation: List files / Search in folder  
- Filter: mime `image/jpeg`, sort `modifiedTime desc`, limit `1` (test) hoặc `5`  
- Output: `id`, `name`, `webViewLink`, `modifiedTime`

### ParseFiles (Code)

- Map output → `{ file_id, file_name, drive_link }`  
- Gắn `run_id` nếu InitConfig chưa tạo: `alpha-YYYY-MM-DD-hhmm-xxxx`

### Router

- **Nhánh test 1:** chỉ **Telegram** — gửi preview ảnh + tên file + hướng dẫn `OK đăng` + dán `mediaId`  
- Nhánh **X:** disabled hoặc disconnect đến Flow B

### Wait

- M0: **Wait for webhook** hoặc **Telegram Send and Wait**  
- Founder reply mẫu: `OK đăng mediaId: abc123`

### Record Post

- Ghi `status`, `file_id`, `media_id`, `run_id` (object nhỏ — chưa cần full schema)

---

## 4. Test Manual — checklist từng bước

| Bước | Hành động | Pass? |
|------|-----------|-------|
| T1 | Save workflow | [ ] |
| T2 | **Execute workflow** từ **Manual Trigger** | [ ] |
| T3 | **InitConfig** → output có `brand`, folder id | [ ] |
| T4 | **Check GDrive** → ≥1 file, không 401/403 | [ ] |
| T5 | **ParseFiles** → `file_id` + `file_name` hợp lệ | [ ] |
| T6 | **Telegram** → Founder nhận tin (ảnh/link + file name) | [ ] |
| T7 | Founder reply `OK đăng` + `mediaId` Zernio đã upload | [ ] |
| T8 | **Wait** resume → **Check Status** = approved | [ ] |
| T9 | **Record Post** có `media_id` + `run_id` | [ ] |
| T10 | (Tuỳ chọn) Bật **Sheets** → 1 dòng log | [ ] |

**Lỗi thường gặp**

| Triệu chứng | Sửa |
|-------------|-----|
| GDrive 403 | Share folder cho OAuth email; đúng folder ID |
| GDrive 0 files | Chưa có file trong `01_ready_jpg/full/` |
| Telegram không gửi | Sai `chat_id`; bot chưa /start với Founder |
| Wait không resume | Dùng URL resume webhook n8n hoặc đổi Send and Wait |

---

## 5. Done criteria — Flow A

Coi **Flow A pass** khi **tất cả** đúng:

- [ ] Manual Trigger chạy xanh **đến Record Post** (Sheets có thể chưa bật)
- [ ] Drive trả đúng ảnh ready mới nhất (hoặc file chỉ định)
- [ ] Telegram preview + duyệt `OK đăng` hoạt động
- [ ] `mediaId` Zernio ghi được trong output run (tay M0)
- [ ] **Không** đăng trùng qua X API + Zernio cùng lúc
- [ ] Export workflow: `workflows/alpha-m0-gdrive.live.json` (local, không commit secret)

**Chưa cần:** Claude Writer, `pack.json` schema, cron 08:00.

---

## 6. Sang Flow B

1. Giữ workflow Flow A **active** hoặc **rename** `Alpha Media — Flow A GDrive`.
2. Import thêm [`workflows/alpha-m0.template.json`](../workflows/alpha-m0.template.json) → workflow mới **Flow B**.
3. Nối (M0 thủ công): sau duyệt Flow B, Founder dùng **cùng `mediaId`** đã lấy ở Flow A / Zernio Media.

Chi tiết: [`N8N_ALPHA_FLOW_B_CLAUDE_ZERNIO.md`](./N8N_ALPHA_FLOW_B_CLAUDE_ZERNIO.md).

---

## 7. Liên kết

| Doc | |
|-----|--|
| SSOT pipeline | [`MEDIA_PIPELINE_N8N_M0.md`](./MEDIA_PIPELINE_N8N_M0.md) |
| Flow B | [`N8N_ALPHA_FLOW_B_CLAUDE_ZERNIO.md`](./N8N_ALPHA_FLOW_B_CLAUDE_ZERNIO.md) |
| Zernio account IDs | [`PILOT_ALPHA_AUDIT_STATUS.md`](./PILOT_ALPHA_AUDIT_STATUS.md) |
