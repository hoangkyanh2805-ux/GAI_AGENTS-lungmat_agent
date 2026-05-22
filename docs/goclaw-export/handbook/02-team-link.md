# 02 — Menu: Agent Link & Team

Menu **Agent Link & Team** cho phép nhiều agent cộng tác xử lý task phức tạp theo workflow.

---

## 2.1 Giới Thiệu Agent Link & Team

**Team** = nhóm agent phối hợp để xử lý task vượt khả năng 1 agent đơn.
**Agent Link** = kết nối trực tiếp giữa 2 agent (upstream → downstream) không qua Team.

**Khi nào dùng Team:**
- Task cần nhiều chuyên môn khác nhau (research + write + review)
- Pipeline xử lý tuần tự (extract → analyze → format → publish)
- Cần orchestrator điều phối nhiều worker

**Khi nào dùng Agent Link:**
- Chỉ cần chuyển task từ agent A sang agent B theo điều kiện đơn giản
- Không cần orchestrator
- 2 agent thuộc domain khác nhau

> **Yêu cầu**: Agent phải là type **Predefined** để tham gia Team. Open agent không thể làm member team.

---

## 2.2 Tạo Team

Sidebar → **Agent Link & Team** → tab **Teams** → **+ Tạo Team**.

**Các trường:**

| Trường | Mô tả |
|--------|-------|
| Name | Tên team |
| Description | Mô tả mục đích team |
| Team type | Sequential / Parallel / Router |
| Orchestrator | Agent chịu trách nhiệm điều phối (Predefined) |

**3 loại Team:**

| Type | Cách hoạt động | Dùng cho |
|------|---------------|----------|
| **Sequential** | Pipeline: Agent 1 xong → Agent 2 → Agent 3 | Workflow tuyến tính có thứ tự rõ ràng |
| **Parallel** | Tất cả agent nhận task cùng lúc, kết quả merge | Cần nhiều perspective/analysis song song |
| **Router** | Orchestrator quyết định agent nào xử lý | Task đa dạng, cần phân loại intent |

---

## 2.3 Kanban Board Team

Sau khi tạo team, tab **Board** hiển thị Kanban task.

**Các cột:**
- `Pending` — task chờ xử lý
- `Running` — đang được agent xử lý
- `Waiting` — đợi input từ người hoặc agent khác
- `Done` — hoàn thành
- `Failed` — thất bại, cần xem xét

**Thao tác:**
- Click task → xem input, output, trace từng bước
- **Retry**: chạy lại task failed
- **Cancel**: hủy task đang pending/running
- Filter theo: agent, date, status, priority

---

## 2.4 Thêm Member Vào Team

Team → tab **Members** → **+ Thêm Member**.

**Role của member:**

| Role | Quyền | Dùng cho |
|------|-------|----------|
| **Worker** | Nhận và thực thi task từ orchestrator | Agent chuyên môn thực thi |
| **Reviewer** | Review output của worker trước khi pass tiếp | QA, fact-check, approval |
| **Specialist** | Được gọi khi cần chuyên môn đặc biệt | Expert on demand |

**Lưu ý:**
- Agent phải là **Predefined** — nếu chọn Open agent sẽ báo lỗi
- 1 agent có thể là member trong nhiều team cùng lúc
- Orchestrator không tính là member — là config riêng của team

---

## 2.5 Cài Đặt Team

Team → tab **Cài đặt**.

| Setting | Mô tả | Default |
|---------|-------|---------|
| Max concurrent tasks | Số task chạy song song tối đa | 5 |
| Timeout per task | Thời gian tối đa 1 task được chạy | 300s |
| Retry policy | Số lần retry khi task fail | 2 |
| Retry delay | Đợi bao lâu trước khi retry | 30s |
| Escalate after N failures | Sau N fail → notify admin | 3 |

---

## 2.6 Workspace Team

Team → tab **Workspace** — không gian chia sẻ giữa các agent trong team.

**Shared context:**
- Shared Memory scope: documents trong Memory scope `Team` chỉ agent trong team đọc được
- Shared Vault docs: assign Vault documents cho toàn team

**Cách hoạt động:**
- Agent trong team có thể đọc/ghi Memory scope `Team`
- Khi agent A write memory với scope `Team` → agent B trong cùng team đọc được ngay
- Dùng để truyền thông tin trung gian giữa các bước pipeline

---

## 2.7 Audit Log Team

Team → tab **Audit Log**.

**Lịch sử task execution:**
- Task ID, thời gian bắt đầu/kết thúc
- Agent thực thi từng bước
- Input / Output tại mỗi bước
- Error traces khi failed

**Lọc và xuất:**
- Filter theo: date range, agent, status, task type
- Export CSV để phân tích ngoài
- Retention: 90 ngày mặc định

**Dùng để debug:**
- Xem agent nào trong pipeline gây lỗi
- So sánh input/output để hiểu agent làm gì
- Tính toán latency từng bước

---

## 2.8 Super Team v2

Tính năng **Super Team** cho phép một Team là member của Team khác — tạo hierarchy nhiều tầng.

