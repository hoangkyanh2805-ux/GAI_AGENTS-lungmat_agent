# Alpha Factory — Import lên Notion

> Dùng khi muốn đọc/runbook trên **Notion** thay vì chỉ trong Cursor/Git.

## Cách 1 — Import Markdown (nhanh nhất)

1. Notion → **Import** → **Markdown**
2. Chọn file (theo thứ tự ưu tiên):

| File | Nội dung |
|------|----------|
| `docs/ALPHA_FACTORY_SETUP_GUIDE.md` | **Runbook chính** — từng bước E2E |
| `docs/ai-worklog/sessions/2026-05-22-alpha-factory-poc.md` | Tóm tắt POC + checklist |
| `docs/ZERNIO_N8N_HTTP_PUBLISH.md` | Body Zernio đúng |
| `docs/N8N_ALPHA_KEYS_SETUP.md` | Biến n8n + Telegram |

3. Gộp vào một page **Alpha Factory** trong workspace Notion của bạn.

## Cách 2 — Link từ Notion về repo (không import)

Trong Notion page, thêm block **Link** hoặc path (mở bằng Cursor trên máy Founder):

```text
G:\Other computers\My Computer\Project\GAI_AGENTS-lungmat_agent\docs\ALPHA_FACTORY_SETUP_GUIDE.md
```

## Cách 3 — n8n (nếu “nt” = n8n)

Không cần Notion:

1. n8n → **Import from file** → `workflows/alpha-m0.webhook-intake.json`
2. Active workflow → copy Production Webhook URL vào `services/alpha-factory/.env`

## Trạng thái lưu trong dự án

| Vị trí | Trạng thái |
|--------|------------|
| **Ổ đĩa** (folder repo) | Có — xem bảng dưới |
| **Git commit** | Chưa — các path `??` trong `git status` (cần `git add` + commit nếu muốn push GitHub) |

### File Alpha factory trên disk

```
docs/ALPHA_FACTORY_SETUP_GUIDE.md
docs/ALPHA_FACTORY_NOTION_IMPORT.md          ← file này
docs/ai-worklog/sessions/2026-05-22-alpha-factory-poc.md
services/alpha-factory/main.py
services/alpha-factory/fetcher.py
services/alpha-factory/packer.py
services/alpha-factory/validator.py
services/alpha-factory/requirements.txt
services/alpha-factory/.env.example
services/alpha-factory/prompts/alpha_writer.md
services/alpha-factory/README.md
workflows/alpha-m0.webhook-intake.json
```

**Lưu ý:** `services/alpha-factory/.env` có key thật — **không** import/commit lên Notion/Git.
