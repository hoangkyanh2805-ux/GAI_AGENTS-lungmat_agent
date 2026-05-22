# 04 — Menu: Channel

Menu **Channels** quản lý kết nối giữa agent và các nền tảng nhắn tin.

---

## 4.1 Channel Là Gì

**Channel** = cầu nối giữa agent GoClaw và nền tảng nhắn tin bên ngoài.

**9 loại channel được hỗ trợ:**
Telegram, Discord, Slack, Zalo OA, Zalo Personal, WhatsApp, Facebook Messenger, Pancake, Web Chat.

**Quy tắc pair:**
- 1 agent có thể pair với **nhiều** channel
- 1 channel chỉ pair được với **1 agent** tại 1 thời điểm
- Muốn 2 agent cùng có mặt trên 1 nền tảng → tạo 2 bot riêng, 2 channel riêng

**Luồng tin nhắn:**
```
User → Nền tảng (Telegram/Discord/...) → Webhook GoClaw → Channel → Agent → LLM → Response
```

---

## 4.2 Tạo Channel Mới

Sidebar → **Channels** → **+ Tạo Channel**.

**Quy trình chung:**
1. Chọn loại channel (Telegram / Discord / Slack / ...)
2. Điền credentials theo loại (xem §4.3–4.11)
3. Bấm **Test kết nối** → GoClaw verify credentials
4. Bấm **Lưu** → channel được tạo
5. Pair với agent: Channel → **Pair Agent** → chọn agent

---

## 4.3 Telegram Channel

**Chuẩn bị:**
1. Chat với `@BotFather` trên Telegram
2. Gửi `/newbot` → đặt tên và username → nhận **Bot Token**

**Điền vào GoClaw:**
- Bot Token: `123456789:AAHdqTcvCH1vGWJxfSeofSs0K3YjlmEKYrg` (ví dụ)
- Webhook URL: GoClaw **tự động set** — không cần điền thủ công

**Hỗ trợ:**
- DM (Direct Message) với bot
- Group: thêm bot vào group, reply khi được tag hoặc theo keyword trigger
- Channel (broadcast): bot post, không nhận reply
- Media: photo, document, voice, video, sticker
- Inline keyboard (button) — qua messaging built-in tool

**Lưu ý:**
- Bot phải được add vào group với quyền **gửi tin nhắn** và **đọc tin nhắn**
- Nếu group chế độ **privacy mode** bật → bot chỉ đọc message khi được tag
- Để tắt privacy mode: BotFather → `/mybots` → bot → Bot Settings → Group Privacy → Turn off

---

## 4.4 Discord Channel

**Chuẩn bị:**
1. Vào `https://discord.com/developers/applications` → New Application
2. Tạo Bot trong application → copy **Bot Token**
3. Bật: Message Content Intent, Server Members Intent
4. Invite bot vào server với quyền: Send Messages, Read Message History, Use Slash Commands

**Điền vào GoClaw:**
- Bot Token
- Application ID (General Information → Application ID)

**Hỗ trợ:**
- DM (Direct Message)
- Server text channel
- Thread
- Slash commands (GoClaw tự động register)
- Embeds và rich messages

---

## 4.5 Slack Channel

**Chuẩn bị:**
1. Vào `https://api.slack.com/apps` → Create New App → From Scratch
2. OAuth & Permissions → thêm scopes: `chat:write`, `im:read`, `im:write`, `channels:history`
3. Install to Workspace → copy **Bot Token** (xBot OAuth Token)
4. Basic Information → **Signing Secret**

**Điền vào GoClaw:**
- Bot Token: `xoxb-...`
- Signing Secret

**Hỗ trợ:**
- DM (App Message)
- Public và private channel (sau khi invite bot vào channel)
- Thread replies
- Block Kit formatting (interactive UI elements)

---

## 4.6 Zalo OA Channel