**Cách cài:**
- Tạo Team cha (parent team) với type Router
- Khi thêm member → chọn **Team** thay vì Agent
- Orchestrator của parent team có thể delegate toàn bộ task cho sub-team

**Use case:**
```
Team Marketing
├── Orchestrator: Marketing Director Agent
├── Member Team: Content Team
│   ├── Orchestrator: Content Manager Agent
│   ├── Worker: Writer Agent
│   └── Reviewer: Editor Agent
└── Member Team: Analytics Team
    ├── Orchestrator: Data Lead Agent
    └── Worker: Analyst Agent
```

**Giới hạn:**
- Tối đa 3 cấp hierarchy (tránh vòng lặp)
- Sub-team cũng phải có orchestrator là Predefined agent
- Task timeout tính tổng cộng qua các tầng

---

## 2.9 Agent Link: Kết Nối 2 Agent

**Agent Link** = kết nối trực tiếp upstream agent → downstream agent.

Sidebar → **Agent Link & Team** → tab **Links** → **+ Tạo Link**.

**Cấu hình:**

| Trường | Mô tả |
|--------|-------|
| Source agent | Agent gửi (upstream) |
| Target agent | Agent nhận (downstream) |
| Trigger condition | Khi nào chuyển: keyword / regex / intent |
| Pass context | Truyền toàn bộ context hiện tại hay chỉ message cuối |
| Auto-reply | Source agent tự reply kết quả của target hay chờ user confirm |

**Trigger condition examples:**
```
keyword: "chuyên gia kỹ thuật"
regex: /\b(code|bug|lỗi kỹ thuật)\b/i
intent: "technical_support"
```

---

## 2.10 Agent Link Policies

**Chiều kết nối:**
- `unidirectional`: Source → Target (1 chiều)
- `bidirectional`: cả 2 chiều (mỗi chiều có trigger condition riêng)

**Max hop count:**
- Giới hạn số lần một message có thể được chuyển tiếp qua các link
- Default: 3 hops
- Tăng lên nếu có pipeline dài hợp lệ
- Vượt quá → message bị drop + log warning (tránh infinite loop)

**Context passing:**
- `full_context`: toàn bộ session history được chuyển sang target
- `last_message`: chỉ message kích hoạt link được chuyển
- `summary`: summarize context trước khi chuyển (tiết kiệm token)

---

## 2.11 Routing Rules

Dành cho **Router team** — orchestrator dùng routing rules để quyết định agent nào xử lý.

**Cấu hình routing rule:**
```yaml
rules:
  - name: Technical Support
    condition: intent == "technical"
    target_agent: tech_support_agent
    priority: 1
  - name: Sales Inquiry
    condition: keyword_match(["giá", "mua", "báo giá"])
    target_agent: sales_agent
    priority: 2
  - name: Default
    condition: always
    target_agent: general_agent
    priority: 99
```

**Fallback agent**: agent xử lý khi không có rule nào match.

**Intent detection**: orchestrator agent dùng LLM để phân loại intent trước khi route — cần model mạnh, không dùng model budget thấp cho orchestrator.

---

## 2.12 Team Permissions

Team → tab **Quyền truy cập**.

**Ai có thể xem/sửa team:**

| Role | Xem task | Sửa config | Xóa team |
|------|---------|------------|---------|
| Admin | Tất cả team | Tất cả team | Tất cả team |
| Operator | Team mình được assign | Team mình own | Không |
| User | Không | Không | Không |

**Shared team**: Team có thể được share giữa nhiều Operator để cùng quản lý.

---

## 2.13 Monitoring Team

Team → tab **Monitoring** (hoặc Dashboard → Overview → Teams section).

**Metrics:**
- Task throughput: số task hoàn thành / giờ
- Agent utilization: % thời gian agent đang xử lý task
- Average task duration: thời gian trung bình hoàn thành 1 task
- Error rate: % task failed
- Queue depth: số task đang pending

**Alerts:**
- Cấu hình alert khi error rate > N%
- Alert khi queue depth > N tasks
- Alert khi agent không phản hồi > N giây

---

## 2.14 Xóa Team / Unlink

**Xóa Team:**
1. Dừng tất cả task đang chạy (hoặc chờ hoàn thành)
2. Remove tất cả member agents
3. Team → **Xóa** → confirm

**Hậu quả:**
- Task đang `Running` bị cancel (trả lỗi cho caller)
- Task `Pending` bị drop
- Audit log giữ nguyên 90 ngày
- Agent member không bị ảnh hưởng — tiếp tục hoạt động độc lập

**Graceful shutdown:**
- Bấm **Pause Team** trước → đợi task running kết thúc → rồi mới xóa
- Hoặc set `max_concurrent_tasks = 0` → đợi queue empty → xóa

**Xóa Agent Link:**
- Sidebar → Links → click link → **Xóa**
- Không ảnh hưởng đến agent đang chạy
- Message đang được xử lý tiếp tục hoàn thành, link mới không được tạo thêm
