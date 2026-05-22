# 02 — Train Agent qua Claude Code

> **Cảnh báo trước khi bắt đầu:**
> ⚠️ KHÔNG commit `CLAUDE.md` chứa `<gateway-token>` thật vào git public. Token này cấp full quyền API GoClaw.

---

## Khi nào nên dùng Claude Code thay vì Dashboard

| Trường hợp | Dashboard | Claude Code |
|---|---|---|
| Đút 1-2 file PDF | ✅ nhanh hơn | — |
| Đút **hàng loạt** file (50+ file) từ folder local | — | ✅ rất nhanh, dùng SCP + rescan |
| Sửa nội dung 1 doc | ✅ | — |
| Bulk rename / tổ chức lại path nhiều doc | — | ✅ script được |
| Ghi 1 memory đơn lẻ | ✅ | — |
| Sync workspace folder agent → vault định kỳ | — | ✅ tự động hóa được |
| Tạo skill đơn giản | tab Skills tab Custom | ✅ Path B chat agent (xem [03](03-create-skill.md)) |
| Verify nhanh: agent có search ra X không | tab 🔍 Tìm kiếm | ✅ curl 1 lệnh |

→ **Dashboard cho thao tác lẻ. Claude Code cho thao tác hàng loạt + tự động hóa.**

---

## Setup ban đầu (1 lần duy nhất)

### Yêu cầu