**Chuẩn bị:**
1. Vào `https://developers.zalo.me/` → tạo ứng dụng Zalo
2. Kết nối Official Account (OA) với ứng dụng
3. Lấy **OA Access Token** từ Zalo Developer Console
4. Cấu hình Webhook URL tại Zalo Developer → nhập URL GoClaw cung cấp

**Điền vào GoClaw:**
- OA Access Token
- OA ID

**Hỗ trợ:**
- DM với followers của OA
- Group OA message (broadcast tới nhóm)
- Template messages (tin nhắn có cấu trúc)

**Hạn chế:**
- Chỉ nhắn được với user đã follow OA
- Zalo kiểm duyệt nội dung OA — không dùng cho nội dung không phù hợp

---

## 4.7 Zalo Personal Channel

**Auth method**: Cookie-based (không phải official API).

**Chuẩn bị:**
1. GoClaw cung cấp hướng dẫn lấy cookie Zalo
2. Đăng nhập Zalo Web → lấy cookie session

**Điền vào GoClaw:**
- Zalo cookie (expires theo session đăng nhập)

**Hạn chế quan trọng:**
- Rate limit thấp hơn nhiều so với OA
- Cookie expire → channel bị disconnect → cần gia hạn thủ công
- Zalo có thể block account nếu phát hiện bot activity
- Không được dùng cho mass messaging

---

## 4.8 WhatsApp Channel

**Chuẩn bị (Meta Business API):**
1. Meta Business Account + WhatsApp Business Account
2. Phone Number đã verify với WhatsApp Business
3. Vào `https://developers.facebook.com/` → App → WhatsApp → API Setup
4. Lấy: **Phone Number ID**, **Access Token**

**Điền vào GoClaw:**
- Phone Number ID
- Access Token (permanent token từ System User)
- Webhook Verify Token (bạn tự đặt — GoClaw dùng để verify webhook)

**Hỗ trợ:**
- DM 1:1 với user (user phải nhắn trước hoặc opt-in)
- Template messages (pre-approved bởi Meta)

**Không hỗ trợ:**
- Group WhatsApp (API limitation của Meta)
- Mass messaging mà không có template approved

---

## 4.9 Facebook Messenger

**Chuẩn bị:**
1. Facebook Page (không phải personal profile)
2. Meta Developer App → Messenger product → setup
3. Page Access Token (permanent)
4. App Secret

**Điền vào GoClaw:**
- Page Access Token
- App Secret
- Verify Token (bạn tự đặt)

**Hỗ trợ:**
- DM với user nhắn vào Page
- Quick replies, persistent menu
- Handover Protocol (chuyển sang live chat agent)

---

## 4.10 Pancake Channel

**Chuẩn bị:**
- Tài khoản Pancake (pancake.vn)
- API Key từ Pancake Dashboard → Settings → API

**Điền vào GoClaw:**
- API Key
- Page ID (nếu multi-page)

**Hỗ trợ:**
- Nhắn tin với khách hàng qua Pancake inbox
- Multi-page: 1 channel GoClaw có thể handle nhiều page Facebook qua Pancake

---

## 4.11 Web Chat

**Web Chat** = chat widget nhúng vào website.

**Cấu hình:**
- Widget title, subtitle
- Primary color (hex: `#1a73e8`)
- Logo URL
- Placeholder text
- Welcome message (hiện khi user mở lần đầu)

**Lấy embed code:**
Channel → Web Chat → tab **Nhúng** → copy snippet:

```html
<script>
  window.GoclawConfig = {
    token: "<channel-token>",
    position: "bottom-right"
  };
</script>
<script src="https://<your-vps>/widget/chat.js" async></script>
```

**Session:**
- Mỗi visitor = 1 session (dựa trên cookie trình duyệt)
- Clear cookie = new session
- Visitor không đăng nhập = anonymous user

---

## 4.12 Channel Credentials Management

**Bảo mật:**
- Credentials (token, secret, cookie) được **encrypted at rest** trong DB
- Admin không thể xem giá trị thật của token sau khi nhập — chỉ thấy `*****` (masked)
- Truyền qua HTTPS với TLS

