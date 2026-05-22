# GoClaw Train Guide — Context cho Claude Code

Folder này chứa **bộ tài liệu đầy đủ** hướng dẫn train agent GoClaw qua Dashboard UI và qua Claude Code CLI.
Được chuyển đổi từ `../goclaw-train-guide.html` thành 8 file markdown AI-readable.

## Điều hướng nhanh

Khi user hỏi về GoClaw, đọc đúng file liên quan:

| Câu hỏi | File cần đọc |
|---------|-------------|
| Cách đút tài liệu/PDF/note vào Vault | `01-train-agent-dashboard.md` §A |
| Ghi memory cho agent | `01-train-agent-dashboard.md` §B |
| Đổi tính cách / SOUL.md / IDENTITY.md | `01-train-agent-dashboard.md` §D |
| Bật skill có sẵn (pdf, docx, xlsx) | `01-train-agent-dashboard.md` §E |
| Bulk import, tự động hóa, gọi API curl | `02-train-agent-via-claude.md` |
| Tạo CLAUDE.md workspace GoClaw | `02-train-agent-via-claude.md` §Bước 2 |
| Prompt mẫu copy-paste ready | `02-train-agent-via-claude.md` §Prompt 1-5 |
| Tạo skill mới (ZIP hoặc chat agent) | `03-create-skill.md` |
| Format SKILL.md chuẩn, YAML frontmatter | `03-create-skill.md` §SKILL.md format |
| Lỗi search không ra, agent quên | `04-troubleshooting.md` |
| Lỗi skill ZIP, API 401, cron sai giờ | `04-troubleshooting.md` |
| Phân biệt Vault / Memory / KG / File context / Skill | `05-glossary.md` |
| Đọc guide này bằng Claude Code / Claude.ai | `06-read-with-claude.md` |
| Quickstart 5 phút first-win | `00-quickstart.md` |

## Cách trả lời

- Trả lời **ngắn gọn** dựa trên nội dung file. Trích đoạn liên quan, cite file + section nếu có.
- Nếu câu hỏi dùng từ GoClaw chưa rõ → đọc `05-glossary.md` trước.
- Nếu có lỗi → scan `04-troubleshooting.md` tìm Symptom khớp → trả lời theo Diagnose + Fix.
- Mọi placeholder (`<agent-name>`, `<gateway-token>`, ...) user phải tự thay bằng giá trị thật — xem `README.md` §Placeholder.

## Cảnh báo quan trọng (luôn nhắc user nếu liên quan)

1. **Budget Monthly** phải đặt trước khi train nhiều — không đặt = bị chặn API cuối tháng.
2. **Sửa SOUL.md/IDENTITY.md** → **bắt buộc tạo session mới** — không thấy thay đổi nếu dùng session cũ.
3. **Skill: phải làm đủ 3 tầng** — bật toàn cục + cài deps + gắn vào agent. Thiếu 1 = không dùng được.
4. **Cron VN**: luôn set `Asia/Ho_Chi_Minh` — default UTC chạy lệch 7 tiếng.
5. **KHÔNG commit** `<gateway-token>` thật vào git public.

## Cấu trúc folder

```
guide/
├── CLAUDE.md                   ← file này (context cho Claude Code)
├── README.md                   ← tổng quan, placeholder, prerequisites
├── 00-quickstart.md            ← 5 phút first-win + decision tree
├── 01-train-agent-dashboard.md ← 5 cách train qua UI
├── 02-train-agent-via-claude.md← workflow Claude Code + 5 prompt mẫu
├── 03-create-skill.md          ← tạo skill (Path A: ZIP / Path B: chat)
├── 04-troubleshooting.md       ← 13 case lỗi thường gặp
├── 05-glossary.md              ← thuật ngữ + bảng so sánh 5 cách
└── 06-read-with-claude.md      ← cách dùng Claude đọc bộ tài liệu này
```
