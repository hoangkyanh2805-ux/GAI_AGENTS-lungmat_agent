# Founder — GoClaw UI (sau khi Claude Code giao ZIP)

> Claude Code làm xong repo → Founder làm **15–30 phút** trên https://agent.hoa-homes.com

## 0. Nguyên tắc vận hành thực tế

Mục tiêu của dự án không phải để Founder tự vibe code từng app nhỏ, mà là xây một **AI Agent Operating System**:

- Founder tập trung chuyên môn: chiến lược, content thesis, data/analytics logic, quy chuẩn vận hành.
- Founder chỉ build hoặc chỉnh **Skill** cho những phần chuyên môn khó mà team chưa tự làm được.
- Team phụ trách vibe code app, UI, automation nhỏ, dashboard, tool nội bộ theo brief.
- Các app lẻ gom vào **Super App / Media OS**, tránh phân tán quá nhiều platform.
- Mỗi workflow phải có owner rõ: Founder duyệt logic, agent xử lý tác vụ, team vận hành, audit ghi bằng chứng.

Áp dụng vào Alpha Media:

| Nhu cầu | Cách làm trong dự án |
|--------|----------------------|
| Viết content XAUUSD | `Alpha Content Writer` + skill `alpha-content-writer` |
| Duyệt bài bằng điện thoại | Telegram Channel + approval gate `OK đăng` |
| Đăng X/Threads | Zernio MCP, không CLI/exec |
| Điều phối nhiều agent | `Media OS Orchestrator` router team |
| App nhỏ cho MKT | Team build trong Super App, Founder chỉ brief |
| Kiểm soát chất lượng | `PILOT_ALPHA_AUDIT_STATUS.md` + screenshot/Post ID |

Quy tắc ra quyết định:

1. Nếu là chuyên môn lõi/voice/logic khó → Founder viết brief hoặc Skill.
2. Nếu là UI/app/automation lặp lại → giao team build, Founder chỉ nghiệm thu.
3. Nếu là thao tác publish/live money/live brand → phải có approval gate và audit.
4. Nếu một app nhỏ dùng lặp lại hơn 3 lần/tuần → gom vào Super App hoặc tạo agent workflow.
5. Nếu một platform chỉ dùng 1 chức năng nhỏ → cân nhắc thay bằng agent/tool nội bộ.

KPI vận hành:

- Giảm số platform lẻ, tăng workflow nằm trong GoClaw/Super App.
- Mỗi agent có skill, owner, channel, tool permission và audit rõ ràng.
- Founder chỉ can thiệp ở tầng brief/duyệt/chiến lược, không ôm triển khai app thường ngày.

## 0b. AI Skill Map cho dự án

Tầm nhìn vận hành: công ty không chỉ tuyển thêm người, mà xây thêm **nhân sự số** cho từng phòng ban. Mỗi agent là một nhân sự số có skill, dữ liệu, quyền tool, kênh giao tiếp và KPI riêng.

Mục tiêu không phải thay người, mà giúp team:

- Đọc dữ liệu nhanh hơn.
- Phân tích vấn đề có cấu trúc hơn.
- Cảnh báo rủi ro sớm hơn.
- Gợi ý hành động rõ hơn.
- Tạo báo cáo đều hơn.
- Theo dõi KPI không phụ thuộc báo cáo miệng.
- Giúp Founder nhìn công ty khỏe/yếu mỗi ngày.

### Alpha / GAI AI Skill Map v1

| Nhóm | Agent / nhân sự số | Skill chính | Việc làm thực tế |
|------|--------------------|-------------|------------------|
| CEO / Điều hành | CEO Command Center AI | executive-summary, decision-brief | Tổng hợp tình hình ngày, cảnh báo nghẽn, đề xuất ưu tiên |
| Media / Marketing | Media OS Orchestrator | media-os-orchestrator | Điều phối content, design, schedule, publish |
| Content Alpha | Alpha Content Writer | alpha-content-writer | Viết XAUUSD, Telegram brief, Threads, YouTube script |
| Community / Education | Linh Cẩu | linh-cau-community | Trả lời kiến thức SMC/TA, không signal, kéo về hệ sinh thái |
| CSKH / Sales | Alpha CSKH | alpha-cskh-1to1 | Tư vấn 1:1, phân loại lead, chuyển người thật khi HOT |
| Data / Analytics | Analytics Agent | market-data, report, KPI | Đọc số liệu, so sánh KPI, phát hiện lệch |
| Ops / Automation | Ops Agent | workflow-check, incident-log | Theo dõi cron, webhook, lỗi publish, lỗi channel |
| Design / Media Asset | Design Agent | image-brief, brand-check | Tạo brief ảnh/video, kiểm tra đúng brand |
| Finance / Cost | Cost Control Agent | spend-watch, platform-audit | Theo dõi chi phí tool/API/platform, đề xuất cắt giảm |
| HR / Training | Training Agent | onboarding, SOP quiz | Train team dùng agent, kiểm tra SOP, cập nhật playbook |

### Quy chuẩn mỗi nhân sự số