- Đã cài [Claude Code](https://claude.com/claude-code) trên máy local
- Có **SSH key** vào VPS chứa GoClaw container (nếu muốn thao tác qua DB/file system)
- Biết các thông số:
- `<your-vps>` — host SSH (vd `myvps.example.com` hoặc IP)
- `<gateway-token>` — lấy từ file `.env` trên VPS, biến `GOCLAW_GATEWAY_TOKEN`
- `<agent-key>` — slug agent (vd `alpha`)
- `<user-id>` — user ID để gọi API (lấy từ contact trong dashboard hoặc DB)

### Bước 1. Tạo project folder local

```bash
mkdir goclaw-train-<tenant-slug>
cd goclaw-train-<tenant-slug>
```

### Bước 2. Tạo `CLAUDE.md` chứa context

Đây là file Claude Code **tự động đọc** mỗi session — chứa context Goclaw để Claude biết phải làm gì.

```markdown
# GoClaw Train Workspace — <tenant-slug>

## Connection

- VPS host: `<your-vps>` (SSH alias: `<ssh-alias>`)
- GoClaw API: `http://localhost:18790` (gọi từ VPS) hoặc qua tunnel
- Container name: `<tenant-slug>-goclaw-1`
- Postgres container: `<tenant-slug>-postgres-1`
- Master tenant ID: `0193a5b0-7000-7000-8000-000000000001` (mặc định, không cần header)

## Auth

- Bearer token: `<gateway-token>` (từ `.env` trên VPS, biến `GOCLAW_GATEWAY_TOKEN`)
- Header bắt buộc cho hầu hết API: `X-GoClaw-User-Id: <user-id>`

## Agent đang train

- Agent key: `<agent-key>`
- Agent ID: `<agent-id>` (UUID, query qua `psql` hoặc API)
- Provider/model: <provider>/<model>

## Tasks tôi thường làm

1. **Đút folder local vào Vault**
   - SCP folder vào `/app/workspace/<agent-key>/` trong container
   - Gọi `POST /v1/vault/rescan` để index
   - Verify bằng `POST /v1/vault/search`

2. **Ghi memory cá nhân**
   - Insert vào DB hoặc gọi API memory create

3. **Build KG từ memory**
   - Bật auto-extract trong Built-in Tools (1 lần)
   - Hoặc gọi extract API thủ công

4. **Sửa file context (SOUL.md, IDENTITY.md)**
   - SCP file vào `/app/data/agent_context/<agent-id>/`
   - Tạo session mới sau khi sửa

## Quy ước an toàn

- KHÔNG đụng database trực tiếp trừ khi đã backup
- KHÔNG restart container khi user đang chat với agent
- Mọi thao tác sửa: log lại trong `LOG.md` để rollback nếu cần
```

### Bước 3. (Tùy chọn) Tạo SSH alias

File `~/.ssh/config`:

```
Host <ssh-alias>
    HostName <your-vps>
    User <ssh-user>
    IdentityFile ~/.ssh/<your-key>
```

Test: `ssh <ssh-alias>` phải vào được VPS không hỏi password.

### Bước 4. Test connection

Mở Claude Code trong folder vừa tạo. Gõ:

```
Test connection: ssh vào <ssh-alias>, kiểm tra container <tenant-slug>-goclaw-1
running không, gọi GET / để check API health.
```

Claude sẽ chạy SSH + curl. Phải báo: container `Up X days (healthy)`, API có response.

---

## Prompt mẫu — copy-paste-ready

Dưới đây là 5 prompt khách dùng thường xuyên. **Paste nguyên văn** vào Claude Code, thay placeholder rồi gửi.

### Prompt 1 — Đút folder local vào Vault

```
Đẩy folder local "<đường-dẫn-folder>" lên Vault của agent <agent-key>:

1. SCP toàn bộ file (chỉ .md/.txt/.pdf/.docx/.csv) lên VPS đường dẫn
   /app/workspace/<agent-key>/<sub-folder-name>/ trong container
   <tenant-slug>-goclaw-1
2. Gọi POST /v1/vault/rescan để index
3. Đợi enrichment xong (poll GET /v1/vault/enrichment/status, phase=done)
4. Verify bằng POST /v1/vault/search với 1-2 query liên quan nội dung
5. Báo kết quả: bao nhiêu file đã index, có file nào fail không

Header API: Authorization: Bearer <gateway-token>, X-GoClaw-User-Id: <user-id>
```

### Prompt 2 — Ghi memory cá nhân cho 1 user

```
Ghi memory cho agent <agent-key>, user <user-id>:

Path: notes/<chủ-đề>.md
Phạm vi: Cá nhân (chỉ user <user-id> này)
Nội dung:
"""
<paste markdown content tại đây>
"""

Insert vào DB qua psql hoặc gọi API memory create endpoint.
Sau đó gọi semantic search test với câu: "<câu-test-liên-quan>"
để verify đã index xong (score >0.5 là đạt).
```

### Prompt 3 — Build Knowledge Graph từ transcript

```
Build KG cho agent <agent-key> từ transcript dưới đây:

Transcript:
"""
<paste transcript cuộc gặp/note tại đây>
"""

1. Gọi extract endpoint với provider <provider> + model có structured output
   (vd gemini-2.5-pro hoặc claude-sonnet-4)
2. Min confidence: 0.7
3. Gán entity vào agent_id <agent-id>
4. Sau khi extract, query DB để xem entity + relation đã tạo
5. Báo: bao nhiêu entity mới, bao nhiêu relation mới, có cặp trùng (dedup
   candidate) không
```

### Prompt 4 — Sửa file context (SOUL.md / IDENTITY.md)

```
Sửa SOUL.md của agent <agent-key>:

1. Đọc file hiện tại tại /app/data/agent_context/<agent-id>/SOUL.md
   (trong container <tenant-slug>-goclaw-1)
2. Update theo nội dung sau:
"""
<paste nội dung mới>
"""
3. Lưu lại
4. ⚠️ Tạo session mới: gọi DELETE session hiện tại của user <user-id>
   với agent <agent-key> (hoặc reset session)
5. Gợi ý anh test: chat 1 câu để verify phong cách mới đã apply

LƯU Ý: cache trước khi sửa — copy file gốc thành SOUL.md.bak để rollback
nếu cần.
```

### Prompt 5 — Lập lịch Cron đọc file định kỳ

```
Tạo cron job cho agent <agent-key>:

Lịch: <every X minutes / cron expression / once at TIME>
Múi giờ: Asia/Ho_Chi_Minh (BẮT BUỘC, default UTC sẽ sai 7 tiếng)
Task: <mô tả việc agent sẽ làm khi tick — vd "đọc file
/app/workspace/<agent-key>/inbox/ và nếu có file mới thì tóm tắt
gửi vào channel <channel-slug>">

Delivery: gửi kết quả vào channel <channel-slug>, chat ID <chat-id>
Stateless: bật (job chạy thường xuyên, không cần lưu run log)

Sau khi tạo, gọi "Chạy thử" 1 lần để verify.
```

---

## Verify qua API — các lệnh curl thường dùng

Em (Claude) thường chạy các lệnh này khi anh nhờ verify. Anh có thể chạy thủ công nếu cần.

### Health check

```bash
ssh <ssh-alias> "curl -s http://localhost:18790/health"
```

### Vault enrichment status

```bash
ssh <ssh-alias> "curl -s -H 'Authorization: Bearer <gateway-token>' \
  -H 'X-GoClaw-User-Id: <user-id>' \
  http://localhost:18790/v1/vault/enrichment/status"
```

Output: `{"phase":"done","done":N,"total":N,"error_count":0,"last_error":""}`. `error_count > 0` = có file lỗi.

### Vault search

```bash
ssh <ssh-alias> "curl -s -X POST \
  -H 'Authorization: Bearer <gateway-token>' \
  -H 'X-GoClaw-User-Id: <user-id>' \
  -H 'Content-Type: application/json' \
  -d '{\"query\":\"<câu-tìm>\",\"limit\":5}' \
  http://localhost:18790/v1/vault/search"
```

### Chat thử với agent (OpenAI-compat)

```bash
ssh <ssh-alias> "curl -s -X POST \
  -H 'Authorization: Bearer <gateway-token>' \
  -H 'X-GoClaw-User-Id: <user-id>' \
  -H 'Content-Type: application/json' \
  -d '{\"model\":\"agent:<agent-key>\",\"messages\":[{\"role\":\"user\",\"content\":\"<câu-test>\"}]}' \
  http://localhost:18790/v1/chat/completions"
```

> Lưu ý: model phải là `agent:<agent-key>` (có prefix `agent:`). Nếu chỉ pass `<agent-key>` sẽ trả lỗi "agent not found: default".

### Query DB trực tiếp (xem agent config, list skills)

```bash
ssh <ssh-alias> "docker exec <tenant-slug>-postgres-1 psql -U goclaw -d goclaw \
  -c \"SELECT agent_key, display_name, provider, model FROM agents WHERE deleted_at IS NULL;\""
```

---

## Pitfalls thường gặp

### Header & Auth

- ⚠️ **Quên header `X-GoClaw-User-Id`** → API trả 401 *"X-GoClaw-User-Id header is required"*. Hầu hết endpoint cần header này
- **Quên `Authorization: Bearer`** → 401 unauthorized
- **Token sai/đã rotate** → 403. Lấy lại token từ `.env` trên VPS

### Tenant

- **Master tenant ID là cố định** `0193a5b0-7000-7000-8000-000000000001`. Không cần header `X-GoClaw-Tenant-Id` cho master
- Nếu làm việc với **tenant khác master** → phải set header `X-GoClaw-Tenant-Id: <tenant-uuid>`

### Encoding

- File markdown viết trên Windows có thể có **UTF-8 BOM** (3 byte đầu) → một số parser lỗi. Lưu file UTF-8 không BOM:
- VS Code: status bar dưới chân → click `UTF-8 with BOM` → chọn `UTF-8`
- Notepad++: Encoding → Convert to UTF-8 (không phải UTF-8 BOM)

### Session cache

- Sau khi **sửa file context** (SOUL.md, IDENTITY.md, USER.md): session đang active **đã cache system prompt** → không thấy thay đổi. **Phải tạo session mới**

### Model-specific

- **Gemma models** không accept `thinking_level` parameter → nếu agent dùng Gemma, set `thinking_level=''` (rỗng) ở dialog Nâng cao agent. Nếu không sẽ lỗi 400 *"Thinking level is not supported for this model"*

### File system

- Mặc định trong container, owner workspace là `goclaw:goclaw` (uid 1000). `docker exec` thường cần `-u 0` cho thao tác cần root (vd ghi vào folder system). `docker cp` thì thoải mái
- Đường dẫn workspace cho master tenant: `/app/workspace/<agent-key>/` (không có prefix `tenants/<slug>/`)

### Cron

- ⚠️ **Default múi giờ UTC** — cron `0 9 * * *` thực tế chạy **16:00 VN** (UTC+7). Luôn set `Asia/Ho_Chi_Minh`
- **Stateless mode** nên BẬT cho cron tần suất cao (mỗi 5 phút) → không phình `cron_run_logs` table

---

## Workflow phối hợp Claude + Dashboard

| Phase | Tool | Việc |
|---|---|---|
| **Setup ban đầu** | Dashboard | Tạo agent, gắn channel, đặt budget, bật built-in tools |
| **Onboarding kiến thức** | Claude Code | Đút hàng loạt file vào Vault qua SCP + rescan |
| **Tinh chỉnh** | Dashboard | Edit metadata doc, đổi visibility skill, ghim Pinned Skill |
| **Train hằng ngày** | Cả 2 | Note ngắn → Dashboard. Bulk import → Claude |
| **Tạo skill mới** | [Path A](03-create-skill.md#path-a--tự-viết--upload-zip) Dashboard / [Path B](03-create-skill.md#path-b--nhờ-agent-tự-tạo-qua-chat) Chat | Tùy độ phức tạp |
| **Verify** | Cả 2 | Dashboard 🔍 Tìm kiếm / `curl /v1/vault/search` |
| **Khi gặp lỗi** | Claude Code | Query DB / xem log container nhanh hơn click dashboard |

---

## Đào sâu

- **Chi tiết 5 cách train (UI version)** → [01 — Train Dashboard](01-train-agent-dashboard.md)
- **Tạo Skill (Path A & Path B)** → [03 — Tạo Skill](03-create-skill.md)
- **Lỗi thường gặp** → [04 — Troubleshooting](04-troubleshooting.md)
- **Glossary** → [05 — Glossary](05-glossary.md)