**Rotate token:**
- Channel → **Chỉnh sửa** → nhập token mới → Lưu
- Không cần xóa channel và tạo lại
- GoClaw tự động update webhook với token mới

**Test connection:**
- Channel → nút **Kiểm tra kết nối** → GoClaw gọi thử API của platform
- Kết quả: ✓ Success hoặc ✗ Error với message chi tiết

---

## 4.13 DM Policy (1:1)

Cài đặt cho Direct Message — user nhắn riêng với bot.

**Auto-reply:**
- `Luôn luôn`: bot reply mọi DM
- `Chỉ khi tag`: bot chỉ reply khi user mention `@botname`
- `Tắt`: bot không reply DM (chỉ hoạt động trong group)

**Welcome message:**
- Gửi khi user DM lần đầu tiên
- Hỗ trợ variable: `{{user_name}}`, `{{agent_name}}`
- Ví dụ: `Xin chào {{user_name}}! Tôi là {{agent_name}}, tôi có thể giúp gì bạn?`

**Rate limit per user:**
- Max messages per minute: default 10
- Max messages per hour: default 100
- Quá giới hạn: bot bỏ qua hoặc reply "vui lòng chờ"

---

## 4.14 Group Policy

Cài đặt khi agent hoạt động trong group (Telegram group, Discord server channel).

**Reply trigger:**
- `Tag bot`: chỉ reply khi được `@mention`
- `Keyword`: reply khi message chứa keyword cấu hình
- `Tất cả message`: reply mọi message trong group (tốn token, dùng cẩn thận)

**Thread reply:**
- `Thread`: reply trong thread của message kích hoạt (gọn gàng, không spam main chat)
- `Flat`: reply trực tiếp vào chat chính

**Per-group skill filter:**
- Xem Agent → Tab Nhóm (§1.12)
- Block skill nguy hiểm chỉ trong group cụ thể

---

## 4.15 Channel Diagnostics

**Webhook delivery status:**
Channel → tab **Chẩn đoán** → xem log webhook gần nhất.

| Status | Ý nghĩa |
|--------|---------|
| `200 OK` | Webhook nhận thành công |
| `4xx` | Lỗi credentials hoặc config phía platform |
| `5xx` | Lỗi GoClaw server |
| `timeout` | GoClaw không nhận được trong 10s |

**Error log:**
- Xem 100 webhook event gần nhất
- Filter theo: status, date, channel
- Xem raw payload để debug

**Latency metrics:**
- P50, P95, P99 webhook processing time
- Thời gian từ khi platform gửi webhook đến khi agent reply

---

## 4.16 Unpair Channel

**Ngắt kết nối agent-channel** mà không xóa credentials.

Channel → **Unpair** → confirm.

**Hậu quả:**
- Agent không nhận message từ channel này nữa
- Session history giữ nguyên
- Channel credentials không bị xóa
- Có thể pair channel này với agent khác ngay sau đó

**Pair với agent mới:**
- Channel (đang unpaired) → **Pair Agent** → chọn agent khác
- Hoặc: Agent mới → tab Kênh → **+ Pair** → chọn channel đã có

---

## 4.17 Multi-Channel Routing

**1 user nhắn qua nhiều kênh → có chung session không?**

Mặc định: **KHÔNG** — mỗi channel tạo session riêng.

Ví dụ: user nhắn Telegram bot và cũng chat Web Chat → 2 session riêng biệt.

**Cross-channel identity matching** (tính năng nâng cao):
- Admin mapping: liên kết user Telegram ID với user Web Chat ID
- Qua API: `POST /api/v1/identity/link`
- Sau khi link: 2 channel dùng chung 1 session

**Use case:**
- User bắt đầu chat qua Web Chat → tiếp tục qua Telegram không mất context
- Multi-channel customer support với lịch sử thống nhất

**Giới hạn:**
- Cross-channel identity matching cần setup thủ công hoặc login flow
- Không tự động detect cùng người nếu không có auth chung
