# 06 — Menu: Built-in Tools

Menu **Built-in Tools** quản lý các công cụ tích hợp sẵn trong GoClaw — đây là code thật (không phải text guide như Skill).

---

## 6.1 Tổng Quan Built-in Tools

**Tool** = function thật mà agent có thể gọi trong quá trình xử lý request.

**Phân biệt với Skill:**
- Skill = "Sách hướng dẫn" → agent đọc và tự thực hiện
- Tool = "Cánh tay robot" → agent gọi hàm, hàm thực thi, trả kết quả

**14 danh mục tool, bật/tắt độc lập:**
File System, Runtime, Web, Memory, Media, Browser, Session, Messaging, Scheduling, Subagents, Skill, Delegation, Teams, Integrations.

**Phân quyền 2 cấp:**
- Global: Admin → Built-in Tools → toggle (bật/tắt cho toàn tenant)
- Per-agent: Agent → Built-in Tools → toggle (bật/tắt cho agent cụ thể)
- Per-group: Agent → Nhóm → [group] → Bộ lọc (cho nhóm cụ thể)

---

## 6.2 Danh Mục Tools

| Danh mục | Tool tiêu biểu | Dùng khi |
|----------|---------------|----------|
| **File System** | `read_file`, `write_file`, `list_dir`, `delete_file` | Đọc/ghi file trên VPS (đường dẫn được whitelist) |
| **Runtime** | `exec` | Chạy shell command trong container — **nguy hiểm** |
| **Web** | `web_search`, `web_fetch`, `browser_open` | Tìm kiếm qua **Web Search Provider Chain** (Exa → Tavily → Brave → DuckDuckGo), fetch URL, browser |
| **Memory** | `memory_read`, `memory_write`, `memory_search`, `memory_delete` | Đọc/ghi/tìm bộ nhớ agent |
| **Vault** | `vault_search`, `vault_read` | Tìm và đọc document trong Vault |
| **Media** | `tts_speak`, `image_generate`, `image_analyze`, `ocr` | TTS, gen ảnh, nhận diện ảnh, OCR |
| **Browser** | `screenshot`, `click`, `fill_form`, `navigate` | Browser automation (Playwright) |
| **Session** | `session_reset`, `session_info`, `session_export` | Quản lý session hiện tại |
| **Messaging** | `send_message`, `reply`, `react`, `pin_message` | Gửi tin nhắn đến channel |
| **Scheduling** | `cron_create`, `cron_list`, `cron_delete`, `cron_pause` | Tạo/quản lý cron job |
| **Subagents** | `spawn_agent`, `delegate_task`, `agent_status` | Tạo agent con, giao task |
| **Skill** | `skill_search`, `use_skill`, `publish_skill` | Tìm/dùng/publish skill |
| **Delegation** | `handoff` | Chuyển toàn bộ session sang agent khác |
| **Teams** | `team_send`, `team_status`, `team_result` | Giao task cho Team |
| **Integrations** | `nhanh_order`, `nhanh_product`, `nhanh_customer` | Tích hợp Nhanh.vn CRM |

---

## 6.3 Cấu Hình TTS (Text-to-Speech) v3.10.0

Sidebar → **Built-in Tools** → **Media** → **TTS**.

**Provider hỗ trợ:**

| Provider | Chất lượng | Chi phí | Hỗ trợ tiếng Việt |
|----------|-----------|---------|-------------------|
| ElevenLabs | Cao nhất | Cao | Có (Multilingual) |
| OpenAI TTS | Tốt | Trung bình | Không tốt |
| Google Cloud TTS | Tốt | Thấp | Tốt (WaveNet/Neural2) |
| Azure TTS | Tốt | Trung bình | Tốt (Neural) |

**Cấu hình:**
- Provider: chọn provider
- API Key: nhập API key của provider
- Default Voice ID: voice mặc định (VD: ElevenLabs: `21m00Tcm4TlvDq8ikWAM`)
- Speed: 0.5–2.0 (1.0 = normal)
- Format output: MP3 (khuyến nghị), OGG, WAV

**Dùng TTS:**
Agent dùng tool `tts_speak`:
```
tts_speak(text="Xin chào bạn!", voice_id="...", format="mp3")
→ trả về URL file audio
Agent gửi file audio qua messaging tool
```

---

## 6.4 Cài Đặt Knowledge Graph Extraction

Sidebar → **Built-in Tools** → **Memory** → **Knowledge Graph**.

**Cài đặt extraction LLM:**
- Provider: chọn provider (khuyến nghị: OpenAI hoặc Anthropic)
- Model: phải hỗ trợ **structured JSON output** / function calling
  - OpenAI: `gpt-4o`, `gpt-4o-mini` (✓)
  - Anthropic: `claude-3-5-sonnet`, `claude-3-haiku` (✓)
  - Groq: `llama-3.1-70b-versatile` (✓)
  - **KHÔNG dùng**: model cũ không có tool use / structured output