Mỗi agent muốn đưa vào vận hành phải có đủ:

| Thành phần | Ý nghĩa |
|------------|--------|
| Owner | Ai chịu trách nhiệm business |
| Skill | Agent biết làm gì, không làm gì |
| Data source | Lấy dữ liệu từ đâu, có timestamp không |
| Tools | Được dùng tool nào, tool nào cấm |
| Channel | Telegram, GoClaw chat, Cron, Super App |
| Approval gate | Khi nào cần Founder/manager OK |
| KPI | Đo bằng gì: thời gian, số lỗi, post live, lead, cost |
| Audit | Bằng chứng nằm ở đâu: screenshot, Post ID, log, doc |

### Phase triển khai Skill Map

| Phase | Mục tiêu | Done khi |
|-------|----------|----------|
| S0 | Chốt bản đồ nhân sự số v1 | Có danh sách agent + owner + workflow |
| S1 | Media OS chạy ổn | Alpha Writer + Telegram duyệt + Zernio publish + Cron |
| S2 | Community + CSKH | Linh Cẩu trả lời chuẩn, Alpha CSKH nhận lead và chuyển người thật |
| S3 | Data/Analytics | Báo cáo KPI ngày, cảnh báo lệch, không cần hỏi thủ công |
| S4 | Ops/Cost | Theo dõi lỗi, chi phí API/platform, đề xuất cắt giảm |
| S5 | Team tự build skill | Team tự tạo/sửa skill theo template, Founder chỉ duyệt |

### Nguyên tắc scale

1. Không tạo agent nếu workflow chưa lặp lại.
2. Không tạo skill nếu chưa có owner.
3. Không cho agent dùng tool nguy hiểm nếu chưa có approval gate.
4. Dữ liệu realtime phải có nguồn + timestamp.
5. Mọi agent vận hành thật phải ghi được audit.
6. Founder chỉ cần nhìn dashboard/báo cáo cuối ngày, không đi hỏi từng nhóm chat.

## 0c. Web Search Provider Chain (đã bật)

**Built-in Tools** → **Web** → **Web Search Provider Chain**

| # | Provider | Trạng thái pilot |
|---|----------|------------------|
| 1 | Exa | ON + API key · max 5 |
| 2 | Tavily | ON + API key · max 5 |
| 3 | Brave | ON — thêm key khi muốn tier 3 |
| 4 | DuckDuckGo | Always-on fallback |

Bật `web_search` cho **Alpha Content Writer** và **Linh Cẩu**. Orchestrator chỉ route — worker mới search.

Chi tiết: [`handbook/06-builtin-tools.md`](../../handbook/06-builtin-tools.md) §6.5.

## 1. Upload skill

1. Lấy file: `docs/goclaw-export/skills/zips/media-os-orchestrator.zip`
2. **Skills** → Upload → **Rescan**

## 2. Tạo agent Orchestrator

**Agents** → **+ Tạo agent**

| Field | Giá trị |
|-------|---------|
| Name | Media OS Orchestrator |
| Type | **Predefined** |
| Model | Claude Sonnet 4.5 |
| Skill | media-os-orchestrator ON |

## 3. Create Team

**Agent Link & Team** → **Teams** → **+ Create Team**

| Field | Giá trị |
|-------|---------|
| Name | Media OS |
| Type | **Router** |
| Orchestrator | Media OS Orchestrator |

## 4. Members

**+ Thêm Member** (agent phải Predefined):

- Alpha Content Writer — Worker
- Linh Cẩu — Worker

## 5. Test

**Chat** với Orchestrator:

- `viết brief XAUUSD` → Board → Alpha
- `FVG là gì` → Linh Cẩu

Screenshot Kanban → gửi Cowork / cập nhật audit.

## 6. Sau incident — link X/Threads 404 (agent báo "xong" nhưng không live)

**Triệu chứng:** Orchestrator trả `x.com/AlphaTradingLab/...` — trang **doesn't exist**; Threads 404; `message` Failed.

| Nguyên nhân | Fix |
|-------------|-----|
| Link/handle **bịa** (`AlphaTradingLab` ≠ `@AlphaTrading79`) | Chỉ tin **Zernio dashboard** + Post ID thật |
| Orchestrator **tự đăng** / `exec` copy ảnh | Re-upload skill **v1.1.0** · tắt **exec** trên Orchestrator |
| Không qua **Zernio MCP** | Đăng lại: **Alpha Content Writer** + Founder `OK đăng` |

**Verify (2 phút):** Zernio → Posts → filter 22/05/2026 → có **Published** + Post ID?

**Đăng lại (chat Alpha, không Orchestrator):**

```text
Đăng lại bài 22/05/2026 — CHỈ Zernio MCP posts_cross_post.
Tweet1 ≤280, threads_post ≤500, mediaIds nếu có.
Trả Post ID + link đúng @AlphaTrading79 và @alphatrading.lab — không bịa URL.
```

**Handles đúng:** X `@AlphaTrading79` · Threads `@alphatrading.lab`
