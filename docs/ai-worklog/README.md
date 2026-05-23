# AI Worklog — Lịch sử làm việc với AI

Folder này lưu **lịch sử chat / quyết định / file đã đổi** khi làm việc với Cursor, Claude, ChatGPT, v.v. trên repo `lungmat-agent` (XAUUSD Media OS).

## Mục đích

- AI session mới đọc nhanh — không cần scroll chat cũ
- Founder giữ **timeline** quyết định sản phẩm & kỹ thuật
- Đồng bộ với `docs/PHASE_STATUS.md` (trạng thái phase) và `docs/architecture.md` (logic hệ thống)

## Cấu trúc

```text
docs/ai-worklog/
  README.md           ← file này
  INDEX.md            ← bảng session (mới nhất trên cùng)
  TEMPLATE.md         ← copy khi mở session mới
  sessions/
    YYYY-MM-DD-<topic>.md
```

## Quy ước ghi session

1. **Mỗi phiên làm việc đáng kể** → 1 file trong `sessions/` (hoặc append nếu cùng ngày + cùng chủ đề).
2. Đặt tên: `YYYY-MM-DD-<topic-ngắn>.md` (vd. `2026-05-15-media-os-phase7.md`).
3. Cuối session: cập nhật `INDEX.md` + 1 dòng trong `docs/PHASE_STATUS.md` nếu đổi phase.
4. Commit message tham chiếu: `docs(ai-worklog): session 2026-05-15 media OS`.

## AI đọc gì trước khi code?

| Thứ tự | File |
|--------|------|
| 1 | `docs/ai-worklog/INDEX.md` (session gần nhất) |
| 2 | `docs/XAUUSD_MEDIA_OS.md` (chiến lược sản phẩm) |
| 3 | `docs/architecture.md` (logic code) |
| 4 | `PROJECT_STATUS.md` |
| 5 | Session file cụ thể nếu đang tiếp tục task |

### Nhánh Alpha factory M0 (máy mới)

| Thứ tự | File |
|--------|------|
| 1 | [`docs/ALPHA_FACTORY_SETUP_GUIDE.md`](../ALPHA_FACTORY_SETUP_GUIDE.md) |
| 2 | `INDEX.md` → [`sessions/2026-05-22-alpha-factory-poc.md`](sessions/2026-05-22-alpha-factory-poc.md) |
| 3 | `PROJECT_STATUS.md` + `docs/architecture.md` |
| 4 | (tuỳ chọn) [`ALPHA_FACTORY_NOTION_IMPORT.md`](../ALPHA_FACTORY_NOTION_IMPORT.md) |

```text
git pull origin main
rồi đọc docs/ALPHA_FACTORY_SETUP_GUIDE.md, session docs/ai-worklog/sessions/2026-05-22-alpha-factory-poc.md, và docs/architecture.md trước khi sửa code.
Sau pull: cd services/alpha-factory → copy .env.example .env → điền key (không có trong repo).
```

## Công cụ AI trong dự án

| Tool | Vai trò (theo Media OS) |
|------|-------------------------|
| **Cursor** | IDE agent — implement trong repo |
| **Claude** | Content strategist, brief dài |
| **ChatGPT** | CTO / roadmap |
| **Cowork** | Workflow / integrations (nếu dùng) |

Ghi rõ **model/agent** trong mỗi session (vd. Cursor Auto, Claude Opus).

## Không lưu ở đây

- Secret (`.env`, token) — không bao giờ paste vào worklog
- Full chat raw export — chỉ **tóm tắt quyết định + diff logic**
- File `.cursor/projects/.../agent-transcripts` — hệ thống Cursor; worklog là bản **do team chủ động** viết