**Entity types allowlist** (mặc định):
```
Person, Organization, Product, Concept, Event, Location, Technology, Document
```
Thêm type tùy chỉnh: VD `TradingInstrument`, `Persona`, `Strategy`.

**Relation types allowlist** (mặc định):
```
is_a, part_of, related_to, created_by, used_in, located_in, owns, manages
```

**Auto-extract khi write memory:**
- Bật: mỗi lần agent write memory → tự extract entities + relations
- Tắt: chỉ extract khi trigger thủ công
- Khuyến nghị: bật, nhưng với model nhỏ (gpt-4o-mini) để tiết kiệm chi phí

---

## 6.5 Web Search Provider Chain (cập nhật GoClaw)

**UI:** Built-in Tools → **Web** → **Web Search Provider Chain**  
*Drag to reorder. First **enabled** provider with a **valid API key** is tried first.*

| # | Provider | Pilot Alpha (Founder đã cấu hình) | Ghi chú |
|---|----------|-----------------------------------|---------|
| 1 | **Exa** | ON · API key · Max results **5** | Primary — headline/research chất lượng |
| 2 | **Tavily** | ON · API key · Max results **5** | Secondary khi Exa lỗi/429 |
| 3 | **Brave Search** | ON · *(chưa key)* | Bật key khi cần tier 3 |
| 4 | **DuckDuckGo** | **Always-on fallback** (khóa vị trí cuối) | Miễn phí — không cần key |

**Logic runtime:**

1. Thử provider #1 nếu toggle ON **và** có API key hợp lệ.
2. Lỗi / timeout / rate-limit → thử provider kế tiếp trong danh sách.
3. Hết chain → **DuckDuckGo** (luôn có).

**Cấu hình khuyến nghị Media OS:**

- Giữ thứ tự **Exa → Tavily → Brave → DuckDuckGo** (như screenshot Founder).
- `Max results`: **5** đủ cho brief; tránh 20+ (token + noise).
- Brave: thêm API key khi muốn giảm phụ thuộc DuckDuckGo free tier.
- Bật `web_search` **global** + per-agent **Alpha Content Writer**, **Linh Cẩu** (edu headline); Orchestrator **không** cần search trực tiếp — delegate worker.

**Quy tắc dự án (không đổi vì có chain mới):**

| Dùng web_search cho | Không dùng web_search làm |
|---------------------|---------------------------|
| Headline Fed/DXY/XAUUSD, bối cảnh tin | Giá spot/DXY **live** (cần feed + timestamp) |
| Link official (Fed, BLS, BEA) qua `web_fetch` | Vault thay cho market data |
| Research bước 1 Alpha Writer workflow | Publish Zernio |

Ref runtime: [`GOCLAW_RUNTIME_GUIDE.md`](../../GOCLAW_RUNTIME_GUIDE.md) §2.1b.

**Trigger conditions (fallback giữa provider):**

- `error`: HTTP 4xx/5xx
- `timeout`: không response trong N giây
- `rate_limit`: HTTP 429

---

## 6.6 Exec Tool (Runtime)

Tool `exec` cho phép agent chạy shell command trong container GoClaw.

> **NGUY HIỂM — Chỉ cấp cho admin agent, không cấp cho public agent.**

**Cấu hình sandbox:**
```yaml
exec:
  whitelist_commands: ["python", "node", "bash", "curl", "jq"]
  blacklist_paths: ["/etc", "/root", "/var/secret", "/proc"]
  timeout_seconds: 30
  working_dir: "/workspace"
  user: "agent-runner"  # user ít quyền, không phải root
```

**Dùng exec để:**
- Chạy Python script phân tích data
- Gọi API bằng curl
- Process file (convert, compress)

**Không dùng exec để:**
- Thao tác file ngoài `/workspace`
- Chạy lệnh network admin (iptables, etc.)
- Cài package mới (dùng dependencies trong SKILL.md thay)

---

## 6.7 Bật/Tắt Tool

**3 cấp bật/tắt:**

```
Cấp 1: Global (toàn tenant)
  Admin → Built-in Tools → [category] → toggle

Cấp 2: Per-agent
  Agents → [agent] → Built-in Tools → [category] → toggle

Cấp 3: Per-group
  Agents → [agent] → Nhóm → [group] → Bộ lọc Tool → toggle
```

**Ưu tiên**: Cấp 1 > Cấp 2 > Cấp 3.
- Nếu Global OFF → agent không thể bật được dù Cấp 2 ON
- Nếu Global ON, Per-agent OFF → agent đó không dùng được
- Nếu Global ON, Per-agent ON, Per-group OFF → agent chỉ bị block trong group đó

**Pattern phổ biến:**
```
exec: Global ON, Per-agent chỉ admin agent ON, tất cả group OFF
vault_search: Global ON, Per-agent ON cho tất cả
memory_write: Global ON, Per-agent ON, Per-group tùy chọn
```
