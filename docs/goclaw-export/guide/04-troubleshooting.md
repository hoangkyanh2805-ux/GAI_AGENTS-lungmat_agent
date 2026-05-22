# 04 — Troubleshooting (lỗi thường gặp + cách fix)

> **Cách dùng file này:** scan tiêu đề tìm lỗi giống của bạn → đọc Diagnose để xác minh → áp dụng Fix.
>
> Format mỗi case: **Symptom** (triệu chứng) → **Diagnose** (cách check chắc đúng lỗi này) → **Fix** (cách xử lý) → **Prevent** (tránh tái diễn).

---

## Mục lục

1. [Vault: upload xong nhưng search không ra](#1-vault-upload-xong-nhưng-search-không-ra)
2. [Memory: search trả 0 kết quả](#2-memory-search-trả-0-kết-quả)
3. [Skill: upload báo Missing Dependencies](#3-skill-upload-báo-missing-dependencies)
4. [Agent "quên" file context vừa sửa](#4-agent-quên-file-context-vừa-sửa)
5. [Bootstrap trap: agent kẹt onboarding mode](#5-bootstrap-trap-agent-kẹt-onboarding-mode)
6. [Cron không chạy đúng giờ](#6-cron-không-chạy-đúng-giờ)
7. [Per-group skill filter không apply](#7-per-group-skill-filter-không-apply)
8. [API trả 401 mặc dù có token](#8-api-trả-401-mặc-dù-có-token)
9. [Agent vượt budget, bị chặn API](#9-agent-vượt-budget-bị-chặn-api)
10. [Sandbox timeout khi chạy code dài](#10-sandbox-timeout-khi-chạy-code-dài)
11. [Skill ZIP báo "phải chứa SKILL.md ở thư mục gốc"](#11-skill-zip-báo-phải-chứa-skillmd-ở-thư-mục-gốc)
12. [Gemma model: 400 "Thinking level not supported"](#12-gemma-model-400-thinking-level-not-supported)
13. [Channel status đỏ: failed/degraded](#13-channel-status-đỏ-faileddegraded)
14. [Anthropic: credit balance too low (HTTP 400)](#14-anthropic-credit-balance-too-low-http-400)
15. [Gemini gg-ai-studio: function_response.name empty](#15-gemini-gg-ai-studio-function_responsename-empty)

---

## 1. Vault: upload xong nhưng search không ra

**Symptom:** Đã upload file vào Vault. Bấm 🔍 Tìm kiếm → trả 0 kết quả hoặc không tìm thấy file vừa upload.

**Diagnose:**
1. Mở doc trong list Vault → click → tab **Đoạn trích (Chunks)**
2. Nhìn trạng thái mỗi chunk: 🟢 Đã nhúng / 🟡 Chưa nhúng
3. Nếu thấy 🟡 → enrichment chưa xong / fail

**Hoặc** check qua API:

```bash
ssh <ssh-alias> "curl -s -H 'Authorization: Bearer <gateway-token>' \
  -H 'X-GoClaw-User-Id: <user-id>' \
  http://localhost:18790/v1/vault/enrichment/status"
```

Output `{"phase":"running"}` = đang xử lý, đợi. Output `{"phase":"done","error_count":N}` với N>0 = có file lỗi.

**Fix:**
- **Đang running** → đợi vài phút. File lớn (PDF nhiều trang) có thể mất 5-10 phút
- **Có error_count** → xem `last_error`. Phổ biến:
  - File PDF bị mã hóa/password → bỏ password rồi re-upload
  - File quá lớn → split nhỏ
  - Encoding lạ → save lại UTF-8
- **Phase done nhưng vẫn 🟡** → bấm **Re-index** trên doc đó, hoặc header **Quét lại workspace**
- **Embedding provider lỗi** → vào Settings xem provider/model embedding (`gemini-embedding-001` hoặc `text-embedding-3-small`...) còn key valid không

**Prevent:**
- Upload từng batch nhỏ (10-20 file) thay vì 100 file một lúc
- File PDF lớn → giảm số trang, hoặc convert sang markdown trước
- Định kỳ check enrichment status sau bulk upload

---

## 2. Memory: search trả 0 kết quả

**Symptom:** Đã tạo memory document nhưng semantic search không tìm thấy.

**Diagnose:**
1. Memory → tab Tài liệu → tìm doc bạn vừa tạo
2. Click → tab Chunks → check 🟢 Đã nhúng
3. Nếu Đã nhúng nhưng search vẫn không ra → vấn đề ở **Min Score threshold**

**Fix:**
- **🟡 Chưa nhúng** → bấm **Lập chỉ mục tất cả** ở header
- **🟢 Đã nhúng nhưng score < threshold:**
  - Vào **Agents → `<agent-name>` → ⚙️ Nâng cao → Memory**
  - Hạ **Min Score** từ `0.35` → `0.25`
  - Hoặc nâng **Max Results** từ `6` → `10`
- **Doc dài quá** → chunk có thể không match. Chia doc thành nhiều doc nhỏ (1 doc/chủ đề, ~3000 ký tự)
- **Test embedding model** → query qua API search xem score có hợp lý không. Score ~0 = embedding model lỗi

**Prevent:**
- Bật "**Tự động lập chỉ mục sau khi tạo**" mỗi lần tạo doc mới
- Path memory rõ ràng (`notes/khach-abc.md` thay vì `note1.md`) — dễ tìm + dễ filter

---

## 3. Skill: upload báo Missing Dependencies

**Symptom:** Upload skill ZIP xong, header trang Skills hiện panel **Missing Dependencies** với danh sách `pip:xxx`, `npm:yyy`. Bấm Install → fail.

**Diagnose:**
- Format dep: `pip:<package>` (Python), `npm:<package>` (Node), hoặc tên runtime (`python`, `node`)
- Click Install → trạng thái `Installing... → Failed`
- Nếu **tất cả** dep cùng fail → 99% là container thiếu runtime, không phải lỗi từng package

**Fix:**
- **Container thiếu Python/Node runtime:**
  1. Vào menu **Packages** (nếu có) → cài Python/Node trong container
  2. Hoặc SSH vào VPS:
     ```bash
     docker exec -u 0 <tenant-slug>-goclaw-1 apk add python3 py3-pip   # Alpine
     # hoặc
     docker exec -u 0 <tenant-slug>-goclaw-1 apt install -y python3 python3-pip   # Debian
     ```
  3. Bấm **Rescan Deps** ở header trang Skills
- **1 dep cụ thể fail:**
  - `pip` không có internet → check container network
  - Package compile cần dev headers → SSH cài `build-essential` / `python3-dev`
  - Package version conflict → check log container `docker logs <tenant-slug>-goclaw-1`

**Prevent:**
- Khi viết skill có dep, kiểm tra container target có Python/Node chưa
- File `requirements.txt` ghi rõ version (`numpy==1.26.0` thay vì `numpy`) → tránh conflict
- Test skill ở dev env trước khi đưa production

---

## 4. Agent "quên" file context vừa sửa

**Symptom:** Đã sửa `SOUL.md` / `IDENTITY.md` (đổi tính cách, vai trò). Chat lại với agent → vẫn ra phong cách cũ.

**Diagnose:**
- Vào tab Tệp của agent → click `SOUL.md` → kiểm tra nội dung mới đã lưu chưa
- Nếu nội dung file đúng nhưng agent vẫn cũ → 99% là **session đang active đã cache system prompt**

**Fix:**
- **Tạo session mới:**
  - Web Chat: bấm **+ New Chat** ở góc
  - Telegram/Zalo/Slack/...: chat từ user khác hoặc xóa session hiện tại
  - Vào menu **Sessions** → tìm session với agent này + user này → bấm **Reset** hoặc **Xóa**
- Sau đó chat lại từ session mới → phải thấy phong cách mới

**Prevent:**
- Mỗi lần sửa file context: nhớ tạo session mới ngay sau lưu
- Có thể xài nút **System Prompt Preview** ở tab Tệp để kiểm tra prompt thực tế trước khi tạo session

---

## 5. Bootstrap trap: agent kẹt onboarding mode

**Symptom:** Agent chỉ trả lời đúng 1 câu lặp lại "Đây là lần đầu chúng ta nói chuyện, anh/chị cho em hỏi tên/timezone..." và không gọi được tool nào (kể cả `vault_search`).

**Diagnose:**
- Vào tab Tệp → check 2 thứ:
  1. Có file `BOOTSTRAP.md` không?
  2. File `USER.md` có nội dung thật hay vẫn là template trống?
- Nếu **có BOOTSTRAP.md + USER.md trống** → agent rơi vào bootstrap mode (chỉ dùng `write_file`, không có tool khác)

**Fix:**
1. **Populate `USER.md`** với nội dung thật (vd: "Người dùng tên Nguyễn Văn A, làm việc tại CTI Group, múi giờ Asia/Saigon")
2. **Xóa `BOOTSTRAP.md`** khỏi tab Tệp (hoặc rename)
3. **Tạo session mới** (như case 4) — vì session active đã cache system prompt
4. Chat lại → agent phải có đầy đủ tools

**Hoặc qua DB nếu file không xóa được trên UI:**

```bash
ssh <ssh-alias> "docker exec <tenant-slug>-postgres-1 psql -U goclaw -d goclaw \
  -c \"DELETE FROM user_context_files WHERE file_name='BOOTSTRAP.md' \
  AND user_id='<user-id>';\""
```

**Prevent:**
- Khi tạo agent Predefined mới: chủ động populate USER.md cho từng user trước khi user chat lần đầu
- Hoặc xóa BOOTSTRAP.md ngay nếu không cần onboarding flow

---

## 6. Cron không chạy đúng giờ

**Symptom:** Tạo cron job lúc 9:00 sáng VN. Thực tế chạy lúc 16:00 VN (chênh 7 tiếng).

**Diagnose:**
- Default múi giờ của Goclaw cron = **UTC**
- Vd `0 9 * * *` (UTC) = 16:00 VN (UTC+7)

**Fix:**
- Vào menu **Cron** → mở job → field **Múi giờ**
- Đổi từ `UTC` thành `Asia/Ho_Chi_Minh` (hoặc `Asia/Saigon`)
- Save → cron run log từ giờ sẽ đúng giờ VN

**Prevent:**
- ⚠️ **Mọi cron job VN phải set `Asia/Ho_Chi_Minh` ngay lúc tạo**, không tin default UTC
- Test bằng nút **Chạy thử** sau khi tạo, không chờ tới giờ thật mới biết

---

## 7. Per-group skill filter không apply

**Symptom:** Đã set filter trong tab **Nhóm** của channel (chỉ cho group X dùng skill `pdf`, `docx`). Member group X vẫn gọi được `skill-creator`.

**Diagnose:**
- Vào **Channel** → channel đó → tab **Nhóm**
- Tìm dòng group ID đó (`-100123456` Telegram, hoặc ID Zalo/WhatsApp)
- Check field **Bộ lọc skill**:
  - **Trống** = kế thừa từ Skills List của agent (filter không apply)
  - **Có tick** = chỉ skill được tick mới gọi được

**Fix:**
- Click vào group đó → field **Bộ lọc skill** → tick các skill cho phép
- Nhớ **KHÔNG** tick skill muốn cấm (vd `skill-creator`)
- Save

**Prevent:**
- Set filter ngay khi gắn agent vào group production, không để default
- Wildcard `*` cho group ID → áp dụng cho mọi group (nếu muốn rule chung)

---

## 8. API trả 401 mặc dù có token

**Symptom:** Curl API có header `Authorization: Bearer <token>` đúng nhưng vẫn trả `{"error":{"code":"INVALID_REQUEST","message":"X-GoClaw-User-Id header is required"}}` hoặc 401.

**Diagnose:**
- Xem chính xác message error:
  - `"X-GoClaw-User-Id header is required"` → thiếu header user
  - `"unauthorized"` → token sai/hết hạn
  - `"tenant not found"` → header tenant ID sai

**Fix:**
- **Thiếu `X-GoClaw-User-Id`:**
  ```bash
  curl ... -H "X-GoClaw-User-Id: <user-id>" ...
  ```
- **Token sai:**
  - Lấy token mới từ `.env` trên VPS:
    ```bash
    ssh <ssh-alias> "grep GOCLAW_GATEWAY_TOKEN /opt/goclaw/<tenant-slug>/.env"
    ```
  - Token có thể đã rotate — kiểm tra lại
- **Tenant ID sai:**
  - Master tenant không cần `X-GoClaw-Tenant-Id`
  - Tenant khác → set đúng UUID

**Prevent:**
- Lưu template curl đầy đủ header trong `CLAUDE.md` để không quên
- Test connection lúc setup ban đầu (xem [02 §Bước 4](02-train-agent-via-claude.md#bước-4-test-connection))

---

## 9. Agent vượt budget, bị chặn API

**Symptom:** Agent đột ngột không trả lời hoặc trả error. Dashboard hiện banner "Agent exceeded monthly budget".

**Diagnose:**
- Vào **Agents → `<agent-name>` → Mô hình & Ngân sách**
- Xem **Budget Monthly** vs **Usage tháng hiện tại**

**Fix:**
- **Tăng Budget Monthly** (nếu thật sự cần) — vd 50 → 100 USD
- **Hoặc đợi đầu tháng sau** — counter reset tự động
- **Hoặc đổi model rẻ hơn**:
  - Claude Sonnet → Haiku (1/10 giá)
  - GPT-4o → GPT-4o-mini
  - Gemini Pro → Gemini Flash

**Prevent:**
- ⚠️ **Đặt budget HỢP LÝ ngay từ đầu**: Sonnet 20-50, Opus/reasoning 100-300, Haiku/Flash 5-15
- Bật **Heartbeat MODEL Override** dùng model rẻ hơn cho heartbeat
- Bật **Subagents Model Override** dùng Haiku cho subagent (1/10 giá)
- Theo dõi Usage tuần đầu → điều chỉnh budget cho tháng sau

---

## 10. Sandbox timeout khi chạy code dài

**Symptom:** Agent chạy script Python (qua skill hoặc tool `exec`) → bị cắt giữa chừng, báo "Sandbox timeout".

**Diagnose:**
- Vào **Agents → `<agent-name>` → ⚙️ Nâng cao → Sandbox**
- Xem **Timeout** (default 300 giây = 5 phút)

**Fix:**
- **Tăng Timeout** lên 600/900 giây (10/15 phút) cho task nặng
- **Tăng Memory** từ 512MB → 1024MB (1GB) nếu script dùng nhiều RAM
- **Tăng CPUs** từ 1.0 → 2.0 nếu cần parallel
- **Bật Network Enabled** nếu script cần `pip install` / fetch internet (default tắt)

**Prevent:**
- Script dài → chia thành nhiều bước nhỏ trong skill (mỗi bước <5 phút)
- Cache kết quả intermediate vào file để không phải tính lại
- Production: **Mode `non-main`** (chỉ sandbox cho non-main session) — tốc độ nhanh hơn

---

## 11. Skill ZIP báo "phải chứa SKILL.md ở thư mục gốc"

**Symptom:** Upload skill ZIP qua tab Custom → báo error *"ZIP phải chứa SKILL.md ở thư mục gốc"*.

**Diagnose:**
- Mở file ZIP bằng tool zip viewer
- Nếu thấy có **folder bọc** bên ngoài (vd `my-skill/SKILL.md`) → đây là lỗi
- Nếu thấy `SKILL.md` ngay root level → vấn đề khác (có thể spelling: `Skill.md` ≠ `SKILL.md`, case-sensitive)

**Fix:**
- **Zip lại đúng cách trên Windows:**
  1. Mở folder skill (vào TRONG folder)
  2. `Ctrl + A` chọn tất cả file/folder bên trong
  3. Chuột phải → **Compress to ZIP**
  4. **KHÔNG** click chuột phải lên folder skill rồi compress
- **Trên Mac/Linux:**
  ```bash
  cd ten-skill
  zip -r ../ten-skill.zip .
  ```
- **Tên file phải chính xác** `SKILL.md` (uppercase). Không phải `Skill.md`, `skill.md`

**Prevent:**
- Test mở ZIP trước khi upload — file đầu phải là `SKILL.md` (không có folder trước)
- Dùng script `package_skill.py` từ `skill-creator` để package đúng chuẩn

---

## 12. Gemma model: 400 "Thinking level not supported"

**Symptom:** Agent dùng provider Gemini với model Gemma (vd `gemma-4-31b-it`). Gọi chat → API trả 400 *"Thinking level is not supported for this model"*.

**Diagnose:**
- Vào **Agents → `<agent-name>` → ⚙️ Nâng cao → Thinking / Reasoning**
- Xem **Thinking Level** — nếu khác `''` (rỗng) thì là nguyên nhân

**Fix:**
- Set **Thinking Level** = `''` (rỗng, không phải `off`)
- Hoặc set **Reasoning Mode** = `inherit` và đảm bảo system default không bật thinking
- Save → test chat lại

**Prevent:**
- Khi chọn model Gemma: KIỂM TRA `thinking_level` rỗng ngay lúc tạo agent
- Document: chỉ Gemini Flash/Pro và Claude support thinking_level. Gemma KHÔNG

---

## 13. Channel status đỏ: failed/degraded

**Symptom:** Trong menu **Channel**, channel của agent có status 🔴 `failed` hoặc 🟡 `degraded`.

**Diagnose:**
- Click channel → mở chi tiết → tab chính có khối **Dòng thời gian (Diagnostics)**:
  - Lỗi đầu tiên + Kiểm tra gần nhất + N lần liên tiếp
  - **Điều gì đã xảy ra**: mô tả lỗi
  - **Hành động được khuyến nghị**: bước tiếp theo
- Nhãn loại lỗi: **Xác thực** (cred sai) / **Cấu hình** (config sai) / **Mạng** / **Cần chú ý**

**Fix theo loại lỗi:**

| Loại | Action |
|---|---|
| **Xác thực** (token sai/hết hạn) | Tab **Thông tin xác thực** → nhập lại token mới (Telegram BotFather, Slack OAuth, ...) → Save |
| **Cấu hình** | Tab **Cấu hình** → check field theo loại channel (Discord cần Message Content Intent, Slack cần Socket Mode, FB cần page_id, ...) |
| **Mạng** | SSH vào VPS → ping endpoint channel (api.telegram.org, slack.com) → check firewall |
| **Cần chú ý** | Đọc kỹ "Hành động được khuyến nghị" — thường là rotate token, kiểm tra webhook secret |

- **Banner "Cần xác thực"** → bấm **Kết nối lại phiên channel**
- **Banner "Thiếu thông tin xác thực"** → bấm **Điền thông tin xác thực bắt buộc**

**Prevent:**
- **Rotate token 90 ngày/lần** (đặt nhắc lịch)
- Tách bot **dev/prod** (token khác nhau)
- Set `webhook_secret` cho channel webhook-based (FB/Pancake/Zalo OA)
- Theo dõi **Failure Streak** mỗi tuần → >5 = rotate token

---

## 14. Anthropic: credit balance too low (HTTP 400)

**Symptom:** Chat/agent không trả lời. Log đỏ:

```text
iter 0 think: llm call: HTTP 400: anthropic: ...
"Your credit balance is too low to access the Anthropic API.
Please go to Plans & Billing to upgrade or purchase credits."
```

**Diagnose:**

1. Lỗi xảy ra ở **iter 0 think** → LLM chưa chạy, **chưa** tới `web_search` / MCP / Team route.
2. Khác lỗi **GoClaw budget** (§9 — banner "Agent exceeded monthly budget").
3. Vào [console.anthropic.com](https://console.anthropic.com) → **Plans & Billing** → xem **Credit balance** của API key đang gắn GoClaw.
4. GoClaw → **Settings** (hoặc tenant LLM provider) → xác nhận **Anthropic API key** trùng account vừa nạp credit.

**Fix (chọn một):**

| Cách | Việc làm |
|------|----------|
| **A — Nạp credit (khuyến nghị)** | Anthropic Console → Plans & Billing → mua credits / upgrade → đợi 1–2 phút → **Chat mới** test lại |
| **B — Đổi API key** | Key khác còn credit → paste vào GoClaw Settings → Save → restart session |
| **C — Tạm đổi model provider** | Agent **Media OS Orchestrator** + workers → **Mô hình** đổi sang **Gemini Flash** (hoặc provider còn quota) cho đến khi Anthropic có credit |
| **D — Test nhanh** | Chat trực tiếp **Alpha Content Writer** (không qua Orchestrator) sau khi nạp — xác nhận key hoạt động |

**Prevent:**

- Gắn **usage alert** trên Anthropic Console.
- Pilot: Orchestrator + Alpha dùng **Sonnet** — theo dõi credit hàng tuần.
- Heartbeat / cron: override model rẻ (Haiku/Flash) theo §9.

**Pilot note:** Web Search Provider Chain (Exa/Tavily) **không** sửa lỗi này — search chỉ chạy sau khi LLM think thành công.

---

## 15. Gemini `gg-ai-studio`: function_response.name empty

**Symptom:** Chat/Team (vd **Media OS Orchestrator**) sau 1–2 bước:

```text
iter 2 think: llm call: HTTP 400: gg-ai-studio:
GenerateContentRequest.contents[N].parts[0].function_response.name:
Name cannot be empty.
status: INVALID_ARGUMENT
```

**Diagnose:**

1. Provider agent = **Google AI Studio** (`gg-ai-studio`), không phải Anthropic.
2. Lỗi ở **iter ≥ 1** → đã gọi **tool** (web_search, team delegate, MCP…) → adapter Gemini gửi `function_response` **thiếu tên**.
3. Thường gặp khi: **Orchestrator + Team Router + Gemini**; ít gặp hơn nếu chat thẳng Alpha bằng **Claude Sonnet**.

**Fix (theo thứ tự — pilot Media OS):**

| # | Việc làm |
|---|----------|
| 1 | **Khuyến nghị:** Nạp Anthropic → **Media OS Orchestrator** + **Alpha Content Writer** → **Claude Sonnet 4.5** (đã verify publish) |
| 2 | **Tạm thời:** Bỏ qua Orchestrator — chat thẳng **Alpha Content Writer** (Sonnet): `viết bài XAUUSD` |
| 3 | Nếu bắt buộc Gemini: agent → **Gemini 2.0 Flash** (không Gemma) · **Thinking level** = rỗng (§12) |
| 4 | Orchestrator trên Gemini: tắt tool thừa (chỉ giữ **Teams** delegate); hoặc test **chat mới** sau khi Save model |
| 5 | Vẫn lỗi → bug GoClaw × Gemini tool bridge — gửi support: prompt + model + `request_id` + log docker |

**Prevent:**

- Production Alpha: **Sonnet** cho Orchestrator + Alpha; Gemini chỉ backup khi có credit Anthropic.
- Route `viết bài` → nếu Orchestrator Gemini fail, fallback thủ công: mở **Alpha Content Writer**.

---

## Khi nào cần liên hệ support?

Nếu đã thử fix theo file này nhưng vẫn không xử được, gom thông tin sau gửi support:

1. **Symptom mô tả** (1-2 câu, kèm screenshot nếu có)
2. **Trang/menu** đang gặp lỗi
3. **Output API/log lỗi** (copy nguyên text):
   ```bash
   ssh <ssh-alias> "docker logs <tenant-slug>-goclaw-1 --tail 200"
   ```
4. **Đã thử fix gì rồi** (theo file này)
5. **Thời điểm bắt đầu lỗi** (ước chừng)

Đào sâu hơn → [05 — Glossary](05-glossary.md) cho thuật ngữ.
