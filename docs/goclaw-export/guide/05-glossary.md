# 05 — Thuật ngữ & So sánh nhanh

> **Khi nào dùng file này:** mở khi đọc các file khác mà không hiểu thuật ngữ, hoặc đang bối rối không biết "đút kiến thức cho agent" thì dùng cách nào.

---

## 1. Năm cách "đút kiến thức" cho Agent — bảng so sánh

GoClaw có **5 nơi** chứa kiến thức cho agent. Chọn đúng nơi quan trọng hơn cách làm.

| | **Vault** | **Memory** | **Knowledge Graph** | **File context** | **Skill** |
|---|---|---|---|---|---|
| **Là gì** | Kho tài liệu chia sẻ | Bộ nhớ dài hạn riêng agent | Bản đồ thực thể + quan hệ | File "tính cách" của agent | Hướng dẫn cách làm 1 việc cụ thể |
| **Phạm vi** | Cá nhân / Nhóm / Chia sẻ workspace | Toàn cục / Cá nhân (riêng 1 agent) | Riêng 1 agent | Riêng 1 agent | Toàn cục (có thể override theo tenant) |
| **Format** | 7 doctype: context/memory/note/skill/episodic/media/document | Markdown chia chunk ~1000 ký tự | Entity (người/công ty/sản phẩm) + Relation (works_at, owns...) | `SOUL.md`, `IDENTITY.md`, `USER.md`, `HEARTBEAT.md` | `SKILL.md` + scripts/references |
| **Cách tìm** | Hybrid: full-text + semantic | Semantic (hiểu ý, không cần keyword) | Graph traversal (đi theo quan hệ) | Inject vào system prompt | Agent gọi `skill_search` |
| **Có wikilinks?** | ✅ `[[link]]` giữa doc | ❌ | ❌ | ❌ | ❌ |
| **Khi nào dùng** | Báo cáo, FAQ, brand voice, hợp đồng mẫu, policies | Note ngắn, fact riêng, sở thích user | Câu hỏi quan hệ ("khách nào mua X và làm ở Y?") | Đổi tính cách, vai trò, ngôn ngữ agent | Cấp năng lực mới (làm Excel, parse PDF, gọi API) |
| **Hướng dẫn** | [01 §A](01-train-agent-dashboard.md#a-vault--kho-tài-liệu-chia-sẻ) / [02](02-train-agent-via-claude.md) | [01 §B](01-train-agent-dashboard.md#b-memory--bộ-nhớ-dài-hạn) | [01 §C](01-train-agent-dashboard.md#c-knowledge-graph--bản-đồ-quan-hệ) | [01 §D](01-train-agent-dashboard.md#d-file-context--tính-cách-agent) | [03](03-create-skill.md) |

### Quy tắc chọn nhanh

- Có **file PDF/Word** muốn agent đọc được → **Vault**
- Có **fact ngắn** muốn agent nhớ qua nhiều cuộc chat → **Memory**
- Có nhiều **người + công ty + sản phẩm** liên quan đến nhau → **Knowledge Graph**
- Muốn đổi **cách agent xưng hô / phong cách trả lời** → **File context (SOUL.md)**
- Muốn agent **biết làm 1 thao tác mới** (gọi API, sinh file Excel) → **Skill**

---

## 2. Memory vs Vault vs File context — phân biệt 3 thứ hay nhầm

| Câu hỏi | Memory | Vault | File context |
|---|---|---|---|
| Ai dùng được? | Riêng 1 agent | Cả workspace / nhóm / cá nhân | Riêng 1 agent |
| Có wikilinks không? | ❌ | ✅ | ❌ |
| Có 7 doctype không? | ❌ (chỉ markdown chunks) | ✅ | ❌ (4 file cố định) |
| Có quét workspace folder không? | ❌ | ✅ (sync auto) | ❌ |
| Inject thẳng vào prompt? | ❌ (chỉ search khi cần) | ❌ (chỉ search khi cần) | ✅ (luôn ở đầu prompt) |
| Sửa xong cần tạo session mới? | ❌ | ❌ | ✅ (vì system prompt đã cache) |

**Mẹo nhớ:**
- **Vault** = thư viện chung (như Google Drive cho team)
- **Memory** = ghi chú cá nhân của agent (như sticky note trong não)
- **File context** = "ADN" của agent (đổi là đổi tính cách)

---

## 3. Thuật ngữ Agent

| Thuật ngữ | Nghĩa |
|---|---|
| **Open Agent** | Mỗi user có 1 bản agent riêng — history/context không share. Phù hợp trợ lý cá nhân. **Không vào được Team.** |
| **Predefined Agent** | Dùng chung — ngữ cảnh nền chung, vẫn giữ `USER.md` per-user. Bắt buộc nếu muốn vào Team. |
| **Agent Key** | Slug định danh (vd `<agent-key>`). **Không đổi được sau khi tạo.** |
| **System Prompt** | Đoạn hướng dẫn nền của agent. Có 4 mode: Đầy đủ (~4.8K token) / Tác vụ (~1.3K) / Tối giản (~570) / Không (~640) |
| **Persona** | Tóm tắt chuyên môn 2-3 câu (ngôi 1) — text này LLM thực sự đọc |
| **Heartbeat** | Agent chủ động chạy định kỳ (5 min mặc định), có thể gửi tin chủ động qua channel |
| **Self-Evolution** | Agent tự rút kinh nghiệm và điều chỉnh (chỉ Predefined). **Production khuyên TẮT cho đến khi quan sát ≥2 tuần.** |

## 4. Thuật ngữ Skill

| Thuật ngữ | Nghĩa |
|---|---|
| **Pinned Skill** | Skill nhúng thẳng vào system prompt (tối đa **10**). Agent không cần `skill_search` để tìm — thấy ngay nhưng tốn vài trăm token/skill |
| **Visibility** | 3 mức: `Riêng tư` (chỉ owner) / `Nội bộ` (default an toàn — agent được cấp quyền) / `Công khai` |
| **Tenant Override** | Bật/tắt skill khác toàn cục cho riêng 1 tenant. Vd toàn cục bật, tenant ngân hàng tắt |
| **System Skill** | 5 skill có sẵn: `pdf`, `docx`, `xlsx`, `pptx`, `skill-creator`. Không xóa/sửa được |
| **Custom Skill** | Skill upload qua ZIP. Có thể edit metadata (mô tả/visibility/tags), version (v1 → v2), delete |
| **`skill-creator`** | System skill đặc biệt: dạy agent **tự tạo skill mới** qua chat, eval-driven. Workflow 10 bước. Có tool `publish_skill` tự đăng ký skill vào hệ thống |

## 5. Thuật ngữ Channel

| Thuật ngữ | Nghĩa |
|---|---|
| **Channel Instance** | 1 cấu hình = slug + loại + credentials + agent gán + status. Có thể tạo nhiều instance cùng loại (vd 3 bot Telegram cho 3 thị trường) |
| **DM Policy** | Quy tắc chat riêng: `pairing` (nhập OTP) / `allowlist` / `open` / `disabled` |
| **Group Policy** | Quy tắc trong group: cùng 4 mức như DM Policy |
| **Allow_from** | Danh sách user ID được phép tương tác |
| **Per-group skill filter** | Mỗi group có thể chỉ định danh sách skill cho phép (tab Nhóm trong channel detail) |

## 6. Thuật ngữ Session & Sandbox

| Thuật ngữ | Nghĩa |
|---|---|
| **Session** | 1 cuộc hội thoại (user × agent × channel). Tách biệt ký ức — không nhớ chéo |
| **Reset session** | Xóa message, giữ key. User chuyển chủ đề mà không mất pairing |
| **Xóa session** | Xóa vĩnh viễn. Buộc pair lại kênh nếu DM/Group policy = `pairing` |
| **Sandbox** | Docker container cô lập để agent chạy code (Python/Bash) an toàn. Mode: `off` / `non-main` / `all` |
| **Workspace** | Folder file riêng của agent (vd `/app/workspace/<agent-key>`), gán tự động khi tạo agent |

## 7. Thuật ngữ liên quan API

| Thuật ngữ | Nghĩa |
|---|---|
| **Gateway Token** | `<gateway-token>` — Bearer token để gọi API. Lấy từ `.env` server (`GOCLAW_GATEWAY_TOKEN`) |
| **Master Tenant** | Tenant mặc định của hệ thống. ID cố định: `0193a5b0-7000-7000-8000-000000000001`. Không cần header `X-GoClaw-Tenant-Id` |
| **`X-GoClaw-User-Id`** | Header bắt buộc cho hầu hết API endpoint. Định danh user gọi API |
| **Bootstrap mode** | Agent rơi vào trạng thái onboarding (chỉ dùng `write_file`) khi user có `BOOTSTRAP.md` + `USER.md` trống. Cần xóa `BOOTSTRAP.md` + populate `USER.md` + tạo session mới |

---

## Đào sâu

- **Sách hướng dẫn quản trị 11 menu GoClaw** — file HTML cẩm nang đi kèm bộ cài đặt sản phẩm
- **Dashboard:** mỗi menu có nút `?` (hoặc tooltip) giải thích từng trường khi hover
