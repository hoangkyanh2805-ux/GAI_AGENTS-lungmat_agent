# GoClaw Handbook — Context cho Claude Code

Folder này chứa **Cẩm nang Quản trị 11 Menu trong GoClaw** — tài liệu vận hành đầy đủ cho Admin/Operator.
Được chuyển đổi sang markdown AI-readable. Mỗi file = 1 Menu chính trong sidebar GoClaw.

## Điều hướng nhanh

Khi user hỏi về quản trị GoClaw, đọc đúng file liên quan:

| Câu hỏi | File cần đọc |
|---------|-------------|
| Tổng quan platform, kiến trúc, roles, channel list | `00-overview.md` |
| Tạo agent, cấu hình model, budget, SOUL.md | `01-agent.md` §1.1–1.4 |
| Tab Skills, Built-in Tools, MCP của agent | `01-agent.md` §1.5–1.7 |
| Cron của agent, Memory agent, Vault agent | `01-agent.md` §1.8–1.10 |
| Knowledge Graph của agent | `01-agent.md` §1.11 |
| Quản lý nhóm Telegram/Discord agent tham gia | `01-agent.md` §1.12 |
| Session: xem, reset, debug | `01-agent.md` §1.13 + `03-session.md` |
| Tạo Team, thêm member, kanban board task | `02-team-link.md` §2.1–2.5 |
| Agent Link: kết nối 2 agent, routing rules | `02-team-link.md` §2.9–2.11 |
| Super Team, multi-level hierarchy | `02-team-link.md` §2.8 |
| Session reset, delete, debug context | `03-session.md` |
| Context bar (token đã dùng / giới hạn) | `03-session.md` §3.2 |
| Tạo channel Telegram, Discord, Slack | `04-channel.md` §4.2–4.5 |
| Tạo channel Zalo OA, Zalo Personal, WhatsApp | `04-channel.md` §4.6–4.8 |
| Cấu hình DM policy, Group policy | `04-channel.md` §4.13–4.14 |
| Skill là gì, tạo skill, upload ZIP | `05-skill.md` |
| Gắn skill vào agent (3 tầng bắt buộc) | `05-skill.md` §5.7 |
| Built-in Tools: danh mục, bật/tắt, cấu hình | `06-builtin-tools.md` |
| Web Search Provider Chain (Exa/Tavily/Brave/DDG) | `06-builtin-tools.md` §6.5 |
| Cấu hình TTS, Knowledge Graph extraction LLM | `06-builtin-tools.md` §6.3–6.4 |
| MCP Server: tạo stdio / SSE / HTTP | `07-mcp.md` §7.2–7.5 |
| Grant MCP permissions cho agent | `07-mcp.md` §7.6 |
| Tạo cron job, cron expression, timezone | `08-cron.md` |
| Approval gate pattern (draft → admin approve) | `08-cron.md` §8.9 |
| Memory: tạo, scope, semantic search | `09-memory.md` |
| Phân biệt Memory vs Vault vs File context | `09-memory.md` §9.7 |
| Vault: upload, DocType, scope, wikilink | `10-vault.md` |
| Knowledge Graph: entity, relation, query | `11-knowledge-graph.md` |
| Quyết định dùng tool nào (flow diagram) | `12-flow-conclusion.md` |
| Nguyên tắc 3 Không / 3 Có | `12-flow-conclusion.md` |

## Cách trả lời

- Trả lời **ngắn gọn** dựa trên nội dung file. Trích đoạn liên quan, cite file + section nếu có.
- Nếu câu hỏi về thuật ngữ → xem `00-overview.md` trước.
- Nếu có lỗi liên quan → tham chiếu `docs/goclaw-export/guide/04-troubleshooting.md`.
- Mọi placeholder (`<your-vps>`, `<agent-name>`, `<bot-token>`) phải user tự thay bằng giá trị thật.

## Cảnh báo quan trọng (luôn nhắc user nếu liên quan)

1. **Agent type Open vs Predefined** ảnh hưởng toàn bộ behavior — Open: mỗi user 1 session riêng tư; Predefined: tất cả user chung 1 session (bắt buộc để tham gia Teams). Chọn sai type phải tạo lại agent.

2. **Channel credentials là per-tenant, không phải per-agent** — 1 Bot Token chỉ dùng cho 1 channel; nếu cần nhiều agent dùng cùng nền tảng thì tạo nhiều bot riêng. Credentials xóa 1 channel = mất credential đó hoàn toàn.

3. **Skill cần làm đủ 3 tầng bắt buộc**: (1) Bật toàn cục Admin → Settings → Skills; (2) Cài dependencies nếu cần; (3) Gắn vào agent cụ thể (Agent → Kỹ năng → toggle ON). **Thiếu 1 tầng = skill không hoạt động** dù không báo lỗi.

4. **Cron: luôn set timezone `Asia/Ho_Chi_Minh`** — default là UTC, lệch 7 tiếng so với VN. Cron `0 8 * * *` UTC = 15:00 VN, không phải 8:00 sáng.

5. **Knowledge Graph yêu cầu LLM hỗ trợ structured JSON output** (function calling / tool use) — không dùng được với model cũ không có function calling. Nếu KG không tự extract: kiểm tra model provider đang chọn cho KG extraction.

## Cấu trúc folder

```
handbook/
├── CLAUDE.md                   <- file này (context cho Claude Code)
├── 00-overview.md              <- platform overview, kiến trúc, roles
├── 01-agent.md                 <- Menu 1: Agent (18 section)
├── 02-team-link.md             <- Menu 2: Agent Link & Team (14 section)
├── 03-session.md               <- Menu 3: Session (12 section)
├── 04-channel.md               <- Menu 4: Channel (17 section)
├── 05-skill.md                 <- Menu 5: Skill (10 section)
├── 06-builtin-tools.md         <- Menu 6: Built-in Tools (7 section)
├── 07-mcp.md                   <- Menu 7: MCP Servers (10 section)
├── 08-cron.md                  <- Menu 8: Cron / Tác vụ định kỳ (10 section)
├── 09-memory.md                <- Menu 9: Memory (9 section)
├── 10-vault.md                 <- Menu 10: Vault (12 section)
├── 11-knowledge-graph.md       <- Menu 11: Knowledge Graph (8 section)
└── 12-flow-conclusion.md       <- Flow diagram + quick reference
```
