# Bộ tài liệu Train Agent GoClaw

Hướng dẫn tự **train** (đút kiến thức + cấp năng lực) cho agent GoClaw của bạn — qua **Dashboard** UI hoặc qua **Claude Code** CLI.

> ⚠️ Tài liệu generic. Mọi nơi viết `<agent-name>`, `<tenant-slug>`, `<gateway-token>`, ... bạn thay bằng giá trị thật của mình.

---

## Tôi muốn... đọc file nào?

| Tình huống | File |
|---|---|
| **Lần đầu mở dashboard, muốn quick win 5 phút** | [00 — Quickstart](00-quickstart.md) |
| **Train hằng ngày qua dashboard** (đút PDF, ghi note, đổi tính cách agent) | [01 — Train Dashboard](01-train-agent-dashboard.md) |
| **Train qua Claude Code** (bulk import, tự động hóa, gọi API) | [02 — Train via Claude](02-train-agent-via-claude.md) |
| **Tạo skill mới** cho agent (cấp năng lực mới — làm Excel, parse PDF, gọi API) | [03 — Tạo Skill](03-create-skill.md) |
| **Đang gặp lỗi** (search không ra, agent quên, upload fail, ...) | [04 — Troubleshooting](04-troubleshooting.md) |
| **Không hiểu thuật ngữ** (Memory vs Vault vs KG vs File context vs Skill?) | [05 — Glossary](05-glossary.md) |
| **Muốn dùng Claude (Code/Desktop/web) đọc bộ tài liệu này** | [06 — Đọc bằng Claude](06-read-with-claude.md) |

## Đề xuất thứ tự đọc

**Lần đầu tiếp xúc Goclaw** (ước chừng 30-45 phút):
1. [00 — Quickstart](00-quickstart.md) (5 phút) — first-win + decision tree
2. [05 — Glossary](05-glossary.md) (5 phút) — phân biệt 5 cách "đút kiến thức"
3. [01 — Train Dashboard](01-train-agent-dashboard.md) (15-20 phút) — xương sống thao tác qua UI
4. [03 — Tạo Skill](03-create-skill.md) (10 phút) — khi cần năng lực mới

**Khi cần dùng Claude Code:**
- [02 — Train via Claude](02-train-agent-via-claude.md) (15 phút setup + prompt mẫu)

**Khi gặp lỗi:**
- Scan [04 — Troubleshooting](04-troubleshooting.md) tìm symptom giống mình

---

## Placeholder chuẩn — thay khi đọc/copy

Mọi file dùng các placeholder sau. Ghi giá trị thật của bạn vào đây 1 lần để tham chiếu:

```
<agent-name>     = ___________________   (tên hiển thị, vd "Alpha")
<agent-key>      = ___________________   (slug agent, vd "alpha")
<agent-id>       = ___________________   (UUID, query DB)
<tenant-slug>    = ___________________   (vd "example.com")
<your-vps>       = ___________________   (host hoặc IP)
<ssh-alias>      = ___________________   (vd "myvps")
<gateway-token>  = ___________________   (từ .env, biến GOCLAW_GATEWAY_TOKEN)
<user-id>        = ___________________   (user ID dùng API, lấy từ contact)
<channel-slug>   = ___________________   (slug channel, vd "alpha-bot")
```

**Master tenant ID** (cố định, không phải placeholder):
```
0193a5b0-7000-7000-8000-000000000001
```
Master tenant không cần header `X-GoClaw-Tenant-Id`.

---

## Prerequisites

Trước khi đọc tài liệu này, đảm bảo:

### Account & Access
- [ ] Có **account dashboard GoClaw** với role admin/operator (đăng nhập được vào `https://<your-vps>`)
- [ ] **Agent đã được tạo** (status `active` trong menu Agents) — chưa có thì xem mục "Tạo agent" của file `01`
- [ ] **Agent đã có Provider + Model** cấu hình (vd Gemini/Claude/OpenAI) — xem menu Agents → Mô hình & Ngân sách
- [ ] **Budget Monthly đã đặt** cho agent (đừng để vô hạn)

### Cho thao tác qua Dashboard (file 00, 01, 03)
- [ ] Browser hiện đại (Chrome/Edge/Firefox bản mới)
- [ ] (Tùy chọn) Channel đã pair (Telegram/Slack/Zalo/...) để test chat — không bắt buộc, có thể test qua Web Chat

### Cho thao tác qua Claude Code (file 02)
- [ ] **Claude Code** đã cài trên máy local (https://claude.com/claude-code)
- [ ] **SSH key** vào VPS chứa container GoClaw (test: `ssh <ssh-alias>` vào được không hỏi password)
- [ ] **`.env` trên VPS** có biến `GOCLAW_GATEWAY_TOKEN` (test: `ssh <ssh-alias> "grep GOCLAW_GATEWAY_TOKEN /opt/goclaw/<tenant-slug>/.env"`)
- [ ] **`CLAUDE.md`** đã setup theo template ở [02 — Train via Claude §Bước 2](02-train-agent-via-claude.md#bước-2-tạo-claudemd-chứa-context)

### Cho tạo Skill (file 03)
- [ ] Hiểu cơ bản **Markdown** + **YAML** (cho Path A — tự viết)
- [ ] Skill `skill-creator` đã được bật + gắn vào agent (cho Path B — chat agent)
- [ ] Built-in Tools đã bật: `skill_search`, `use_skill`, `publish_skill`, `write_file`, `exec`

---

## Cảnh báo an toàn quan trọng

⚠️ **Đọc trước khi train production:**

1. **Đặt Budget Monthly** trước khi train nhiều — không thì vượt budget bất ngờ, agent bị chặn API
2. **KHÔNG để PII/password ở Memory scope Toàn cục** — chỉ Cá nhân
3. **KHÔNG để Visibility skill = Công khai** trừ khi đã kiểm định kỹ — default Nội bộ an toàn
4. **KHÔNG commit `<gateway-token>` thật** vào git public
5. **Tạo session mới sau khi sửa file context** (SOUL.md/IDENTITY.md/USER.md) — nếu không thay đổi không có hiệu lực
6. **Cron job VN** luôn set múi giờ `Asia/Ho_Chi_Minh` — default UTC sẽ chạy lệch 7 tiếng
7. **Per-group skill filter** — nếu agent chạy trong group production, set Bộ lọc skill ở tab Nhóm để cấm skill nguy hiểm (vd `skill-creator` chỉ admin DM riêng)

---

## Cấu trúc bộ tài liệu

```
customer-handover/
├── README.md                    ← bạn đang đọc
├── 00-quickstart.md             ← 5 phút first-win + decision tree
├── 01-train-agent-dashboard.md  ← 5 cách train qua UI (Vault/Memory/KG/File context/Skill)
├── 02-train-agent-via-claude.md ← Workflow Claude Code + 5 prompt mẫu copy-paste
├── 03-create-skill.md           ← Tạo skill mới (Path A: ZIP / Path B: chat agent)
├── 04-troubleshooting.md        ← 13 case lỗi: Symptom → Diagnose → Fix → Prevent
├── 05-glossary.md               ← Lookup thuật ngữ + bảng so sánh 5 cách "đút kiến thức"
└── 06-read-with-claude.md       ← Cách dùng Claude Code/Desktop/web đọc bộ này
```

---

## Hỗ trợ

Nếu có câu hỏi không tìm thấy answer trong bộ tài liệu, xem mục "**Khi nào cần liên hệ support?**" cuối file [04 — Troubleshooting](04-troubleshooting.md#khi-nào-cần-liên-hệ-support) để biết cách gom thông tin gửi support nhanh nhất.
