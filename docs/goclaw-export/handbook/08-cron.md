# 08 — Menu: Cron / Tác Vụ Định Kỳ

Menu **Cron** quản lý các tác vụ tự động chạy theo lịch — agent nhận message và thực thi theo schedule.

---

## 8.1 Cron Là Gì

**Cron** = tác vụ tự động: GoClaw gửi message cho agent theo lịch định sẵn → agent xử lý và gửi kết quả.

**3 loại cron:**

| Loại | Dùng khi | Ví dụ |
|------|----------|-------|
| **Every** | Lặp đều đặn mỗi N giây/phút/giờ | Ping health check mỗi 5 phút |
| **Cron expression** | Schedule phức tạp theo ngày/giờ | Tóm tắt thị trường lúc 8:00 sáng mỗi ngày |
| **Once** | Chạy 1 lần vào thời điểm cụ thể | Nhắc họp lúc 14:00 ngày mai |

---

## 8.2 Tạo Cron — Loại Every

Sidebar → **Cron** → **+ Tạo** → chọn **Every**.

| Trường | Mô tả | Ví dụ |
|--------|-------|-------|
| Name | Tên cron | `health-check` |
| Agent | Agent xử lý | `my-agent` |
| Interval | Số giây/phút/giờ | `5 minutes` |
| Message | Nội dung gửi cho agent | `"Kiểm tra status hệ thống và báo cáo"` |
| Channel delivery | Kênh nhận kết quả | Telegram chat_id hoặc Discord channel_id |
| Active | Bật/tắt ngay khi tạo | ✓ |

**Interval tối thiểu**: 60 giây (GoClaw không cho phép interval < 1 phút để tránh overload).

**Dùng Every cho:**
- Health check định kỳ
- Polling dữ liệu từ API ngoài
- Sync dữ liệu thường xuyên
- Heartbeat notification

---

## 8.3 Tạo Cron — Loại Cron Expression

Sidebar → **Cron** → **+ Tạo** → chọn **Cron**.

| Trường | Mô tả |
|--------|-------|
| Name | Tên cron |
| Agent | Agent xử lý |
| Expression | Cron expression (5 fields) |
| Timezone | **BẮT BUỘC: `Asia/Ho_Chi_Minh`** |
| Message | Nội dung gửi cho agent |
| Channel delivery | Kênh nhận kết quả |

**Cron expression format:**
```
*    *    *    *    *
│    │    │    │    │
│    │    │    │    └─ Thứ (0=CN, 1=T2, ..., 6=T7)
│    │    │    └───── Tháng (1-12)
│    │    └─────────── Ngày (1-31)
│    └───────────────── Giờ (0-23)
└─────────────────────── Phút (0-59)
```

**Ví dụ thường dùng:**

| Expression | Ý nghĩa |
|------------|---------|
| `0 8 * * *` | 8:00 sáng mỗi ngày |
| `0 8 * * 1-5` | 8:00 sáng T2–T6 (ngày làm việc) |
| `0 8,12,17 * * *` | 8:00, 12:00, 17:00 mỗi ngày |
| `0 0 * * 0` | Midnight mỗi Chủ nhật |
| `30 7 * * 1` | 7:30 sáng mỗi thứ Hai |
| `0 */4 * * *` | Mỗi 4 tiếng |
| `0 9 1 * *` | 9:00 sáng ngày 1 mỗi tháng |

> **QUAN TRỌNG**: Luôn set timezone = `Asia/Ho_Chi_Minh`.
> Default là UTC — `0 8 * * *` UTC = **15:00 VN**, không phải 8:00 sáng.
> Dùng https://crontab.guru để verify expression trước khi lưu.

---

## 8.4 Tạo Cron — Loại Once

Sidebar → **Cron** → **+ Tạo** → chọn **Once**.

| Trường | Mô tả | Ví dụ |
|--------|-------|-------|
| Name | Tên cron | `remind-meeting-2026-05-21` |
| Agent | Agent xử lý | `my-agent` |
| Datetime | Thời điểm chạy (ISO 8601) | `2026-05-21T14:00:00+07:00` |
| Message | Nội dung gửi cho agent | `"Nhắc team họp review lúc 14:00 hôm nay"` |
| Channel delivery | Kênh nhận kết quả | Telegram chat_id |

**Sau khi chạy**: cron tự động chuyển sang status `completed`, không chạy lại.

**Dùng Once cho:**
- Nhắc nhở 1 lần (meeting, deadline)
- Event-based action (trigger sau 1 event)
- Delayed notification

---

## 8.5 Channel Delivery

Kết quả cron sau khi agent xử lý sẽ gửi đến channel được cấu hình.

**Các loại delivery:**
- **Telegram**: nhập `chat_id` (số âm cho group, số dương cho DM)
  - Lấy chat_id: thêm `@userinfobot` vào group → `/start`
  - Hoặc: nhắn bot → xem trong GoClaw Sessions
- **Discord**: nhập `channel_id` (enable Developer Mode → right-click channel → Copy ID)
- **Slack**: nhập channel ID (bắt đầu bằng `C`)

