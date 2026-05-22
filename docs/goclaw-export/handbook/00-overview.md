# 00 — Tổng quan GoClaw Platform

## GoClaw là gì

GoClaw là nền tảng **multi-tenant AI Agent** — cho phép doanh nghiệp triển khai, quản lý và vận hành nhiều AI agent trên một hệ thống dùng chung, tách biệt theo tenant (workspace).

Mỗi tenant có không gian riêng: agent, channel, user, dữ liệu — hoàn toàn cách ly với tenant khác.

---

## LLM Providers hỗ trợ (20+)

GoClaw hỗ trợ kết nối với hơn 20 nhà cung cấp LLM:

| Nhóm | Provider |
|------|---------|
| Top-tier | Anthropic (Claude Opus/Sonnet/Haiku), OpenAI (GPT-4o, o1, o3), Google (Gemini 2.0/1.5) |
| Open-source hosted | DeepSeek, Groq (Llama/Mixtral), Mistral AI, Cohere, Together AI |
| Asian providers | Alibaba Qwen, Baidu ERNIE, Moonshot AI, Zhipu AI |
| Specialized | xAI Grok, Perplexity, Fireworks AI, Replicate |
| Self-hosted | Ollama (local), LM Studio, vLLM, llama.cpp |
| Compatible | bất kỳ provider có OpenAI-compatible API |

Mỗi agent chọn provider + model riêng. Có thể cấu hình **fallback chain**: nếu primary hết budget → chuyển sang secondary.

---

## 9 Kênh giao tiếp (Channels)

| # | Channel | Loại auth | Hỗ trợ |
|---|---------|----------|--------|
| 1 | Telegram | Bot Token | DM, Group, Channel broadcast, inline keyboard, file, voice |
| 2 | Discord | Bot Token + App ID | DM, Server channel, Thread, Slash commands |
| 3 | Slack | Bot Token + Signing Secret | DM, Channel, Thread, Block Kit |
| 4 | Zalo OA | OA Access Token | DM, Group OA message |
| 5 | Zalo Personal | Cookie-based | DM (rate limit thấp) |
| 6 | WhatsApp | Meta Business API | DM (không hỗ trợ group công khai) |
| 7 | Facebook Messenger | Page Access Token | DM với Page |
| 8 | Pancake | Pancake API Key | Multi-page, DM |
| 9 | Web Chat | Embed snippet JS | Session per visitor (cookie) |

**Lưu ý quan trọng**: 1 channel chỉ pair được với 1 agent tại 1 thời điểm. 1 agent có thể pair với nhiều channel.

---

## RBAC — Phân quyền 3 vai trò

| Role | Quyền |
|------|-------|
| **Admin** | Toàn quyền: tạo/xóa agent, channel, user; quản lý tenant settings; cấp quyền operator |
| **Operator** | Quản lý agent, skill, vault, cron; không tạo được user mới hoặc thay đổi billing |
| **User** | Chat với agent được assign; xem session của mình; không vào dashboard quản trị |

---

## 2 loại Agent

| Loại | Behavior | Dùng khi |
|------|----------|----------|
| **Open** | Mỗi user tạo 1 session riêng, private | Agent tư vấn 1:1, chatbot cá nhân hóa |
| **Predefined** | Tất cả user chung 1 session (shared context) | Teams, workflows tự động, agent có state chung |

> **Cảnh báo**: Agent phải là type **Predefined** mới có thể tham gia **Team**. Không thể đổi type sau khi tạo — phải tạo agent mới.

---

## 5 loại Knowledge Storage

| Loại | Mô tả | Ai ghi |
|------|-------|--------|
| **Vault** | Kho tài liệu tham chiếu (PDF, Word, MD...) — agent search khi cần | Admin/Operator |
| **Memory** | Bộ nhớ dài hạn dạng document — agent tự đọc/ghi | Agent + Admin |
| **Knowledge Graph** | Mạng entity-relation tự động extract từ Memory | Auto (từ Memory) |
| **File context** | SOUL.md / IDENTITY.md / USER.md — luôn đưa vào system prompt | Admin |
| **Skill** | "Sách hướng dẫn" cho agent — agent đọc và làm theo | Admin/Operator |

---

## Kiến trúc hệ thống

```
Tenant (workspace)
│
├── Users (Admin / Operator / User)
│
├── Agents
│   ├── Type: Open | Predefined
│   ├── Model: provider + model + fallback
│   ├── Knowledge: Vault, Memory, KG, File context, Skills
│   ├── Tools: Built-in Tools, MCP Servers
│   ├── Automation: Cron Jobs
│   └── Channels: Telegram, Discord, Slack, ...
│
├── Teams
│   ├── Members: Agent × role (Worker/Reviewer/Specialist)
│   └── Type: Sequential | Parallel | Router
│
└── Shared Resources
    ├── Shared Vault (scope Shared/Workspace)
    ├── Global Skills
    └── Global MCP Servers
```

**Luồng xử lý tin nhắn:**

```
User gửi message (Telegram/Discord/Slack/...)
  → Channel nhận webhook
  → Route đến Agent được pair
  → Agent load context (session + file context + memory + vault search)
  → Gọi LLM provider
  → Thực thi tool calls nếu có (built-in tools / MCP / skill)
  → Trả response về channel
  → Cập nhật session history
```

---

## Dashboard URL

Truy cập dashboard tại: `https://<your-vps>`

Thay `<your-vps>` bằng IP hoặc domain VPS của bạn.

Sidebar trái phân nhóm theo chức năng:

| Nhóm | Menu |
|------|------|
| CORE | Overview, Chat, Agents, Agent Link & Team |
| CONVERSATIONS | Sessions, Pending Messages, Contacts |
| CONNECTIVITY | Channels, Nodes |
| CAPABILITIES | Skills, Built-in Tools, MCP Servers, TTS, Cron, Hooks |
| DATA | Memory, Vault, Knowledge Graph |

---

## Phiên bản và Môi trường

- GoClaw chạy trên VPS tự host (Docker Compose hoặc Kubernetes)
- Update qua `docker pull` + `docker compose up -d`
- Logs: `docker compose logs -f goclaw-api`
- Config: file `.env` tại root của Docker Compose project

> Tài liệu này áp dụng cho GoClaw v3.10.0+. Một số tính năng (TTS v3.10.0, Super Team v2) có thể chưa có ở version cũ hơn.