**Approval gate:**
Thay vì gửi thẳng → agent tạo draft → gửi cho admin approve → mới publish.
- Cấu hình: `delivery_mode: approval_gate`
- Admin nhận draft qua DM, reply `approve` / `reject [lý do]`
- Xem pattern đầy đủ: §8.9

---

## 8.6 Lifecycle Cron

**Status:**

| Status | Mô tả |
|--------|-------|
| `active` | Đang chạy theo lịch |
| `paused` | Tạm dừng — không chạy nhưng không xóa |
| `completed` | Đã chạy xong (chỉ với Once) |
| `error` | Lần chạy gần nhất bị lỗi |
| `disabled` | Admin tắt |

**Thao tác:**
- **Pause**: tạm dừng không xóa → resume sau
- **Resume**: bật lại cron đang pause
- **Run Now**: trigger chạy ngay (không chờ đến lịch)
- **Delete**: xóa vĩnh viễn — không khôi phục

---

## 8.7 Run History

Cron → chọn cron → tab **Lịch sử**.

**Mỗi lần chạy log:**
- Timestamp bắt đầu / kết thúc
- Status: success / failed / timeout
- Input message (đã gửi cho agent)
- Output (response của agent)
- Error detail nếu failed

**Retry:**
- Click vào run bị failed → **Retry** → chạy lại với cùng input
- Không thay đổi schedule, chỉ trigger 1 lần extra

**Retention**: lịch sử giữ 30 ngày.

---

## 8.8 Cron và Context (Session Mode)

Mỗi lần cron chạy có thể dùng session stateless hoặc persistent.

**Stateless (default):**
```yaml
session_mode: stateless
```
- Mỗi lần cron = session mới độc lập
- Không nhớ gì từ lần chạy trước
- Phù hợp: tác vụ độc lập mỗi ngày (báo cáo, health check)

**Persistent:**
```yaml
session_mode: persistent
session_id: cron-daily-report-session
```
- Dùng cùng 1 session mỗi lần chạy
- Agent nhớ context từ lần trước
- Phù hợp: agent cần theo dõi xu hướng qua nhiều ngày

**Chú ý với persistent**: context tích lũy → sau nhiều lần chạy context đầy → cần cấu hình `summarize` strategy.

---

## 8.9 Approval Gate Pattern

Pattern phổ biến trong Media OS / XAUUSD workflow.

**Luồng hoạt động:**
```
1. Cron trigger → gửi message cho agent
2. Agent phân tích / tạo content
3. Agent dùng messaging tool → gửi draft cho admin (DM Telegram)
4. Admin xem draft, reply:
   - "approve" → agent publish lên channel public
   - "reject: [lý do]" → agent chỉnh sửa và gửi lại
   - "edit: [nội dung mới]" → agent dùng nội dung admin chỉnh
5. Sau khi approve → agent publish lên channel đích
```

**Cài đặt approval gate:**
```yaml
# Trong message gửi cho agent:
message: |
  Phân tích XAUUSD hôm nay.
  Sau khi xong, gửi draft cho admin qua Telegram DM: {ADMIN_CHAT_ID}
  Chờ approval trước khi publish.
  Khi nhận "approve", publish lên group: {GROUP_CHAT_ID}

delivery_mode: none  # agent tự handle delivery
```

**Timeout approval**: nếu admin không reply trong X giờ → agent tự cancel hoặc tự publish (cấu hình theo policy).

---

## 8.10 Ví Dụ Cron Thực Tế (Media OS)

**Cron 1: Tóm tắt thị trường sáng 8:00**
```yaml
name: morning-market-summary
type: cron
expression: "0 8 * * 1-5"
timezone: Asia/Ho_Chi_Minh
agent: alpha-trader-agent
message: |
  Phân tích thị trường XAUUSD hôm nay.
  Kiểm tra news từ Vault (PHASE_STATUS.md, NEXT_STEPS.md).
  Tạo draft post theo 3 style: Alpha (kỹ thuật), Raymond (thực chiến), VIP10X (động lực).
  Gửi draft cho admin approve qua Telegram DM trước khi publish.
channel: telegram_admin_chat_id
session_mode: stateless
```

**Cron 2: Health check hệ thống mỗi 15 phút**
```yaml
name: system-health-check
type: every
interval: "15 minutes"
agent: devops-agent
message: "Kiểm tra status các service: GoClaw API, DB, Redis, Telegram webhook. Báo cáo ngắn gọn."
channel: telegram_devops_chat_id
session_mode: stateless
```

**Cron 3: Tổng kết tuần (Chủ nhật 20:00)**
```yaml
name: weekly-summary
type: cron
expression: "0 20 * * 0"
timezone: Asia/Ho_Chi_Minh
agent: analytics-agent
message: |
  Tổng kết tuần vừa qua:
  1. Đọc session logs 7 ngày qua
  2. Thống kê: tổng câu hỏi, top topic, error rate
  3. Tạo báo cáo PDF (dùng skill excel-writer)
  4. Gửi báo cáo cho admin
channel: telegram_admin_chat_id
session_mode: persistent
session_id: weekly-analytics-session
```
